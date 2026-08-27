import { DEFAULT_LOGOS, getLogoDataUrl } from '../core/defaultLogos.js';
import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class LogoPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeLogoId = state.logos[0]?.id || null;

    this.render();
  }

  getTintOptions() {
    return [
      { id: 'original', name: t('tint_original'), color: 'transparent' },
      { id: '#ffffff', name: t('tint_white'), color: '#ffffff' },
      { id: '#0f172a', name: t('tint_black'), color: '#0f172a' },
      { id: '#f59e0b', name: t('tint_gold'), color: '#f59e0b' },
      { id: '#ef4444', name: t('tint_red'), color: '#ef4444' },
      { id: '#38bdf8', name: t('tint_neon'), color: '#38bdf8' }
    ];
  }

  render() {
    const activeItem = this.state.logos.find(l => l.id === this.activeLogoId) || this.state.logos[0];
    const tintOptions = this.getTintOptions();

    this.container.innerHTML = `
      <div class="drag-hint-banner">
        <span class="hint-icon-svg">${ICONS.crosshair}</span>
        <span class="hint-text">${t('logo_drag_hint_de')}</span>
      </div>

      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.upload}</span>
          <span>${t('section_upload_logo')}</span>
        </div>

        <div class="drop-zone" id="logo-drop-zone">
          <input type="file" id="logo-file-input" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display:none">
          <div class="drop-content">
            <span class="drop-icon-svg">${ICONS.upload}</span>
            <span class="drop-text">${t('drop_text')}</span>
            <span class="drop-hint">${t('drop_hint')}</span>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.shield}</span>
          <span>${t('section_logo_library')}</span>
        </div>
        <div class="preset-logos-grid">
          ${DEFAULT_LOGOS.map(logo => `
            <button class="preset-logo-btn" data-id="${logo.id}" title="${logo.name}">
              <div class="logo-preview-box">
                <img src="${getLogoDataUrl(logo)}" alt="${logo.name}">
              </div>
              <span class="preset-logo-label">${logo.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="panel-section">
        <div class="section-header-row">
          <div class="section-title">
            <span class="title-icon-svg">${ICONS.layers}</span>
            <span>${t('section_logo_layers')}</span>
          </div>
        </div>

        <div class="layers-list">
          ${this.state.logos.map((item) => `
            <div class="layer-item ${item.id === this.activeLogoId ? 'active' : ''}" data-id="${item.id}">
              <div class="layer-info">
                <span class="layer-title">${item.name || 'Logo'}</span>
                <span class="layer-zone-badge">${getZoneName(item.zone)}</span>
              </div>
              <div class="layer-actions">
                <button class="icon-btn btn-toggle-logo-vis" title="Visibility" data-id="${item.id}">
                  ${item.visible ? ICONS.eye : ICONS.eyeOff}
                </button>
                <button class="icon-btn btn-delete-logo" title="Delete" data-id="${item.id}">${ICONS.trash}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${activeItem ? `
        <div class="panel-section active-item-editor">
          <div class="section-subtitle">${t('section_selected_logo')}</div>

          <div class="form-group">
            <label class="form-label">${t('label_text_zone')}</label>
            <select class="select-glass" id="select-logo-zone">
              ${Object.entries(PLACEMENT_ZONES).map(([key]) => `
                <option value="${key}" ${activeItem.zone === key ? 'selected' : ''}>${getZoneName(key)}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t('label_color_filter')}</label>
            <div class="tint-buttons-row">
              ${tintOptions.map(tOption => `
                <button class="tint-btn ${activeItem.tint === tOption.id ? 'active' : ''}" data-tint="${tOption.id}" title="${tOption.name}">
                  <span class="tint-dot" style="background-color: ${tOption.color}; border: ${tOption.id === 'original' ? '1px dashed #64748b' : 'none'}"></span>
                  <span class="tint-name">${tOption.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_scale')}</label>
              <span class="slider-val" id="val-logo-scale">${Math.round(activeItem.scale * 100)}%</span>
            </div>
            <input type="range" class="range-slider" id="slider-logo-scale" min="0.2" max="2.4" step="0.05" value="${activeItem.scale}">
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_rotation')}</label>
              <span class="slider-val" id="val-logo-rot">${activeItem.rotation || 0}°</span>
            </div>
            <input type="range" class="range-slider" id="slider-logo-rotation" min="-180" max="180" step="5" value="${activeItem.rotation || 0}">
          </div>

          <div class="form-group">
            <div class="slider-header">
              <label class="form-label">${t('label_opacity')}</label>
              <span class="slider-val" id="val-logo-opacity">${Math.round((activeItem.opacity ?? 1.0) * 100)}%</span>
            </div>
            <input type="range" class="range-slider" id="slider-logo-opacity" min="0.1" max="1.0" step="0.05" value="${activeItem.opacity ?? 1.0}">
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <div class="slider-header">
                <label class="form-label">${t('label_offset_x')}</label>
                <span class="slider-val" id="val-logo-ox">${activeItem.offsetX || 0}</span>
              </div>
              <input type="range" class="range-slider" id="slider-logo-ox" min="-180" max="180" step="1" value="${activeItem.offsetX || 0}">
            </div>
            <div class="form-group">
              <div class="slider-header">
                <label class="form-label">${t('label_offset_y')}</label>
                <span class="slider-val" id="val-logo-oy">${activeItem.offsetY || 0}</span>
              </div>
              <input type="range" class="range-slider" id="slider-logo-oy" min="-180" max="180" step="1" value="${activeItem.offsetY || 0}">
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this.bindEvents();
  }

  bindEvents() {
    const dropZone = this.container.querySelector('#logo-drop-zone');
    const fileInput = this.container.querySelector('#logo-file-input');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFile(e.target.files[0]);
        }
      });
    }

    this.container.querySelectorAll('.preset-logo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const logoId = btn.dataset.id;
        const logoItem = DEFAULT_LOGOS.find(l => l.id === logoId);
        if (!logoItem) return;

        const newId = 'logo_' + Date.now();
        const dataUrl = getLogoDataUrl(logoItem);

        this.state.logos.push({
          id: newId,
          name: logoItem.name,
          src: dataUrl,
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
        this.render();
        this.onUpdate();
      });
    });

    this.container.querySelectorAll('.layer-item').forEach(layer => {
      layer.addEventListener('click', (e) => {
        if (e.target.closest('.layer-actions')) return;
        this.activeLogoId = layer.dataset.id;
        this.render();
      });
    });

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

    const zoneSelect = this.container.querySelector('#select-logo-zone');
    if (zoneSelect) {
      zoneSelect.addEventListener('change', (e) => {
        activeItem.zone = e.target.value;
        this.render();
        this.onUpdate();
      });
    }

    this.container.querySelectorAll('.tint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeItem.tint = btn.dataset.tint;
        this.render();
        this.onUpdate();
      });
    });

    const setupSlider = (sliderId, valId, key, transform = (v) => v, suffix = '') => {
      const slider = this.container.querySelector(sliderId);
      const valEl = this.container.querySelector(valId);
      if (slider && valEl) {
        slider.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          activeItem[key] = val;
          valEl.textContent = `${transform(val)}${suffix}`;
          this.onUpdate();
        });
      }
    };

    setupSlider('#slider-logo-scale', '#val-logo-scale', 'scale', (v) => Math.round(v * 100), '%');
    setupSlider('#slider-logo-rotation', '#val-logo-rot', 'rotation', (v) => v, '°');
    setupSlider('#slider-logo-opacity', '#val-logo-opacity', 'opacity', (v) => Math.round(v * 100), '%');
    setupSlider('#slider-logo-ox', '#val-logo-ox', 'offsetX', (v) => v, '');
    setupSlider('#slider-logo-oy', '#val-logo-oy', 'offsetY', (v) => v, '');
  }

  updateOffsets(itemId, offsetX, offsetY) {
    if (this.activeLogoId === itemId) {
      const sliderX = this.container.querySelector('#slider-logo-ox');
      const valX = this.container.querySelector('#val-logo-ox');
      const sliderY = this.container.querySelector('#slider-logo-oy');
      const valY = this.container.querySelector('#val-logo-oy');

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

  updateScale(itemId, scale) {
    if (this.activeLogoId === itemId) {
      const slider = this.container.querySelector('#slider-logo-scale');
      const valEl = this.container.querySelector('#val-logo-scale');
      if (slider && valEl) {
        slider.value = scale;
        valEl.textContent = `${Math.round(scale * 100)}%`;
      }
    }
  }

  updateRotation(itemId, rotation) {
    if (this.activeLogoId === itemId) {
      const slider = this.container.querySelector('#slider-logo-rotation');
      const valEl = this.container.querySelector('#val-logo-rot');
      if (slider && valEl) {
        slider.value = rotation;
        valEl.textContent = `${rotation}°`;
      }
    }
  }

  setActiveLogo(id) {
    this.activeLogoId = id;
    this.render();
  }

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const newId = 'logo_' + Date.now();
      const fileName = file.name.replace(/\.[^/.]+$/, '');

      this.state.logos.push({
        id: newId,
        name: fileName,
        src: dataUrl,
        zone: 'chest_center',
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        tint: 'original',
        offsetX: 0,
        offsetY: 0,
        visible: true
      });

      this.activeLogoId = newId;
      this.render();
      this.onUpdate();
    };
    reader.readAsDataURL(file);
  }

  updateState(newState) {
    this.state = newState;
    if (!this.state.logos.find(l => l.id === this.activeLogoId)) {
      this.activeLogoId = this.state.logos[0]?.id || null;
    }
    this.render();
  }
}
