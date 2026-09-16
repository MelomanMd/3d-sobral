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
    // Deprecated: mannequin removed
  }

  setMode(mode) {
    if (this.onModeChange) this.onModeChange(mode);
  }

  render() {
    const fsTitle = this.isFullscreen ? t('fullscreen_exit') : t('fullscreen_enter');
    const fsIcon = this.isFullscreen ? ICONS.minimize : ICONS.maximize;

    this.container.innerHTML = `
      <div class="floating-view-bar">
        <!-- 3D Camera Angles -->
        <div class="view-preset-group">
          <button class="view-btn ${this.currentView === 'perspective' ? 'active' : ''}" data-view="perspective" title="${t('view_perspective')}">
            <span class="btn-label">${t('view_perspective')}</span>
          </button>
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
          <button class="view-btn ${this.currentView === 'top' ? 'active' : ''}" data-view="top" title="${t('view_top')}">
            <span class="btn-label">${t('view_top')}</span>
          </button>
        </div>

        <div class="view-divider"></div>

        <div class="view-action-group">
          <button class="action-toggle-btn" id="btn-zoom-in" title="${t('zoom_in')}">
            <span class="btn-icon-svg">${ICONS.plus}</span>
          </button>
          <button class="action-toggle-btn" id="btn-zoom-out" title="${t('zoom_out')}">
            <span class="btn-icon-svg">${ICONS.minus}</span>
          </button>
          <button class="action-toggle-btn" id="btn-toggle-wireframe" title="Drahtgitter / Wireframe">
            <span class="btn-icon-svg">${ICONS.wireframe}</span>
          </button>
          <button class="action-toggle-btn" id="btn-toggle-spin" title="${t('view_spin')}">
            <span class="btn-icon-svg">${ICONS.spin}</span>
          </button>
          <button class="action-toggle-btn" id="btn-quick-screenshot" title="${t('save_screenshot')}">
            <span class="btn-icon-svg">${ICONS.camera}</span>
          </button>
          ${this.viewer?.getState()?.activeProduct?.comparisonPhoto ? `
            <button class="action-toggle-btn" id="btn-view-comparison" title="${t('photo_comparison_view')}">
              <span class="btn-icon-svg">${ICONS.eye}</span>
            </button>
          ` : ''}

          <div class="bg-switcher-pill" id="bg-switcher-group" title="${t('bg_label')}">
            <button class="bg-pill-btn ${(this.viewer?.currentBackground || 'light') === 'light' ? 'active' : ''}" data-bg="light" title="${t('bg_studio_light')}">☀️</button>
            <button class="bg-pill-btn ${(this.viewer?.currentBackground) === 'white' ? 'active' : ''}" data-bg="white" title="${t('bg_white')}">⚪</button>
            <button class="bg-pill-btn ${(this.viewer?.currentBackground) === 'dark' ? 'active' : ''}" data-bg="dark" title="${t('bg_studio_dark')}">🌙</button>
          </div>

          <button class="action-toggle-btn ${this.isFullscreen ? 'active' : ''}" id="btn-toggle-fullscreen" title="${fsTitle}">
            <span class="btn-icon-svg" id="fs-icon-container">${fsIcon}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 3D Angle buttons
    this.container.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.currentView = view;
        this.container.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
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
        if (this.viewer) this.viewer.zoom(0.84);
      });
    }

    const btnZoomOut = this.container.querySelector('#btn-zoom-out');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (this.viewer) this.viewer.zoom(1.19);
      });
    }

    // Wireframe toggle
    const btnWireframe = this.container.querySelector('#btn-toggle-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        if (this.viewer) {
          const isWireframe = this.viewer.toggleWireframe();
          btnWireframe.classList.toggle('active', isWireframe);
        }
      });
    }

    // Auto-spin toggle
    const btnSpin = this.container.querySelector('#btn-toggle-spin');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        if (this.viewer) {
          const isSpinning = this.viewer.toggleAutoRotate();
          btnSpin.classList.toggle('active', isSpinning);
        }
      });
    }

    // Quick Screenshot button
    const btnScreenshot = this.container.querySelector('#btn-quick-screenshot');
    if (btnScreenshot) {
      btnScreenshot.addEventListener('click', async () => {
        if (this.viewer) {
          btnScreenshot.classList.add('active');
          await this.viewer.captureCurrentView();
          setTimeout(() => btnScreenshot.classList.remove('active'), 600);
        }
      });
    }

    // Background Switcher Pill
    this.container.querySelectorAll('.bg-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bg = btn.dataset.bg;
        if (this.viewer) {
          this.viewer.setBackground(bg);
        }
        this.updateBackgroundPill(bg);
      });
    });

    if (this.viewer) {
      const origBgHandler = this.viewer.onBackgroundChange;
      this.viewer.onBackgroundChange = (bg) => {
        this.updateBackgroundPill(bg);
        if (typeof origBgHandler === 'function') origBgHandler(bg);
      };
    }

    // Comparison Dialog Button
    const btnComp = this.container.querySelector('#btn-view-comparison');
    if (btnComp) {
      btnComp.addEventListener('click', () => {
        const photoUrl = this.viewer?.getState()?.activeProduct?.comparisonPhoto;
        if (photoUrl) {
          openPhotoComparisonDialog(photoUrl);
        }
      });
    }

    // Fullscreen toggle
    const btnFs = this.container.querySelector('#btn-toggle-fullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
  }

  updateBackgroundPill(bg) {
    this.container.querySelectorAll('.bg-pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.bg === bg);
    });
  }

  bindGlobalEvents() {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      const fsIconContainer = this.container.querySelector('#fs-icon-container');
      const btnFs = this.container.querySelector('#btn-toggle-fullscreen');
      if (fsIconContainer && btnFs) {
        fsIconContainer.innerHTML = this.isFullscreen ? ICONS.minimize : ICONS.maximize;
        btnFs.title = this.isFullscreen ? t('fullscreen_exit') : t('fullscreen_enter');
        btnFs.classList.toggle('active', this.isFullscreen);
      }
    });

    // Keyboard Shortcuts (0: 3/4 Perspective, 1: Front, 2: Back, 3: Left, 4: Right, 5: Top, +/-: Zoom, W: Wireframe, Space: Spin)
    window.addEventListener('keydown', (e) => {
      if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) return;

      if (e.key === '0') this.triggerView('perspective');
      else if (e.key === '1') this.triggerView('front');
      else if (e.key === '2') this.triggerView('back');
      else if (e.key === '3') this.triggerView('left');
      else if (e.key === '4') this.triggerView('right');
      else if (e.key === '5') this.triggerView('top');
      else if (e.key === '+' || e.key === '=') {
        const btn = this.container.querySelector('#btn-zoom-in');
        if (btn) btn.click();
      } else if (e.key === '-' || e.key === '_') {
        const btn = this.container.querySelector('#btn-zoom-out');
        if (btn) btn.click();
      } else if (e.key.toLowerCase() === 'w') {
        const btn = this.container.querySelector('#btn-toggle-wireframe');
        if (btn) btn.click();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const spinBtn = this.container.querySelector('#btn-toggle-spin');
        if (spinBtn) spinBtn.click();
      }
    });
  }

  triggerView(viewName) {
    const btn = this.container.querySelector(`.view-btn[data-view="${viewName}"]`);
    if (btn) btn.click();
  }

  toggleFullscreen() {
    const appEl = document.querySelector('.app-container') || document.documentElement;
    if (!document.fullscreenElement) {
      if (appEl.requestFullscreen) {
        appEl.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn('Exit fullscreen error:', err));
      }
    }
  }
}
