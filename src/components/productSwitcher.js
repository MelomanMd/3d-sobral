import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export class ProductSwitcher {
  constructor(containerElement, catalog, onOpenAddModal) {
    this.container = containerElement;
    this.catalog = catalog;
    this.onOpenAddModal = onOpenAddModal;
    this.isOpen = false;
    this.modalEl = null;
    this.activeFilter = 'all';
    this.searchQuery = '';

    if (this.container) {
      this.render();
    }
    this.bindGlobalEvents();
  }

  toggleDropdown() {
    this.openModal();
  }

  openModal() {
    this.closeModal();

    const activeProduct = this.catalog.getActiveProduct();
    const products = this.catalog.getProducts();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop catalog-modal-backdrop';
    modal.id = 'product-catalog-modal';

    modal.innerHTML = `
      <div class="modal-card modal-card-large catalog-modal-card" style="max-width: 920px; max-height: 85vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; background: #ffffff;">
          <div class="modal-title-group">
            <span class="modal-badge" style="background: rgba(255, 68, 0, 0.08); color: #ff4400; border: 1px solid rgba(255, 68, 0, 0.2); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
              KATALOG & MODELLWAHL
            </span>
            <h2 class="modal-title" style="margin: 6px 0 2px 0; font-size: 20px; font-weight: 700; color: #1d1d1b; font-family: 'Neue DIN', sans-serif;">Produkt oder Look wechseln</h2>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">Wähle ein Kleidungsstück oder einen Komplett-Look für deine 3D-Konfiguration.</p>
          </div>
          <button class="modal-close-btn" id="catalog-modal-close" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e5e7eb; background: #ffffff; color: #1d1d1b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
            ${ICONS.close || '✕'}
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="catalog-modal-toolbar" style="padding: 12px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
          <div class="catalog-filter-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="cat-filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-cat="all">Alle</button>
            <button class="cat-filter-btn ${this.activeFilter === 'outfits' ? 'active' : ''}" data-cat="outfits">Komplett-Looks</button>
            <button class="cat-filter-btn ${this.activeFilter === 'tops' ? 'active' : ''}" data-cat="tops">Oberteile</button>
            <button class="cat-filter-btn ${this.activeFilter === 'bottoms' ? 'active' : ''}" data-cat="bottoms">Hosen</button>
            <button class="cat-filter-btn ${this.activeFilter === 'helmets' ? 'active' : ''}" data-cat="helmets">Kopfschutz</button>
            <button class="cat-filter-btn ${this.activeFilter === 'shoes' ? 'active' : ''}" data-cat="shoes">Schuhe</button>
          </div>
          <div class="catalog-search-box" style="position: relative; width: 220px;">
            <input type="text" id="catalog-search-input" placeholder="Suchen..." value="${this.searchQuery}" style="width: 100%; padding: 7px 12px 7px 30px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; outline: none; font-family: 'Neue DIN', sans-serif;">
            <span style="position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #9ca3af;">🔍</span>
          </div>
        </div>

        <!-- Product Cards Grid -->
        <div class="catalog-grid-container" id="catalog-grid" style="padding: 24px; overflow-y: auto; flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; background: #f3f4f6;">
          ${this.renderProductCards(products, activeProduct)}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Bind Modal Events
    this.bindModalEvents();
  }

  renderProductCards(products, activeProduct) {
    const q = this.searchQuery.toLowerCase().trim();
    const filtered = products.filter(p => {
      // Category filter
      if (this.activeFilter !== 'all') {
        if (this.activeFilter === 'outfits' && p.category !== 'outfits') return false;
        if (this.activeFilter === 'tops' && p.category !== 'tops') return false;
        if (this.activeFilter === 'bottoms' && p.category !== 'bottoms' && p.category !== 'trousers') return false;
        if (this.activeFilter === 'helmets' && p.category !== 'helmets' && p.silhouette !== 'helmet') return false;
        if (this.activeFilter === 'shoes' && p.category !== 'shoes' && p.silhouette !== 'shoes') return false;
      }
      // Search filter
      if (q) {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchSku = (p.sku || p.articleNumber || '').toLowerCase().includes(q);
        const matchCat = (p.categoryName || '').toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }
      return true;
    });

    if (!filtered.length) {
      return `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #6b7280;">
          <p style="font-size: 15px; margin: 0 0 8px 0; font-weight: 500;">Keine Produkte gefunden</p>
          <span style="font-size: 13px;">Passe deinen Suchbegriff oder die Kategorie an.</span>
        </div>
      `;
    }

    return filtered.map(p => {
      const isActive = p.id === activeProduct.id;
      const previewImg = p.frontPreview || (p.silhouette === 'helmet' ? '/previews/WHE00113-front.png' : (p.silhouette === 'worker' ? '/previews/worker-front.png' : ''));
      return `
        <div class="product-catalog-card ${isActive ? 'is-active' : ''}" data-id="${p.id}" style="background: #ffffff; border-radius: 12px; border: ${isActive ? '2px solid #ff4400' : '1px solid #e5e7eb'}; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.04); position: relative;">
          ${isActive ? `
            <div style="position: absolute; top: 10px; right: 10px; background: #ff4400; color: #ffffff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; z-index: 2; letter-spacing: 0.5px; text-transform: uppercase;">
              ✓ AKTIV IN 3D
            </div>
          ` : ''}

          <div style="height: 110px; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 8px; position: relative;">
            ${previewImg ? `
              <img src="${previewImg}" alt="${p.name}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06));">
            ` : `
              <div style="font-size: 32px; color: #cbd5e1;">👕</div>
            `}
          </div>

          <div style="padding: 12px 14px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; border-top: 1px solid #f1f5f9;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 10px; font-weight: 700; color: #ff4400; text-transform: uppercase; letter-spacing: 0.5px;">${p.categoryName || p.category || 'WORKWEAR'}</span>
                <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">${p.articleNumber || p.sku || ''}</span>
              </div>
              <h3 style="font-size: 13px; font-weight: 700; color: #1d1d1b; margin: 0; line-height: 1.25; font-family: 'Neue DIN', sans-serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 32px;">${p.name}</h3>
            </div>

            <div style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px; font-weight: 700; color: #4b5563;">${p.price || 'Auf Anfrage'}</span>
              <button class="btn-select-product" data-id="${p.id}" style="padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s ease; font-family: 'Neue DIN', sans-serif; ${isActive ? 'background: #f3f4f6; color: #6b7280; pointer-events: none;' : 'background: #1d1d1b; color: #ffffff;'}">
                ${isActive ? 'Gewählt' : 'Auswählen →'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  bindModalEvents() {
    if (!this.modalEl) return;

    // Close button
    const btnClose = this.modalEl.querySelector('#catalog-modal-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal());
    }

    // Backdrop click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.closeModal();
      }
    });

    // Filter tabs
    this.modalEl.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.modalEl.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.cat;
        this.updateCards();
      });
    });

    // Search input
    const searchInput = this.modalEl.querySelector('#catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.updateCards();
      });
    }

    // Product Card Selection
    this.bindCardClicks();
  }

  bindCardClicks() {
    if (!this.modalEl) return;
    this.modalEl.querySelectorAll('.product-catalog-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.selectProduct(id);
      });
    });
  }

  updateCards() {
    if (!this.modalEl) return;
    const grid = this.modalEl.querySelector('#catalog-grid');
    if (grid) {
      const activeProduct = this.catalog.getActiveProduct();
      const products = this.catalog.getProducts();
      grid.innerHTML = this.renderProductCards(products, activeProduct);
      this.bindCardClicks();
    }
  }

  selectProduct(id) {
    if (!id) return;
    this.catalog.setActiveProduct(id);
    this.closeModal();
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  render() {
    if (!this.container) return;
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
      </div>
    `;

    const btnToggle = this.container.querySelector('#btn-product-dropdown');
    if (btnToggle) {
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal();
      });
    }
  }

  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl) {
        this.closeModal();
      }
    });
  }
}
