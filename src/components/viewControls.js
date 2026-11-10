import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { openPhotoComparisonDialog } from './exportModal.js';

export class ViewControls {
  constructor(containerElement, viewer, onModeChange) {
    this.container = containerElement;
    this.viewer = viewer;
    this.onModeChange = onModeChange;
    this.currentView = 'front';
    this.isFullscreen = !!document.fullscreenElement;

    this.render();
    this.bindGlobalEvents();
  }

  setHasPhotos(hasPhotos) {
    // Kept for backward compatibility
  }

  setMannequinActive(active) {
    // Deprecated
  }

  setMode(mode) {
    if (this.onModeChange) this.onModeChange(mode);
  }

  render() {
    this.zoomPercent = 100;
    this.container.innerHTML = `
      <div class="figma-camera-bar">
        <div class="figma-cam-buttons">
          <button class="figma-cam-btn ${this.currentView === 'front' ? 'active' : ''}" data-view="front" title="Vorne">
            VORNE
          </button>
          <button class="figma-cam-btn ${this.currentView === 'back' ? 'active' : ''}" data-view="back" title="Hinten">
            HINTEN
          </button>
          <button class="figma-cam-btn ${this.currentView === 'left' ? 'active' : ''}" data-view="left" title="Links">
            LINKS
          </button>
          <button class="figma-cam-btn ${this.currentView === 'right' ? 'active' : ''}" data-view="right" title="Rechts">
            RECHTS
          </button>
          <div class="figma-cam-zoom-box">
            <button class="figma-zoom-btn" id="btn-zoom-out" title="Verkleinern">−</button>
            <span class="figma-zoom-text" id="zoom-level-text">${Math.round(this.zoomPercent)} %</span>
            <button class="figma-zoom-btn" id="btn-zoom-in" title="Vergrößern">+</button>
          </div>
        </div>
        <div class="figma-cam-subtext">Beispielvorschau des Komplettlooks</div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const updateZoomDisplay = () => {
      const el = this.container.querySelector('#zoom-level-text');
      if (el) el.textContent = `${Math.round(this.zoomPercent)} %`;
    };

    // 3D Angle buttons
    this.container.querySelectorAll('.figma-cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.currentView = view;
        this.container.querySelectorAll('.figma-cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (this.viewer) {
          this.viewer.setView(view);
        }
      });
    });

    // Zoom buttons
    const btnZoomIn = this.container.querySelector('#btn-zoom-in');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (this.viewer) {
          this.viewer.zoom(0.85);
          this.zoomPercent = Math.min(250, (this.zoomPercent || 100) + 15);
          updateZoomDisplay();
        }
      });
    }

    const btnZoomOut = this.container.querySelector('#btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (this.viewer) {
          this.viewer.zoom(1.18);
          this.zoomPercent = Math.max(50, (this.zoomPercent || 100) - 15);
          updateZoomDisplay();
        }
      });
    }

    // Reset camera view if user double clicks or uses hotkey
    if (this.viewer) {
      this.viewer.onCameraZoom = (pct) => {
        this.zoomPercent = pct;
        updateZoomDisplay();
      };
    }
  }

  bindGlobalEvents() {
    // Keyboard shortcuts for angles
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') {
        const btn = this.container.querySelector('.figma-cam-btn[data-view="front"]');
        if (btn) btn.click();
      } else if (e.key === '2') {
        const btn = this.container.querySelector('.figma-cam-btn[data-view="back"]');
        if (btn) btn.click();
      } else if (e.key === '3') {
        const btn = this.container.querySelector('.figma-cam-btn[data-view="left"]');
        if (btn) btn.click();
      } else if (e.key === '4') {
        const btn = this.container.querySelector('.figma-cam-btn[data-view="right"]');
        if (btn) btn.click();
      }
    });
  }
}
