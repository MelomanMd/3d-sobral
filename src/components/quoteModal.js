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
      <div class="modal-card figma-quote-card" style="max-width: 580px; background: #ffffff; border-radius: 12px; box-shadow: 0 25px 60px rgba(0,0,0,0.35); overflow: hidden;">
        <div class="modal-header" style="padding: 24px 28px 16px 28px; border-bottom: none; display: flex; align-items: flex-start; justify-content: space-between; background: #ffffff;">
          <div class="modal-title-group">
            <h2 class="modal-title" style="margin: 0; font-size: 20px; font-weight: 700; color: #1d1d1b; font-family: 'Neue DIN', sans-serif; letter-spacing: 0.5px;">ANGEBOT ANFORDERN</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Kontaktdaten für dein individuelles Angebot.</p>
          </div>
          <button class="modal-close-btn" id="quote-btn-close" style="width: 34px; height: 34px; border-radius: 50%; border: 1px solid #e5e7eb; background: #ffffff; color: #1d1d1b; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ✕
          </button>
        </div>

        <div class="modal-body" style="padding: 10px 28px 24px 28px; background: #ffffff;">
          <form id="quote-request-form" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- E-MAIL Field -->
            <div class="figma-field-group">
              <label class="figma-label">E-MAIL</label>
              <input type="email" id="quote-email" value="${customer.email || ''}" placeholder="name@firma.ch" required class="figma-input">
            </div>

            <!-- FIRMA Field -->
            <div class="figma-field-group">
              <label class="figma-label">FIRMA</label>
              <input type="text" id="quote-company" value="${customer.company || ''}" placeholder="Dein Unternehmen" required class="figma-input">
            </div>

            <!-- Button ZURÜCK ZUM ENTWURF -->
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
              <button type="submit" class="btn-figma-orange-action" id="btn-quote-submit" style="width: 100%; height: 46px; font-size: 14px; font-weight: 700; border-radius: 6px; border: none; background: #ff4400; color: #ffffff; cursor: pointer; font-family: 'Neue DIN', sans-serif;">
                ANGEBOT JETZT ABSENDEN
              </button>
              <button type="button" class="btn-figma-white-action" id="btn-quote-back" style="width: 100%; height: 44px; font-size: 13px; font-weight: 700; border-radius: 6px; border: 1px solid #d1d5db; background: #ffffff; color: #1d1d1b; cursor: pointer; font-family: 'Neue DIN', sans-serif;">
                ZURÜCK ZUM ENTWURF
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Events
    modal.querySelector('#quote-btn-close').addEventListener('click', () => this.close());
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
