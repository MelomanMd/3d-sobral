import { DEFAULT_LOGOS, getLogoDataUrl } from '../core/defaultLogos.js';
import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { ARTICLE_TARGETS, ARTICLE_ZONES } from './textPanel.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class LogoPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeLogoId = state.logos[0]?.id || null;
    this.isLibraryOpen = false;

    this.render();
  }

  getTintOptions() {
    return [
      { id: 'original', name: 'Original', color: 'transparent' },
      { id: '#ffffff', name: 'Weiss', color: '#ffffff' },
      { id: '#000000', name: 'Schwarz', color: '#000000' },
      { id: '#ff4400', name: 'Orange', color: '#ff4400' },
      { id: '#f59e0b', name: 'Gold', color: '#f59e0b' },
      { id: '#283b79', name: 'Blau', color: '#283b79' }
    ];
  }

  render() {
    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId) || this.state.logos[0];
    const targetArticle = activeItem?.targetArticle || 'primary';
    const availableZones = ARTICLE_ZONES[targetArticle] || ARTICLE_ZONES.primary;
    const tintOptions = this.getTintOptions();

    const resolveZoneName = (item) => {
      const art = item.targetArticle || 'primary';
      const zones = ARTICLE_ZONES[art] || ARTICLE_ZONES.primary;
      const found = zones.find(z => z.key === item.zone);
      return found ? found.name : getZoneName(item.zone);
    };

    const resolveArticleName = (item) => {
      const art = item.targetArticle || 'primary';
      const found = ARTICLE_TARGETS.find(a => a.id === art);
      return found ? found.name.split(' ')[0] : 'Oberteil';
    };

    this.container.innerHTML = `
      <div class="logo-panel-wrapper">
        <!-- 1. Header with Upload & Library Buttons (Figma Frame 1876:8549) -->
        <div class="panel-section-header">
          <span class="section-title-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>LOGO UPLOAD</span>
          </span>
          <div class="header-btns-group">
            <button class="btn-figma-add-item" id="btn-open-upload-zone" title="Neues Logo hochladen">
              <span>+ Logo hochladen</span>
            </button>
            <button class="btn-figma-secondary-item" id="btn-open-library" title="Meine Logo-Bibliothek">
              <span>Bibliothek</span>
            </button>
          </div>
        </div>

        <!-- Hidden File Input for Direct Upload -->
        <input type="file" id="logo-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">

        <!-- Upload Dropzone (Collapsible or Shown on Demand) -->
        <div class="drop-zone-figma" id="logo-drop-zone" style="display: none;">
          <div class="drop-content-figma">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4400" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="drop-title">Datei hier ablegen oder durchsuchen</span>
            <span class="drop-sub">SVG, PNG, JPG oder WebP (Vektorgrafiken empfohlen)</span>
          </div>
        </div>

        <!-- 2. Logos List (Figma Frame 1867:5877) -->
        <div class="logo-items-list">
          ${this.state.logos.map((item, idx) => `
            <div class="logo-item-card ${item.id === this.activeLogoId ? 'active' : ''}" data-id="${item.id}">
              <div class="logo-thumb-box">
                <img src="${item.src}" alt="${item.name || 'Logo'}" class="logo-thumb-img">
              </div>
              <div class="logo-item-main">
                <span class="logo-item-index">LOGO ${idx + 1}</span>
                <span class="logo-item-name">${item.name || 'Logo'}</span>
                <span class="logo-item-meta">${resolveArticleName(item)} · ${resolveZoneName(item)}</span>
              </div>
              <div class="logo-item-actions">
                <button class="btn-item-action btn-toggle-logo-vis" title="Sichtbarkeit" data-id="${item.id}">
                  ${item.visible ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  `}
                </button>
                <button class="btn-item-action btn-delete-logo" title="Löschen" data-id="${item.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 3. Fine-Tuning Editor (Figma Frame 1876:8700) -->
        ${activeItem ? `
          <div class="active-item-editor-new">
            <div class="editor-section-title">
              <span>FEINJUSTIERUNG LOGO</span>
            </div>

            <!-- Target Article & Placement Selectors -->
            <div class="figma-form-row">
              <div class="figma-form-group">
                <label class="figma-form-label">Artikel</label>
                <select class="figma-select" id="select-logo-article">
                  ${ARTICLE_TARGETS.map(a => `
                    <option value="${a.id}" ${targetArticle === a.id ? 'selected' : ''}>${a.name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="figma-form-group">
                <label class="figma-form-label">Platzierung</label>
                <select class="figma-select" id="select-logo-zone">
                  ${availableZones.map(z => `
                    <option value="${z.key}" ${activeItem.zone === z.key ? 'selected' : ''}>${z.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Farbanpassung / Tint Options -->
            <div class="figma-form-group">
              <label class="figma-form-label">Farbanpassung</label>
              <div class="tint-buttons-row">
                ${tintOptions.map(tOption => `
                  <button class="tint-btn ${activeItem.tint === tOption.id ? 'active' : ''}" data-tint="${tOption.id}" title="${tOption.name}">
                    <span class="tint-dot" style="background-color: ${tOption.color}; border: ${tOption.id === 'original' ? '1px dashed #64748b' : '1px solid rgba(0,0,0,0.1)'}"></span>
                    <span class="tint-name">${tOption.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Scale & Rotation Sliders -->
            <div class="figma-form-row">
              <div class="figma-form-group">
                <div class="figma-slider-header">
                  <label class="figma-form-label">Skalierung</label>
                  <span class="figma-slider-value" id="val-logo-scale">${Math.round(activeItem.scale * 100)}%</span>
                </div>
                <input type="range" class="figma-slider" id="slider-logo-scale" min="0.2" max="2.4" step="0.05" value="${activeItem.scale}">
              </div>

              <div class="figma-form-group">
                <div class="figma-slider-header">
                  <label class="figma-form-label">Drehung</label>
                  <span class="figma-slider-value" id="val-logo-rot">${activeItem.rotation || 0}°</span>
                </div>
                <input type="range" class="figma-slider" id="slider-logo-rotation" min="-180" max="180" step="5" value="${activeItem.rotation || 0}">
              </div>
            </div>

          </div>
        ` : ''}

        <!-- 4. Modal: MEINE LOGO-BIBLIOTHEK (Figma Frame 1876:8870) -->
        <div class="logo-library-modal-backdrop" id="logo-library-modal" style="${this.isLibraryOpen ? 'display: flex;' : 'display: none;'}">
          <div class="logo-library-modal-window">
            <div class="library-modal-header">
              <div class="library-header-text">
                <h3 class="library-modal-title">MEINE LOGO-BIBLIOTHEK</h3>
                <p class="library-modal-sub">Wählen Sie ein Firmenlogo oder laden Sie eine Vektordatei hoch</p>
              </div>
              <button class="btn-sidebar-close" id="btn-close-library">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="library-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="library-search-input" id="library-search-input" placeholder="Nach Vektorgrafiken und Logos suchen...">
            </div>

            <div class="library-logos-grid" id="library-logos-grid">
              ${DEFAULT_LOGOS.map(logo => `
                <button class="library-logo-card" data-id="${logo.id}">
                  <div class="library-card-thumb">
                    <img src="${getLogoDataUrl(logo)}" alt="${logo.name}">
                  </div>
                  <span class="library-card-name">${logo.name}</span>
                </button>
              `).join('')}
            </div>

            <!-- Library Upload Dropzone -->
            <div class="library-dropzone-box" id="library-dropzone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4400" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>+ Neues Firmenlogo hinzufügen (SVG, PNG, PDF)</span>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Open file upload
    const btnUpload = this.container.querySelector('#btn-open-upload-zone');
    const fileInput = this.container.querySelector('#logo-file-input');
    const dropZone = this.container.querySelector('#logo-drop-zone');

    if (btnUpload) {
      btnUpload.addEventListener('click', () => {
        if (dropZone) {
          dropZone.style.display = dropZone.style.display === 'none' ? 'block' : 'none';
        } else if (fileInput) {
          fileInput.click();
        }
      });
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFile(e.target.files[0]);
        }
      });
    }

    // Open Library Modal
    const btnOpenLib = this.container.querySelector('#btn-open-library');
    if (btnOpenLib) {
      btnOpenLib.addEventListener('click', () => {
        this.isLibraryOpen = true;
        this.render();
      });
    }

    // Close Library Modal
    const btnCloseLib = this.container.querySelector('#btn-close-library');
    if (btnCloseLib) {
      btnCloseLib.addEventListener('click', () => {
        this.isLibraryOpen = false;
        this.render();
      });
    }

    // Library logo cards
    this.container.querySelectorAll('.library-logo-card').forEach(card => {
      card.addEventListener('click', () => {
        const logoId = card.dataset.id;
        const logoItem = DEFAULT_LOGOS.find(l => l.id === logoId);
        if (!logoItem) return;

        const newId = 'logo_' + Date.now();
        const dataUrl = getLogoDataUrl(logoItem);

        this.state.logos.push({
          id: newId,
          name: logoItem.name,
          src: dataUrl,
          targetArticle: 'primary',
          zone: 'chest_left',
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          tint: 'original',
          offsetX: 0,
          offsetY: 0,
          visible: true
        });

        this.activeLogoId = newId;
        this.isLibraryOpen = false;
        this.render();
        this.onUpdate();
      });
    });

    // Library dropzone
    const libDropzone = this.container.querySelector('#library-dropzone');
    if (libDropzone && fileInput) {
      libDropzone.addEventListener('click', () => fileInput.click());
    }

    // Select Logo Card
    this.container.querySelectorAll('.logo-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.logo-item-actions')) return;
        this.activeLogoId = card.dataset.id;
        this.render();
      });
    });

    // Toggle Logo Visibility
    this.container.querySelectorAll('.btn-toggle-logo-vis').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = this.state.logos.find(l => l.id === id);
        if (item) {
          item.visible = !item.visible;
          this.render();
          this.onUpdate();
        }
      });
    });

    // Delete Logo
    this.container.querySelectorAll('.btn-delete-logo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.state.logos = this.state.logos.filter(l => l.id !== id);
        if (this.activeLogoId === id) {
          this.activeLogoId = this.state.logos[0]?.id || null;
        }
        this.render();
        this.onUpdate();
      });
    });

    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId);
    if (!activeItem) return;

    // Target Article Selector
    const selectArticle = this.container.querySelector('#select-logo-article');
    if (selectArticle) {
      selectArticle.addEventListener('change', (e) => {
        activeItem.targetArticle = e.target.value;
        const defaultZones = ARTICLE_ZONES[e.target.value] || ARTICLE_ZONES.primary;
        activeItem.zone = defaultZones[0].key;
        this.render();
        this.onUpdate();
      });
    }

    // Target Zone Selector
    const selectZone = this.container.querySelector('#select-logo-zone');
    if (selectZone) {
      selectZone.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        this.render();
        this.onUpdate();
      });
    }

    // Tint Buttons
    this.container.querySelectorAll('.tint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeItem.tint = btn.dataset.tint;
        this.render();
        this.onUpdate();
      });
    });

    // Scale Slider
    const sliderScale = this.container.querySelector('#slider-logo-scale');
    const valScale = this.container.querySelector('#val-logo-scale');
    if (sliderScale && valScale) {
      sliderScale.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        activeItem.scale = val;
        valScale.textContent = `${Math.round(val * 100)}%`;
        this.onUpdate();
      });
    }

    // Rotation Slider
    const sliderRot = this.container.querySelector('#slider-logo-rotation');
    const valRot = this.container.querySelector('#val-logo-rot');
    if (sliderRot && valRot) {
      sliderRot.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        activeItem.rotation = val;
        valRot.textContent = `${val}°`;
        this.onUpdate();
      });
    }
  }

  handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newId = 'logo_' + Date.now();
      const defaultZone = 'chest_left';

      this.state.logos.push({
        id: newId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        src: e.target.result,
        targetArticle: 'primary',
        zone: defaultZone,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        tint: 'original',
        offsetX: 0,
        offsetY: 0,
        visible: true
      });

      this.activeLogoId = newId;
      this.isLibraryOpen = false;
      this.render();
      this.onUpdate();
    };
    reader.readAsDataURL(file);
  }

  setActiveLogo(itemId) {
    this.activeLogoId = itemId;
    this.render();
  }

  updateZone(itemId, newZone) {
    const item = this.state.logos.find(l => l.id === itemId);
    if (item) item.zone = newZone;
    this.render();
  }

  updateOffsets(itemId, offsetX, offsetY) {
    const item = this.state.logos.find(l => l.id === itemId);
    if (item) {
      item.offsetX = offsetX;
      item.offsetY = offsetY;
    }
  }

  updateScale(itemId, newScale) {
    const item = this.state.logos.find(l => l.id === itemId);
    if (item) item.scale = newScale;
    this.render();
  }

  updateRotation(itemId, newAngle) {
    const item = this.state.logos.find(l => l.id === itemId);
    if (item) item.rotation = newAngle;
    this.render();
  }

  updateState(newState) {
    this.state = newState;
    if (!this.state.logos.find(l => l.id === this.activeLogoId)) {
      this.activeLogoId = this.state.logos[0]?.id || null;
    }
    this.render();
  }
}
