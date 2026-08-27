import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const FONT_OPTIONS = [
  { name: 'Impact Pro (Athletic)', value: "'Impact', 'Arial Black', sans-serif" },
  { name: 'Teko Sport (Tall / Jersey)', value: "'Teko', 'Impact', sans-serif" },
  { name: 'Bebas Block (Modern Sport)', value: "'Bebas Neue', 'Impact', sans-serif" },
  { name: 'Russo Tech (Bold / Cyber)', value: "'Russo One', sans-serif" },
  { name: 'Montserrat (Clean Sans)', value: "'Montserrat', sans-serif" }
];

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

    this.container.innerHTML = `
      <div class="drag-hint-banner">
        <span class="hint-icon-svg">${ICONS.crosshair}</span>
        <span class="hint-text">${t('text_drag_hint_de')}</span>
      </div>

      <div class="panel-section">
        <div class="section-header-row">
          <div class="section-title">
            <span class="title-icon-svg">${ICONS.type}</span>
            <span>${t('section_texts_title')}</span>
          </div>
          <button class="btn-sm btn-primary-glass" id="btn-add-text">
            <span>${t('btn_add_text')}</span>
          </button>
        </div>

        <div class="layers-list">
          ${this.state.texts.map((item) => `
            <div class="layer-item ${item.id === this.activeTextId ? 'active' : ''}" data-id="${item.id}">
              <div class="layer-info">
                <span class="layer-title">${item.text || t('no_text')}</span>
                <span class="layer-zone-badge">${getZoneName(item.zone)}</span>
              </div>
              <div class="layer-actions">
                <button class="icon-btn btn-toggle-vis" title="Visibility" data-id="${item.id}">
                  ${item.visible ? ICONS.eye : ICONS.eyeOff}
                </button>
                ${this.state.texts.length > 1 ? `
                  <button class="icon-btn btn-delete-layer" title="Delete" data-id="${item.id}">${ICONS.trash}</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${activeItem ? `
        <div class="panel-section active-item-editor">
          <div class="form-group">
            <label class="form-label">${t('label_text_val')}</label>
            <input type="text" class="input-glass" id="input-text-val" value="${activeItem.text}">
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_text_zone')}</label>
            <select class="select-glass" id="select-text-zone">
              ${Object.entries(PLACEMENT_ZONES).map(([key]) => `
                <option value="${key}" ${activeItem.zone === key ? 'selected' : ''}>${getZoneName(key)}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_font')}</label>
            <select class="select-glass" id="select-text-font">
              ${FONT_OPTIONS.map(f => `
                <option value="${f.value}" ${activeItem.fontFamily === f.value ? 'selected' : ''}>${f.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">${t('label_text_color')}</label>
              <div class="color-picker-row">
                <input type="color" class="native-color-picker" id="input-text-color" value="${activeItem.color}">
                <span class="hex-badge">${activeItem.color}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${t('label_stroke_color')}</label>
              <div class="color-picker-row">
                <input type="color" class="native-color-picker" id="input-stroke-color" value="${activeItem.strokeColor}">
                <span class="hex-badge">${activeItem.strokeColor}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_stroke_width')}</label>
              <span class="slider-val" id="val-stroke">${activeItem.strokeWidth}px</span>
            </div>
            <input type="range" class="range-slider" id="slider-stroke" min="0" max="16" step="1" value="${activeItem.strokeWidth}">
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_font_size')}</label>
              <span class="slider-val" id="val-fontsize">${activeItem.fontSize}</span>
            </div>
            <input type="range" class="range-slider" id="slider-fontsize" min="20" max="140" step="2" value="${activeItem.fontSize}">
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_arc_curve')}</label>
              <span class="slider-val" id="val-curve">${activeItem.curve || 0}%</span>
            </div>
            <input type="range" class="range-slider" id="slider-curve" min="-80" max="80" step="2" value="${activeItem.curve || 0}">
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_rotation')}</label>
              <span class="slider-val" id="val-rot">${activeItem.rotation || 0}°</span>
            </div>
            <input type="range" class="range-slider" id="slider-rotation" min="-180" max="180" step="5" value="${activeItem.rotation || 0}">
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <div class="slider-header">
                <label class="form-label">${t('label_offset_x')}</label>
                <span class="slider-val" id="val-ox">${activeItem.offsetX || 0}</span>
              </div>
              <input type="range" class="range-slider" id="slider-ox" min="-180" max="180" step="1" value="${activeItem.offsetX || 0}">
            </div>
            <div class="form-group">
              <div class="slider-header">
                <label class="form-label">${t('label_offset_y')}</label>
                <span class="slider-val" id="val-oy">${activeItem.offsetY || 0}</span>
              </div>
              <input type="range" class="range-slider" id="slider-oy" min="-180" max="180" step="1" value="${activeItem.offsetY || 0}">
            </div>
          </div>
        </div>
      ` : ''}
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
          text: 'SOBRAL',
          zone: 'chest_center',
          fontFamily: FONT_OPTIONS[0].value,
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
        };
        this.state.texts.push(newItem);
        this.activeTextId = newId;
        this.render();
        this.onUpdate();
      });
    }

    this.container.querySelectorAll('.layer-item').forEach(layer => {
      layer.addEventListener('click', (e) => {
        if (e.target.closest('.layer-actions')) return;
        this.activeTextId = layer.dataset.id;
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

    const textInput = this.container.querySelector('#input-text-val');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        activeItem.text = e.target.value;
        const titleEl = this.container.querySelector(`.layer-item[data-id="${activeItem.id}"] .layer-title`);
        if (titleEl) titleEl.textContent = activeItem.text || t('no_text');
        this.onUpdate();
      });
    }

    const zoneSelect = this.container.querySelector('#select-text-zone');
    if (zoneSelect) {
      zoneSelect.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        this.render();
        this.onUpdate();
      });
    }

    const fontSelect = this.container.querySelector('#select-text-font');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        activeItem.fontFamily = e.target.value;
        this.onUpdate();
      });
    }

    const textColor = this.container.querySelector('#input-text-color');
    if (textColor) {
      textColor.addEventListener('input', (e) => {
        activeItem.color = e.target.value;
        this.onUpdate();
      });
    }

    const strokeColor = this.container.querySelector('#input-stroke-color');
    if (strokeColor) {
      strokeColor.addEventListener('input', (e) => {
        activeItem.strokeColor = e.target.value;
        this.onUpdate();
      });
    }

    const setupSlider = (sliderId, valId, key, suffix = '') => {
      const slider = this.container.querySelector(sliderId);
      const valEl = this.container.querySelector(valId);
      if (slider && valEl) {
        slider.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          activeItem[key] = val;
          valEl.textContent = `${val}${suffix}`;
          this.onUpdate();
        });
      }
    };

    setupSlider('#slider-stroke', '#val-stroke', 'strokeWidth', 'px');
    setupSlider('#slider-fontsize', '#val-fontsize', 'fontSize', '');
    setupSlider('#slider-curve', '#val-curve', 'curve', '%');
    setupSlider('#slider-rotation', '#val-rot', 'rotation', '°');
    setupSlider('#slider-ox', '#val-ox', 'offsetX', '');
    setupSlider('#slider-oy', '#val-oy', 'offsetY', '');
  }

  updateOffsets(itemId, offsetX, offsetY) {
    if (this.activeTextId === itemId) {
      const sliderX = this.container.querySelector('#slider-ox');
      const valX = this.container.querySelector('#val-ox');
      const sliderY = this.container.querySelector('#slider-oy');
      const valY = this.container.querySelector('#val-oy');

      if (sliderX && valX) {
        sliderX.value = offsetX;
        valX.textContent = offsetX;
      }
      if (sliderY && valY) {
        sliderY.value = offsetY;
        valY.textContent = offsetY;
      }
    }
  }

  updateFontSize(itemId, fontSize) {
    if (this.activeTextId === itemId) {
      const slider = this.container.querySelector('#slider-fontsize');
      const valEl = this.container.querySelector('#val-fontsize');
      if (slider && valEl) {
        slider.value = fontSize;
        valEl.textContent = fontSize;
      }
    }
  }

  updateRotation(itemId, rotation) {
    if (this.activeTextId === itemId) {
      const slider = this.container.querySelector('#slider-rotation');
      const valEl = this.container.querySelector('#val-rot');
      if (slider && valEl) {
        slider.value = rotation;
        valEl.textContent = `${rotation}°`;
      }
    }
  }

  setActiveText(id) {
    this.activeTextId = id;
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
