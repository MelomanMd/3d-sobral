import * as THREE from 'three';

export const REPORT_VIEWS = [
  { id: 'front', label: 'VORDERSEITE', direction: [0, 0, 1] },
  { id: 'back', label: 'RUECKSEITE', direction: [0, 0, -1] },
  { id: 'left', label: 'LINKS', direction: [-1, 0, 0] },
  { id: 'right', label: 'RECHTS', direction: [1, 0, 0] }
];

export function placementStateKey(state) {
  return JSON.stringify({ product: state.activeProduct, patternId: state.patternId, colors: state.colors, logos: state.logos, texts: state.texts });
}

export function getReportItems(state) {
  return [
    ...(state.logos || []).filter(item => item.visible).map(item => ({ ...item, type: 'logo' })),
    ...(state.texts || []).filter(item => item.visible && item.text?.trim()).map(item => ({ ...item, type: 'text' }))
  ].map((item, index) => ({ ...item, number: index + 1, label: item.type === 'text' ? item.text : item.name || 'Logo' }));
}

function makeCamera(bounds, view, pixels) {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const horizontal = view.direction[0] ? size.z : size.x;
  const span = Math.max(horizontal, size.y) * 1.16;
  const camera = new THREE.OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.001, span * 12);
  camera.position.copy(center).add(new THREE.Vector3(...view.direction).multiplyScalar(span * 3));
  camera.lookAt(center);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  const corners = [];
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    const p = new THREE.Vector3(x, y, z).project(camera);
    corners.push({ x: (p.x + 1) * pixels / 2, y: (1 - p.y) * pixels / 2 });
  }
  const x = Math.min(...corners.map(p => p.x));
  const y = Math.min(...corners.map(p => p.y));
  const width = Math.max(...corners.map(p => p.x)) - x;
  const height = Math.max(...corners.map(p => p.y)) - y;
  return { camera, modelRect: { x, y, width, height } };
}

function worldMesh(source, material) {
  const mesh = new THREE.Mesh(source.geometry, material);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(source.matrixWorld);
  return mesh;
}

function alphaMaterial(texture, side) {
  return new THREE.ShaderMaterial({
    uniforms: { artwork: { value: texture } },
    vertexShader: 'varying vec2 artworkUv; void main() { artworkUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D artwork; varying vec2 artworkUv; void main() { if (texture2D(artwork, artworkUv).a < 0.05) discard; gl_FragColor = vec4(1.0); }',
    side,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
  });
}

// Measure actual visible ink, not a padded text canvas or an estimated logo size.
// Depth-only garment meshes keep artwork on the far side from showing through.
function measureInk(renderer, camera, meshes, artworkMeshes, pixels) {
  const scene = new THREE.Scene();
  const temporaryMaterials = [];
  for (const mesh of meshes) {
    const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const depth = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, side: source?.side ?? THREE.FrontSide });
    temporaryMaterials.push(depth);
    const copy = worldMesh(mesh, depth);
    copy.renderOrder = -100;
    scene.add(copy);
  }
  for (const { mesh, texture } of artworkMeshes) {
    const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const material = alphaMaterial(texture, source?.side ?? THREE.FrontSide);
    temporaryMaterials.push(material);
    const copy = worldMesh(mesh, material);
    copy.renderOrder = 1;
    scene.add(copy);
  }
  try {
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const data = new Uint8Array(pixels * pixels * 4);
    gl.readPixels(0, 0, pixels, pixels, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let minX = pixels, minY = pixels, maxX = -1, maxY = -1;
    for (let y = 0; y < pixels; y++) for (let x = 0; x < pixels; x++) {
      if (data[(y * pixels + x) * 4 + 3] < 128) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, pixels - 1 - y); maxY = Math.max(maxY, pixels - 1 - y);
    }
    return maxX < 0 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  } finally {
    temporaryMaterials.forEach(material => material.dispose());
  }
}

export function relativeInkBounds(ink, model) {
  if (!ink) return null;
  return {
    centerX: ((ink.x + ink.width / 2 - model.x) / model.width) * 100,
    centerY: ((ink.y + ink.height / 2 - model.y) / model.height) * 100,
    width: ink.width / model.width * 100,
    height: ink.height / model.height * 100
  };
}

export async function captureProductionReport(viewer, snapshot, pixels = 1200) {
  if (viewer.isModelLoading || viewer.loadedModelUrl !== snapshot.activeProduct?.modelUrl) throw new Error('Bitte warten, bis das 3D-Modell geladen ist.');
  const key = placementStateKey(snapshot);
  const items = getReportItems(snapshot);
  const temporaryTextures = [];
  try {
    await document.fonts.ready;
    await viewer.textureEngine.render(snapshot, { hideSelection: true });
    viewer.updateMaterialColor(snapshot.colors);
    await viewer.updateDecals(snapshot);
    if (key !== placementStateKey(viewer.getState())) throw new Error('Konfiguration wurde geaendert. Bitte PDF erneut erstellen.');
    viewer.scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(viewer.shirtGroup);
    const artwork = new Map();
    for (const item of items) {
      if (viewer.isMultiMesh || viewer.isAiModel) {
        artwork.set(item.number, viewer.decalGroup.children
          .filter(mesh => mesh.userData.id === item.id && mesh.userData.type === item.type)
          .map(mesh => ({ mesh, texture: mesh.material.map })));
      } else {
        // Reuse the exact drawing functions and UV layout of the live shirt.
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = viewer.textureEngine.size;
        const ctx = canvas.getContext('2d');
        if (item.type === 'logo') await viewer.textureEngine.drawLogo(ctx, item, canvas.width, canvas.height);
        else viewer.textureEngine.drawText(ctx, item, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        temporaryTextures.push(texture);
        artwork.set(item.number, viewer.productMeshes.map(mesh => ({ mesh, texture })));
      }
    }
    const views = [];
    for (const view of REPORT_VIEWS) {
      // Keep the UI responsive between views. No shared camera state is changed.
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (key !== placementStateKey(viewer.getState())) throw new Error('Konfiguration wurde geaendert. Bitte PDF erneut erstellen.');
      const { camera, modelRect } = makeCamera(bounds, view, pixels);
      const renderer = viewer.renderer;
      const savedSize = renderer.getSize(new THREE.Vector2());
      const savedRatio = renderer.getPixelRatio();
      const savedColor = renderer.getClearColor(new THREE.Color());
      const savedAlpha = renderer.getClearAlpha();
      const gizmoVisible = viewer.gizmoGroup?.visible;
      const wasWireframe = viewer.isWireframe;
      const savedComponents = { ...viewer.componentVisibility };
      try {
        viewer.setComponentVisibility({ prints: true, straps: true, inside: true });
        if (viewer.gizmoGroup) viewer.gizmoGroup.visible = false;
        if (wasWireframe) viewer.setWireframe(false);
        renderer.setPixelRatio(1);
        renderer.setSize(pixels, pixels, false);
        renderer.render(viewer.scene, camera);
        const image = renderer.domElement.toDataURL('image/png');
        const placements = items.map(item => {
          const ink = measureInk(renderer, camera, viewer.productMeshes, artwork.get(item.number), pixels);
          return { number: item.number, ink, relative: relativeInkBounds(ink, modelRect) };
        });
        views.push({ ...view, image, modelRect, pixels, placements });
      } finally {
        renderer.setClearColor(savedColor, savedAlpha);
        renderer.setPixelRatio(savedRatio);
        renderer.setSize(savedSize.x, savedSize.y, false);
        if (viewer.gizmoGroup) viewer.gizmoGroup.visible = gizmoVisible;
        if (wasWireframe) viewer.setWireframe(true);
        viewer.setComponentVisibility(savedComponents);
        renderer.render(viewer.scene, viewer.camera);
      }
    }
    return { items, views, calibrated: false };
  } finally {
    temporaryTextures.forEach(texture => texture.dispose());
    await viewer.textureEngine.render(viewer.getState(), { hideSelection: false });
    viewer.updateMaterialColor(viewer.getState().colors);
    await viewer.updateDecals();
  }
}
