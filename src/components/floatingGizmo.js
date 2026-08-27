// Floating contextual toolbar on 3D Viewport when an item is selected
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class FloatingGizmo {
  constructor(containerElement, getStateFn, onUpdateStateFn) {
    this.container = containerElement;
    this.getState = getStateFn;
    this.onUpdateState = onUpdateStateFn;
    this.rootEl = null;

    this.init();
  }

  init() {
    const el = document.createElement('div');
    el.className = 'floating-gizmo-bar hidden';
    el.id = 'floating-gizmo-root';
    this.container.appendChild(el);
    this.rootEl = el;
  }

  update() {
    const state = this.getState();
    const selectedId = state.selectedItemId;

    if (!selectedId) {
      this.rootEl.classList.add('hidden');
      return;
    }

    const selText = state.texts?.find(t => t.id === selectedId);
    const selLogo = state.logos?.find(l => l.id === selectedId);
    const item = selText || selLogo;
    const isText = !!selText;

    if (!item || !item.visible) {
      this.rootEl.classList.add('hidden');
      return;
    }

    const title = isText ? `"${item.text || t('no_text')}"` : `${item.name || 'Logo'}`;
    const iconSvg = isText ? ICONS.type : ICONS.shield;
    const currentVal = isText ? `${item.fontSize}px` : `${Math.round((item.scale || 1.0) * 100)}%`;
    const minVal = isText ? 20 : 0.2;
    const maxVal = isText ? 140 : 2.5;
    const step = isText ? 2 : 0.05;
    const val = isText ? item.fontSize : item.scale;

    this.rootEl.innerHTML = `
      <div class="gizmo-item-info">
        <div class="gizmo-title-row">
          <span class="gizmo-icon-svg">${iconSvg}</span>
          <span class="gizmo-item-title">${title}</span>
        </div>
        <span class="gizmo-hint-badge">${t('gizmo_selected_hint')}</span>
      </div>

      <div class="gizmo-divider"></div>

      <!-- Quick Scale / Resize -->
      <div class="gizmo-control-group">
        <span class="gizmo-label">${t('gizmo_size')}</span>
        <button class="gizmo-btn" id="btn-scale-minus" title="${t('gizmo_decrease')}">${ICONS.minus}</button>
        <span class="gizmo-val-badge" id="gizmo-val-display">${currentVal}</span>
        <button class="gizmo-btn" id="btn-scale-plus" title="${t('gizmo_increase')}">${ICONS.plus}</button>
      </div>

      <div class="gizmo-slider-group">
        <input type="range" class="gizmo-range" id="gizmo-slider-scale" min="${minVal}" max="${maxVal}" step="${step}" value="${val}">
      </div>

      <div class="gizmo-divider"></div>

      <!-- Quick Rotate -->
      <div class="gizmo-control-group">
        <button class="gizmo-btn" id="btn-rotate-left" title="${t('gizmo_rot_ccw')}">${ICONS.rotateCcw}</button>
        <button class="gizmo-btn" id="btn-rotate-right" title="${t('gizmo_rot_cw')}">${ICONS.rotateCw}</button>
      </div>

      <div class="gizmo-divider"></div>

      <!-- Actions -->
      <div class="gizmo-control-group">
        <button class="gizmo-btn btn-gizmo-delete" id="btn-gizmo-delete" title="${t('gizmo_delete')}">${ICONS.trash}</button>
        <button class="gizmo-btn btn-gizmo-close" id="btn-gizmo-close" title="${t('gizmo_deselect')}">${ICONS.close}</button>
      </div>
    `;

    this.rootEl.classList.remove('hidden');
    this.bindEvents(item, isText);
  }

  bindEvents(item, isText) {
    const slider = this.rootEl.querySelector('#gizmo-slider-scale');
    const valDisplay = this.rootEl.querySelector('#gizmo-val-display');

    if (slider) {
      slider.addEventListener('input', (e) => {
        const num = Number(e.target.value);
        if (isText) {
          item.fontSize = num;
          if (valDisplay) valDisplay.textContent = `${num}px`;
        } else {
          item.scale = num;
          if (valDisplay) valDisplay.textContent = `${Math.round(num * 100)}%`;
        }
        this.onUpdateState(false);
      });

      slider.addEventListener('change', () => {
        this.onUpdateState(true);
      });
    }

    const btnMinus = this.rootEl.querySelector('#btn-scale-minus');
    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        if (isText) {
          item.fontSize = Math.max(20, item.fontSize - 6);
        } else {
          item.scale = Number(Math.max(0.2, item.scale - 0.1).toFixed(2));
        }
        this.update();
        this.onUpdateState(true);
      });
    }

    const btnPlus = this.rootEl.querySelector('#btn-scale-plus');
    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        if (isText) {
          item.fontSize = Math.min(140, item.fontSize + 6);
        } else {
          item.scale = Number(Math.min(2.5, item.scale + 0.1).toFixed(2));
        }
        this.update();
        this.onUpdateState(true);
      });
    }

    const btnRotLeft = this.rootEl.querySelector('#btn-rotate-left');
    if (btnRotLeft) {
      btnRotLeft.addEventListener('click', () => {
        item.rotation = ((item.rotation || 0) - 15) % 360;
        this.update();
        this.onUpdateState(true);
      });
    }

    const btnRotRight = this.rootEl.querySelector('#btn-rotate-right');
    if (btnRotRight) {
      btnRotRight.addEventListener('click', () => {
        item.rotation = ((item.rotation || 0) + 15) % 360;
        this.update();
        this.onUpdateState(true);
      });
    }

    const btnClose = this.rootEl.querySelector('#btn-gizmo-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        const state = this.getState();
        state.selectedItemId = null;
        this.update();
        this.onUpdateState(false);
      });
    }

    const btnDelete = this.rootEl.querySelector('#btn-gizmo-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        const state = this.getState();
        if (isText) {
          state.texts = state.texts.filter(t => t.id !== item.id);
        } else {
          state.logos = state.logos.filter(l => l.id !== item.id);
        }
        state.selectedItemId = null;
        this.update();
        this.onUpdateState(true);
      });
    }
  }

  syncValues(item, isText) {
    const valDisplay = this.rootEl.querySelector('#gizmo-val-display');
    const slider = this.rootEl.querySelector('#gizmo-slider-scale');
    if (valDisplay && slider) {
      const val = isText ? item.fontSize : item.scale;
      slider.value = val;
      valDisplay.textContent = isText ? `${val}px` : `${Math.round(val * 100)}%`;
    }
  }
}
