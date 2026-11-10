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

    this.zoomPercent = 100;
    this.container.innerHTML = `
      <div class="floating-view-bar-new">
        <!-- 3D Camera Angles -->
        <div class="view-preset-group-new">
          <button class="view-btn-pill ${this.currentView === 'front' ? 'active' : ''}" data-view="front" title="Vorne">
            <span>Vorne</span>
          </button>
          <button class="view-btn-pill ${this.currentView === 'back' ? 'active' : ''}" data-view="back" title="Hinten">
            <span>Hinten</span>
          </button>
          <button class="view-btn-pill ${this.currentView === 'left' ? 'active' : ''}" data-view="left" title="Links">
            <span>Links</span>
          </button>
          <button class="view-btn-pill ${this.currentView === 'right' ? 'active' : ''}" data-view="right" title="Rechts">
            <span>Rechts</span>
          </button>
        </div>

        <div class="view-pill-divider"></div>

        <!-- Zoom Controls -->
        <div class="view-zoom-group-new">
          <button class="btn-zoom-circle" id="btn-zoom-out" title="Verkleinern">−</button>
          <span class="zoom-level-text" id="zoom-level-text">${Math.round(this.zoomPercent)} %</span>
          <button class="btn-zoom-circle" id="btn-zoom-in" title="Vergrößern">+</button>
        </div>

        <div class="view-pill-divider"></div>

        <!-- Reset Camera View -->
        <button class="btn-reset-view-circle" id="btn-reset-camera-view" title="Ansicht zurücksetzen">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
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
    this.container.querySelectorAll('.view-btn-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.currentView = view;
        this.container.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
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

    // Reset camera view
    const btnReset = this.container.querySelector('#btn-reset-camera-view');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.viewer) {
          this.viewer.setView('front');
          this.currentView = 'front';
          this.zoomPercent = 100;
          updateZoomDisplay();
          this.container.querySelectorAll('.view-btn-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.view === 'front');
          });
        }
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
