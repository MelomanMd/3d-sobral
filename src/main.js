import { TextureEngine } from './core/textureEngine.js';
import { ShirtViewer } from './core/viewer.js';
import { PhotoMockupViewer } from './components/photoMockupViewer.js';
import { ColorPanel, SPORT_PALETTES } from './components/colorPanel.js';
import { TextPanel } from './components/textPanel.js';
import { LogoPanel } from './components/logoPanel.js';
import { ViewControls } from './components/viewControls.js';
import { ExportModal } from './components/exportModal.js';
import { ImportModal } from './components/importModal.js';
import { AddProductModal } from './components/addProductModal.js';
import { ProductSwitcher } from './components/productSwitcher.js';
import { ProductCatalog } from './core/products.js';
import { FloatingGizmo } from './components/floatingGizmo.js';
import { HistoryManager } from './core/history.js';
import { DEFAULT_LOGOS, getLogoDataUrl } from './core/defaultLogos.js';
import { PATTERNS } from './core/patterns.js';
import { t, getLang, setLang } from './core/i18n.js';
import { ICONS } from './core/icons.js';

// Initial App State
let state = {
  selectedItemId: null,
  patternId: 'vexa',
  colors: {
    primary: '#121316',
    accent: '#dc2626',
    collar: '#f8fafc',
    secondary: '#ffffff'
  },
  texts: [
    {
      id: 'text_1',
      text: 'SOBRAL',
      zone: 'chest_center',
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: 56,
      fontWeight: '900',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      curve: 0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      visible: true,
      uppercase: true
    },
    {
      id: 'text_2',
      text: '10',
      zone: 'back_number',
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: 90,
      fontWeight: '900',
      color: '#ffffff',
      strokeColor: '#dc2626',
      strokeWidth: 6,
      curve: 0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      visible: true,
      uppercase: true
    },
    {
      id: 'text_3',
      text: 'CHAMPION',
      zone: 'back_top',
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: 42,
      fontWeight: '900',
      color: '#f8fafc',
      strokeColor: '#000000',
      strokeWidth: 3,
      curve: 0,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      visible: true,
      uppercase: true
    }
  ],
  logos: [
    {
      id: 'logo_1',
      name: 'Royal Lion Crest',
      src: getLogoDataUrl(DEFAULT_LOGOS[0]),
      zone: 'chest_left',
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      tint: 'original',
      offsetX: 0,
      offsetY: 0,
      visible: true
    }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  const canvasContainer = document.getElementById('canvas-container');
  const viewControlsRoot = document.getElementById('view-controls-root');
  const tabContentRoot = document.getElementById('tab-content-root');
  const productSwitcherRoot = document.getElementById('product-switcher-root');

  let viewer = null;

  // 1. Initialize Product Catalog
  const catalog = new ProductCatalog();

  // Insert Static SVG Icons
  const initStaticIcons = () => {
    const elUndo = document.getElementById('icon-undo');
    if (elUndo) elUndo.innerHTML = ICONS.undo;

    const elRedo = document.getElementById('icon-redo');
    if (elRedo) elRedo.innerHTML = ICONS.redo;

    const elFlagDe = document.getElementById('flag-de');
    if (elFlagDe) elFlagDe.innerHTML = ICONS.flagDe;

    const elFlagEn = document.getElementById('flag-en');
    if (elFlagEn) elFlagEn.innerHTML = ICONS.flagEn;

    const elAddProd = document.getElementById('icon-add-prod');
    if (elAddProd) elAddProd.innerHTML = ICONS.plus;

    const elImport = document.getElementById('icon-import');
    if (elImport) elImport.innerHTML = ICONS.folderOpen;

    const elShuffle = document.getElementById('icon-shuffle');
    if (elShuffle) elShuffle.innerHTML = ICONS.shuffle;

    const elDownload = document.getElementById('icon-download');
    if (elDownload) elDownload.innerHTML = ICONS.download;

    const elCrosshair = document.getElementById('icon-crosshair');
    if (elCrosshair) elCrosshair.innerHTML = ICONS.crosshair;

    const elTabColors = document.getElementById('tab-icon-colors');
    if (elTabColors) elTabColors.innerHTML = ICONS.palette;

    const elTabText = document.getElementById('tab-icon-text');
    if (elTabText) elTabText.innerHTML = ICONS.type;

    const elTabLogos = document.getElementById('tab-icon-logos');
    if (elTabLogos) elTabLogos.innerHTML = ICONS.shield;
  };

  initStaticIcons();

  // 2. Language Setup (German default, English option)
  const updateStaticTexts = () => {
    const brandBadge = document.getElementById('brand-badge');
    if (brandBadge) brandBadge.textContent = t('prototype_badge');

    const undoText = document.getElementById('undo-text');
    if (undoText) undoText.textContent = t('undo');

    const redoText = document.getElementById('redo-text');
    if (redoText) redoText.textContent = t('redo');

    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) themeLabel.textContent = currentTheme === 'light' ? t('theme_dark') : t('theme_light');

    const addProdLabel = document.getElementById('add-prod-label');
    if (addProdLabel) addProdLabel.textContent = t('add_product_btn');

    const importLabel = document.getElementById('import-label');
    if (importLabel) importLabel.textContent = t('load_project');

    const randLabel = document.getElementById('randomize-label');
    if (randLabel) randLabel.textContent = t('random_design');

    const exportLabel = document.getElementById('export-label');
    if (exportLabel) exportLabel.textContent = t('download_mockup');

    const hintText = document.getElementById('viewport-hint-text');
    if (hintText) hintText.textContent = t('viewport_hint');

    const tabColors = document.getElementById('tab-label-colors');
    if (tabColors) tabColors.textContent = t('tab_colors');

    const tabText = document.getElementById('tab-label-text');
    if (tabText) tabText.textContent = t('tab_text');

    const tabLogos = document.getElementById('tab-label-logos');
    if (tabLogos) tabLogos.textContent = t('tab_logos');
  };

  const applyLang = (lang) => {
    setLang(lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updateStaticTexts();
  };

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.lang);
      renderActivePanel();
      if (viewControls) viewControls.render();
      if (floatingGizmo) floatingGizmo.update();
      if (productSwitcher) productSwitcher.render();
    });
  });

  // 3. Theme Setup (Light by default)
  let currentTheme = localStorage.getItem('sobral_theme') || 'light';
  const applyTheme = (theme) => {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sobral_theme', theme);

    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    if (themeIcon && themeLabel) {
      if (theme === 'light') {
        themeIcon.innerHTML = ICONS.moon;
        themeLabel.textContent = t('theme_dark');
      } else {
        themeIcon.innerHTML = ICONS.sun;
        themeLabel.textContent = t('theme_light');
      }
    }

    if (viewer) {
      viewer.setTheme(theme);
    }
  };

  applyTheme(currentTheme);
  applyLang(getLang());

  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  // 4. Hydrate offline 3D models and photos from IndexedDB
  await catalog.hydrateOfflineModels();
  const initialProd = catalog.getActiveProduct() || DEFAULT_PRODUCTS[0];
  state.activeProduct = initialProd;
  state.patternId = initialProd.patternId || 'raglan_shoulder';
  state.colors = {
    primary: initialProd.colors?.primary || initialProd.baseColor || '#1b2034',
    accent: initialProd.colors?.accent || initialProd.accentColor || '#5b6c84',
    collar: initialProd.colors?.collar || '#1b2034',
    secondary: initialProd.colors?.secondary || '#ffffff'
  };
  state.productFrontPhoto = initialProd.frontPreview || null;
  state.productBackPhoto = initialProd.backPreview || null;
  state.productLeftPhoto = initialProd.leftPreview || null;
  state.productRightPhoto = initialProd.rightPreview || null;

  // 5. Create 2D Texture Engine
  const textureEngine = new TextureEngine(2048);
  await textureEngine.render(state);

  // 6. Create 3D Viewer with state getter
  viewer = new ShirtViewer(canvasContainer, textureEngine, () => state);
  viewer.setTheme(currentTheme);

  // 6. Create 2D Photo Mockup Viewer
  const viewportArea = document.querySelector('.viewport-area');
  const photoMockupViewer = new PhotoMockupViewer(viewportArea, () => state, () => onStateChange());

  // 7. Create View Controls with 3D/2D Mode switcher (4 Photo Angles)
  const viewControls = new ViewControls(viewControlsRoot, viewer, (mode) => {
    if (mode === '3d') {
      photoMockupViewer.setActive(false);
      canvasContainer.style.display = 'block';
    } else if (mode === '2d_front') {
      photoMockupViewer.setActive(true, 'front');
      canvasContainer.style.display = 'none';
    } else if (mode === '2d_back') {
      photoMockupViewer.setActive(true, 'back');
      canvasContainer.style.display = 'none';
    } else if (mode === '2d_left') {
      photoMockupViewer.setActive(true, 'left');
      canvasContainer.style.display = 'none';
    } else if (mode === '2d_right') {
      photoMockupViewer.setActive(true, 'right');
      canvasContainer.style.display = 'none';
    }
    if (floatingGizmo) floatingGizmo.update();
  });

  // 8. Create Floating Contextual Gizmo Toolbar on 3D Viewport
  const floatingGizmo = new FloatingGizmo(
    document.querySelector('.viewport-area'),
    () => state,
    (shouldRecordHistory = false) => {
      onStateUpdate();
      if (shouldRecordHistory) {
        historyManager.push(state);
      }
      if (activeTab === 'text' && textPanel) textPanel.render();
      if (activeTab === 'logos' && logoPanel) logoPanel.render();
    }
  );

  // 9. Create Product Switcher Dropdown
  const productSwitcher = new ProductSwitcher(
    productSwitcherRoot,
    catalog,
    (selectedProduct) => {
      // Product switched
      onProductSwitched(selectedProduct);
    },
    () => {
      // Open Add Product Wizard
      openAddProductModal();
    }
  );

  const openAddProductModal = () => {
    const modal = new AddProductModal(catalog, (newProd) => {
      if (productSwitcher) productSwitcher.render();
      onProductSwitched(newProd);
    });
    modal.open();
  };

  const btnOpenAddProduct = document.getElementById('btn-open-add-product');
  if (btnOpenAddProduct) {
    btnOpenAddProduct.addEventListener('click', () => {
      openAddProductModal();
    });
  }

  const onProductSwitched = async (prod) => {
    state.activeProduct = prod;
    state.productFrontPhoto = prod.frontPreview || null;
    state.productBackPhoto = prod.backPreview || null;
    state.productLeftPhoto = prod.leftPreview || null;
    state.productRightPhoto = prod.rightPreview || null;
    state.productTextureUrl = prod.textureUrl || null;

    // Reset design to be completely clean & blank for the new product
    state.texts = [];
    state.logos = [];
    state.selectedItemId = null;
    // Pattern & Colors
    state.patternId = prod.patternId || (prod.colors?.accent && prod.colors.accent !== prod.colors.primary ? 'raglan_shoulder' : 'solid');

    const primaryCol = prod.colors?.primary || prod.baseColor || '#1b2034';
    const accentCol = prod.colors?.accent || prod.accentColor || '#5b6c84';
    const collarCol = prod.colors?.collar || primaryCol;

    state.colors.primary = primaryCol;
    state.colors.accent = accentCol;
    state.colors.collar = collarCol;
    state.colors.secondary = prod.colors?.secondary || '#ffffff';

    await textureEngine.render(state);

    if (viewer) {
      viewer.loadModel(prod.modelUrl || '/shirt_baked.glb');
      if (viewer.shirtMaterial && viewer.shirtMaterial.map) {
        viewer.shirtMaterial.map.needsUpdate = true;
      }
      viewer.updateDecals();
    }
    if (photoMockupViewer) {
      photoMockupViewer.render();
    }
    if (viewControls) {
      viewControls.setHasPhotos(!!(prod.frontPreview || prod.backPreview || prod.leftPreview || prod.rightPreview));
      viewControls.setMode('3d');
    }
    if (floatingGizmo) floatingGizmo.update();
    setActiveTab('colors');
    historyManager.push(state);
  };

  // 9. Setup History Manager (Ctrl+Z / Ctrl+Y)
  let activeTab = 'colors';
  let colorPanel = null;
  let textPanel = null;
  let logoPanel = null;

  const renderActivePanel = () => {
    tabContentRoot.innerHTML = '';
    if (activeTab === 'colors') {
      colorPanel = new ColorPanel(tabContentRoot, state, onStateChange);
    } else if (activeTab === 'text') {
      textPanel = new TextPanel(tabContentRoot, state, onStateChange);
    } else if (activeTab === 'logos') {
      logoPanel = new LogoPanel(tabContentRoot, state, onStateChange);
    }
  };

  const historyManager = new HistoryManager(state, (restoredState) => {
    state = restoredState;
    onStateUpdate();
    floatingGizmo.update();
    renderActivePanel();
  });

  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  if (btnUndo) btnUndo.addEventListener('click', () => historyManager.undo());
  if (btnRedo) btnRedo.addEventListener('click', () => historyManager.redo());

  // 10. State Update & History Push
  let updateTimeout = null;
  const onStateUpdate = () => {
    if (updateTimeout) cancelAnimationFrame(updateTimeout);
    updateTimeout = requestAnimationFrame(async () => {
      await textureEngine.render(state);
      if (viewer) {
        viewer.updateMaterialColor(state.colors);
        viewer.updateDecals();
      }
      if (photoMockupViewer) {
        photoMockupViewer.render();
      }
    });
  };

  let historyDebounce = null;
  const onStateChange = () => {
    onStateUpdate();
    floatingGizmo.update();
    clearTimeout(historyDebounce);
    historyDebounce = setTimeout(() => {
      historyManager.push(state);
    }, 400);
  };

  const setActiveTab = (tabName) => {
    activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    renderActivePanel();
  };

  renderActivePanel();

  // 11. Wire up 3D Mouse Drag, Selection, and Corner Scaling
  viewer.onItemSelect = (type, itemId) => {
    state.selectedItemId = itemId;
    onStateUpdate();
    floatingGizmo.update();

    if (type === 'text') {
      setActiveTab('text');
      if (textPanel) textPanel.setActiveText(itemId);
    } else if (type === 'logo') {
      setActiveTab('logos');
      if (logoPanel) logoPanel.setActiveLogo(itemId);
    }
  };

  viewer.onDeselect = () => {
    if (state.selectedItemId) {
      state.selectedItemId = null;
      onStateUpdate();
      floatingGizmo.update();
    }
  };

  // 11.5. Direct 3D Part Picking (Click on shirt elements)
  viewer.onPartClick = (partId) => {
    if (activeTab !== 'colors') {
      setActiveTab('colors');
    }
    if (colorPanel) {
      colorPanel.setActiveZone(partId);
    }
  };

  viewer.onItemDrag = (type, itemId, offsetX, offsetY) => {
    onStateUpdate();
    if (type === 'text' && textPanel) {
      textPanel.updateOffsets(itemId, offsetX, offsetY);
    } else if (type === 'logo' && logoPanel) {
      logoPanel.updateOffsets(itemId, offsetX, offsetY);
    }
  };

  viewer.onItemScale = (type, itemId, newScaleOrSize) => {
    onStateUpdate();
    const isText = type === 'text';
    const item = isText ? state.texts.find(t => t.id === itemId) : state.logos.find(l => l.id === itemId);
    if (item) {
      floatingGizmo.syncValues(item, isText);
    }
    if (isText && textPanel) {
      textPanel.updateFontSize(itemId, newScaleOrSize);
    } else if (!isText && logoPanel) {
      logoPanel.updateScale(itemId, newScaleOrSize);
    }
  };

  viewer.onItemRotate = (type, itemId, newAngle) => {
    onStateUpdate();
    if (type === 'text' && textPanel) {
      textPanel.updateRotation(itemId, newAngle);
    } else if (type === 'logo' && logoPanel) {
      logoPanel.updateRotation(itemId, newAngle);
    }
  };

  viewer.onItemDragEnd = () => {
    onStateUpdate();
    floatingGizmo.update();
    historyManager.push(state);
  };

  // 12. Tab Navigation Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.dataset.tab);
    });
  });

  // 13. Randomize Design Button
  const btnRandomize = document.getElementById('btn-randomize');
  if (btnRandomize) {
    btnRandomize.addEventListener('click', () => {
      const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      state.patternId = randomPattern.id;

      const paletteCopy = [...SPORT_PALETTES].sort(() => 0.5 - Math.random());
      state.colors.primary = paletteCopy[0].hex;
      state.colors.accent = paletteCopy[1].hex;
      state.colors.collar = paletteCopy[2].hex;
      state.colors.secondary = paletteCopy[3].hex;

      onStateUpdate();
      floatingGizmo.update();
      historyManager.push(state);
      renderActivePanel();
    });
  }

  // 14. Project Import Function
  const loadProjectDesign = (importedData) => {
    if (importedData.patternId) state.patternId = importedData.patternId;
    if (importedData.colors) state.colors = { ...state.colors, ...importedData.colors };
    if (Array.isArray(importedData.texts)) state.texts = importedData.texts;
    if (Array.isArray(importedData.logos)) state.logos = importedData.logos;
    state.selectedItemId = null;

    onStateUpdate();
    floatingGizmo.update();
    historyManager.push(state);
    renderActivePanel();
  };

  // 15. Import Modal Trigger
  const btnImport = document.getElementById('btn-open-import');
  if (btnImport) {
    btnImport.addEventListener('click', () => {
      const modal = new ImportModal((designData) => {
        loadProjectDesign(designData);
      });
      modal.open();
    });
  }

  // 16. Drag & Drop JSON file directly on 3D Viewport
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            loadProjectDesign(data);
          } catch (err) {
            console.error('Failed to parse dropped JSON project:', err);
          }
        };
        reader.readAsText(file);
      }
    }
  });

  // 17. Export / Snapshot Modal
  const btnExport = document.getElementById('btn-open-export');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const modal = new ExportModal(viewer, state);
      modal.open();
    });
  }

  // 18. Keyboard Delete / Backspace to delete selected item
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeEl = document.activeElement;
      const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || activeEl?.isContentEditable) {
        return; // Let user edit text inside form fields
      }

      if (state.selectedItemId) {
        e.preventDefault();
        const selectedId = state.selectedItemId;
        const isText = state.texts.some(t => t.id === selectedId);
        const isLogo = state.logos.some(l => l.id === selectedId);

        if (isText) {
          state.texts = state.texts.filter(t => t.id !== selectedId);
        } else if (isLogo) {
          state.logos = state.logos.filter(l => l.id !== selectedId);
        }

        state.selectedItemId = null;
        onStateUpdate();
        floatingGizmo.update();
        historyManager.push(state);
        renderActivePanel();
      }
    }
  });
});
