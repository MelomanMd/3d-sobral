import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class ProductSwitcher {
  constructor(containerElement, catalog, onSelectProduct, onOpenAddModal) {
    this.container = containerElement;
    this.catalog = catalog;
    this.onSelectProduct = onSelectProduct;
    this.onOpenAddModal = onOpenAddModal;
    this.isOpen = false;

    this.render();
    this.bindGlobalEvents();
  }

  render() {
    const activeProduct = this.catalog.getActiveProduct();
    const products = this.catalog.getProducts();

    this.container.innerHTML = `
      <div class="product-selector-wrapper">
        <button class="product-selector-btn" id="btn-product-dropdown" title="${t('select_product')}">
          <span class="prod-btn-icon">${ICONS.shirt}</span>
          <div class="prod-btn-info">
            <span class="prod-btn-name">${activeProduct.name}</span>
            <span class="prod-btn-cat">${activeProduct.categoryName || t(`cat_${activeProduct.category}`)}</span>
          </div>
          <span class="prod-btn-arrow">${ICONS.arrowRight}</span>
        </button>

        <!-- Dropdown Menu -->
        <div class="product-dropdown-menu ${this.isOpen ? 'open' : ''}" id="product-dropdown-menu">
          <div class="dropdown-header">
            <span class="dropdown-title">${t('product_catalog')}</span>
          </div>

          <div class="dropdown-products-list">
            ${products.map(p => `
              <div class="dropdown-product-item ${p.id === activeProduct.id ? 'active' : ''}" data-id="${p.id}">
                <div class="prod-item-icon">
                  ${p.frontPreview ? `<img src="${p.frontPreview}" alt="${p.name}" class="prod-item-thumb">` : ICONS.shirt}
                </div>
                <div class="prod-item-details">
                  <span class="prod-item-name">${p.name}</span>
                  <div class="prod-item-meta">
                    <span class="prod-item-cat">${p.categoryName || t(`cat_${p.category}`)}</span>
                    <span class="prod-item-price">${p.price || '49.00 €'}</span>
                  </div>
                </div>
                ${!p.id.startsWith('sobral_') ? `
                  <button class="btn-delete-custom-prod" data-id="${p.id}" title="Produkt löschen">${ICONS.trash}</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnToggle = this.container.querySelector('#btn-product-dropdown');
    if (btnToggle) {
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isOpen = !this.isOpen;
        this.render();
      });
    }

    this.container.querySelectorAll('.dropdown-product-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-custom-prod')) return;
        const id = item.dataset.id;
        this.catalog.setActiveProduct(id);
        this.isOpen = false;
        this.render();
        this.onSelectProduct(this.catalog.getActiveProduct());
      });
    });

    this.container.querySelectorAll('.btn-delete-custom-prod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        this.catalog.deleteProduct(id);
        this.render();
      });
    });
  }

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.isOpen = false;
        this.render();
      }
    });
  }
}
