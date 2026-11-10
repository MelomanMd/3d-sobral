import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { ARTICLE_TARGETS, ARTICLE_ZONES } from './textPanel.js';

export const SOBRAL_PRESET_LOGOS = [
  { id: 'logo_sobral_main', name: 'SOBRAL WORKWEAR (Official)', src: './images/sobral-workwear-logo.svg', type: 'vector' },
  { id: 'logo_sobral_icon', name: 'SOBRAL Emblem Circle', src: './images/sobral-workwear-logo.svg', type: 'vector' }
];

export class LogoPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeLogoId = state.logos[0]?.id || null;
    this.isLibraryOpen = false;
    this.isAdvancedOpen = false;

    this.render();
  }

  setActiveLogo(id) {
    this.activeLogoId = id;
    this.render();
  }

  render() {
    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId) || this.state.logos[0];
    const targetArticle = activeItem?.targetArticle || 'primary';
    const availableZones = ARTICLE_ZONES[targetArticle] || ARTICLE_ZONES.primary;

    const resolveZoneName = (item) => {
      const art = item.targetArticle || 'primary';
      const zones = ARTICLE_ZONES[art] || ARTICLE_ZONES.primary;
      const found = zones.find(z => z.key === item.zone);
      return found ? found.name : getZoneName(item.zone);
    };

    const resolveArticleName = (item) => {
      const art = item.targetArticle || 'primary';
      const found = ARTICLE_TARGETS.find(a => a.id === art);
      return found ? found.name : 'Oberteil';
    };

    this.container.innerHTML = `
      <div class="figma-subpanel-wrapper">
        <!-- 1. Header (Figma 03_logo_upload.png) -->
        <div class="figma-panel-header">
          <h3 class="figma-panel-title">DEINE LOGOS</h3>
          <p class="figma-panel-subtitle">Logos hinzufügen und auf deinem Outfit platzieren.</p>
        </div>

        <!-- 2. Action Buttons Row: + LOGO HOCHLADEN & MEINE LOGO-BIBLIOTHEK -->
        <div class="figma-logo-actions-row">
          <button class="btn-figma-black-action" id="btn-open-upload-zone">
            + LOGO HOCHLADEN
          </button>
          <button class="btn-figma-white-action" id="btn-open-library">
            MEINE LOGO-BIBLIOTHEK
          </button>
        </div>

        <!-- Hidden File Input & Dropzone -->
        <input type="file" id="logo-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">
        <div class="drop-zone-figma" id="logo-drop-zone" style="display: none;">
          <span>Datei hier ablegen (PNG, SVG, JPG, WebP)</span>
        </div>

        <!-- 3. Horizontal Cards for Logo Layers -->
        <div class="figma-items-cards-grid">
          ${this.state.logos.map((item, idx) => {
            const isActive = item.id === (activeItem ? activeItem.id : '');
            return `
              <div class="figma-layer-card ${isActive ? 'active' : ''}" data-id="${item.id}">
                <div class="figma-layer-card-text">
                  <span class="figma-layer-name">${item.name || (idx === 0 ? 'FIRMENLOGO' : 'RÜCKENLOGO')}</span>
                  <span class="figma-layer-meta">${resolveArticleName(item)} · ${resolveZoneName(item)}</span>
                </div>
                <div class="figma-layer-actions">
                  <button class="btn-figma-icon btn-toggle-logo-vis" title="Sichtbarkeit" data-id="${item.id}">
                    ${item.visible ? `
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ` : `
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    `}
                  </button>
                  ${this.state.logos.length > 1 ? `
                    <button class="btn-figma-icon btn-delete-logo" title="Löschen" data-id="${item.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 4. Form Controls: ARTIKEL & PLATZIERUNG (Figma 03_logo_upload.png) -->
        ${activeItem ? `
          <div class="figma-form-body">
            <div class="figma-grid-2col">
              <div class="figma-field-group">
                <label class="figma-label">ARTIKEL</label>
                <select class="figma-select" id="select-logo-article">
                  ${ARTICLE_TARGETS.map(a => `
                    <option value="${a.id}" ${targetArticle === a.id ? 'selected' : ''}>${a.name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="figma-field-group">
                <label class="figma-label">PLATZIERUNG</label>
                <select class="figma-select" id="select-logo-zone">
                  ${availableZones.map(z => `
                    <option value="${z.key}" ${activeItem.zone === z.key ? 'selected' : ''}>${z.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Accordion Button: Größe / Position anpassen + -->
            <button class="figma-accordion-btn" id="btn-toggle-advanced">
              <span>Größe / Position anpassen</span>
              <span class="acc-icon">${this.isAdvancedOpen ? '−' : '+'}</span>
            </button>

            <!-- Advanced Sliders Container -->
            <div class="figma-advanced-sliders" style="${this.isAdvancedOpen ? 'display: block;' : 'display: none;'}">
              <div class="figma-steppers-grid" style="margin-top: 12px;">
                <!-- Scale -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">SKALIERUNG</label>
                  <div class="figma-stepper-controls">
                    <button class="btn-step" data-action="dec-scale">−</button>
                    <span class="step-val">${Math.round((activeItem.scale || 1.0) * 100)} %</span>
                    <button class="btn-step" data-action="inc-scale">+</button>
                  </div>
                </div>

                <!-- Rotation -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">DREHWINKEL</label>
                  <div class="figma-stepper-controls">
                    <button class="btn-step" data-action="dec-rot">−</button>
                    <span class="step-val">${activeItem.rotation || 0}°</span>
                    <button class="btn-step" data-action="inc-rot">+</button>
                  </div>
                </div>

                <!-- Offset X -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">VERSATZ X</label>
                  <div class="figma-stepper-controls">
                    <button class="btn-step" data-action="dec-ox">−</button>
                    <span class="step-val">${Math.round(activeItem.offsetX || 0)}</span>
                    <button class="btn-step" data-action="inc-ox">+</button>
                  </div>
                </div>

                <!-- Offset Y -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">VERSATZ Y</label>
                  <div class="figma-stepper-controls">
                    <button class="btn-step" data-action="dec-oy">−</button>
                    <span class="step-val">${Math.round(activeItem.offsetY || 0)}</span>
                    <button class="btn-step" data-action="inc-oy">+</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ` : ''}

        <!-- 5. Modal: MEINE LOGO-BIBLIOTHEK (Figma Frame 1876:8870) -->
        <div class="logo-library-modal-backdrop" id="logo-library-modal" style="${this.isLibraryOpen ? 'display: flex;' : 'display: none;'}">
          <div class="logo-library-card">
            <div class="logo-library-header">
              <div>
                <span class="modal-badge" style="background: rgba(255, 68, 0, 0.1); color: #ff4400; border: 1px solid rgba(255, 68, 0, 0.25);">
                  VEKTOR-ARCHIV
                </span>
                <h3 class="logo-library-title">MEINE LOGO-BIBLIOTHEK</h3>
              </div>
              <button class="btn-sidebar-close" id="btn-close-library">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="logo-library-body">
              <input type="text" class="library-search-input" id="library-search-input" placeholder="Nach Vektorgrafiken und Logos suchen...">
              
              <div class="library-logos-grid" id="library-logos-grid">
                ${SOBRAL_PRESET_LOGOS.map(logo => `
                  <button class="library-logo-card" data-id="${logo.id}">
                    <div class="library-logo-thumb">
                      <img src="${logo.src}" alt="${logo.name}">
                    </div>
                    <span class="library-logo-name">${logo.name}</span>
                    <span class="library-logo-badge">Vektor SVG</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Open upload file dialog
    const btnUpload = this.container.querySelector('#btn-open-upload-zone');
    const fileInput = this.container.querySelector('#logo-file-input');
    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    // Open/Close library modal
    const btnLib = this.container.querySelector('#btn-open-library');
    if (btnLib) {
      btnLib.addEventListener('click', () => {
        this.isLibraryOpen = true;
        this.render();
      });
    }

    const btnCloseLib = this.container.querySelector('#btn-close-library');
    if (btnCloseLib) {
      btnCloseLib.addEventListener('click', () => {
        this.isLibraryOpen = false;
        this.render();
      });
    }

    // Toggle advanced sliders accordion
    const btnToggleAdv = this.container.querySelector('#btn-toggle-advanced');
    if (btnToggleAdv) {
      btnToggleAdv.addEventListener('click', () => {
        this.isAdvancedOpen = !this.isAdvancedOpen;
        this.render();
      });
    }

    // Select logo layer card
    this.container.querySelectorAll('.figma-layer-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-figma-icon')) return;
        this.activeLogoId = card.dataset.id;
        this.render();
      });
    });

    // Toggle logo visibility
    this.container.querySelectorAll('.btn-toggle-logo-vis').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = this.state.logos.find(l => l.id === id);
        if (item) {
          item.visible = !item.visible;
          if (this.onUpdate) this.onUpdate();
          this.render();
        }
      });
    });

    // Delete logo
    this.container.querySelectorAll('.btn-delete-logo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.state.logos = this.state.logos.filter(l => l.id !== id);
        if (this.activeLogoId === id) {
          this.activeLogoId = this.state.logos[0]?.id || null;
        }
        if (this.onUpdate) this.onUpdate();
        this.render();
      });
    });

    // Library preset logo click
    this.container.querySelectorAll('.library-logo-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const preset = SOBRAL_PRESET_LOGOS.find(p => p.id === id);
        if (preset) {
          const newLogo = {
            id: 'logo_' + Date.now(),
            name: preset.name,
            src: preset.src,
            targetArticle: 'primary',
            zone: 'chest_left',
            scale: 0.55,
            rotation: 0,
            offsetX: 0,
            offsetY: 0,
            visible: true
          };
          this.state.logos.push(newLogo);
          this.activeLogoId = newLogo.id;
          this.isLibraryOpen = false;
          if (this.onUpdate) this.onUpdate();
          this.render();
        }
      });
    });

    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId) || this.state.logos[0];
    if (!activeItem) return;

    // Article select
    const selArticle = this.container.querySelector('#select-logo-article');
    if (selArticle) {
      selArticle.addEventListener('change', (e) => {
        activeItem.targetArticle = e.target.value;
        const defaultZones = ARTICLE_ZONES[activeItem.targetArticle] || ARTICLE_ZONES.primary;
        activeItem.zone = defaultZones[0].key;
        if (this.onUpdate) this.onUpdate();
        this.render();
      });
    }

    // Zone select
    const selZone = this.container.querySelector('#select-logo-zone');
    if (selZone) {
      selZone.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        if (this.onUpdate) this.onUpdate();
        this.render();
      });
    }

    // Advanced Stepper Buttons (+ / -)
    this.container.querySelectorAll('.btn-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'inc-scale') {
          activeItem.scale = Math.min(2.4, +( (activeItem.scale || 1.0) + 0.1 ).toFixed(2));
        } else if (action === 'dec-scale') {
          activeItem.scale = Math.max(0.2, +( (activeItem.scale || 1.0) - 0.1 ).toFixed(2));
        } else if (action === 'inc-rot') {
          activeItem.rotation = ((activeItem.rotation || 0) + 5) % 360;
        } else if (action === 'dec-rot') {
          activeItem.rotation = ((activeItem.rotation || 0) - 5) % 360;
        } else if (action === 'inc-ox') {
          activeItem.offsetX = (activeItem.offsetX || 0) + 5;
        } else if (action === 'dec-ox') {
          activeItem.offsetX = (activeItem.offsetX || 0) - 5;
        } else if (action === 'inc-oy') {
          activeItem.offsetY = (activeItem.offsetY || 0) + 5;
        } else if (action === 'dec-oy') {
          activeItem.offsetY = (activeItem.offsetY || 0) - 5;
        }

        if (this.onUpdate) this.onUpdate();
        this.render();
      });
    });
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const newLogo = {
        id: 'logo_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        src,
        targetArticle: 'primary',
        zone: 'chest_left',
        scale: 0.55,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      };
      this.state.logos.push(newLogo);
      this.activeLogoId = newLogo.id;
      if (this.onUpdate) this.onUpdate();
      this.render();
    };
    reader.readAsDataURL(file);
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
