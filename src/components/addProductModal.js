import confetti from 'canvas-confetti';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { DEFAULT_PRODUCTS } from '../core/products.js';
import { ModelStorage } from '../core/modelStorage.js';
import { PhotoAnalyzer } from '../core/photoAnalyzer.js';

export class AddProductModal {
  constructor(catalog, onProductAdded) {
    this.catalog = catalog;
    this.onProductAdded = onProductAdded;
    this.modalEl = null;

    this.formData = {
      name: '',
      category: 'tops',
      price: '49.00',
      sku: '',
      silhouette: 'tshirt',
      modelUrl: null,
      frontPreview: null,
      backPreview: null,
      textureUrl: null,
      catalogPreview: null,
      baseColor: '#1b2034',
      accentColor: '#5b6c84'
    };
  }

  open() {
    this.close();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'add-product-modal-root';
    modal.innerHTML = `
      <div class="modal-card modal-card-large">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge">${t('add_product_badge')}</span>
            <h2 class="modal-title">${t('add_product_title')}</h2>
          </div>
          <button class="modal-close-btn" id="add-prod-close-btn">${ICONS.close}</button>
        </div>

        <div class="modal-body">
          <div class="add-product-instruction-banner">
            <span class="instruction-icon">${ICONS.sparkles}</span>
            <span class="instruction-text">${t('add_product_subtitle')}</span>
          </div>

          <!-- Product Details Form -->
          <div class="add-prod-form-grid">
            <div class="form-group">
              <label class="form-label">${t('label_product_name')} *</label>
              <input type="text" class="input-glass" id="new-prod-name" placeholder="z.B. Blåkläder Workwear T-Shirt" value="${this.formData.name || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">${t('label_product_cat')}</label>
              <select class="select-glass" id="new-prod-cat">
                <option value="tops" selected>${t('cat_tops')}</option>
                <option value="bottoms">${t('cat_bottoms')}</option>
                <option value="outerwear">${t('cat_outerwear')}</option>
                <option value="accessories">${t('cat_accessories')}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('label_product_silhouette')}</label>
              <select class="select-glass" id="new-prod-sil">
                <option value="tshirt" selected>${t('sil_tshirt')}</option>
                <option value="shorts">${t('sil_shorts')}</option>
                <option value="hoodie">${t('sil_hoodie')}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Schnitt & Design-Muster</label>
              <select class="select-glass" id="new-prod-pattern">
                <option value="raglan_shoulder" selected>Kontrast-Schultern (Blåkläder / Raglan)</option>
                <option value="solid">Klassisch Einfarbig (Solid)</option>
                <option value="vexa">Vexa Sport (Dynamisch)</option>
                <option value="racing">Speed Racing (Streifen)</option>
                <option value="cyber_hex">Cyber Mesh / Waben</option>
                <option value="gradient">Farbverlauf Flow (Ombre)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Hauptfarbe (Körper)</label>
              <div class="color-picker-inline">
                <input type="color" class="color-swatch-input" id="new-prod-color" value="${this.formData.baseColor || '#1b2034'}">
                <input type="text" class="input-glass" id="new-prod-color-hex" value="${this.formData.baseColor || '#1b2034'}" style="width: 80px; text-transform: uppercase;">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Akzentfarbe (Schultern / Design)</label>
              <div class="color-picker-inline">
                <input type="color" class="color-swatch-input" id="new-prod-accent-color" value="${this.formData.accentColor || '#5b6c84'}">
                <input type="text" class="input-glass" id="new-prod-accent-color-hex" value="${this.formData.accentColor || '#5b6c84'}" style="width: 80px; text-transform: uppercase;">
              </div>
            </div>
          </div>

          <!-- Upload Slots Grid for 4 angles -->
          <div class="upload-slots-section">
            <h3 class="slots-section-title">Produktfotos für 2D-Studio (4 Ansichten)</h3>

            <div class="upload-slots-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
              <!-- Slot 1: Front Photo -->
              <div class="upload-slot-card" id="card-slot-front">
                <div class="slot-header">
                  <span class="slot-badge optional">Vorderansicht</span>
                  <span class="slot-title">1. Vorne (Front)</span>
                </div>
                <p class="slot-desc">Vorderseite der Kleidung</p>
                <div class="slot-dropzone" id="drop-slot-front">
                  <input type="file" id="file-slot-front" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="ph-slot-front">
                    <span class="slot-icon-svg">${ICONS.shirt}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="prev-box-front">
                    <img src="" id="prev-img-front" alt="Front Preview">
                    <button class="btn-remove-slot-img" data-slot="front">${ICONS.trash}</button>
                  </div>
                </div>
              </div>

              <!-- Slot 2: Back Photo -->
              <div class="upload-slot-card" id="card-slot-back">
                <div class="slot-header">
                  <span class="slot-badge optional">Rückansicht</span>
                  <span class="slot-title">2. Hinten (Back)</span>
                </div>
                <p class="slot-desc">Rückseite der Kleidung</p>
                <div class="slot-dropzone" id="drop-slot-back">
                  <input type="file" id="file-slot-back" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="ph-slot-back">
                    <span class="slot-icon-svg">${ICONS.refresh}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="prev-box-back">
                    <img src="" id="prev-img-back" alt="Back Preview">
                    <button class="btn-remove-slot-img" data-slot="back">${ICONS.trash}</button>
                  </div>
                </div>
              </div>

              <!-- Slot 3: Left Side Photo -->
              <div class="upload-slot-card" id="card-slot-left">
                <div class="slot-header">
                  <span class="slot-badge optional">Linke Seite</span>
                  <span class="slot-title">3. Links (Left Side)</span>
                </div>
                <p class="slot-desc">Linker Ärmel / Profil</p>
                <div class="slot-dropzone" id="drop-slot-left">
                  <input type="file" id="file-slot-left" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="ph-slot-left">
                    <span class="slot-icon-svg">${ICONS.layers}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="prev-box-left">
                    <img src="" id="prev-img-left" alt="Left Preview">
                    <button class="btn-remove-slot-img" data-slot="left">${ICONS.trash}</button>
                  </div>
                </div>
              </div>

              <!-- Slot 4: Right Side Photo -->
              <div class="upload-slot-card" id="card-slot-right">
                <div class="slot-header">
                  <span class="slot-badge optional">Rechte Seite</span>
                  <span class="slot-title">4. Rechts (Right Side)</span>
                </div>
                <p class="slot-desc">Rechter Ärmel / Profil</p>
                <div class="slot-dropzone" id="drop-slot-right">
                  <input type="file" id="file-slot-right" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="ph-slot-right">
                    <span class="slot-icon-svg">${ICONS.layers}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="prev-box-right">
                    <img src="" id="prev-img-right" alt="Right Preview">
                    <button class="btn-remove-slot-img" data-slot="right">${ICONS.trash}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-outline-glass" id="add-prod-cancel-btn">Abbrechen</button>
          <button class="btn-primary-action" id="btn-save-new-product">
            <span class="btn-icon-svg">${ICONS.check}</span>
            <span>${t('btn_create_product')}</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    this.bindEvents(modal);
  }

  bindEvents(modal) {
    modal.querySelector('#add-prod-close-btn').addEventListener('click', () => this.close());
    modal.querySelector('#add-prod-cancel-btn').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Wire Up File Upload Slots for 4 angles
    this.setupSlotUpload(modal, 'front', 'frontPreview');
    this.setupSlotUpload(modal, 'back', 'backPreview');
    this.setupSlotUpload(modal, 'left', 'leftPreview');
    this.setupSlotUpload(modal, 'right', 'rightPreview');

    // Color inputs sync
    const colPrimary = modal.querySelector('#new-prod-color');
    const colPrimaryHex = modal.querySelector('#new-prod-color-hex');
    if (colPrimary && colPrimaryHex) {
      colPrimary.addEventListener('input', (e) => {
        colPrimaryHex.value = e.target.value.toUpperCase();
        this.formData.baseColor = e.target.value;
      });
      colPrimaryHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colPrimary.value = e.target.value;
          this.formData.baseColor = e.target.value;
        }
      });
    }

    const colAccent = modal.querySelector('#new-prod-accent-color');
    const colAccentHex = modal.querySelector('#new-prod-accent-color-hex');
    if (colAccent && colAccentHex) {
      colAccent.addEventListener('input', (e) => {
        colAccentHex.value = e.target.value.toUpperCase();
        this.formData.accentColor = e.target.value;
      });
      colAccentHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colAccent.value = e.target.value;
          this.formData.accentColor = e.target.value;
        }
      });
    }

    // Save New Product
    modal.querySelector('#btn-save-new-product').addEventListener('click', () => {
      const nameInput = modal.querySelector('#new-prod-name');
      const name = nameInput ? nameInput.value.trim() : '';

      if (!name) {
        alert('Bitte geben Sie einen Produktnamen ein!');
        if (nameInput) nameInput.focus();
        return;
      }

      const cat = modal.querySelector('#new-prod-cat').value;
      const sil = modal.querySelector('#new-prod-sil').value;
      const patternId = modal.querySelector('#new-prod-pattern') ? modal.querySelector('#new-prod-pattern').value : 'raglan_shoulder';
      const baseColor = modal.querySelector('#new-prod-color') ? modal.querySelector('#new-prod-color').value : (this.formData.baseColor || '#1b2034');
      const accentColor = modal.querySelector('#new-prod-accent-color') ? modal.querySelector('#new-prod-accent-color').value : (this.formData.accentColor || '#5b6c84');

      // Pick matching base template zones
      const baseTpl = DEFAULT_PRODUCTS.find(p => p.silhouette === sil) || DEFAULT_PRODUCTS[0];

      const newProduct = this.catalog.addProduct({
        name,
        category: cat,
        categoryName: t(`cat_${cat}`),
        silhouette: sil,
        modelUrl: this.formData.modelUrl || baseTpl.modelUrl || '/shirt_baked.glb',
        patternId,
        baseColor,
        accentColor,
        colors: {
          primary: baseColor,
          accent: accentColor,
          collar: baseColor,
          secondary: '#ffffff'
        },
        frontPreview: this.formData.frontPreview,
        backPreview: this.formData.backPreview,
        leftPreview: this.formData.leftPreview,
        rightPreview: this.formData.rightPreview,
        textureUrl: this.formData.textureUrl,
        zones: { ...baseTpl.zones }
      });

      // Save full-res photos permanently in IndexedDB
      if (this.formData.frontPreview) {
        ModelStorage.saveImage(`${newProduct.id}_front`, this.formData.frontPreview).catch(err => console.warn('ModelStorage saveImage error:', err));
      }
      if (this.formData.backPreview) {
        ModelStorage.saveImage(`${newProduct.id}_back`, this.formData.backPreview).catch(err => console.warn('ModelStorage saveImage error:', err));
      }
      if (this.formData.leftPreview) {
        ModelStorage.saveImage(`${newProduct.id}_left`, this.formData.leftPreview).catch(err => console.warn('ModelStorage saveImage error:', err));
      }
      if (this.formData.rightPreview) {
        ModelStorage.saveImage(`${newProduct.id}_right`, this.formData.rightPreview).catch(err => console.warn('ModelStorage saveImage error:', err));
      }

      this.close();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (this.onProductAdded) {
        this.onProductAdded(newProduct);
      }
    });
  }

  setupSlotUpload(modal, slotKey, formKey, isGlb = false) {
    const dropzone = modal.querySelector(`#drop-slot-${slotKey}`);
    const fileInput = modal.querySelector(`#file-slot-${slotKey}`);
    const placeholder = modal.querySelector(`#ph-slot-${slotKey}`);
    const prevBox = modal.querySelector(`#prev-box-${slotKey}`);
    const prevImg = modal.querySelector(`#prev-img-${slotKey}`);

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove-slot-img')) return;
      fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0], formKey, placeholder, prevBox, prevImg, dropzone, isGlb);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0], formKey, placeholder, prevBox, prevImg, dropzone, isGlb);
      }
    });

    const removeBtn = prevBox.querySelector('.btn-remove-slot-img');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.formData[formKey] = null;
        if (prevImg) prevImg.src = '';
        prevBox.classList.add('hidden');
        placeholder.classList.remove('hidden');
        dropzone.classList.remove('has-image');
        fileInput.value = '';
      });
    }
  }

  handleFileUpload(file, formKey, placeholder, prevBox, prevImg, dropzone, isGlb = false) {
    if (isGlb) {
      const url = URL.createObjectURL(file);
      this.formData[formKey] = url;
      placeholder.classList.add('hidden');
      prevBox.classList.remove('hidden');
      dropzone.classList.add('has-image');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      this.formData[formKey] = dataUrl;
      if (prevImg) prevImg.src = dataUrl;
      placeholder.classList.add('hidden');
      prevBox.classList.remove('hidden');
      dropzone.classList.add('has-image');

      // Auto-analyze colors and cut pattern from uploaded photos
      try {
        const analysis = await PhotoAnalyzer.analyzeGarmentPhotos({
          front: this.formData.frontPreview,
          back: this.formData.backPreview,
          left: this.formData.leftPreview,
          right: this.formData.rightPreview
        });

        if (analysis && this.modalEl) {
          if (analysis.colors?.primary) {
            const primInput = this.modalEl.querySelector('#new-prod-color');
            const primHex = this.modalEl.querySelector('#new-prod-color-hex');
            if (primInput) primInput.value = analysis.colors.primary;
            if (primHex) primHex.value = analysis.colors.primary.toUpperCase();
            this.formData.baseColor = analysis.colors.primary;
          }
          if (analysis.colors?.accent) {
            const accInput = this.modalEl.querySelector('#new-prod-accent-color');
            const accHex = this.modalEl.querySelector('#new-prod-accent-color-hex');
            if (accInput) accInput.value = analysis.colors.accent;
            if (accHex) accHex.value = analysis.colors.accent.toUpperCase();
            this.formData.accentColor = analysis.colors.accent;
          }
          if (analysis.detectedPattern) {
            const patSelect = this.modalEl.querySelector('#new-prod-pattern');
            if (patSelect) patSelect.value = analysis.detectedPattern;
          }
        }
      } catch (err) {
        console.warn('Auto-analysis error:', err);
      }
    };
    reader.readAsDataURL(file);
  }

  close() {
    const existing = document.getElementById('add-product-modal-root');
    if (existing) {
      existing.remove();
    }
    this.modalEl = null;
  }
}
