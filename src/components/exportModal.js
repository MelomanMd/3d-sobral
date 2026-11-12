import confetti from 'canvas-confetti';
import { downloadDraftPdf } from '../core/pdfExport.js';
import { compositeBrandedExport } from '../core/exportCompositor.js';

/**
 * Figma Redesign 2026: Export / Save Draft Modal (Frames 1876:9135 - 1876:9492)
 * Handles PDF, PNG and JPG export formats with instant downloads and success feedback.
 */
export class ExportModal {
  constructor(viewer, state) {
    this.viewer = viewer;
    this.state = state;
    this.modalEl = null;
    this.activeFormat = 'pdf'; // 'pdf' | 'png' | 'jpg'
  }

  open() {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'figma-draft-backdrop';
    backdrop.id = 'export-modal-root';

    backdrop.innerHTML = `
      <div class="figma-draft-card" id="figma-draft-card-body">
        <button class="figma-draft-close" id="btn-draft-x" title="Schließen">✕</button>
        <h2 class="figma-draft-title">ENTWURF SPEICHERN</h2>
        <p class="figma-draft-subtitle">Wähle das gewünschte Dateiformat.</p>

        <div class="figma-draft-format-grid">
          <button class="figma-draft-format-btn active" data-format="pdf">PDF</button>
          <button class="figma-draft-format-btn" data-format="png">PNG</button>
          <button class="figma-draft-format-btn" data-format="jpg">JPG</button>
        </div>

        <div class="figma-draft-desc-box">
          <div class="figma-draft-desc-lead" id="draft-desc-lead">PDF · Vorläufiger Design-Entwurf (4 Ansichten)</div>
          <div class="figma-draft-desc-sub" id="draft-desc-sub">Unverbindliche Vorschau zur Abstimmung – keine technische Spezifikation.</div>
        </div>

        <button class="figma-btn-primary-orange" id="btn-draft-action">ALS PDF SPEICHERN</button>
        <button class="figma-btn-outline-white" id="btn-draft-cancel">ABBRECHEN</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    this.bindEvents(backdrop);
  }

  updateFormat(format) {
    this.activeFormat = format;
    const card = this.modalEl?.querySelector('#figma-draft-card-body');
    if (!card) return;

    // Update active tab buttons
    card.querySelectorAll('.figma-draft-format-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === format);
    });

    const leadEl = card.querySelector('#draft-desc-lead');
    const subEl = card.querySelector('#draft-desc-sub');
    const actionBtn = card.querySelector('#btn-draft-action');

    if (format === 'pdf') {
      if (leadEl) leadEl.textContent = 'PDF · Vorläufiger Design-Entwurf (4 Ansichten)';
      if (subEl) subEl.textContent = 'Unverbindliche Vorschau zur Abstimmung – keine technische Spezifikation.';
      if (actionBtn) actionBtn.textContent = 'ALS PDF SPEICHERN';
    } else if (format === 'png') {
      if (leadEl) leadEl.textContent = 'PNG · Hochauflösendes Bild mit Sobral-Hintergrund';
      if (subEl) subEl.textContent = 'Vollständige Modellansicht auf dunklem Sobral-Hintergrund.';
      if (actionBtn) actionBtn.textContent = 'ALS PNG SPEICHERN';
    } else if (format === 'jpg') {
      if (leadEl) leadEl.textContent = 'JPG · Kompaktes Bild mit Sobral-Hintergrund';
      if (subEl) subEl.textContent = 'Vollständige Modellansicht auf dunklem Sobral-Hintergrund.';
      if (actionBtn) actionBtn.textContent = 'ALS JPG SPEICHERN';
    }
  }

  async executeExport() {
    const actionBtn = this.modalEl?.querySelector('#btn-draft-action');
    if (actionBtn) {
      actionBtn.disabled = true;
      actionBtn.textContent = 'WIRD VORBEREITET...';
    }

    try {
      // 1. Save design state locally
      const savedDesigns = JSON.parse(localStorage.getItem('sobral_saved_designs') || '[]');
      savedDesigns.unshift({
        id: 'sobral_' + Date.now(),
        date: new Date().toISOString(),
        product: this.state.activeProduct?.id || 'sobral_worker',
        colors: { ...this.state.colors },
        logos: [...this.state.logos],
        texts: [...this.state.texts]
      });
      localStorage.setItem('sobral_saved_designs', JSON.stringify(savedDesigns.slice(0, 30)));

      // 2. Perform export based on format
      if (this.activeFormat === 'pdf') {
        await downloadDraftPdf(this.viewer, this.state);
      } else if (this.activeFormat === 'png') {
        if (this.viewer) {
          const url = await this.viewer.captureAngle('front', 1920, 1920, true);
          await this.triggerFileDownload(url, `sobral-design-${Date.now()}.png`, 'image/png');
        }
      } else if (this.activeFormat === 'jpg') {
        if (this.viewer) {
          const url = await this.viewer.captureAngle('front', 1920, 1920, true);
          await this.triggerFileDownload(url, `sobral-scene-${Date.now()}.jpg`, 'image/jpeg');
        }
      }

      // 3. Trigger celebration confetti
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

      // 4. Render success state: Frame 13 (EXPORT VORBEREITET)
      this.renderSuccessState();
    } catch (err) {
      console.error('Export failed:', err);
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.textContent = `ALS ${this.activeFormat.toUpperCase()} SPEICHERN`;
      }
    }
  }

  async triggerFileDownload(dataUrl, filename, mimeType) {
    const quality = mimeType === 'image/jpeg' ? 0.92 : 1.0;
    const { blob } = await compositeBrandedExport(dataUrl, { mimeType, quality });
    if (!blob) return;
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  }

  renderSuccessState() {
    const card = this.modalEl?.querySelector('#figma-draft-card-body');
    if (!card) return;

    card.innerHTML = `
      <button class="figma-draft-close" id="btn-draft-x" title="Schließen">✕</button>
      <h2 class="figma-draft-title">EXPORT VORBEREITET</h2>
      <p class="figma-draft-subtitle" style="color: #1D1D1B; margin-bottom: 12px;">Der Exportablauf ist im Klickdummy abgeschlossen.</p>
      <p class="figma-draft-subtitle" style="margin-bottom: 32px;">In der fertigen Anwendung startet hier der Dateidownload.</p>

      <button class="figma-btn-primary-orange" id="btn-draft-continue">WEITER BEARBEITEN</button>
      <button class="figma-btn-outline-white" id="btn-draft-close-all">KONFIGURATOR SCHLIESSEN</button>
    `;

    card.querySelector('#btn-draft-x')?.addEventListener('click', () => this.close());
    card.querySelector('#btn-draft-continue')?.addEventListener('click', () => this.close());
    card.querySelector('#btn-draft-close-all')?.addEventListener('click', () => {
      this.close();
      window.location.href = '/';
    });
  }

  bindEvents(backdrop) {
    // Backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    // Close button
    backdrop.querySelector('#btn-draft-x')?.addEventListener('click', () => this.close());
    backdrop.querySelector('#btn-draft-cancel')?.addEventListener('click', () => this.close());

    // Format tabs
    backdrop.querySelectorAll('.figma-draft-format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateFormat(btn.dataset.format);
      });
    });

    // Action button
    backdrop.querySelector('#btn-draft-action')?.addEventListener('click', () => {
      this.executeExport();
    });
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}

/**
 * Figma Redesign 2026: Discard Changes Modal (Frame 1876:9611)
 * Triggered when clicking close ✕ on the configurator window.
 */
export class DiscardModal {
  constructor(onSave, onClose) {
    this.onSave = onSave;
    this.onClose = onClose;
    this.modalEl = null;
  }

  open() {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'figma-draft-backdrop';
    backdrop.id = 'discard-modal-root';

    backdrop.innerHTML = `
      <div class="figma-draft-card">
        <button class="figma-draft-close" id="btn-discard-x" title="Schließen">✕</button>
        <h2 class="figma-draft-title">ENTWURF VERWERFEN?</h2>
        <p class="figma-draft-subtitle" style="margin-bottom: 32px;">Ohne Speichern gehen deine Änderungen beim Schliessen verloren.</p>

        <button class="figma-btn-primary-orange" id="btn-discard-return">Weiter bearbeiten</button>
        <button class="figma-btn-outline-white" id="btn-discard-save">Zuerst speichern</button>
        <button class="figma-btn-outline-white" id="btn-discard-exit">Ohne Speichern schliessen</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    backdrop.querySelector('#btn-discard-x')?.addEventListener('click', () => this.close());
    backdrop.querySelector('#btn-discard-return')?.addEventListener('click', () => this.close());

    backdrop.querySelector('#btn-discard-save')?.addEventListener('click', () => {
      this.close();
      if (this.onSave) this.onSave();
    });

    backdrop.querySelector('#btn-discard-exit')?.addEventListener('click', () => {
      this.close();
      if (this.onClose) this.onClose();
      else window.location.href = '/';
    });
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
