import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const FIGMA_FONTS = [
  { name: 'Neue DIN (Sobral CI)', value: "'Neue DIN', 'Space Grotesk', sans-serif" },
  { name: 'Impact Pro', value: "'Impact', 'Arial Black', sans-serif" },
  { name: 'Arial Standard', value: "'Arial', sans-serif" },
  { name: 'Montserrat Clean', value: "'Montserrat', sans-serif" }
];

export const FONT_OPTIONS = FIGMA_FONTS;

export const TEXT_PALETTES = [
  { name: 'Weiss', hex: '#FFFFFF' },
  { name: 'Schwarz', hex: '#000000' },
  { name: 'Sobral Orange', hex: '#FF4400' },
  { name: 'Signalgelb', hex: '#FFCF24' },
  { name: 'Rot', hex: '#DC2626' },
  { name: 'Blau', hex: '#283B79' },
  { name: 'Silber / Reflektierend', hex: '#E5E7EB' }
];

export const ARTICLE_TARGETS = [
  { id: 'primary', name: 'Oberteil (Jacke & Ärmel)' },
  { id: 'helmet', name: 'Kopfschutz (Helmschale)' },
  { id: 'trousers', name: 'Arbeitshose (Hose & Beine)' }
];

export const ARTICLE_ZONES = {
  primary: [
    { key: 'chest_left', name: 'Brust links' },
    { key: 'chest_right', name: 'Brust rechts' },
    { key: 'chest_center', name: 'Brust Mitte' },
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

    this.render();
  }

  render() {
    const activeItem = this.state.texts.find(t => t.id === this.activeTextId) || this.state.texts[0];
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
      return found ? found.name.split(' ')[0] : 'Oberteil';
    };

    this.container.innerHTML = `
      <div class="text-panel-wrapper">
        <!-- 1. Header with Add Button -->
        <div class="panel-section-header">
          <span class="section-title-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            <span>BESCHRIFTUNG (TEXT & NUMMER)</span>
          </span>
          <button class="btn-figma-add-item" id="btn-add-text">
            <span>+ Text hinzufügen</span>
          </button>
        </div>

        <!-- 2. Texts List (Figma Frame 1867:5581) -->
        <div class="text-items-list">
          ${this.state.texts.map((item, idx) => `
            <div class="text-item-card ${item.id === this.activeTextId ? 'active' : ''}" data-id="${item.id}">
              <div class="text-item-main">
                <span class="text-item-index">TEXT ${idx + 1}</span>
                <span class="text-item-preview">${item.text || 'LEERER TEXT'}</span>
                <span class="text-item-meta">${resolveArticleName(item)} · ${resolveZoneName(item)}</span>
              </div>
              <div class="text-item-actions">
                <button class="btn-item-action btn-toggle-vis" title="Sichtbarkeit" data-id="${item.id}">
                  ${item.visible ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  `}
                </button>
                ${this.state.texts.length > 1 ? `
                  <button class="btn-item-action btn-delete-layer" title="Löschen" data-id="${item.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 3. Active Item Details Form (Figma Frame 1876:8047) -->
        ${activeItem ? `
          <div class="active-item-editor-new">
            <div class="editor-section-title">
              <span>FEINJUSTIERUNG TEXT</span>
            </div>

            <!-- Beschriftungstext Input -->
            <div class="figma-form-group">
              <label class="figma-form-label">Beschriftungstext</label>
              <input type="text" class="figma-input-text" id="input-text-val" value="${activeItem.text}">
            </div>

            <!-- Artikel Dropdown (Oberteil / Kopfschutz / Arbeitshose) -->
            <div class="figma-form-row">
              <div class="figma-form-group">
                <label class="figma-form-label">Artikel</label>
                <select class="figma-select" id="select-target-article">
                  ${ARTICLE_TARGETS.map(a => `
                    <option value="${a.id}" ${targetArticle === a.id ? 'selected' : ''}>${a.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Platzierung Dropdown -->
              <div class="figma-form-group">
                <label class="figma-form-label">Platzierung</label>
                <select class="figma-select" id="select-text-zone">
                  ${availableZones.map(z => `
                    <option value="${z.key}" ${activeItem.zone === z.key ? 'selected' : ''}>${z.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Schriftart Dropdown -->
            <div class="figma-form-group">
              <label class="figma-form-label">Schriftart</label>
              <select class="figma-select" id="select-text-font">
                ${FIGMA_FONTS.map(f => `
                  <option value="${f.value}" ${activeItem.fontFamily === f.value ? 'selected' : ''}>${f.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Schriftfarbe Quick Swatches + Native Picker -->
            <div class="figma-form-group">
              <label class="figma-form-label">Schriftfarbe</label>
              <div class="figma-color-swatches-strip">
                ${TEXT_PALETTES.map(p => `
                  <button class="figma-text-color-swatch ${(activeItem.color || '').toLowerCase() === p.hex.toLowerCase() ? 'active' : ''}" 
                          data-hex="${p.hex}" 
                          title="${p.name} (${p.hex})" 
                          style="background-color: ${p.hex};">
                  </button>
                `).join('')}
                <div class="figma-custom-color-btn" title="Eigene Farbe wählen">
                  <input type="color" class="figma-native-color-picker" id="input-text-color" value="${activeItem.color}">
                </div>
              </div>
            </div>

            <!-- Size & Rotation Sliders -->
            <div class="figma-form-row">
              <div class="figma-form-group">
                <div class="figma-slider-header">
                  <label class="figma-form-label">Schriftgröße</label>
                  <span class="figma-slider-value" id="val-fontsize">${activeItem.fontSize}px</span>
                </div>
                <input type="range" class="figma-slider" id="slider-fontsize" min="16" max="140" step="2" value="${activeItem.fontSize}">
              </div>

              <div class="figma-form-group">
                <div class="figma-slider-header">
                  <label class="figma-form-label">Drehung</label>
                  <span class="figma-slider-value" id="val-rot">${activeItem.rotation || 0}°</span>
                </div>
                <input type="range" class="figma-slider" id="slider-rotation" min="-180" max="180" step="5" value="${activeItem.rotation || 0}">
              </div>
            </div>

          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnAdd = this.container.querySelector('#btn-add-text');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const newId = 'text_' + Date.now();
        const newItem = {
          id: newId,
          text: 'SOBRAL WORKWEAR',
          targetArticle: 'primary',
          zone: 'chest_left',
          fontFamily: FIGMA_FONTS[0].value,
          fontSize: 48,
          fontWeight: '700',
          color: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 0,
          curve: 0,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          visible: true,
          uppercase: true
        };
        this.state.texts.push(newItem);
        this.activeTextId = newId;
        this.render();
        this.onUpdate();
      });
    }

    this.container.querySelectorAll('.text-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.text-item-actions')) return;
        this.activeTextId = card.dataset.id;
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-toggle-vis').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = this.state.texts.find(t => t.id === id);
        if (item) {
          item.visible = !item.visible;
          this.render();
          this.onUpdate();
        }
      });
    });

    this.container.querySelectorAll('.btn-delete-layer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.state.texts = this.state.texts.filter(t => t.id !== id);
        if (this.activeTextId === id) {
          this.activeTextId = this.state.texts[0]?.id || null;
        }
        this.render();
        this.onUpdate();
      });
    });

    const activeItem = this.state.texts.find(t => t.id === this.activeTextId);
    if (!activeItem) return;

    // Text Input
    const inputVal = this.container.querySelector('#input-text-val');
    if (inputVal) {
      inputVal.addEventListener('input', (e) => {
        activeItem.text = e.target.value;
        const cardTitle = this.container.querySelector(`.text-item-card[data-id="${activeItem.id}"] .text-item-preview`);
        if (cardTitle) cardTitle.textContent = e.target.value || 'LEERER TEXT';
        this.onUpdate();
      });
    }

    // Article Target Dropdown
    const selectArticle = this.container.querySelector('#select-target-article');
    if (selectArticle) {
      selectArticle.addEventListener('change', (e) => {
        activeItem.targetArticle = e.target.value;
        const defaultZones = ARTICLE_ZONES[e.target.value] || ARTICLE_ZONES.primary;
        activeItem.zone = defaultZones[0].key;
        this.render();
        this.onUpdate();
      });
    }

    // Zone Placement Dropdown
    const selectZone = this.container.querySelector('#select-text-zone');
    if (selectZone) {
      selectZone.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        this.render();
        this.onUpdate();
      });
    }

    // Font Dropdown
    const selectFont = this.container.querySelector('#select-text-font');
    if (selectFont) {
      selectFont.addEventListener('change', (e) => {
        activeItem.fontFamily = e.target.value;
        this.onUpdate();
      });
    }

    // Color Swatches
    this.container.querySelectorAll('.figma-text-color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        activeItem.color = btn.dataset.hex;
        this.render();
        this.onUpdate();
      });
    });

    // Native Color Picker
    const inputColor = this.container.querySelector('#input-text-color');
    if (inputColor) {
      inputColor.addEventListener('input', (e) => {
        activeItem.color = e.target.value;
        this.onUpdate();
      });
    }

    // Font Size Slider
    const sliderSize = this.container.querySelector('#slider-fontsize');
    const valSize = this.container.querySelector('#val-fontsize');
    if (sliderSize && valSize) {
      sliderSize.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        activeItem.fontSize = val;
        valSize.textContent = `${val}px`;
        this.onUpdate();
      });
    }

    // Rotation Slider
    const sliderRot = this.container.querySelector('#slider-rotation');
    const valRot = this.container.querySelector('#val-rot');
    if (sliderRot && valRot) {
      sliderRot.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        activeItem.rotation = val;
        valRot.textContent = `${val}°`;
        this.onUpdate();
      });
    }
  }

  setActiveText(itemId) {
    this.activeTextId = itemId;
    this.render();
  }

  updateZone(itemId, newZone) {
    const item = this.state.texts.find(t => t.id === itemId);
    if (item) item.zone = newZone;
    this.render();
  }

  updateOffsets(itemId, offsetX, offsetY) {
    const item = this.state.texts.find(t => t.id === itemId);
    if (item) {
      item.offsetX = offsetX;
      item.offsetY = offsetY;
    }
  }

  updateFontSize(itemId, newSize) {
    const item = this.state.texts.find(t => t.id === itemId);
    if (item) item.fontSize = newSize;
    this.render();
  }

  updateRotation(itemId, newAngle) {
    const item = this.state.texts.find(t => t.id === itemId);
    if (item) item.rotation = newAngle;
    this.render();
  }

  updateState(newState) {
    this.state = newState;
    if (!this.state.texts.find(t => t.id === this.activeTextId)) {
      this.activeTextId = this.state.texts[0]?.id || null;
    }
    this.render();
  }
}
