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

    const customer = window.SOBRAL_CUSTOMER || {
      isLoggedIn: false,
      name: '',
      email: '',
      company: ''
    };

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'quote-modal-root';
    modal.innerHTML = `
      <div class="modal-card figma-quote-card" style="max-width: 520px; width: 100%; background: #ffffff; border-radius: 2px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); padding: 32px 36px 36px 36px; overflow: hidden;">
        <div class="modal-title-group" style="margin-bottom: 24px;">
          <h2 class="modal-title" style="margin: 0; font-size: 20px; font-weight: 700; color: #1d1d1b; font-family: 'Neue DIN', sans-serif; letter-spacing: 0.5px;">ANGEBOT ANFORDERN</h2>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280;">Kontaktdaten für dein individuelles Angebot.</p>
        </div>

        <form id="quote-request-form" style="display: flex; flex-direction: column; gap: 20px;">
          <!-- E-MAIL Field -->
          <div class="figma-field-group">
            <label class="figma-label">E-MAIL</label>
            <input type="email" id="quote-email" value="${customer.email || 'name@firma.ch'}" placeholder="name@firma.ch" required class="figma-input" style="height: 44px; border-radius: 2px;">
          </div>

          <!-- FIRMA Field -->
          <div class="figma-field-group">
            <label class="figma-label">FIRMA</label>
            <input type="text" id="quote-company" value="${customer.company || 'Dein Unternehmen'}" placeholder="Dein Unternehmen" required class="figma-input" style="height: 44px; border-radius: 2px;">
          </div>

          <!-- Button ZURÜCK ZUM ENTWURF -->
          <div style="margin-top: 8px;">
            <button type="button" class="btn-figma-white-action" id="btn-quote-back" style="width: 100%; height: 44px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; border-radius: 2px; border: 1px solid #d1d5db; background: #ffffff; color: #1d1d1b; cursor: pointer; font-family: 'Neue DIN', sans-serif; text-transform: uppercase;">
              ZURÜCK ZUM ENTWURF
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Events
    modal.querySelector('#btn-quote-back').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    const form = modal.querySelector('#quote-request-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('#btn-quote-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';

      const email = modal.querySelector('#quote-email').value;
      const company = modal.querySelector('#quote-company').value;

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        this.renderSuccess(company || email);
      } catch (err) {
        console.error('Quote error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'ANGEBOT JETZT ABSENDEN';
      }
    });
  }

  renderSuccess(leadName) {
    if (!this.modalEl) return;
    const card = this.modalEl.querySelector('.figma-quote-card');
    card.innerHTML = `
      <div style="padding: 40px 30px; text-align: center; background: #ffffff;">
        <div style="width: 56px; height: 56px; background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: #22c55e; font-size: 26px;">
          ✓
        </div>
        <h3 style="font-size: 20px; font-weight: 700; color: #1d1d1b; margin: 0 0 8px 0; font-family: 'Neue DIN', sans-serif;">
          VIELEN DANK!
        </h3>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0;">
          Deine Anfrage für <b>${leadName}</b> wurde erfolgreich übermittelt.<br>
          Unser Team meldet sich innerhalb von 24 Stunden mit deinem persönlichen Angebot.
        </p>
        <button class="btn-figma-black-action" id="btn-success-close" style="padding: 12px 28px; border-radius: 6px; font-weight: 700; font-family: 'Neue DIN', sans-serif;">
          ZURÜCK ZUM KONFIGURATOR
        </button>
      </div>
    `;

    card.querySelector('#btn-success-close')?.addEventListener('click', () => this.close());
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
