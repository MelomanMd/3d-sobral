import confetti from 'canvas-confetti';
import { PATTERNS } from '../core/patterns.js';
import { PLACEMENT_ZONES, getZoneName } from '../core/textureEngine.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class ExportModal {
  constructor(viewer, state) {
    this.viewer = viewer;
    this.state = state;
    this.modalEl = null;
  }

  async open() {
    this.close();

    const frontUrl = await this.viewer.captureAngle('front', 1200, 1200);
    const backUrl = await this.viewer.captureAngle('back', 1200, 1200);
    const pattern = PATTERNS.find(p => p.id === this.state.patternId) || PATTERNS[0];
    const patternName = pattern.getName ? pattern.getName() : pattern.name;
    const comparisonPhoto = this.state.activeProduct?.comparisonPhoto || null;

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'export-modal-root';
    modal.innerHTML = `
      <div class="modal-card modal-card-large">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge">${t('modal_badge')}</span>
            <h2 class="modal-title">${t('modal_title')}</h2>
          </div>
          <button class="modal-close-btn" id="modal-btn-close">${ICONS.close}</button>
        </div>

        <div class="modal-body">
          <!-- Dual Front & Back Previews -->
          <div class="dual-render-grid">
            <div class="render-box">
              <div class="render-box-header">
                <span class="view-tag-svg">${ICONS.shirt}</span>
                <span class="view-tag">${t('front_view')}</span>
              </div>
              <div class="render-img-frame">
                <img src="${frontUrl}" alt="Front View" class="render-preview-img" id="front-preview-img">
              </div>
              <button class="btn-sm btn-outline-glass btn-download-single" data-view="front">
                <span class="btn-icon-svg">${ICONS.download}</span>
                <span>${t('download_front')}</span>
              </button>
            </div>

            <div class="render-box">
              <div class="render-box-header">
                <span class="view-tag-svg">${ICONS.refresh}</span>
                <span class="view-tag">${t('back_view')}</span>
              </div>
              <div class="render-img-frame">
                <img src="${backUrl}" alt="Back View" class="render-preview-img" id="back-preview-img">
              </div>
              <button class="btn-sm btn-outline-glass btn-download-single" data-view="back">
                <span class="btn-icon-svg">${ICONS.download}</span>
                <span>${t('download_back')}</span>
              </button>
            </div>
          </div>

          <!-- Specification Breakdown -->
          <div class="spec-grid">
            <div class="spec-card">
              <div class="spec-card-title">
                <span class="spec-title-icon">${ICONS.palette}</span>
                <span>${t('spec_color_scheme')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-key">${t('section_pattern')}:</span>
                <span class="spec-val highlight">${patternName}</span>
              </div>
              <div class="spec-item">
                <span class="spec-key">${t('zone_primary')}:</span>
                <div class="spec-color-val">
                  <span class="mini-swatch" style="background-color: ${this.state.colors.primary}"></span>
                  <code>${this.state.colors.primary}</code>
                </div>
              </div>
              <div class="spec-item">
                <span class="spec-key">${t('zone_accent')}:</span>
                <div class="spec-color-val">
                  <span class="mini-swatch" style="background-color: ${this.state.colors.accent}"></span>
                  <code>${this.state.colors.accent}</code>
                </div>
              </div>
              <div class="spec-item">
                <span class="spec-key">${t('zone_collar')}:</span>
                <div class="spec-color-val">
                  <span class="mini-swatch" style="background-color: ${this.state.colors.collar}"></span>
                  <code>${this.state.colors.collar}</code>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-title">
                <span class="spec-title-icon">${ICONS.type}</span>
                <span>${t('spec_texts_numbers')}</span>
              </div>
              ${this.state.texts.filter(tItem => tItem.visible && tItem.text).map(tItem => `
                <div class="spec-item">
                  <span class="spec-key">${getZoneName(tItem.zone)}:</span>
                  <span class="spec-val bold">"${tItem.text}" (${tItem.color})</span>
                </div>
              `).join('') || `<div class="spec-empty">${t('no_texts')}</div>`}
            </div>

            <div class="spec-card">
              <div class="spec-card-title">
                <span class="spec-title-icon">${ICONS.shield}</span>
                <span>${t('spec_logos_graphics')}</span>
              </div>
              ${this.state.logos.filter(l => l.visible).map(l => `
                <div class="spec-item">
                  <span class="spec-key">${l.name || 'Logo'}:</span>
                  <span class="spec-val">${getZoneName(l.zone)} (${Math.round(l.scale * 100)}%)</span>
                </div>
              `).join('') || `<div class="spec-empty">${t('no_logos')}</div>`}
            </div>
          </div>

          ${comparisonPhoto ? `
            <!-- 8-Angle Reference & 3D Comparison Sheet -->
            <div class="comparison-export-card">
              <div class="comparison-export-header">
                <div class="comparison-header-left">
                  <span class="view-tag-svg">${ICONS.eye}</span>
                  <div>
                    <span class="comparison-title">${t('photo_comparison_modal_title')}</span>
                    <span class="comparison-sub">8 Rundum-Referenzfotos im direkten Vergleich mit dem 3D-Modell</span>
                  </div>
                </div>
                <div class="comparison-header-actions">
                  <button class="btn-sm btn-outline-glass" id="btn-open-comparison-dialog">
                    <span class="btn-icon-svg">${ICONS.maximize}</span>
                    <span>${t('photo_comparison_view')}</span>
                  </button>
                  <button class="btn-sm btn-outline-glass" id="btn-download-comparison-img">
                    <span class="btn-icon-svg">${ICONS.download}</span>
                    <span>${t('photo_comparison_download')}</span>
                  </button>
                </div>
              </div>
              <div class="comparison-banner-preview" id="comparison-banner-click" title="${t('photo_comparison_view')}">
                <img src="${comparisonPhoto}" alt="${t('photo_comparison_modal_title')}" class="comparison-banner-img">
                <div class="comparison-hover-pill">
                  <span class="btn-icon-svg">${ICONS.maximize}</span>
                  <span>${t('photo_comparison_view')}</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          <button class="btn-outline-glass" id="btn-download-glb" title="${t('download_glb')}">
            <span class="btn-icon-svg">${ICONS.cube}</span>
            <span>3D-Modell (.GLB)</span>
          </button>
          <button class="btn-outline-glass" id="btn-quick-screenshot" title="${t('save_screenshot')}">
            <span class="btn-icon-svg">${ICONS.camera}</span>
            <span>Aktuelle Ansicht (PNG)</span>
          </button>
          <button class="btn-outline-glass" id="btn-download-json" title="${t('download_project_json')}">
            <span class="btn-icon-svg">${ICONS.fileJson}</span>
            <span>JSON</span>
          </button>
          <button class="btn-outline-glass" id="btn-copy-spec">
            <span class="btn-icon-svg">${ICONS.copy}</span>
            <span>${t('copy_spec')}</span>
          </button>
          <button class="btn-primary-action" id="btn-download-composite">
            <span class="btn-icon-svg">${ICONS.download}</span>
            <span>${t('download_composite')}</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Events
    modal.querySelector('#modal-btn-close').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Single angle downloads
    modal.querySelectorAll('.btn-download-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        const url = view === 'front' ? frontUrl : backUrl;
        const a = document.createElement('a');
        a.href = url;
        a.download = `sobral_${view}.png`;
        a.click();

        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      });
    });

    // Download 3D Model GLB
    const btnDownloadGlb = modal.querySelector('#btn-download-glb');
    if (btnDownloadGlb) {
      btnDownloadGlb.addEventListener('click', async () => {
        const orig = btnDownloadGlb.innerHTML;
        btnDownloadGlb.innerHTML = `<span class="btn-icon-svg">${ICONS.cube}</span><span>${t('downloading_glb') || 'Wird geladen...'}</span>`;
        btnDownloadGlb.disabled = true;
        try {
          await this.viewer.downloadActiveModelGlb();
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        } finally {
          btnDownloadGlb.innerHTML = orig;
          btnDownloadGlb.disabled = false;
        }
      });
    }

    // Quick screenshot of current 3D view
    const btnQuickScreenshot = modal.querySelector('#btn-quick-screenshot');
    if (btnQuickScreenshot) {
      btnQuickScreenshot.addEventListener('click', async () => {
        btnQuickScreenshot.disabled = true;
        try {
          await this.viewer.captureCurrentView();
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        } finally {
          btnQuickScreenshot.disabled = false;
        }
      });
    }

    // Export project JSON
    const btnDownloadJson = modal.querySelector('#btn-download-json');
    if (btnDownloadJson) {
      btnDownloadJson.addEventListener('click', () => {
        const projectData = {
          version: '1.0.0',
          appName: 'SOBRAL 3D Studio',
          exportedAt: new Date().toISOString(),
          patternId: this.state.patternId,
          colors: { ...this.state.colors },
          texts: JSON.parse(JSON.stringify(this.state.texts || [])),
          logos: JSON.parse(JSON.stringify(this.state.logos || []))
        };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sobral_design.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Composite Download (Front + Back side by side)
    modal.querySelector('#btn-download-composite').addEventListener('click', async () => {
      const btn = modal.querySelector('#btn-download-composite');
      const origText = btn.innerHTML;
      btn.innerHTML = `<span class="btn-icon-svg">${ICONS.download}</span><span>${t('generating_mockup')}</span>`;

      try {
        const compositeUrl = await this.viewer.captureComposite(2400, 1350);
        const a = document.createElement('a');
        a.href = compositeUrl;
        a.download = 'sobral_mockup.png';
        a.click();

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } finally {
        btn.innerHTML = origText;
      }
    });

    // 8-Angle Photo Comparison Events
    if (comparisonPhoto) {
      const openDialog = () => this.openComparisonDialog(comparisonPhoto);
      
      const btnOpenComp = modal.querySelector('#btn-open-comparison-dialog');
      if (btnOpenComp) btnOpenComp.addEventListener('click', openDialog);

      const bannerClick = modal.querySelector('#comparison-banner-click');
      if (bannerClick) bannerClick.addEventListener('click', openDialog);

      const btnDownloadComp = modal.querySelector('#btn-download-comparison-img');
      if (btnDownloadComp) {
        btnDownloadComp.addEventListener('click', async () => {
          try {
            const res = await fetch(comparisonPhoto);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sobral-${(this.state.activeProduct?.articleNumber || 'produkt').toLowerCase()}-fotovergleich.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } catch (e) {
            console.error('Error downloading comparison photo:', e);
          }
        });
      }
    }

    // Copy specification to clipboard
    modal.querySelector('#btn-copy-spec').addEventListener('click', (e) => {
      const textSummary = `
${t('spec_summary_header')}
${t('section_pattern')}: ${patternName}
${t('spec_color_scheme')}:
- ${t('zone_primary')}: ${this.state.colors.primary}
- ${t('zone_accent')}: ${this.state.colors.accent}
- ${t('zone_collar')}: ${this.state.colors.collar}
- ${t('zone_secondary')}: ${this.state.colors.secondary}

${t('spec_texts_numbers')}:
${this.state.texts.filter(item => item.visible).map(item => `- ${getZoneName(item.zone)}: "${item.text}" (${t('label_text_color')}: ${item.color})`).join('\n')}

${t('spec_logos_graphics')}:
${this.state.logos.filter(l => l.visible).map(l => `- ${l.name}: ${getZoneName(l.zone)} (${t('label_scale')}: ${Math.round(l.scale * 100)}%)`).join('\n')}
--------------------------------------
      `.trim();

      navigator.clipboard.writeText(textSummary).then(() => {
        const btn = e.currentTarget;
        const orig = btn.innerHTML;
        btn.innerHTML = `<span class="btn-icon-svg">${ICONS.check}</span><span>${t('copied_success')}</span>`;
        setTimeout(() => {
          btn.innerHTML = orig;
        }, 2000);
      });
    });
  }

  openComparisonDialog(photoUrl) {
    const dialog = document.createElement('dialog');
    dialog.className = 'comparison-dialog-root';
    dialog.id = 'comparison-dialog';
    dialog.innerHTML = `
      <div class="dialog-bar">
        <strong>${t('photo_comparison_modal_title')}</strong>
        <button class="dialog-close-btn" id="close-dialog-btn">${t('close_modal')}</button>
      </div>
      <div class="dialog-scroll-body">
        <img src="${photoUrl}" alt="${t('photo_comparison_modal_title')}" class="dialog-comparison-img">
      </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    const closeDialog = () => {
      dialog.close();
      dialog.remove();
    };

    dialog.querySelector('#close-dialog-btn').addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog();
    });
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
