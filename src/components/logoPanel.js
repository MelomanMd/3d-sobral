import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { ARTICLE_TARGETS, ARTICLE_ZONES } from './textPanel.js';
import { DEFAULT_LOGOS, getLogoDataUrl } from '../core/defaultLogos.js';

export const SOBRAL_PRESET_LOGOS = DEFAULT_LOGOS.map((logo, idx) => ({
  id: logo.id || `logo_preset_${idx}`,
  name: logo.name,
  src: getLogoDataUrl(logo),
  type: 'vector'
}));

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

  getTargetArticles() {
    const activeProduct = this.state.activeProduct || { silhouette: 'worker' };
    const isWorker = activeProduct.silhouette === 'worker' || activeProduct.category === 'outfits';
    if (isWorker) {
      return ARTICLE_TARGETS;
    }
    if (activeProduct.silhouette === 'helmet' || activeProduct.category === 'headwear') {
      return [{ id: 'helmet', name: 'Kopfschutz' }];
    }
    if (activeProduct.silhouette === 'trousers' || activeProduct.category === 'bottoms') {
      return [{ id: 'trousers', name: 'Arbeitshose' }];
    }
    return [{ id: 'primary', name: 'Oberteil' }];
  }

  render() {
    if (this.isLibraryOpen) {
      this.renderLibraryView();
      return;
    }
    this.renderMainView();
  }

  renderLibraryView() {
    const mainTitle = document.querySelector('.sidebar-title-main');
    const subTitle = document.querySelector('.sidebar-title-sub');
    if (mainTitle) mainTitle.textContent = 'MEINE LOGO-BIBLIOTHEK';
    if (subTitle) subTitle.textContent = '3 / 3 · Dein Outfit personalisieren';

    const userSavedLogos = (this.state.logos || []).filter(l => l.src && !SOBRAL_PRESET_LOGOS.some(p => p.src === l.src));
    const libraryLogos = [...userSavedLogos, ...SOBRAL_PRESET_LOGOS];

    this.container.innerHTML = `
      <div class="figma-subpanel-wrapper">
        <!-- 1. Header (matching user design) -->
        <div class="figma-panel-header">
          <h3 class="figma-panel-title">MEINE LOGO-BIBLIOTHEK</h3>
          <p class="figma-panel-subtitle">3 / 3 · Dein Outfit personalisieren</p>
        </div>
        <p class="figma-panel-subsubtitle">Gespeicherte Logos · angemeldet</p>

        <!-- 2. Library Logo Cards -->
        <div class="figma-library-cards-list">
          ${libraryLogos.map(logo => {
            const shortName = logo.name.toUpperCase().includes('SOBRAL') ? 'SOBRAL' : logo.name;
            return `
              <div class="figma-library-logo-card">
                <div class="figma-library-logo-preview">
                  <img src="${logo.src}" alt="${logo.name}">
                </div>
                <button type="button" class="btn-figma-use-logo" data-id="${logo.id}">
                  ${shortName} · Logo verwenden
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3. Bottom Action Buttons -->
        <div class="figma-library-actions-stack">
          <button type="button" class="btn-figma-library-upload" id="btn-library-upload-new">
            + Neues Logo hochladen
          </button>
          <button type="button" class="btn-figma-library-back" id="btn-library-back">
            Zurück zu meinen Logos
          </button>
        </div>

        <!-- Hidden File Input for uploading from library view -->
        <input type="file" id="library-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">
      </div>
    `;

    this.bindLibraryEvents();
  }

  bindLibraryEvents() {
    const btnBack = this.container.querySelector('#btn-library-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.isLibraryOpen = false;
        this.render();
      });
    }

    const btnUpload = this.container.querySelector('#btn-library-upload-new');
    const fileInput = this.container.querySelector('#library-file-input');
    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleFileUpload(file);
          this.isLibraryOpen = false;
        }
      });
    }

    this.container.querySelectorAll('.btn-figma-use-logo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const preset = (this.state.logos || []).find(p => p.id === id) || SOBRAL_PRESET_LOGOS.find(p => p.id === id);
        if (preset) {
          const targetArticle = this.getTargetArticles()[0]?.id || 'primary';
          const defaultZones = ARTICLE_ZONES[targetArticle] || ARTICLE_ZONES.primary;
          const targetZone = defaultZones[0]?.id || 'chest_left';

          const activeItem = this.state.logos.find(l => l.id === this.activeLogoId);
          if (activeItem) {
            activeItem.name = preset.name.toUpperCase().includes('SOBRAL') ? 'SOBRAL' : preset.name;
            activeItem.src = preset.src;
          } else {
            const newLogo = {
              id: 'logo_' + Date.now(),
              name: preset.name.toUpperCase().includes('SOBRAL') ? 'SOBRAL' : preset.name,
              src: preset.src,
              targetArticle,
              zone: targetZone,
              scale: 0.45,
              rotation: 0,
              offsetX: 0,
              offsetY: 0,
              opacity: 1.0,
              visible: true
            };
            this.state.logos.push(newLogo);
            this.activeLogoId = newLogo.id;
          }
          this.isLibraryOpen = false;
          if (this.onUpdate) this.onUpdate('decals');
          this.render();
        }
      });
    });
  }

  renderMainView() {
    const mainTitle = document.querySelector('.sidebar-title-main');
    const subTitle = document.querySelector('.sidebar-title-sub');
    const activeProduct = this.catalog?.getActiveProduct ? this.catalog.getActiveProduct() : this.state.activeProduct;
    const isWorker = activeProduct?.silhouette === 'worker' || activeProduct?.category === 'outfits';
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 860;
    if (mainTitle) mainTitle.textContent = isMobile ? 'DEINE LOGOS' : (isWorker ? 'DEIN KOMPLETT-OUTFIT' : (activeProduct?.name?.toUpperCase() || 'DEIN OUTFIT'));
    if (subTitle) subTitle.textContent = isMobile ? '3 / 3 · Dein Outfit personalisieren' : '3 / 3 · Logo hochladen & platzieren';

    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId) || this.state.logos[0];
    const activeTargets = this.getTargetArticles();
    let targetArticle = activeItem?.targetArticle || activeTargets[0].id;
    if (!activeTargets.some(t => t.id === targetArticle)) {
      targetArticle = activeTargets[0].id;
      if (activeItem) activeItem.targetArticle = targetArticle;
    }
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
          <p class="figma-panel-subtitle">3 / 3 · Dein Outfit personalisieren</p>
        </div>

        <!-- 2. Action Buttons Row: + Logo hochladen & Meine Logo-Bibliothek (Figma Image 5) -->
        <div class="figma-logo-actions-row">
          <button type="button" class="btn-figma-black-action" id="btn-open-upload-zone">
            + Logo hochladen
          </button>
          <button type="button" class="btn-figma-white-action" id="btn-open-library">
            Meine Logo-Bibliothek
          </button>
        </div>

        <!-- Hidden File Input & Dropzone -->
        <input type="file" id="logo-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">
        <div class="drop-zone-figma" id="logo-drop-zone" style="display: none;">
          <span>Datei hier ablegen (PNG, SVG, JPG, WebP)</span>
        </div>

        <!-- 3. Logo Cards Grid (single full-width row stack on mobile) -->
        <div class="figma-items-cards-grid figma-logo-cards-grid">
          ${this.state.logos.length === 0 ? `
            <div style="grid-column: 1 / -1; padding: 28px 16px; text-align: center; background: #f8f9fa; border-radius: 6px; border: 1px dashed #d1d5db; color: #6b7280;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #1d1d1b; font-family: 'Neue DIN', sans-serif;">Keine Logos vorhanden</p>
              <span style="font-size: 12px;">Klicke oben auf „+ Logo hochladen“ oder „Meine Logo-Bibliothek“.</span>
            </div>
          ` : this.state.logos.map((item, idx) => {
            const isActive = item.id === (activeItem ? activeItem.id : '');
            const displayName = item.name ? item.name.toUpperCase() : (idx === 0 ? 'FIRMENLOGO' : 'RÜCKENLOGO');
            return `
              <div class="figma-layer-card ${isActive ? 'active' : ''}" data-id="${item.id}">
                <div class="figma-layer-card-text">
                  <span class="figma-layer-name">${displayName}</span>
                  <span class="figma-layer-meta">${resolveArticleName(item)} · ${resolveZoneName(item)}</span>
                </div>
                <div class="figma-layer-actions">
                  <button type="button" class="btn-figma-icon btn-toggle-logo-vis" title="Sichtbarkeit" data-id="${item.id}" aria-label="Sichtbarkeit">
                    ${item.visible !== false ? `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ` : `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    `}
                  </button>
                  <button type="button" class="btn-figma-icon btn-delete-logo" title="Löschen" data-id="${item.id}" aria-label="Löschen">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
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
                  ${activeTargets.map(a => `
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
            <button type="button" class="figma-accordion-btn" id="btn-toggle-advanced">
              Größe / Position anpassen ${this.isAdvancedOpen ? '−' : '+'}
            </button>

            <!-- Advanced Sliders Container -->
            <div class="figma-advanced-sliders" style="${this.isAdvancedOpen ? 'display: block;' : 'display: none;'}">
              <div class="figma-steppers-grid" style="margin-top: 12px;">
                <!-- Scale -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">SKALIERUNG</label>
                  <div class="figma-stepper-controls">
                    <span class="step-val">${Math.round((activeItem.scale || 1.0) * 100)} %</span>
                    <div class="figma-stepper-btns">
                      <button type="button" class="btn-step" data-action="dec-scale">−</button>
                      <span class="step-sep">/</span>
                      <button type="button" class="btn-step" data-action="inc-scale">+</button>
                    </div>
                  </div>
                </div>

                <!-- Rotation -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">DREHWINKEL</label>
                  <div class="figma-stepper-controls">
                    <span class="step-val">${activeItem.rotation || 0}°</span>
                    <div class="figma-stepper-btns">
                      <button type="button" class="btn-step" data-action="dec-rot">−</button>
                      <span class="step-sep">/</span>
                      <button type="button" class="btn-step" data-action="inc-rot">+</button>
                    </div>
                  </div>
                </div>

                <!-- Offset X -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">VERSATZ X</label>
                  <div class="figma-stepper-controls">
                    <span class="step-val">${Math.round(activeItem.offsetX || 0)}</span>
                    <div class="figma-stepper-btns">
                      <button type="button" class="btn-step" data-action="dec-ox">−</button>
                      <span class="step-sep">/</span>
                      <button type="button" class="btn-step" data-action="inc-ox">+</button>
                    </div>
                  </div>
                </div>

                <!-- Offset Y -->
                <div class="figma-stepper-box">
                  <label class="figma-stepper-label">VERSATZ Y</label>
                  <div class="figma-stepper-controls">
                    <span class="step-val">${Math.round(activeItem.offsetY || 0)}</span>
                    <div class="figma-stepper-btns">
                      <button type="button" class="btn-step" data-action="dec-oy">−</button>
                      <span class="step-sep">/</span>
                      <button type="button" class="btn-step" data-action="inc-oy">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  openLibraryModal() {
    this.closeLibraryModal();

    const modal = document.createElement('div');
    modal.className = 'logo-library-modal-backdrop';
    modal.id = 'logo-library-modal';
    modal.innerHTML = `
      <div class="logo-library-modal-window">
        <div class="library-modal-header">
          <div>
            <span class="modal-badge" style="background: rgba(255, 68, 0, 0.1); color: #ff4400; border: 1px solid rgba(255, 68, 0, 0.25); display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">
              VEKTOR-ARCHIV
            </span>
            <h3 class="library-modal-title">MEINE LOGO-BIBLIOTHEK</h3>
            <p class="library-modal-sub">Wähle ein offizielles Sobral Vektorlogo für dein Outfit.</p>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-library" style="background: transparent; border: none; font-size: 24px; color: #1d1d1b; cursor: pointer; padding: 4px; line-height: 1;">
            ✕
          </button>
        </div>

        <div class="library-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" class="library-search-input" id="library-search-input" placeholder="Nach Vektorgrafiken und Logos suchen...">
        </div>

        <div class="library-logos-grid" id="library-logos-grid">
          ${SOBRAL_PRESET_LOGOS.map(logo => `
            <button type="button" class="library-logo-card" data-id="${logo.id}">
              <div class="library-card-thumb">
                <img src="${logo.src}" alt="${logo.name}">
              </div>
              <span class="library-card-name">${logo.name}</span>
              <span class="library-card-badge">Vektor SVG</span>
            </button>
          `).join('')}
        </div>

        <!-- Figma Frame 1876:8870: Upload new logo from within library -->
        <div class="library-modal-footer" style="margin-top: 6px; padding-top: 14px; border-top: 1px solid #e5e7eb;">
          <input type="file" id="library-upload-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display: none;">
          <button type="button" class="btn-figma-black-action" id="btn-library-upload-new" style="width: 100%; height: 44px; font-weight: 700; font-family: 'Neue DIN', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
            + NEUES LOGO HOCHLADEN
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.libraryModalEl = modal;

    modal.querySelector('#btn-close-library')?.addEventListener('click', () => this.closeLibraryModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeLibraryModal();
    });

    // Wire + NEUES LOGO HOCHLADEN button inside library
    const libUploadBtn = modal.querySelector('#btn-library-upload-new');
    const libFileInput = modal.querySelector('#library-upload-file-input');
    if (libUploadBtn && libFileInput) {
      libUploadBtn.addEventListener('click', () => libFileInput.click());
      libFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleFileUpload(file);
          this.closeLibraryModal();
        }
      });
    }

    // Drag & drop support directly on library modal window
    const modalWindow = modal.querySelector('.logo-library-modal-window');
    if (modalWindow) {
      ['dragenter', 'dragover'].forEach(eventName => {
        modalWindow.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          modalWindow.style.borderColor = '#FF4400';
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        modalWindow.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          modalWindow.style.borderColor = '#e5e7eb';
        });
      });
      modalWindow.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          this.handleFileUpload(files[0]);
          this.closeLibraryModal();
        }
      });
    }

    const searchInput = modal.querySelector('#library-search-input');
    const grid = modal.querySelector('#library-logos-grid');
    if (searchInput && grid) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = SOBRAL_PRESET_LOGOS.filter(l => l.name.toLowerCase().includes(query));
        grid.innerHTML = filtered.map(logo => `
          <button type="button" class="library-logo-card" data-id="${logo.id}">
            <div class="library-card-thumb">
              <img src="${logo.src}" alt="${logo.name}">
            </div>
            <span class="library-card-name">${logo.name}</span>
            <span class="library-card-badge">Vektor SVG</span>
          </button>
        `).join('');
        this.bindLibraryCardClicks(modal);
      });
    }

    this.bindLibraryCardClicks(modal);
  }

  closeLibraryModal() {
    if (this.libraryModalEl) {
      this.libraryModalEl.remove();
      this.libraryModalEl = null;
    }
  }

  bindLibraryCardClicks(modal) {
    modal.querySelectorAll('.library-logo-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const preset = SOBRAL_PRESET_LOGOS.find(p => p.id === id);
        if (preset) {
          const targetArticle = this.getTargetArticles()[0]?.id || 'primary';
          const defaultZones = ARTICLE_ZONES[targetArticle] || ARTICLE_ZONES.primary;
          const targetZone = defaultZones[0]?.id || 'chest_left';

          const activeItem = this.state.logos.find(l => l.id === this.activeLogoId);
          if (activeItem) {
            activeItem.name = preset.name;
            activeItem.src = preset.src;
          } else {
            const newLogo = {
              id: 'logo_' + Date.now(),
              name: preset.name,
              src: preset.src,
              targetArticle,
              zone: targetZone,
              scale: 0.45,
              rotation: 0,
              offsetX: 0,
              offsetY: 0,
              opacity: 1.0,
              visible: true
            };
            this.state.logos.push(newLogo);
            this.activeLogoId = newLogo.id;
          }
          this.closeLibraryModal();
          if (this.onUpdate) this.onUpdate('decals');
          this.render();
        }
      });
    });
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

    // Drag & drop support for Tab 03
    const panelWrap = this.container.querySelector('.figma-subpanel-wrapper');
    if (panelWrap) {
      ['dragenter', 'dragover'].forEach(eventName => {
        panelWrap.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          panelWrap.style.borderColor = '#FF4400';
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        panelWrap.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          panelWrap.style.borderColor = 'transparent';
        });
      });
      panelWrap.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          this.handleFileUpload(files[0]);
        }
      });
    }

    // Open library view
    const btnLib = this.container.querySelector('#btn-open-library');
    if (btnLib) {
      btnLib.addEventListener('click', () => {
        this.isLibraryOpen = true;
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

    // Select logo layer card or row container
    this.container.querySelectorAll('.figma-layer-card, .figma-logo-row-container, .figma-logo-select-btn').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-figma-icon')) return;
        const id = card.dataset.id || card.closest('[data-id]')?.dataset.id;
        if (id) {
          this.activeLogoId = id;
          this.render();
        }
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
          if (this.onUpdate) this.onUpdate('decals');
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
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
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
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    }

    // Zone select
    const selZone = this.container.querySelector('#select-logo-zone');
    if (selZone) {
      selZone.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        if (this.onUpdate) this.onUpdate('decals');
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

        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    });
  }

  handleFileUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const targetArticle = this.getTargetArticles()[0]?.id || 'primary';
      const defaultZones = ARTICLE_ZONES[targetArticle] || ARTICLE_ZONES.primary;
      const targetZone = defaultZones[0]?.id || 'chest_left';

      const newLogo = {
        id: 'logo_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, "") || 'Eigenes Logo',
        src,
        targetArticle,
        zone: targetZone,
        scale: 0.55,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        opacity: 1.0,
        visible: true
      };
      this.state.logos.push(newLogo);
      this.activeLogoId = newLogo.id;
      if (this.onUpdate) this.onUpdate('decals');
      this.render();
    };
    reader.readAsDataURL(file);
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
