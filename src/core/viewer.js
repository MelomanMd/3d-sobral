import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { FabricTextureGenerator } from './fabricTexture.js';
import { t } from './i18n.js';

export class ShirtViewer {
  constructor(containerElement, textureEngine, getStateFn) {
    this.container = containerElement;
    this.textureEngine = textureEngine;
    this.getState = getStateFn || (() => ({}));

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.shirtMesh = null;
    this.shirtMaterial = null;
    this.shirtGroup = null;
    this.decalGroup = new THREE.Group();

    this.isAutoRotating = false;
    this.isTransitioningCamera = false;

    // Raycasting & Interaction Modes: 'idle', 'move', 'scale', 'rotate'
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragMode = 'idle';
    this.draggedItem = null;
    this.draggedType = null; // 'text' or 'logo'
    this.dragStartUV = null;
    this.dragStartOffset = null;
    this.dragStartFontSize = 50;
    this.dragStartScale = 1.0;
    this.dragStartRotation = 0;
    this.dragStartDistance = 0;
    this.activeHandle = null;

    // Callbacks
    this.onItemSelect = null;
    this.onItemDrag = null;
    this.onItemScale = null;
    this.onItemRotate = null;
    this.onItemDragEnd = null;
    this.onDeselect = null;

    this.lights = {};
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.05, 0.92);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.45;
    this.controls.maxDistance = 1.8;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.target.set(0, 0.05, 0);
    this.controls.update();

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Ground Shadow & Decals
    this.setupGroundShadow();
    this.scene.add(this.decalGroup);

    // 7. Load GLB Model (Active product model or default)
    const initialModelUrl = this.getState()?.activeProduct?.modelUrl || '/shirt_baked.glb';
    this.loadModel(initialModelUrl);

    // 8. Event Listeners for Raycasting & Gizmo Controls
    this.setupPointerEvents();
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 3, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.7);
    fillLight.position.set(-2.5, 2, 2);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    const rimLight = new THREE.DirectionalLight(0xfff7ed, 0.85);
    rimLight.position.set(0, 3, -2.5);
    this.scene.add(rimLight);
    this.lights.rim = rimLight;
  }

  setupGroundShadow() {
    const shadowGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.45)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.32;
    this.scene.add(shadowMesh);
  }

  loadModel(modelUrl = '/shirt_baked.glb') {
    if (this.shirtGroup) {
      this.scene.remove(this.shirtGroup);
      this.shirtGroup = null;
      this.shirtMesh = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;
        this.shirtGroup = root;

        root.traverse((child) => {
          if (child.isMesh) {
            this.shirtMesh = child;

            const origMat = child.material;
            const isAiModel = modelUrl !== '/shirt_baked.glb' && !!(origMat && origMat.map);
            this.isAiModel = isAiModel;

            const dynamicTexture = this.textureEngine.getTexture();
            if (this.renderer) {
              dynamicTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            }

            const textureMap = isAiModel ? origMat.map : dynamicTexture;

            let normalMap = origMat?.normalMap || null;
            if (!normalMap) {
              const normalCanvas = FabricTextureGenerator.getFabricNormalMapCanvas();
              const fabricNormalTex = new THREE.CanvasTexture(normalCanvas);
              fabricNormalTex.wrapS = THREE.RepeatWrapping;
              fabricNormalTex.wrapT = THREE.RepeatWrapping;
              fabricNormalTex.repeat.set(24, 24);
              fabricNormalTex.needsUpdate = true;
              normalMap = fabricNormalTex;
            }

            this.shirtMaterial = new THREE.MeshStandardMaterial({
              map: textureMap,
              normalMap: normalMap,
              normalScale: new THREE.Vector2(0.4, 0.4),
              roughness: 0.9,
              metalness: 0.02,
              aoMap: origMat?.aoMap || null,
              aoMapIntensity: 0.7,
              side: THREE.DoubleSide
            });

            child.material = this.shirtMaterial;
            child.castShadow = true;
            child.receiveShadow = true;

            if (!isAiModel) {
              this.textureEngine.render(this.getState()).then(() => {
                dynamicTexture.needsUpdate = true;
              });
            } else {
              this.updateDecals();
            }
          }
        });

        // Compute Bounding Box and scale/center dynamically
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0.001) {
          const targetDim = 0.85;
          const scaleFactor = targetDim / maxDim;
          root.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        const updatedBox = new THREE.Box3().setFromObject(root);
        const center = updatedBox.getCenter(new THREE.Vector3());
        root.position.sub(center);
        root.position.y += 0.05;

        this.scene.add(root);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
      }
    );
  }

  updateMaterialColor(colors) {
    if (this.shirtMaterial) {
      this.shirtMaterial.color.set(0xffffff);
    }
  }

  async updateDecals() {
    if (!this.shirtMesh) return;
    const state = this.getState();

    // Clear previous decals
    while (this.decalGroup.children.length > 0) {
      const obj = this.decalGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
      this.decalGroup.remove(obj);
    }

    if (!this.isAiModel) return;

    // Project Logos onto 3D Mesh
    for (const logo of state.logos || []) {
      if (!logo.visible) continue;
      const img = await this.textureEngine.loadImage(logo.src);
      if (!img) continue;

      const logoTex = new THREE.CanvasTexture(img);
      logoTex.colorSpace = THREE.SRGBColorSpace;

      const isFront = !logo.zone?.includes('back');
      const pos = new THREE.Vector3(
        (logo.offsetX || 0) * 0.002,
        0.05 - (logo.offsetY || 0) * 0.002,
        isFront ? 0.14 : -0.14
      );
      const orient = new THREE.Euler(0, isFront ? 0 : Math.PI, -(logo.rotation || 0) * Math.PI / 180);
      const size = new THREE.Vector3(0.20 * (logo.scale || 1.0), 0.20 * (logo.scale || 1.0), 0.20);

      try {
        const decalGeo = new DecalGeometry(this.shirtMesh, pos, orient, size);
        const decalMat = new THREE.MeshStandardMaterial({
          map: logoTex,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4
        });
        const decalMesh = new THREE.Mesh(decalGeo, decalMat);
        this.decalGroup.add(decalMesh);
      } catch (e) {
        console.warn('Decal generation failed:', e);
      }
    }

    // Project Texts onto 3D Mesh
    for (const textItem of state.texts || []) {
      if (!textItem.visible || !textItem.text?.trim()) continue;
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 256;
      const ctx = textCanvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 256);
      ctx.font = `${textItem.fontWeight || 'bold'} ${textItem.fontSize || 54}px ${textItem.fontFamily || 'sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (textItem.strokeWidth) {
        ctx.strokeStyle = textItem.strokeColor || '#000000';
        ctx.lineWidth = textItem.strokeWidth * 2;
        ctx.strokeText(textItem.text, 256, 128);
      }
      ctx.fillStyle = textItem.color || '#ffffff';
      ctx.fillText(textItem.text, 256, 128);

      const textTex = new THREE.CanvasTexture(textCanvas);
      textTex.colorSpace = THREE.SRGBColorSpace;

      const isFront = !textItem.zone?.includes('back');
      const pos = new THREE.Vector3(
        (textItem.offsetX || 0) * 0.002,
        0.08 - (textItem.offsetY || 0) * 0.002,
        isFront ? 0.14 : -0.14
      );
      const orient = new THREE.Euler(0, isFront ? 0 : Math.PI, -(textItem.rotation || 0) * Math.PI / 180);
      const size = new THREE.Vector3(0.28, 0.14, 0.20);

      try {
        const decalGeo = new DecalGeometry(this.shirtMesh, pos, orient, size);
        const decalMat = new THREE.MeshStandardMaterial({
          map: textTex,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4
        });
        const decalMesh = new THREE.Mesh(decalGeo, decalMat);
        this.decalGroup.add(decalMesh);
      } catch (e) {
        console.warn('Text Decal generation failed:', e);
      }
    }
  }

  setupPointerEvents() {
    const domEl = this.renderer.domElement;

    const getPointerCoords = (e) => {
      const rect = domEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      return { x, y };
    };

    const getRaycastHit = (e) => {
      if (!this.shirtMesh) return null;
      const { x, y } = getPointerCoords(e);
      this.pointer.set(x, y);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObject(this.shirtMesh);
      return intersects.length > 0 ? intersects[0] : null;
    };

    // Pointer Down
    domEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;

      const hit = getRaycastHit(e);
      if (!hit || !hit.uv) {
        // Clicked outside on background -> deselect
        if (this.onDeselect) this.onDeselect();
        return;
      }

      const uv = hit.uv;
      const state = this.getState();
      const selectedId = state.selectedItemId;

      // 1. Check if clicked on a corner handle of the currently selected item
      if (selectedId) {
        const selText = state.texts?.find(t => t.id === selectedId);
        const selLogo = state.logos?.find(l => l.id === selectedId);
        const activeItem = selText || selLogo;
        const activeType = selText ? 'text' : 'logo';

        if (activeItem) {
          const handle = this.textureEngine.findHandleAtUV(uv.x, uv.y, activeItem, activeType);
          if (handle) {
            this.dragMode = handle === 'rot' ? 'rotate' : 'scale';
            this.activeHandle = handle;
            this.draggedItem = activeItem;
            this.draggedType = activeType;
            this.dragStartUV = { u: uv.x, v: uv.y };
            this.dragStartFontSize = activeItem.fontSize || 54;
            this.dragStartScale = activeItem.scale || 1.0;
            this.dragStartRotation = activeItem.rotation || 0;

            const bounds = this.textureEngine.getItemUVBounds(activeItem, activeType);
            this.dragStartDistance = Math.hypot(uv.x - bounds.centerU, uv.y - bounds.centerV);

            this.controls.enabled = false;
            domEl.style.cursor = handle === 'rot' ? 'crosshair' : 'nwse-resize';
            return;
          }
        }
      }

      // 2. Check if clicked over a text
      const hitText = this.textureEngine.findTextAtUV(uv.x, uv.y, state.texts);
      if (hitText) {
        this.dragMode = 'move';
        this.draggedItem = hitText;
        this.draggedType = 'text';
        this.dragStartUV = { u: uv.x, v: uv.y };
        this.dragStartOffset = { x: hitText.offsetX || 0, y: hitText.offsetY || 0 };
        this.controls.enabled = false;
        domEl.style.cursor = 'grabbing';

        if (this.onItemSelect) {
          this.onItemSelect('text', hitText.id);
        }
        return;
      }

      // 3. Check if clicked over a logo
      const hitLogo = this.textureEngine.findLogoAtUV(uv.x, uv.y, state.logos);
      if (hitLogo) {
        this.dragMode = 'move';
        this.draggedItem = hitLogo;
        this.draggedType = 'logo';
        this.dragStartUV = { u: uv.x, v: uv.y };
        this.dragStartOffset = { x: hitLogo.offsetX || 0, y: hitLogo.offsetY || 0 };
        this.controls.enabled = false;
        domEl.style.cursor = 'grabbing';

        if (this.onItemSelect) {
          this.onItemSelect('logo', hitLogo.id);
        }
        return;
      }

      // 4. Clicked on garment element surface -> identify clicked part!
      const clickedPart = this.identifyGarmentPartAtUV(uv.x, uv.y);
      if (this.onPartClick) {
        this.onPartClick(clickedPart);
      }
      if (this.onDeselect) this.onDeselect();
    });

    // Pointer Move
    domEl.addEventListener('pointermove', (e) => {
      // 1. Handling active dragging modes
      if (this.dragMode === 'move' && this.draggedItem) {
        const hit = getRaycastHit(e);
        if (hit && hit.uv) {
          const deltaU = hit.uv.x - this.dragStartUV.u;
          const deltaV = hit.uv.y - this.dragStartUV.v;

          const newOffsetX = Math.round(this.dragStartOffset.x + deltaU * 1000);
          const newOffsetY = Math.round(this.dragStartOffset.y + deltaV * 1000);

          this.draggedItem.offsetX = Math.max(-180, Math.min(180, newOffsetX));
          this.draggedItem.offsetY = Math.max(-180, Math.min(180, newOffsetY));

          if (this.onItemDrag) {
            this.onItemDrag(this.draggedType, this.draggedItem.id, this.draggedItem.offsetX, this.draggedItem.offsetY);
          }
        }
        return;
      }

      if (this.dragMode === 'scale' && this.draggedItem) {
        const hit = getRaycastHit(e);
        if (hit && hit.uv) {
          const bounds = this.textureEngine.getItemUVBounds(this.draggedItem, this.draggedType);
          const currentDist = Math.hypot(hit.uv.x - bounds.centerU, hit.uv.y - bounds.centerV);
          const scaleFactor = Math.max(0.2, currentDist / (this.dragStartDistance || 0.05));

          if (this.draggedType === 'text') {
            const newFontSize = Math.round(Math.max(20, Math.min(140, this.dragStartFontSize * scaleFactor)));
            this.draggedItem.fontSize = newFontSize;
            if (this.onItemScale) {
              this.onItemScale('text', this.draggedItem.id, newFontSize);
            }
          } else {
            const newScale = Number(Math.max(0.2, Math.min(2.5, this.dragStartScale * scaleFactor)).toFixed(2));
            this.draggedItem.scale = newScale;
            if (this.onItemScale) {
              this.onItemScale('logo', this.draggedItem.id, newScale);
            }
          }
        }
        return;
      }

      if (this.dragMode === 'rotate' && this.draggedItem) {
        const hit = getRaycastHit(e);
        if (hit && hit.uv) {
          const bounds = this.textureEngine.getItemUVBounds(this.draggedItem, this.draggedType);
          const angleRad = Math.atan2(hit.uv.x - bounds.centerU, -(hit.uv.y - bounds.centerV));
          let angleDeg = Math.round((angleRad * 180) / Math.PI);
          this.draggedItem.rotation = angleDeg;

          if (this.onItemRotate) {
            this.onItemRotate(this.draggedType, this.draggedItem.id, angleDeg);
          }
        }
        return;
      }

      // 2. Hover states and cursor icons
      const hit = getRaycastHit(e);
      if (hit && hit.uv) {
        const state = this.getState();
        const selectedId = state.selectedItemId;

        // Check if hovering over handles of selected item
        if (selectedId) {
          const selText = state.texts?.find(t => t.id === selectedId);
          const selLogo = state.logos?.find(l => l.id === selectedId);
          const activeItem = selText || selLogo;
          const activeType = selText ? 'text' : 'logo';

          if (activeItem) {
            const handle = this.textureEngine.findHandleAtUV(hit.uv.x, hit.uv.y, activeItem, activeType);
            if (handle) {
              domEl.style.cursor = handle === 'rot' ? 'crosshair' : (handle === 'tl' || handle === 'br' ? 'nwse-resize' : 'nesw-resize');
              return;
            }
          }
        }

        // Check if hovering over text or logo
        const hitText = this.textureEngine.findTextAtUV(hit.uv.x, hit.uv.y, state.texts);
        const hitLogo = this.textureEngine.findLogoAtUV(hit.uv.x, hit.uv.y, state.logos);

        if (hitText || hitLogo) {
          domEl.style.cursor = 'grab';
          return;
        }
      }

      domEl.style.cursor = 'default';
    });

    // Pointer Up
    const endDrag = () => {
      if (this.dragMode !== 'idle') {
        this.dragMode = 'idle';
        this.draggedItem = null;
        this.draggedType = null;
        this.controls.enabled = true;
        domEl.style.cursor = 'default';

        if (this.onItemDragEnd) {
          this.onItemDragEnd();
        }
      }
    };

    domEl.addEventListener('pointerup', endDrag);
    domEl.addEventListener('pointercancel', endDrag);
    domEl.addEventListener('pointerleave', endDrag);
  }

  identifyGarmentPartAtUV(u, v) {
    // 1. Check Collar (around top center of front or back neckline)
    if ((v < 0.12 && Math.abs(u - 0.25) < 0.08) || (v < 0.12 && Math.abs(u - 0.75) < 0.08)) {
      return 'collar';
    }
    // 2. Check Contrast Shoulders (Front Left, Front Right, Back Left, Back Right)
    const isFrontShoulder = v >= 0.07 && v <= 0.25 && ((u >= 0.03 && u <= 0.20) || (u >= 0.30 && u <= 0.47));
    const isBackShoulder = v >= 0.07 && v <= 0.25 && ((u >= 0.53 && u <= 0.70) || (u >= 0.80 && u <= 0.97));
    if (isFrontShoulder || isBackShoulder) {
      return 'accent';
    }
    // 3. Default: Main Body
    return 'primary';
  }

  setTheme(theme) {
    this.currentTheme = theme;
    if (theme === 'light') {
      this.lights.ambient.intensity = 1.6;
      this.lights.key.intensity = 2.0;
      this.lights.fill.intensity = 1.3;
      this.lights.rim.intensity = 1.4;
    } else {
      this.lights.ambient.intensity = 1.3;
      this.lights.key.intensity = 2.4;
      this.lights.fill.intensity = 1.4;
      this.lights.rim.intensity = 2.0;
    }
  }

  setCameraPreset(presetName) {
    const radius = 0.90;
    const targetY = 0.04;
    let targetPos = new THREE.Vector3();

    switch (presetName) {
      case 'front':
        targetPos.set(0, targetY, radius);
        break;
      case 'back':
        targetPos.set(0, targetY, -radius);
        break;
      case 'left':
        targetPos.set(-radius, targetY, 0);
        break;
      case 'right':
        targetPos.set(radius, targetY, 0);
        break;
      case 'perspective':
      default:
        targetPos.set(radius * 0.65, targetY + 0.2, radius * 0.75);
        break;
    }

    this.animateCameraTo(targetPos, new THREE.Vector3(0, targetY, 0));
  }

  animateCameraTo(targetPosition, targetLookAt, duration = 800) {
    this.isTransitioningCamera = true;
    const startPos = this.camera.position.clone();
    const startLook = this.controls.target.clone();
    const startTime = performance.now();

    const updateCam = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.camera.position.lerpVectors(startPos, targetPosition, ease);
      this.controls.target.lerpVectors(startLook, targetLookAt, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(updateCam);
      } else {
        this.isTransitioningCamera = false;
      }
    };

    requestAnimationFrame(updateCam);
  }

  toggleAutoRotate(state = null) {
    this.isAutoRotating = state !== null ? state : !this.isAutoRotating;
    this.controls.autoRotate = this.isAutoRotating;
    this.controls.autoRotateSpeed = 2.5;
    return this.isAutoRotating;
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Capture angle snapshot with clean texture (no gizmos)
  async captureAngle(presetName, width = 1200, height = 1200, isClean = true) {
    if (isClean && this.textureEngine) {
      await this.textureEngine.render(this.getState(), { hideSelection: true });
    }

    const savedPos = this.camera.position.clone();
    const savedTarget = this.controls.target.clone();
    const savedAspect = this.camera.aspect;
    const savedSize = new THREE.Vector2();
    this.renderer.getSize(savedSize);

    const radius = 0.88;
    const targetY = 0.04;

    switch (presetName) {
      case 'front':
        this.camera.position.set(0, targetY, radius);
        break;
      case 'back':
        this.camera.position.set(0, targetY, -radius);
        break;
      case 'left':
        this.camera.position.set(-radius, targetY, 0);
        break;
      case 'right':
        this.camera.position.set(radius, targetY, 0);
        break;
      case 'perspective':
      default:
        this.camera.position.set(radius * 0.65, targetY + 0.2, radius * 0.75);
        break;
    }

    this.controls.target.set(0, targetY, 0);
    this.controls.update();

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png', 1.0);

    this.camera.position.copy(savedPos);
    this.controls.target.copy(savedTarget);
    this.controls.update();
    this.camera.aspect = savedAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(savedSize.x, savedSize.y);
    this.renderer.render(this.scene, this.camera);

    if (isClean && this.textureEngine) {
      await this.textureEngine.render(this.getState(), { hideSelection: false });
    }

    return dataUrl;
  }

  async captureComposite(width = 2400, height = 1350) {
    if (this.textureEngine) {
      await this.textureEngine.render(this.getState(), { hideSelection: true });
    }

    const frontUrl = await this.captureAngle('front', 1200, 1200, false);
    const backUrl = await this.captureAngle('back', 1200, 1200, false);

    if (this.textureEngine) {
      await this.textureEngine.render(this.getState(), { hideSelection: false });
    }

    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

    const [frontImg, backImg] = await Promise.all([loadImage(frontUrl), loadImage(backUrl)]);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const isLight = this.currentTheme === 'light';
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isLight) {
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#e2e8f0');
    } else {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = "bold 44px 'Montserrat', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(t('mockup_header') || 'SOBRAL 3D TRIKOT-MOCKUP', width / 2, 90);

    ctx.font = "600 22px 'Montserrat', sans-serif";
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.fillText(t('mockup_subheader') || 'Spezifikation und Produktionsmuster', width / 2, 130);

    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 160);
    ctx.lineTo(width - 120, 160);
    ctx.stroke();

    const imgSize = 1050;
    const posY = 180;
    ctx.drawImage(frontImg, width * 0.25 - imgSize / 2, posY, imgSize, imgSize);
    ctx.drawImage(backImg, width * 0.75 - imgSize / 2, posY, imgSize, imgSize);

    ctx.fillStyle = '#3b82f6';
    ctx.font = "bold 32px 'Montserrat', sans-serif";
    ctx.fillText((t('front_view') || 'Vorderseite').toUpperCase(), width * 0.25, posY + imgSize + 30);
    ctx.fillText((t('back_view') || 'Rückseite').toUpperCase(), width * 0.75, posY + imgSize + 30);

    ctx.fillStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    ctx.font = "bold 18px monospace";
    ctx.textAlign = 'right';
    ctx.fillText(`GENERATED: ${new Date().toLocaleDateString()} • SOBRAL 3D STUDIO`, width - 80, height - 30);

    return canvas.toDataURL('image/png', 1.0);
  }

  captureSnapshot(width = 1920, height = 1080) {
    const originalAspect = this.camera.aspect;
    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png', 1.0);

    this.camera.aspect = originalAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(originalSize.x, originalSize.y);
    this.renderer.render(this.scene, this.camera);

    return dataUrl;
  }
}
