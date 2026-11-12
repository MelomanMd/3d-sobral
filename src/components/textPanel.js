import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const FIGMA_FONTS = [
  { name: 'Neue DIN', value: "'Neue DIN', 'Space Grotesk', sans-serif" },
  { name: 'Impact', value: "'Impact', 'Arial Black', sans-serif" },
  { name: 'Arial Standard', value: "'Arial', sans-serif" },
  { name: 'Stencil Pro', value: "'Stencil', sans-serif" }
];

export const FONT_OPTIONS = FIGMA_FONTS;

export const TEXT_PALETTES = [
  { name: 'Schwarz', hex: '#000000' },
  { name: 'Weiss', hex: '#FFFFFF' },
  { name: 'Sobral Orange', hex: '#FF4400' },
  { name: 'Signalgelb', hex: '#FFCF24' },
  { name: 'Rot', hex: '#DC2626' },
  { name: 'Blau', hex: '#283B79' },
  { name: 'Silber', hex: '#E5E7EB' }
];

export const ARTICLE_TARGETS = [
  { id: 'primary', name: 'Oberteil' },
  { id: 'helmet', name: 'Kopfschutz' },
  { id: 'trousers', name: 'Arbeitshose' }
];

export const ARTICLE_ZONES = {
  primary: [
    { key: 'chest_left', name: 'Brust links' },
    { key: 'chest_right', name: 'Brust rechts' },
    { key: 'chest_center', name: 'Brustmitte' },
    { key: 'back_top', name: 'Rücken oben' },
    { key: 'back_center', name: 'Rücken groß' },
    { key: 'sleeve_left', name: 'Ärmel links' },
    { key: 'sleeve_right', name: 'Ärmel rechts' }
  ],
  helmet: [
    { key: 'helmet_front', name: 'Vorne (Stirn)' },
    { key: 'helmet_back', name: 'Hinten (Nacken)' },
    { key: 'helmet_left', name: 'Links' },
    { key: 'helmet_right', name: 'Rechts' }
  ],
  trousers: [
    { key: 'trousers_thigh_left', name: 'Oberschenkel links' },
    { key: 'trousers_thigh_right', name: 'Oberschenkel rechts' },
    { key: 'trousers_pocket_back', name: 'Gesäßtasche' }
  ]
};

export class TextPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeTextId = state.texts[0]?.id || null;
    this.styleExpanded = false;

    this.render();
  }

  setActiveText(id) {
    this.activeTextId = id;
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
    const activeItem = this.state.texts.find(t => t.id === this.activeTextId) || this.state.texts[0];
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
        <!-- 1. Header with Add Button (Figma 02_text_nummer.png) -->
        <div class="figma-header-with-action">
          <div>
            <h3 class="figma-panel-title">DEINE BESCHRIFTUNG</h3>
            <p class="figma-panel-subtitle">Ergänze Namen, Teamtexte oder Nummern.</p>
          </div>
          <button class="btn-figma-black-action" id="btn-add-text">
            + Text hinzufügen
          </button>
        </div>

        <!-- 2. Horizontal Cards for Text Layers -->
        <div class="figma-items-cards-grid">
          ${this.state.texts.length === 0 ? `
            <div style="grid-column: 1 / -1; padding: 28px 16px; text-align: center; background: #f8f9fa; border-radius: 6px; border: 1px dashed #d1d5db; color: #6b7280;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #1d1d1b; font-family: 'Neue DIN', sans-serif;">Keine Beschriftung vorhanden</p>
              <span style="font-size: 12px;">Klicke oben auf „+ Text hinzufügen“, um einen Text zu erstellen.</span>
            </div>
          ` : this.state.texts.map(item => {
            const isActive = item.id === (activeItem ? activeItem.id : '');
            return `
              <div class="figma-layer-card ${isActive ? 'active' : ''}" data-id="${item.id}">
                <div class="figma-layer-card-text">
                  <span class="figma-layer-name">${item.text || 'LEERER TEXT'}</span>
                  <span class="figma-layer-meta">${resolveArticleName(item)} · ${resolveZoneName(item)}</span>
                </div>
                <div class="figma-layer-actions">
                  <button class="btn-figma-icon btn-toggle-vis" title="Sichtbarkeit" data-id="${item.id}">
                    ${item.visible ? `
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ` : `
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    `}
                  </button>
                  <button class="btn-figma-icon btn-delete-layer" title="Löschen" data-id="${item.id}" aria-label="Löschen">
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

        <!-- 3. Two-Column Form Controls (Figma 02_text_nummer.png) -->
        ${activeItem ? `
          <div class="figma-form-body">
            <!-- Row 1: TEXT / NAME / NUMMER + ARTIKEL -->
            <div class="figma-grid-2col">
              <div class="figma-field-group">
                <label class="figma-label">TEXT / NAME / NUMMER</label>
                <input type="text" class="figma-input" id="input-text-val" value="${activeItem.text}">
              </div>
              <div class="figma-field-group">
                <label class="figma-label">ARTIKEL</label>
                <select class="figma-select" id="select-target-article">
                  ${activeTargets.map(a => `
                    <option value="${a.id}" ${targetArticle === a.id ? 'selected' : ''}>${a.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Row 2: PLATZIERUNG -->
            <div class="figma-field-group">
              <label class="figma-label">PLATZIERUNG</label>
              <select class="figma-select" id="select-text-zone">
                ${availableZones.map(z => `
                  <option value="${z.key}" ${activeItem.zone === z.key ? 'selected' : ''}>${z.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Row 3: SCHRIFTART + TEXTFARBE -->
            <div class="figma-grid-2col">
              <div class="figma-field-group">
                <label class="figma-label">SCHRIFTART</label>
                <select class="figma-select" id="select-text-font">
                  ${FIGMA_FONTS.map(f => `
                    <option value="${f.value}" ${activeItem.fontFamily === f.value ? 'selected' : ''}>${f.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="figma-field-group">
                <label class="figma-label">TEXTFARBE</label>
                <select class="figma-select" id="select-text-color">
                  ${TEXT_PALETTES.map(p => `
                    <option value="${p.hex}" ${(activeItem.color || '').toLowerCase() === p.hex.toLowerCase() ? 'selected' : ''}>■ ${p.name} · ${p.hex}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Subheader: TEXTSTIL ANPASSEN + / – -->
            <button type="button" class="figma-subheading figma-subheading-toggle" id="btn-toggle-textstyle" aria-expanded="${this.styleExpanded}">
              TEXTSTIL ANPASSEN ${this.styleExpanded ? '–' : '+'}
            </button>

            ${this.styleExpanded ? `
            <!-- Stepper Inputs Grid (2 columns) -->
            <div class="figma-steppers-grid">
              <!-- SCHRIFTGRÖSSE -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">SCHRIFTGRÖSSE</label>
                <div class="figma-stepper-controls">
                  <span class="step-val" id="val-fontsize">${activeItem.fontSize}</span>
                  <div class="figma-stepper-btns">
                    <button type="button" class="btn-step" data-action="dec-size">−</button>
                    <span class="step-sep">/</span>
                    <button type="button" class="btn-step" data-action="inc-size">+</button>
                  </div>
                </div>
              </div>

              <!-- KONTURSTÄRKE -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">KONTURSTÄRKE</label>
                <div class="figma-stepper-controls">
                  <span class="step-val" id="val-stroke">${activeItem.strokeWidth || 0} px</span>
                  <div class="figma-stepper-btns">
                    <button type="button" class="btn-step" data-action="dec-stroke">−</button>
                    <span class="step-sep">/</span>
                    <button type="button" class="btn-step" data-action="inc-stroke">+</button>
                  </div>
                </div>
              </div>

              <!-- KONTURFARBE -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">KONTURFARBE</label>
                <div class="figma-stepper-controls">
                  <select class="figma-stepper-select" id="select-stroke-color">
                    <option value="none" ${!activeItem.strokeWidth ? 'selected' : ''}>Keine</option>
                    ${TEXT_PALETTES.map(p => `
                      <option value="${p.hex}" ${activeItem.strokeWidth && (activeItem.strokeColor || '#000000').toLowerCase() === p.hex.toLowerCase() ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <!-- BOGENWÖLBUNG -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">BOGENWÖLBUNG</label>
                <div class="figma-stepper-controls">
                  <span class="step-val" id="val-arc">${activeItem.arc || 0} %</span>
                  <div class="figma-stepper-btns">
                    <button type="button" class="btn-step" data-action="dec-arc">−</button>
                    <span class="step-sep">/</span>
                    <button type="button" class="btn-step" data-action="inc-arc">+</button>
                  </div>
                </div>
              </div>

              <!-- DREHWINKEL -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">DREHWINKEL</label>
                <div class="figma-stepper-controls">
                  <span class="step-val" id="val-rot">${activeItem.rotation || 0}°</span>
                  <div class="figma-stepper-btns">
                    <button type="button" class="btn-step" data-action="dec-rot">−</button>
                    <span class="step-sep">/</span>
                    <button type="button" class="btn-step" data-action="inc-rot">+</button>
                  </div>
                </div>
              </div>

              <!-- VERSATZ X / Y -->
              <div class="figma-stepper-box">
                <label class="figma-stepper-label">VERSATZ X / Y</label>
                <div class="figma-stepper-controls">
                  <span class="step-val" id="val-offset">${Math.round(activeItem.offsetX || 0)} / ${Math.round(activeItem.offsetY || 0)}</span>
                  <div class="figma-stepper-btns">
                    <button type="button" class="btn-step" data-action="dec-offset">−</button>
                    <span class="step-sep">/</span>
                    <button type="button" class="btn-step" data-action="inc-offset">+</button>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Toggle TEXTSTIL ANPASSEN accordion
    const btnToggleStyle = this.container.querySelector('#btn-toggle-textstyle');
    if (btnToggleStyle) {
      btnToggleStyle.addEventListener('click', () => {
        this.styleExpanded = !this.styleExpanded;
        this.render();
      });
    }

    // Add text button
    const btnAdd = this.container.querySelector('#btn-add-text');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const newId = 'text_' + Date.now();
        const newItem = {
          id: newId,
          text: 'TEAM 02',
          targetArticle: 'primary',
          zone: 'back_center',
          fontFamily: FIGMA_FONTS[0].value,
          color: '#FFFFFF',
          fontSize: 56,
          strokeWidth: 0,
          strokeColor: '#000000',
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          visible: true
        };
        this.state.texts.push(newItem);
        this.activeTextId = newId;
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    }

    // Select text layer card
    this.container.querySelectorAll('.figma-layer-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-figma-icon')) return;
        this.activeTextId = card.dataset.id;
        this.render();
      });
    });

    // Visibility toggle
    this.container.querySelectorAll('.btn-toggle-vis').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = this.state.texts.find(t => t.id === id);
        if (item) {
          item.visible = !item.visible;
          if (this.onUpdate) this.onUpdate('decals');
          this.render();
        }
      });
    });

    // Delete text
    this.container.querySelectorAll('.btn-delete-layer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.state.texts = this.state.texts.filter(t => t.id !== id);
        if (this.activeTextId === id) {
          this.activeTextId = this.state.texts[0]?.id || null;
        }
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    });

    const activeItem = this.state.texts.find(t => t.id === this.activeTextId) || this.state.texts[0];
    if (!activeItem) return;

    // Text value input (debounced 3D decal projection to keep typing smooth)
    const inputVal = this.container.querySelector('#input-text-val');
    if (inputVal) {
      let inputTimer = null;
      inputVal.addEventListener('input', (e) => {
        activeItem.text = e.target.value;
        const cardName = this.container.querySelector(`.figma-layer-card[data-id="${activeItem.id}"] .figma-layer-name`);
        if (cardName) cardName.textContent = activeItem.text || 'LEERER TEXT';
        clearTimeout(inputTimer);
        inputTimer = setTimeout(() => {
          if (this.onUpdate) this.onUpdate('decals');
        }, 120);
      });
    }

    // Article select
    const selArticle = this.container.querySelector('#select-target-article');
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
    const selZone = this.container.querySelector('#select-text-zone');
    if (selZone) {
      selZone.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    }

    // Font select
    const selFont = this.container.querySelector('#select-text-font');
    if (selFont) {
      selFont.addEventListener('change', (e) => {
        activeItem.fontFamily = e.target.value;
        if (this.onUpdate) this.onUpdate('decals');
      });
    }

    // Text color select
    const selColor = this.container.querySelector('#select-text-color');
    if (selColor) {
      selColor.addEventListener('change', (e) => {
        activeItem.color = e.target.value;
        if (this.onUpdate) this.onUpdate('decals');
      });
    }

    // Stroke color select
    const selStrokeColor = this.container.querySelector('#select-stroke-color');
    if (selStrokeColor) {
      selStrokeColor.addEventListener('change', (e) => {
        if (e.target.value === 'none') {
          activeItem.strokeWidth = 0;
        } else {
          activeItem.strokeColor = e.target.value;
          if (!activeItem.strokeWidth) activeItem.strokeWidth = 2;
        }
        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    }

    // Stepper Buttons (+ / -)
    this.container.querySelectorAll('.btn-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'inc-size') {
          activeItem.fontSize = Math.min(140, (activeItem.fontSize || 56) + 4);
        } else if (action === 'dec-size') {
          activeItem.fontSize = Math.max(16, (activeItem.fontSize || 56) - 4);
        } else if (action === 'inc-stroke') {
          activeItem.strokeWidth = Math.min(20, (activeItem.strokeWidth || 0) + 1);
        } else if (action === 'dec-stroke') {
          activeItem.strokeWidth = Math.max(0, (activeItem.strokeWidth || 0) - 1);
        } else if (action === 'inc-rot') {
          activeItem.rotation = ((activeItem.rotation || 0) + 5) % 360;
        } else if (action === 'dec-rot') {
          activeItem.rotation = ((activeItem.rotation || 0) - 5) % 360;
        } else if (action === 'inc-arc') {
          activeItem.arc = Math.min(100, (activeItem.arc || 0) + 10);
        } else if (action === 'dec-arc') {
          activeItem.arc = Math.max(-100, (activeItem.arc || 0) - 10);
        } else if (action === 'inc-offset') {
          activeItem.offsetX = (activeItem.offsetX || 0) + 5;
        } else if (action === 'dec-offset') {
          activeItem.offsetX = (activeItem.offsetX || 0) - 5;
        }

        if (this.onUpdate) this.onUpdate('decals');
        this.render();
      });
    });
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
