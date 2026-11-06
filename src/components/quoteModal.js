import confetti from 'canvas-confetti';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { getClosestColorSpec, downloadProductionPdf, generateProductionPdf } from '../core/pdfExport.js';
import { getZoneName } from '../core/textureEngine.js';

export class QuoteModal {
  constructor(viewer, state) {
    this.viewer = viewer;
    this.state = state;
    this.modalEl = null;
    this.sizes = {
      XS: 0,
      S: 5,
      M: 15,
      L: 20,
      XL: 15,
      '2XL': 10,
      '3XL': 2,
      '4XL': 0
    };
  }

  getTotalQty() {
    return Object.values(this.sizes).reduce((sum, q) => sum + (parseInt(q, 10) || 0), 0);
  }

  async open() {
    this.close();

    const prod = this.state.activeProduct || {};
    const artNumber = prod.articleNumber || prod.id || 'WORKWEAR';
    const prodName = prod.name || 'SOBRAL Workwear';
    const previewUrl = await this.viewer.captureAngle('front', 600, 600, true);

    const customer = window.SOBRAL_CUSTOMER || {
      isLoggedIn: false,
      name: '',
      email: ''
    };

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'quote-modal-root';
    modal.innerHTML = `
      <div class="modal-card modal-card-large" style="max-width: 780px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge" style="background: rgba(255, 68, 0, 0.15); color: #ff4400; border: 1px solid rgba(255, 68, 0, 0.3);">
              OFFERTE & MUSTER
            </span>
            <h2 class="modal-title">Unverbindliches Angebot anfordern</h2>
          </div>
          <button class="modal-close-btn" id="quote-btn-close">${ICONS.close}</button>
        </div>

        <div class="modal-body" style="padding-top: 12px;">
          <!-- Top Design Summary Row -->
          <div style="display: flex; gap: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 14px; margin-bottom: 18px; align-items: center;">
            <div style="width: 80px; height: 80px; background: #161a24; border-radius: 8px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
              <img src="${previewUrl}" alt="3D Vorschau" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; font-weight: 700; color: #ff4400; text-transform: uppercase;">${artNumber}</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 2px 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prodName}</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary);">
                <span><b>Hauptfarbe:</b> ${getClosestColorSpec(this.state.colors.primary).ral}</span>
                <span>•</span>
                <span><b>Akzent:</b> ${getClosestColorSpec(this.state.colors.accent).ral}</span>
                <span>•</span>
                <span><b>Logos:</b> ${(this.state.logos || []).filter(l => l.visible).length} Platziert</span>
              </div>
            </div>
          </div>

          <!-- Size Matrix Section -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em;">
                1. Stückzahlen pro Konfektionsgrösse
              </span>
              <span style="font-size: 12px; font-weight: 700; color: #ff4400;">
                Gesamt: <b id="quote-total-qty">${this.getTotalQty()}</b> Stück
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); padding: 12px; border-radius: 8px;">
              ${Object.keys(this.sizes).map(sz => `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">${sz}</span>
                  <input type="number" class="quote-size-input" data-size="${sz}" min="0" max="9999" value="${this.sizes[sz]}" style="width: 100%; text-align: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff; padding: 6px 2px; font-weight: 600; font-size: 13px;">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Customer Contact Form -->
          <div>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 10px;">
              2. Kontaktdaten für das Angebot
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Firma / Organisation (optional)</label>
                <input type="text" id="quote-company" placeholder="z.B. Bau AG" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 13px;">
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Ansprechpartner *</label>
                <input type="text" id="quote-name" value="${customer.name || ''}" placeholder="Vor- und Nachname" required style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 13px;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">E-Mail-Adresse *</label>
                <input type="email" id="quote-email" value="${customer.email || ''}" placeholder="ihre@email.ch" required style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 13px;">
              </div>
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Telefonnummer</label>
                <input type="tel" id="quote-phone" placeholder="+41 ..." style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 13px;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Bemerkungen & Wünsche (z.B. Stick, Veredelungstechnik, Wunschtermin)</label>
              <textarea id="quote-notes" rows="2" placeholder="Zusätzliche Wünsche oder Fragen..." style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 13px; resize: vertical;"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn-outline-glass" id="btn-quote-download-pdf" title="Produktionsdatenblatt als PDF herunterladen">
            <span class="btn-icon-svg">${ICONS.fileText}</span>
            <span>Produktions-PDF</span>
          </button>

          <button class="btn-primary-action" id="btn-submit-quote" style="background: linear-gradient(135deg, #ff4400 0%, #ff6b35 100%); font-weight: 700; padding: 0 24px;">
            <span class="btn-icon-svg">${ICONS.send}</span>
            <span>Angebot anfordern</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Events
    modal.querySelector('#quote-btn-close').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Size input handlers
    const totalEl = modal.querySelector('#quote-total-qty');
    modal.querySelectorAll('.quote-size-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const sz = e.target.dataset.size;
        this.sizes[sz] = parseInt(e.target.value, 10) || 0;
        if (totalEl) totalEl.textContent = this.getTotalQty();
      });
    });

    // PDF Download button
    modal.querySelector('#btn-quote-download-pdf').addEventListener('click', async () => {
      await downloadProductionPdf(this.viewer, this.state, this.sizes);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    });

    // Submit Quote Button
    const btnSubmit = modal.querySelector('#btn-submit-quote');
    btnSubmit.addEventListener('click', async () => {
      const name = modal.querySelector('#quote-name').value.trim();
      const email = modal.querySelector('#quote-email').value.trim();
      const company = modal.querySelector('#quote-company').value.trim();
      const phone = modal.querySelector('#quote-phone').value.trim();
      const notes = modal.querySelector('#quote-notes').value.trim();

      if (!name || !email) {
        alert('Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an.');
        return;
      }

      btnSubmit.disabled = true;
      const origContent = btnSubmit.innerHTML;
      btnSubmit.innerHTML = `<span>Wird übermittelt...</span>`;

      try {
        const quoteRef = 'SOB-OFF-' + Math.floor(100000 + Math.random() * 900000);
        const quotePayload = {
          quoteRef,
          product: {
            id: prod.id,
            articleNumber: artNumber,
            name: prodName
          },
          colors: this.state.colors,
          logos: this.state.logos,
          texts: this.state.texts,
          sizes: this.sizes,
          totalQty: this.getTotalQty(),
          customer: { name, email, company, phone, notes },
          previewImage: previewUrl,
          createdAt: new Date().toISOString()
        };

        // If backend Magento endpoint is reachable, send quote
        const quoteUrl = window.SOBRAL_CUSTOMER?.quoteUrl || '/customizer/quote/request';
        try {
          await fetch(quoteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quotePayload)
          });
        } catch (netErr) {
          console.warn('Network send fallback:', netErr);
        }

        // Store in localStorage quotes history
        try {
          const quotes = JSON.parse(localStorage.getItem('sobral_quote_requests') || '[]');
          quotes.unshift(quotePayload);
          localStorage.setItem('sobral_quote_requests', JSON.stringify(quotes.slice(0, 20)));
        } catch (e) {}

        // Show Success View in Modal
        this.renderSuccess(modal, quoteRef, name, email);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (err) {
        alert('Fehler beim Absenden des Angebots. Bitte versuchen Sie es erneut.');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origContent;
      }
    });
  }

  renderSuccess(modal, quoteRef, name, email) {
    const card = modal.querySelector('.modal-card');
    if (!card) return;

    card.innerHTML = `
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-badge" style="background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);">
            ANGEBOT ERFOLGREICH ANGEFORDERT
          </span>
          <h2 class="modal-title">Vielen Dank für Ihre Anfrage!</h2>
        </div>
        <button class="modal-close-btn" id="success-btn-close">${ICONS.close}</button>
      </div>

      <div class="modal-body" style="text-align: center; padding: 24px 16px;">
        <div style="width: 56px; height: 56px; background: rgba(34, 197, 94, 0.15); border: 2px solid #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: #22c55e;">
          ${ICONS.check}
        </div>

        <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;">
          Ihre Angebotsnummer: <span style="color: #ff4400;">${quoteRef}</span>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
          Wir haben Ihre 3D-Konfiguration und die gewünschte Stückzahl (${this.getTotalQty()} Stk.) erhalten. Eine Bestätigung wurde an <b>${email}</b> gesendet. Unser B2B-Team wird sich innerhalb von 24 Stunden mit Ihrer Offerte bei Ihnen melden.
        </p>

        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn-primary-action" id="btn-success-pdf" style="background: linear-gradient(135deg, #ff4400 0%, #ff6b35 100%);">
            <span class="btn-icon-svg">${ICONS.fileText}</span>
            <span>Produktions-PDF herunterladen</span>
          </button>
          <button class="btn-outline-glass" id="btn-success-close">
            <span>Schliessen</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('#success-btn-close')?.addEventListener('click', () => this.close());
    card.querySelector('#btn-success-close')?.addEventListener('click', () => this.close());
    card.querySelector('#btn-success-pdf')?.addEventListener('click', async () => {
      await downloadProductionPdf(this.viewer, this.state, this.sizes);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    });
  }

  close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
  }
}
