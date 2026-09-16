import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { FabricTextureGenerator } from './fabricTexture.js';
import { ModelStorage } from './modelStorage.js';
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
    this.productMeshes = [];
    this.materialGroups = new Map();
    this.clonedMaterials = new Map();
    this.isMultiMesh = false;
    this.decalGroup = new THREE.Group();
    this._loadId = 0;
    this.shadowMesh = null;
    this.cameraTransition = null;
    this.componentVisibility = { prints: true, straps: true, inside: true };
    this.isWireframe = false;

    this.isAutoRotating = false;
    this.isTransitioningCamera = false;

    // Raycasting & Interaction Modes: 'idle', 'move', 'scale', 'rotate'
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
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

    // Gizmo & Decals State
    this.gizmoGroup = null;
    this.selectedDecalMesh = null;
    this.isDragging = false;
    this.isTransforming = false;

    // Callbacks
    this.onItemSelect = null;
    this.onItemDrag = null;
    this.onItemScale = null;
    this.onItemRotate = null;
    this.onItemDragEnd = null;
    this.onDeselect = null;
    this.onBackgroundChange = null;

    this.lights = {};
    this.currentTheme = 'light';
    this.currentBackground = 'light';
    try {
      this.currentBackground = localStorage.getItem('sobral_viewer_bg') || 'light';
    } catch (e) {}

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.05, 1.55);

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
    this.controls.maxDistance = 2.5;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.target.set(0, 0.05, 0);
    this.controls.update();

    this.controls.addEventListener('start', () => {
      this.cameraTransition = null;
    });

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Ground Shadow & Decals
    this.setupGroundShadow();
    this.scene.add(this.decalGroup);
    this.setBackground(this.currentBackground);

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
    this.shadowMesh = shadowMesh;
    this.scene.add(shadowMesh);
  }

  loadModel(modelUrl = '/shirt_baked.glb') {
    this._loadId = (this._loadId || 0) + 1;
    const currentLoadId = this._loadId;

    if (this.shirtGroup) {
      this.scene.remove(this.shirtGroup);
      this.shirtGroup.traverse((node) => {
        if (node.isMesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(m => m.dispose());
          }
        }
      });
      this.shirtGroup = null;
      this.shirtMesh = null;
    }
    this.productMeshes = [];
    this.materialGroups.clear();
    this.clonedMaterials.clear();

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (this._loadId !== currentLoadId) return;

        const root = gltf.scene;

        const meshesInGltf = [];
        root.traverse((node) => {
          if (node.isMesh) meshesInGltf.push(node);
        });

        const isSobralSortiment = modelUrl.includes('/models/sobral-') || meshesInGltf.length > 1;
        this.isMultiMesh = isSobralSortiment;

        if (isSobralSortiment) {
          this.isAiModel = true;
          meshesInGltf.forEach((node) => {
            this.productMeshes.push(node);
            node.castShadow = true;
            node.receiveShadow = true;

            const sourceMaterials = Array.isArray(node.material) ? node.material : [node.material];
            const materials = sourceMaterials.map((source) => {
              let material = this.clonedMaterials.get(source.uuid);
              if (!material) {
                material = source.clone();
                this.clonedMaterials.set(source.uuid, material);
                const role = material.userData?.sobralRole || material.name;
                if (!this.materialGroups.has(role)) {
                  this.materialGroups.set(role, new Set());
                }
                this.materialGroups.get(role).add(material);
              }
              return material;
            });
            node.material = Array.isArray(node.material) ? materials : materials[0];
          });

          // Set primary mesh reference for raycasting fallback
          this.shirtMesh = meshesInGltf[0] || null;

          // Standalone single garment / helmet mode
          root.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          if (maxSize > 0) {
            const displayHeight = 0.72;
            root.scale.multiplyScalar(displayHeight / maxSize);
            root.updateMatrixWorld(true);
          }
          const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
          root.position.sub(center);
          root.position.y += 0.05;
          root.updateMatrixWorld(true);

          this.scene.add(root);
          this.shirtGroup = root;

          if (this.shadowMesh) {
            this.shadowMesh.position.y = -0.32;
            this.shadowMesh.scale.set(1.0, 1.0, 1.0);
          }

          if (this.controls) {
            this.controls.minDistance = 0.35;
            this.controls.maxDistance = 3.5;
            this.controls.target.set(0, 0.05, 0);
            this.camera.position.set(0, 0.05, 1.55);
            this.controls.update();
          }

          // Apply product colors from state
          this.updateMaterialColor(this.getState().colors);
          this.updateDecals();
          this.setComponentVisibility(this.componentVisibility);
          if (this.isWireframe) this.setWireframe(true);
        } else {
          // Legacy single mesh mode (/shirt_baked.glb)
          this.isAiModel = false;
          root.traverse((child) => {
            if (child.isMesh) {
              this.shirtMesh = child;
              this.productMeshes.push(child);

              const origMat = child.material;
              const dynamicTexture = this.textureEngine.getTexture();
              if (this.renderer) {
                dynamicTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
              }

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
                map: dynamicTexture,
                normalMap: normalMap,
                normalScale: new THREE.Vector2(0.4, 0.4),
                roughness: 0.9,
                metalness: 0.02,
                aoMap: origMat?.aoMap || null,
                aoMapIntensity: 0.7,
                side: THREE.DoubleSide,
                transparent: true,
                alphaTest: 0.5
              });

              child.material = this.shirtMaterial;
              child.castShadow = true;
              child.receiveShadow = true;

              this.textureEngine.render(this.getState()).then(() => {
                dynamicTexture.needsUpdate = true;
              });
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
          this.shirtGroup = root;

          if (this.shadowMesh) {
            this.shadowMesh.position.y = -0.32;
            this.shadowMesh.scale.set(1.0, 1.0, 1.0);
          }

          if (this.controls) {
            this.controls.minDistance = 0.35;
            this.controls.maxDistance = 3.5;
            this.controls.target.set(0, 0.05, 0);
            this.camera.position.set(0, 0.05, 1.55);
            this.controls.update();
          }
        }
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
      }
    );
  }

  updateMaterialColor(colors) {
    if (!colors) return;
    if (this.isMultiMesh) {
      const primaryColor = colors.primary || '#1b2034';
      const accentColor = colors.accent || primaryColor;
      const collarColor = colors.collar || colors.accent || primaryColor;

      // Primary Body / Shell Roles (includes helmet shell)
      ['fabric_primary', 'shell_primary', 'knit_shell', 'trousers_mainshell', 'shirt'].forEach(role => {
        const group = this.materialGroups.get(role);
        if (group) group.forEach(mat => mat.color.set(primaryColor));
      });

      // Accent / Secondary / Hood / Hardware Roles
      ['fabric_secondary', 'shell_secondary', 'hood_lining', 'stretch_panels', 'reinforcement', 'hardware_orange', 'emboss_white'].forEach(role => {
        const group = this.materialGroups.get(role);
        if (group) group.forEach(mat => mat.color.set(accentColor));
      });

      const trousersCol = colors.trousers || '#1a2232';
      ['trousers'].forEach(role => {
        const group = this.materialGroups.get(role);
        if (group) group.forEach(mat => mat.color.set(trousersCol));
      });

      // Collar / Rib trim / Straps / Headband Roles
      ['rib_trim', 'collar', 'lining', 'shirt_trim', 'strap_webbing', 'headband', 'hardware_black'].forEach(role => {
        const group = this.materialGroups.get(role);
        if (group) group.forEach(mat => mat.color.set(collarColor));
      });
    } else if (this.shirtMaterial) {
      this.shirtMaterial.color.set(0xffffff);
    }
  }

  async updateDecals() {
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

    if (!this.isAiModel && !this.isMultiMesh) return;

    const state = this.getState();
    const activeProduct = state.activeProduct;
    const targetMeshes = this.isMultiMesh ? this.productMeshes : (this.shirtMesh ? [this.shirtMesh] : []);
    if (!targetMeshes.length) return;

    const raycastSurface = (origin, direction) => {
      const ray = new THREE.Raycaster(origin, direction.normalize());
      const intersects = ray.intersectObjects(targetMeshes, false);
      if (!intersects.length) return null;
      const candidate = intersects.find(hit => hit.object.userData?.decalTarget === true);
      return candidate || intersects[0];
    };

    // Project Logos onto 3D Mesh
    for (const logo of state.logos || []) {
      if (!logo.visible) continue;
      const img = await this.textureEngine.loadImage(logo.src);
      if (!img) continue;

      const logoTex = new THREE.CanvasTexture(img);
      logoTex.colorSpace = THREE.SRGBColorSpace;

      const zoneDef = activeProduct?.zones?.[logo.zone];
      let hit = null;

      if (zoneDef?.rayOrigin) {
        const [rx, ry, rz] = zoneDef.rayOrigin;
        const origin = new THREE.Vector3(rx + (logo.offsetX || 0) * 0.001, ry - (logo.offsetY || 0) * 0.001, rz);
        const dir = new THREE.Vector3(-rx * 0.5, 0, -rz * 0.5);
        hit = raycastSurface(origin, dir.length() > 0 ? dir : new THREE.Vector3(0, 0, -1));
      }

      if (!hit) {
        const isFront = !logo.zone?.includes('back');
        const isLeft = logo.zone?.includes('left');
        const isRight = logo.zone?.includes('right');

        let origin, dir;
        if (isLeft) {
          origin = new THREE.Vector3(0.5, 0.10 - (logo.offsetY || 0) * 0.002, (logo.offsetX || 0) * 0.002);
          dir = new THREE.Vector3(-1, 0, 0);
        } else if (isRight) {
          origin = new THREE.Vector3(-0.5, 0.10 - (logo.offsetY || 0) * 0.002, (logo.offsetX || 0) * 0.002);
          dir = new THREE.Vector3(1, 0, 0);
        } else if (isFront) {
          origin = new THREE.Vector3((logo.offsetX || 0) * 0.002, 0.08 - (logo.offsetY || 0) * 0.002, 0.6);
          dir = new THREE.Vector3(0, 0, -1);
        } else {
          origin = new THREE.Vector3(-(logo.offsetX || 0) * 0.002, 0.08 - (logo.offsetY || 0) * 0.002, -0.6);
          dir = new THREE.Vector3(0, 0, 1);
        }
        hit = raycastSurface(origin, dir);
      }

      if (hit && hit.face) {
        try {
          const normal = hit.face.normal.clone().applyNormalMatrix(
            new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
          ).normalize();
          const zAxis = new THREE.Vector3(0, 0, 1);
          const q = new THREE.Quaternion().setFromUnitVectors(zAxis, normal);
          q.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis, THREE.MathUtils.degToRad(logo.rotation || 0)));
          const orient = new THREE.Euler().setFromQuaternion(q);

          const baseScale = (zoneDef?.defaultScale || 1.0) * (logo.scale || 1.0);
          const size = new THREE.Vector3(0.18 * baseScale, 0.18 * baseScale, 0.15);

          const decalGeo = new DecalGeometry(hit.object, hit.point, orient, size);
          const decalMat = new THREE.MeshStandardMaterial({
            map: logoTex,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            roughness: 0.9,
            metalness: 0
          });
          const decalMesh = new THREE.Mesh(decalGeo, decalMat);
          decalMesh.userData = { type: 'logo', id: logo.id };
          this.decalGroup.add(decalMesh);
        } catch (e) {
          console.warn('Decal generation failed:', e);
        }
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

      const zoneDef = activeProduct?.zones?.[textItem.zone];
      let hit = null;

      if (zoneDef?.rayOrigin) {
        const [rx, ry, rz] = zoneDef.rayOrigin;
        const origin = new THREE.Vector3(rx + (textItem.offsetX || 0) * 0.001, ry - (textItem.offsetY || 0) * 0.001, rz);
        const dir = new THREE.Vector3(-rx * 0.5, 0, -rz * 0.5);
        hit = raycastSurface(origin, dir.length() > 0 ? dir : new THREE.Vector3(0, 0, -1));
      }

      if (!hit) {
        const isFront = !textItem.zone?.includes('back');
        const origin = new THREE.Vector3(
          (textItem.offsetX || 0) * 0.002,
          0.10 - (textItem.offsetY || 0) * 0.002,
          isFront ? 0.6 : -0.6
        );
        const dir = new THREE.Vector3(0, 0, isFront ? -1 : 1);
        hit = raycastSurface(origin, dir);
      }

      if (hit && hit.face) {
        try {
          const normal = hit.face.normal.clone().applyNormalMatrix(
            new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
          ).normalize();
          const zAxis = new THREE.Vector3(0, 0, 1);
          const q = new THREE.Quaternion().setFromUnitVectors(zAxis, normal);
          q.multiply(new THREE.Quaternion().setFromAxisAngle(zAxis, THREE.MathUtils.degToRad(textItem.rotation || 0)));
          const orient = new THREE.Euler().setFromQuaternion(q);

          const size = new THREE.Vector3(0.28, 0.14, 0.15);
          const decalGeo = new DecalGeometry(hit.object, hit.point, orient, size);
          const decalMat = new THREE.MeshStandardMaterial({
            map: textTex,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            roughness: 0.9,
            metalness: 0
          });
          const decalMesh = new THREE.Mesh(decalGeo, decalMat);
          decalMesh.userData = { type: 'text', id: textItem.id };
          this.decalGroup.add(decalMesh);
        } catch (e) {
          console.warn('Text Decal generation failed:', e);
        }
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
      const meshes = this.isMultiMesh ? this.productMeshes : (this.shirtMesh ? [this.shirtMesh] : []);
      if (!meshes.length) return null;
      const { x, y } = getPointerCoords(e);
      this.pointer.set(x, y);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(meshes, false);
      return intersects.length > 0 ? intersects[0] : null;
    };

    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    // Pointer Down
    domEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;

      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();

      const state = this.getState();
      const { x, y } = getPointerCoords(e);
      this.pointer.set(x, y);
      this.raycaster.setFromCamera(this.pointer, this.camera);

      // 0. Check if clicked directly on a Decal in decalGroup
      if (this.decalGroup && this.decalGroup.children.length > 0) {
        const decalHits = this.raycaster.intersectObjects(this.decalGroup.children, false);
        if (decalHits.length > 0) {
          const clickedDecal = decalHits[0].object;
          const meta = clickedDecal.userData;
          if (meta && meta.id) {
            const isText = meta.type === 'text';
            const item = isText
              ? state.texts?.find(t => t.id === meta.id)
              : state.logos?.find(l => l.id === meta.id);
            if (item) {
              this.dragMode = 'move';
              this.draggedItem = item;
              this.draggedType = meta.type;
              this.dragStartOffset = { x: item.offsetX || 0, y: item.offsetY || 0 };
              this.controls.enabled = false;
              domEl.style.cursor = 'grabbing';
              if (this.onItemSelect) {
                this.onItemSelect(meta.type, item.id);
              }
              return;
            }
          }
        }
      }

      const hit = getRaycastHit(e);
      if (!hit) {
        if (this.onDeselect) this.onDeselect();
        return;
      }

      const uv = hit.uv;
      if (!uv) return;

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
    });

    // Pointer Move
    domEl.addEventListener('pointermove', (e) => {
      // 1. Handling active dragging modes
      if (this.dragMode === 'move' && this.draggedItem) {
        if (this.isMultiMesh) {
          const dx = Math.round((e.movementX || 0) * 1.5);
          const dy = Math.round((e.movementY || 0) * 1.5);
          this.draggedItem.offsetX = Math.max(-180, Math.min(180, (this.draggedItem.offsetX || 0) + dx));
          this.draggedItem.offsetY = Math.max(-180, Math.min(180, (this.draggedItem.offsetY || 0) + dy));
          if (this.onItemDrag) {
            this.onItemDrag(this.draggedType, this.draggedItem.id, this.draggedItem.offsetX, this.draggedItem.offsetY);
          }
          return;
        }

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
    const endDrag = (e) => {
      const isQuickClick = e && e.clientX !== undefined && (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) < 6) && (Date.now() - pointerDownTime < 400);

      if (this.dragMode !== 'idle') {
        this.dragMode = 'idle';
        this.draggedItem = null;
        this.draggedType = null;
        this.controls.enabled = true;
        domEl.style.cursor = 'default';

        if (this.onItemDragEnd) {
          this.onItemDragEnd();
        }
        return;
      }

      // If it was a quick stationary click, handle part picking
      if (isQuickClick) {
        const hit = getRaycastHit(e);
        if (hit) {
          if (this.isMultiMesh && hit.object?.material) {
            const role = (hit.object.material.userData?.sobralRole || hit.object.material.name || '').toLowerCase();
            let clickedPart = 'primary';
            if (role.includes('rib') || role.includes('collar') || role.includes('lining') || role.includes('zipper')) {
              clickedPart = 'collar';
            } else if (role.includes('secondary') || role.includes('hood') || role.includes('stretch') || role.includes('reinforcement')) {
              clickedPart = 'accent';
            }
            if (this.onPartClick) {
              this.onPartClick(clickedPart);
            }
          } else if (hit.uv) {
            const clickedPart = this.identifyGarmentPartAtUV(hit.uv.x, hit.uv.y);
            if (this.onPartClick) {
              this.onPartClick(clickedPart);
            }
          }
        }
      }
    };

    domEl.addEventListener('pointerup', (e) => endDrag(e));
    domEl.addEventListener('pointercancel', () => endDrag(null));
    domEl.addEventListener('pointerleave', () => endDrag(null));
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
    if (this.cameraTransition) {
      const now = performance.now();
      const t = Math.min((now - this.cameraTransition.start) / 450, 1.0);
      const e = t * t * (3 - 2 * t);
      this.camera.position.lerpVectors(this.cameraTransition.from, this.cameraTransition.to, e);
      this.controls.target.lerpVectors(this.cameraTransition.fromTarget, this.cameraTransition.toTarget, e);
      if (t >= 1.0) {
        this.cameraTransition = null;
      }
    }
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

    const radius = 1.62;
    const targetY = 0.0;

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
        this.camera.position.set(radius * 0.65, targetY + 0.18, radius * 0.75);
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

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#121316');
    bgGrad.addColorStop(1, '#08080a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 44px 'Space Grotesk', 'Montserrat', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(t('mockup_header') || 'SOBRAL 3D WORKWEAR SPECIFICATION', width / 2, 85);

    ctx.font = "600 20px 'Space Grotesk', 'Montserrat', sans-serif";
    ctx.fillStyle = '#ff4400';
    ctx.fillText(t('mockup_subheader') || 'Offizielles SOBRAL.CH Produktions- und Freigabemuster', width / 2, 122);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, 150);
    ctx.lineTo(width - 120, 150);
    ctx.stroke();

    const imgSize = 1060;
    const posY = 170;
    ctx.drawImage(frontImg, width * 0.25 - imgSize / 2, posY, imgSize, imgSize);
    ctx.drawImage(backImg, width * 0.75 - imgSize / 2, posY, imgSize, imgSize);

    ctx.fillStyle = '#ff4400';
    ctx.font = "bold 28px 'Space Grotesk', 'Montserrat', sans-serif";
    ctx.fillText((t('front_view') || 'VORDERSEITE (FRONT)').toUpperCase(), width * 0.25, posY + imgSize + 10);
    ctx.fillText((t('back_view') || 'RÜCKSEITE (BACK)').toUpperCase(), width * 0.75, posY + imgSize + 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = "bold 16px monospace";
    ctx.textAlign = 'right';
    ctx.fillText(`SOBRAL.CH • 3D CUSTOM STUDIO • GENERATED: ${new Date().toLocaleDateString()}`, width - 80, height - 30);

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

  setView(viewName, animate = true) {
    const dist = 1.55;
    const targetY = 0.05;
    const center = new THREE.Vector3(0, targetY, 0);

    let targetPos = new THREE.Vector3(0, targetY, dist);
    if (viewName === 'perspective') {
      // 3/4 Perspective angle (depth and volume across all products)
      targetPos.set(-dist * 0.64, targetY + dist * 0.35, dist * 0.78);
    } else if (viewName === 'front') {
      targetPos.set(0, targetY, dist);
    } else if (viewName === 'back') {
      targetPos.set(0, targetY, -dist);
    } else if (viewName === 'left') {
      targetPos.set(-dist, targetY, 0);
    } else if (viewName === 'right') {
      targetPos.set(dist, targetY, 0);
    } else if (viewName === 'top') {
      targetPos.set(0, targetY + dist * 1.05, 0.001);
    }

    if (this.controls) {
      this.controls.minDistance = 0.35;
      this.controls.maxDistance = 3.5;

      if (animate) {
        this.cameraTransition = {
          start: performance.now(),
          from: this.camera.position.clone(),
          to: targetPos,
          fromTarget: this.controls.target.clone(),
          toTarget: center
        };
      } else {
        this.cameraTransition = null;
        this.camera.position.copy(targetPos);
        this.controls.target.copy(center);
        this.controls.update();
      }
    }
  }

  zoom(factor) {
    this.cameraTransition = null;
    if (this.camera && this.controls) {
      this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);
      this.controls.update();
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    this.setWireframe(this.isWireframe);
    return this.isWireframe;
  }

  setWireframe(enabled) {
    this.isWireframe = !!enabled;
    if (this.shirtGroup) {
      this.shirtGroup.traverse((o) => {
        if (o.isMesh && o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => {
            m.wireframe = this.isWireframe;
          });
        }
      });
    }
  }

  setComponentVisibility(opts = {}) {
    this.componentVisibility = { ...this.componentVisibility, ...opts };
    if (!this.shirtGroup) return;

    const { prints = true, straps = true, inside = true } = this.componentVisibility;
    const strapNames = ['ChinStrap', 'StrapHardware', 'ChinBuckle_Black', 'ChinBuckle_OrangeRelease'];
    const insideNames = ['ImpactLiner', 'AdjustableHeadband', 'ForeheadPadding', 'OccipitalPadding', 'SuspensionArms', 'RearAdjustmentDial', 'AccessoryReceiver30mm_A', 'AccessoryReceiver30mm_B'];

    this.shirtGroup.traverse((o) => {
      // Toggle pre-baked manufacturer prints
      if (o.name.startsWith('Print_')) {
        o.visible = prints;
      }
      // Toggle straps / harness
      if (strapNames.includes(o.name)) {
        o.visible = straps;
      }
      // Toggle internal liner / cushioning
      if (insideNames.includes(o.name)) {
        o.visible = inside;
      }
    });
  }

  setBackground(bgType = 'light') {
    this.currentBackground = bgType;
    try {
      localStorage.setItem('sobral_viewer_bg', bgType);
    } catch (e) {}

    const vp = this.container.closest('.viewport-area') || this.container;
    if (vp) {
      vp.dataset.background = bgType;
    }

    if (this.shadowMesh) {
      this.shadowMesh.visible = (bgType !== 'dark');
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    if (typeof this.onBackgroundChange === 'function') {
      this.onBackgroundChange(bgType);
    }
  }

  async captureCurrentView(filename = null) {
    const activeProd = this.getState()?.activeProduct;
    const prodName = (activeProd?.articleNumber ? `sobral-${activeProd.articleNumber}` : (activeProd?.name || 'sobral-produkt')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const name = filename || `${prodName}-ansicht.png`;

    const wasGizmo = this.gizmoGroup?.visible;
    if (this.gizmoGroup) this.gizmoGroup.visible = false;

    this.renderer.render(this.scene, this.camera);

    return new Promise((resolve) => {
      this.renderer.domElement.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          resolve(true);
        } else {
          resolve(false);
        }
        if (wasGizmo && this.gizmoGroup) this.gizmoGroup.visible = true;
      }, 'image/png');
    });
  }

  async downloadActiveModelGlb() {
    const activeProd = this.getState()?.activeProduct;
    const prodName = (activeProd?.articleNumber ? `sobral-${activeProd.articleNumber}` : (activeProd?.id || 'produkt')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${prodName}.glb`;

    try {
      let blob = null;
      if (activeProd?.storageKey) {
        const stored = await ModelStorage.getModel(activeProd.storageKey);
        if (stored?.data) {
          blob = stored.data instanceof Blob ? stored.data : new Blob([stored.data], { type: 'model/gltf-binary' });
        }
      }

      if (!blob) {
        const url = activeProd?.modelUrl || '/shirt_baked.glb';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        blob = await res.blob();
      }

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
      return true;
    } catch (err) {
      console.error('Error downloading GLB model:', err);
      alert('Fehler beim Herunterladen der GLB-Datei: ' + err.message);
      return false;
    }
  }

  resetView() {
    this.setView('perspective');
    if (this.isWireframe) {
      this.toggleWireframe();
    }
    if (this.componentVisibility) {
      this.setComponentVisibility({ prints: true, straps: true, inside: true });
    }
    this.setBackground('light');
  }
}
