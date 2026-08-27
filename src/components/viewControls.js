import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class ViewControls {
  constructor(containerElement, viewer, onModeChange) {
    this.container = containerElement;
    this.viewer = viewer;
    this.onModeChange = onModeChange;
    this.currentView = 'front';
    this.currentMode = '3d'; // '3d', '2d_front', '2d_back'
    this.isFullscreen = !!document.fullscreenElement;
    this.hasPhotos = false;

    this.render();
    this.bindGlobalEvents();
  }

  setHasPhotos(hasPhotos) {
    this.hasPhotos = hasPhotos;
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
    if (this.onModeChange) this.onModeChange(mode);
  }

  render() {
    const fsTitle = this.isFullscreen ? t('fullscreen_exit') : t('fullscreen_enter');
    const fsIcon = this.isFullscreen ? ICONS.minimize : ICONS.maximize;

    this.container.innerHTML = `
      <div class="floating-view-bar">
        <!-- 3D vs 2D Mode Switcher with 4 Angles -->
        <div class="view-mode-group">
          <button class="mode-toggle-btn ${this.currentMode === '3d' ? 'active' : ''}" data-mode="3d" title="3D 360° Studio">
            <span class="btn-icon-svg">${ICONS.cube}</span>
            <span class="btn-label">3D Studio</span>
          </button>
          <button class="mode-toggle-btn ${this.currentMode === '2d_front' ? 'active' : ''}" data-mode="2d_front" title="Original-Foto Vorne (2D)">
            <span class="btn-icon-svg">${ICONS.shirt}</span>
            <span class="btn-label">Foto Vorne</span>
          </button>
          <button class="mode-toggle-btn ${this.currentMode === '2d_back' ? 'active' : ''}" data-mode="2d_back" title="Original-Foto Hinten (2D)">
            <span class="btn-icon-svg">${ICONS.refresh}</span>
            <span class="btn-label">Foto Hinten</span>
          </button>
          <button class="mode-toggle-btn ${this.currentMode === '2d_left' ? 'active' : ''}" data-mode="2d_left" title="Original-Foto Links (2D)">
            <span class="btn-icon-svg">${ICONS.layers}</span>
            <span class="btn-label">Foto Links</span>
          </button>
          <button class="mode-toggle-btn ${this.currentMode === '2d_right' ? 'active' : ''}" data-mode="2d_right" title="Original-Foto Rechts (2D)">
            <span class="btn-icon-svg">${ICONS.layers}</span>
            <span class="btn-label">Foto Rechts</span>
          </button>
        </div>

        <div class="view-divider"></div>

        <!-- 3D Camera Angles (Active only in 3D Mode) -->
        <div class="view-preset-group" style="${this.currentMode !== '3d' ? 'opacity: 0.4; pointer-events: none;' : ''}">
          <button class="view-btn ${this.currentView === 'front' ? 'active' : ''}" data-view="front" title="${t('view_front')}">
            <span class="btn-label">${t('view_front')}</span>
          </button>
          <button class="view-btn ${this.currentView === 'back' ? 'active' : ''}" data-view="back" title="${t('view_back')}">
            <span class="btn-label">${t('view_back')}</span>
          </button>
          <button class="view-btn ${this.currentView === 'left' ? 'active' : ''}" data-view="left" title="${t('view_left')}">
            <span class="btn-label">${t('view_left')}</span>
          </button>
          <button class="view-btn ${this.currentView === 'right' ? 'active' : ''}" data-view="right" title="${t('view_right')}">
            <span class="btn-label">${t('view_right')}</span>
          </button>
        </div>

        <div class="view-divider"></div>

        <div class="view-action-group">
          <button class="action-toggle-btn" id="btn-toggle-spin" title="${t('view_spin')}" style="${this.currentMode !== '3d' ? 'display:none;' : ''}">
            <span class="btn-icon-svg">${ICONS.spin}</span>
          </button>
          <button class="action-toggle-btn ${this.isFullscreen ? 'active' : ''}" id="btn-toggle-fullscreen" title="${fsTitle}">
            <span class="btn-icon-svg" id="fs-icon-container">${fsIcon}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.mode-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.setMode(mode);
      });
    });

    this.container.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentMode !== '3d') {
          this.setMode('3d');
        }
        const view = btn.dataset.view;
        this.currentView = view;
        this.viewer.setCameraPreset(view);
        this.render();
      });
    });

    const btnSpin = this.container.querySelector('#btn-toggle-spin');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        const isSpinning = this.viewer.toggleAutoRotate();
        btnSpin.classList.toggle('active', isSpinning);
      });
    }

    const btnFs = this.container.querySelector('#btn-toggle-fullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
  }

  toggleFullscreen() {
    const targetElement = document.querySelector('.viewport-area') || document.documentElement;

    if (!document.fullscreenElement) {
      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn('Exit Fullscreen error:', err));
      }
    }
  }

  bindGlobalEvents() {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.render();
      if (this.viewer && this.viewer.onWindowResize) {
        setTimeout(() => this.viewer.onWindowResize(), 100);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          this.toggleFullscreen();
        }
      }
    });
  }
}
