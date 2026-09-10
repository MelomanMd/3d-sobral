import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class FittingPanel {
  constructor(containerElement, state, outfitState, onOutfitUpdate, onReturnToProduct, onExportLook, garmentProduct = null, catalog = null, onSwitchGarment = null) {
    this.container = containerElement;
    this.state = state;
    this.garmentProduct = garmentProduct || state.activeProduct;
    this.catalog = catalog;
    this.onSwitchGarment = onSwitchGarment;
    this.outfitState = outfitState || {
      trousersColor: '#1a2232',
      shoesColor: '#121418',
      headwear: 'none' // 'none', 'helmet', 'beanie'
    };
    this.onOutfitUpdate = onOutfitUpdate;
    this.onReturnToProduct = onReturnToProduct;
    this.onExportLook = onExportLook;

    this.render();
  }

  calculateTotal() {
    const topPrice = parseFloat(this.garmentProduct?.price) || 39.0;
    const trousersPrice = 89.0;
    const shoesPrice = 129.0;
    let headPrice = 0;
    if (this.outfitState.headwear === 'helmet') headPrice = 145.0;
    else if (this.outfitState.headwear === 'beanie') headPrice = 24.0;

    return (topPrice + trousersPrice + shoesPrice + headPrice).toFixed(2);
  }

  render() {
    const prod = this.garmentProduct || this.state.activeProduct || {};
    const primaryColor = this.state.colors?.primary || '#1b2034';
    const accentColor = this.state.colors?.accent || '#ff4400';
    const total = this.calculateTotal();

    // Find available workwear tops from catalog
    const availableTops = this.catalog ? this.catalog.getProducts().filter(p => {
      if (p.id === 'sobral_person_01') return false;
      return p.category === 'tops' || (p.modelUrl && (
        p.modelUrl.includes('3300') ||
        p.modelUrl.includes('3340') ||
        p.modelUrl.includes('3362') ||
        p.modelUrl.includes('3366') ||
        p.modelUrl.includes('4890')
      ));
    }) : [];

    this.container.innerHTML = `
      <div class="fitting-panel-wrapper">
        <!-- Header Info -->
        <div class="panel-section" style="padding-bottom: 12px;">
          <div class="section-title">
            <span class="title-icon-svg">${ICONS.user}</span>
            <span>${t('fitting_title')}</span>
          </div>
          <p style="font-size: 11.5px; color: var(--text-muted); margin: 0 0 10px 0; line-height: 1.4;">
            ${t('fitting_subtitle')}
          </p>

          <button class="btn-sm btn-outline-glass" id="btn-back-to-product" style="width: 100%; justify-content: center; gap: 8px;">
            <span class="btn-icon-svg">${ICONS.arrowLeft}</span>
            <span>${t('fitting_switch_back')}</span>
          </button>
        </div>

        <!-- 1. Configured Top (Applied from Studio) -->
        <div class="panel-section" style="padding-top: 10px; padding-bottom: 10px;">
          <div class="fitting-card-box">
            <div class="fitting-card-header">
              <span class="fitting-card-badge">${t('fitting_top_card')}</span>
              <span class="fitting-item-price">${prod.price || '39.00 CHF'}</span>
            </div>
            <div class="fitting-card-body">
              <div class="fitting-thumb-wrap">
                ${prod.frontPreview ? `<img src="${prod.frontPreview}" alt="${prod.name}" class="fitting-thumb-img">` : ICONS.shirt}
              </div>
              <div class="fitting-item-info">
                <span class="fitting-item-name">${prod.name}</span>
                <span class="fitting-item-sku">SKU: ${prod.sku || 'SOB-101'}</span>
                <div class="fitting-color-pills">
                  <span class="fitting-color-dot" style="background: ${primaryColor};" title="Hauptfarbe: ${primaryColor}"></span>
                  <span class="fitting-color-dot" style="background: ${accentColor};" title="Akzentfarbe: ${accentColor}"></span>
                  <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Farben aktiv am Model</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Top Garment Switcher List -->
          ${availableTops.length > 1 ? `
            <div style="margin-top: 10px;">
              <span style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                Andere Kleidung anprobieren:
              </span>
              <div class="fitting-garment-select-grid">
                ${availableTops.map(p => `
                  <div class="fitting-garment-btn ${p.id === prod.id ? 'active' : ''}" data-garment-id="${p.id}" title="${p.name}">
                    <span class="fitting-garment-thumb">
                      ${p.frontPreview ? `<img src="${p.frontPreview}" alt="${p.name}">` : `<span class="icon-svg-sm">${ICONS.shirt}</span>`}
                    </span>
                    <span class="fitting-garment-name">${p.name.replace('SOBRAL ', '')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 2. Matching Trousers Selector -->
        <div class="panel-section" style="padding-top: 10px; padding-bottom: 10px;">
          <div class="section-header-row" style="margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              ${t('fitting_bottom_card')}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #3b82f6;">89.00 CHF</span>
          </div>

          <div class="fitting-options-grid">
            <div class="fitting-opt-card ${this.outfitState.trousersColor === '#1a2232' ? 'active' : ''}" data-trousers="#1a2232">
              <span class="opt-color-circle" style="background: #1a2232;"></span>
              <span class="opt-label">${t('fitting_trousers_navy')}</span>
            </div>
            <div class="fitting-opt-card ${this.outfitState.trousersColor === '#121316' ? 'active' : ''}" data-trousers="#121316">
              <span class="opt-color-circle" style="background: #121316;"></span>
              <span class="opt-label">${t('fitting_trousers_black')}</span>
            </div>
            <div class="fitting-opt-card ${this.outfitState.trousersColor === '#475569' ? 'active' : ''}" data-trousers="#475569">
              <span class="opt-color-circle" style="background: #475569;"></span>
              <span class="opt-label">${t('fitting_trousers_grey')}</span>
            </div>
          </div>
        </div>

        <!-- 3. Safety Boots -->
        <div class="panel-section" style="padding-top: 10px; padding-bottom: 10px;">
          <div class="section-header-row" style="margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
              ${t('fitting_shoes_card')}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #3b82f6;">129.00 CHF</span>
          </div>

          <div class="fitting-opt-card active" style="cursor: default;">
            <span class="opt-color-circle" style="background: #181818; border: 1px solid #ff4400;"></span>
            <span class="opt-label">${t('fitting_shoe_black')} (Inklusive)</span>
          </div>
        </div>

        <!-- 4. Total Price & Actions -->
        <div class="panel-section" style="padding-top: 14px; margin-top: 8px; border-top: 1px solid var(--border-glass);">
          <div class="fitting-total-row" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
            <span style="font-size: 12.5px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">${t('fitting_total_price')}:</span>
            <span style="font-size: 20px; font-weight: 900; color: #ff4400;">${total} CHF</span>
          </div>

          <button class="btn-primary-action" id="btn-export-fitting-look" style="width: 100%; justify-content: center; padding: 12px; font-size: 13px;">
            <span class="btn-icon-svg">${ICONS.camera}</span>
            <span>${t('fitting_download_look')}</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnBack = this.container.querySelector('#btn-back-to-product');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (this.onReturnToProduct) this.onReturnToProduct();
      });
    }

    this.container.querySelectorAll('[data-garment-id]').forEach(el => {
      el.addEventListener('click', () => {
        const gId = el.dataset.garmentId;
        const targetProd = this.catalog?.getProducts().find(p => p.id === gId);
        if (targetProd && this.onSwitchGarment) {
          this.garmentProduct = targetProd;
          this.onSwitchGarment(targetProd);
        }
      });
    });

    this.container.querySelectorAll('[data-trousers]').forEach(el => {
      el.addEventListener('click', () => {
        const col = el.dataset.trousers;
        this.outfitState.trousersColor = col;
        this.render();
        if (this.onOutfitUpdate) this.onOutfitUpdate(this.outfitState);
      });
    });

    const btnExport = this.container.querySelector('#btn-export-fitting-look');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        if (this.onExportLook) this.onExportLook();
      });
    }
  }
}
