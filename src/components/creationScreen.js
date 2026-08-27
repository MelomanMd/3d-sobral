import confetti from 'canvas-confetti';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { DEFAULT_PRODUCTS } from '../core/products.js';
import { ModelStorage } from '../core/modelStorage.js';
import { PhotoAnalyzer } from '../core/photoAnalyzer.js';

export class CreationScreen {
  constructor(containerElement, catalog, onProductCreated) {
    this.container = containerElement;
    this.catalog = catalog;
    this.onProductCreated = onProductCreated;
    this.isOpen = false;

    this.formData = {
      name: '',
      category: 'tops',
      silhouette: 'tshirt',
      modelUrl: null,
      frontPreview: null,
      backPreview: null,
      leftPreview: null,
      rightPreview: null,
      textureUrl: null,
      baseColor: '#1b2034',
      accentColor: '#5b6c84',
      patternId: 'raglan_shoulder'
    };
  }

  open(canClose = false) {
    this.isOpen = true;
    this.canClose = canClose;
    this.render();
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.container.classList.add('hidden');
    this.container.style.display = 'none';
  }

  render() {
    this.container.innerHTML = `
      <div class="creation-screen-wrapper">
        <div class="creation-screen-card">
          <!-- Top Header -->
          <div class="creation-header">
            <div class="creation-title-group">
              <span class="creation-badge">✨ 3D-Rekonstruktion</span>
              <h2 class="creation-title">Neues Produkt erstellen</h2>
              <p class="creation-subtitle">Laden Sie 4 Fotos hoch – das System generiert automatisch die exakte 3D-Kopie mit allen Elementen.</p>
            </div>
            ${this.canClose ? `<button class="creation-close-btn" id="btn-close-creation">${ICONS.close}</button>` : ''}
          </div>

          <!-- Live Auto-Reconstruction Preview Badge -->
          <div class="analysis-live-card" id="screen-analysis-live-card" style="display: none;">
            <div class="analysis-card-top">
              <span class="analysis-live-tag">✨ Elemente & Farben erkannt</span>
              <span id="screen-analysis-pattern-badge" class="analysis-pattern-tag">Kontrast-Schultern erkannt</span>
            </div>
            <div id="screen-analysis-pills-wrap" class="analysis-pills-row"></div>
          </div>

          <!-- 4 Photos Upload Section -->
          <div class="creation-slots-section">
            <h3 class="creation-section-heading">
              <span>Produktfotos für 3D-Rekonstruktion (4 Ansichten)</span>
            </h3>

            <div class="creation-slots-grid">
              <!-- Slot 1: Front -->
              <div class="upload-slot-card" id="screen-card-slot-front">
                <div class="slot-header">
                  <span class="slot-badge optional">Vorderseite</span>
                  <span class="slot-title">1. Vorne (Front)</span>
                </div>
                <div class="slot-dropzone" id="screen-drop-slot-front">
                  <input type="file" id="screen-file-slot-front" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="screen-ph-slot-front">
                    <span class="slot-icon-svg">${ICONS.shirt}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="screen-prev-box-front"></div>
                </div>
              </div>

              <!-- Slot 2: Back -->
              <div class="upload-slot-card" id="screen-card-slot-back">
                <div class="slot-header">
                  <span class="slot-badge optional">Rückseite</span>
                  <span class="slot-title">2. Hinten (Back)</span>
                </div>
                <div class="slot-dropzone" id="screen-drop-slot-back">
                  <input type="file" id="screen-file-slot-back" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="screen-ph-slot-back">
                    <span class="slot-icon-svg">${ICONS.refresh}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="screen-prev-box-back"></div>
                </div>
              </div>

              <!-- Slot 3: Left -->
              <div class="upload-slot-card" id="screen-card-slot-left">
                <div class="slot-header">
                  <span class="slot-badge optional">Linke Seite</span>
                  <span class="slot-title">3. Links (Left)</span>
                </div>
                <div class="slot-dropzone" id="screen-drop-slot-left">
                  <input type="file" id="screen-file-slot-left" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="screen-ph-slot-left">
                    <span class="slot-icon-svg">${ICONS.layers}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="screen-prev-box-left"></div>
                </div>
              </div>

              <!-- Slot 4: Right -->
              <div class="upload-slot-card" id="screen-card-slot-right">
                <div class="slot-header">
                  <span class="slot-badge optional">Rechte Seite</span>
                  <span class="slot-title">4. Rechts (Right)</span>
                </div>
                <div class="slot-dropzone" id="screen-drop-slot-right">
                  <input type="file" id="screen-file-slot-right" accept="image/*" style="display:none">
                  <div class="slot-placeholder" id="screen-ph-slot-right">
                    <span class="slot-icon-svg">${ICONS.layers}</span>
                    <span class="slot-action-text">${t('btn_choose_file')}</span>
                  </div>
                  <div class="slot-preview-box hidden" id="screen-prev-box-right"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Details Form -->
          <div class="creation-form-grid">
            <div class="form-group">
              <label class="form-label">${t('label_product_name')} *</label>
              <input type="text" class="input-glass" id="screen-prod-name" placeholder="z.B. Blåkläder Workwear T-Shirt" value="${this.formData.name || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">${t('label_product_cat')}</label>
              <select class="select-glass" id="screen-prod-cat">
                <option value="tops" selected>${t('cat_tops')}</option>
                <option value="bottoms">${t('cat_bottoms')}</option>
                <option value="outerwear">${t('cat_outerwear')}</option>
                <option value="accessories">${t('cat_accessories')}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t('label_product_silhouette')}</label>
              <select class="select-glass" id="screen-prod-sil">
                <option value="tshirt" selected>${t('sil_tshirt')}</option>
                <option value="shorts">${t('sil_shorts')}</option>
                <option value="hoodie">${t('sil_hoodie')}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Schnitt & Design-Muster</label>
              <select class="select-glass" id="screen-prod-pattern">
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
                <input type="color" class="color-swatch-input" id="screen-prod-color" value="${this.formData.baseColor || '#1b2034'}">
                <input type="text" class="input-glass" id="screen-prod-color-hex" value="${this.formData.baseColor || '#1b2034'}" style="width: 90px; text-transform: uppercase;">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Akzentfarbe (Schultern)</label>
              <div class="color-picker-inline">
                <input type="color" class="color-swatch-input" id="screen-prod-accent-color" value="${this.formData.accentColor || '#5b6c84'}">
                <input type="text" class="input-glass" id="screen-prod-accent-color-hex" value="${this.formData.accentColor || '#5b6c84'}" style="width: 90px; text-transform: uppercase;">
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="creation-footer">
            ${this.canClose ? `
              <button class="btn-secondary-action" id="btn-cancel-creation" style="padding: 12px 24px;">
                Abbrechen
              </button>
            ` : ''}
            <button class="btn-primary-action btn-submit-creation" id="btn-submit-creation">
              <span class="btn-icon">${ICONS.sparkles}</span>
              <span>3D-Modell generieren & Studio starten</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const card = this.container.querySelector('.creation-screen-card');
    if (!card) return;

    if (this.canClose) {
      const closeBtn = card.querySelector('#btn-close-creation');
      const cancelBtn = card.querySelector('#btn-cancel-creation');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
      if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
    }

    // Bind 4 upload slots
    this.setupSlotUpload('front', 'frontPreview');
    this.setupSlotUpload('back', 'backPreview');
    this.setupSlotUpload('left', 'leftPreview');
    this.setupSlotUpload('right', 'rightPreview');

    // Color Pickers sync
    const colorInput = card.querySelector('#screen-prod-color');
    const colorHex = card.querySelector('#screen-prod-color-hex');
    if (colorInput && colorHex) {
      colorInput.addEventListener('input', (e) => {
        colorHex.value = e.target.value.toUpperCase();
        this.formData.baseColor = e.target.value;
      });
      colorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colorInput.value = e.target.value;
          this.formData.baseColor = e.target.value;
        }
      });
    }

    const accentInput = card.querySelector('#screen-prod-accent-color');
    const accentHex = card.querySelector('#screen-prod-accent-color-hex');
    if (accentInput && accentHex) {
      accentInput.addEventListener('input', (e) => {
        accentHex.value = e.target.value.toUpperCase();
        this.formData.accentColor = e.target.value;
      });
      accentHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          accentInput.value = e.target.value;
          this.formData.accentColor = e.target.value;
        }
      });
    }

    // Submit Creation
    const submitBtn = card.querySelector('#btn-submit-creation');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        let name = card.querySelector('#screen-prod-name')?.value.trim();
        if (!name) {
          name = 'Neues Kleidungsstück';
        }

        const cat = card.querySelector('#screen-prod-cat')?.value || 'tops';
        const sil = card.querySelector('#screen-prod-sil')?.value || 'tshirt';
        const patternId = card.querySelector('#screen-prod-pattern')?.value || (this.formData.accentColor !== this.formData.baseColor ? 'raglan_shoulder' : 'solid');
        const baseColor = card.querySelector('#screen-prod-color')?.value || this.formData.baseColor || '#1b2034';
        const accentColor = card.querySelector('#screen-prod-accent-color')?.value || this.formData.accentColor || '#5b6c84';

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

        // Save high-res images in IndexedDB
        if (this.formData.frontPreview) {
          ModelStorage.saveImage(`${newProduct.id}_front`, this.formData.frontPreview).catch(err => console.warn(err));
        }
        if (this.formData.backPreview) {
          ModelStorage.saveImage(`${newProduct.id}_back`, this.formData.backPreview).catch(err => console.warn(err));
        }

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        this.close();
        if (this.onProductCreated) {
          this.onProductCreated(newProduct);
        }
      });
    }
  }

  setupSlotUpload(slotKey, formKey) {
    const dropzone = this.container.querySelector(`#screen-drop-slot-${slotKey}`);
    const fileInput = this.container.querySelector(`#screen-file-slot-${slotKey}`);
    const placeholder = this.container.querySelector(`#screen-ph-slot-${slotKey}`);
    const prevBox = this.container.querySelector(`#screen-prev-box-${slotKey}`);

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
        this.handleFileUpload(files[0], formKey, placeholder, prevBox, dropzone, slotKey, fileInput);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0], formKey, placeholder, prevBox, dropzone, slotKey, fileInput);
      }
    });
  }

  handleFileUpload(file, formKey, placeholder, prevBox, dropzone, slotKey, fileInput) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      this.formData[formKey] = dataUrl;

      prevBox.innerHTML = `
        <img src="${dataUrl}" alt="${slotKey} Preview" style="max-width:100%; max-height:100%; object-fit:contain;">
        <button class="btn-remove-slot-img" data-slot="${slotKey}" title="Bild entfernen">${ICONS.trash}</button>
      `;
      prevBox.classList.remove('hidden');
      placeholder.classList.add('hidden');
      dropzone.classList.add('has-image');

      const removeBtn = prevBox.querySelector('.btn-remove-slot-img');
      if (removeBtn) {
        removeBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          this.formData[formKey] = null;
          prevBox.innerHTML = '';
          prevBox.classList.add('hidden');
          placeholder.classList.remove('hidden');
          dropzone.classList.remove('has-image');
          if (fileInput) fileInput.value = '';
        });
      }

      // Auto-analyze colors and cut pattern from uploaded photos
      try {
        const analysis = await PhotoAnalyzer.analyzeGarmentPhotos({
          front: this.formData.frontPreview,
          back: this.formData.backPreview,
          left: this.formData.leftPreview,
          right: this.formData.rightPreview
        });

        if (analysis) {
          const liveCard = this.container.querySelector('#screen-analysis-live-card');
          const pillsWrap = this.container.querySelector('#screen-analysis-pills-wrap');
          const patternBadge = this.container.querySelector('#screen-analysis-pattern-badge');

          if (liveCard && pillsWrap) {
            liveCard.style.display = 'block';
            if (patternBadge) {
              patternBadge.textContent = analysis.hasContrastShoulders 
                ? 'Schnitt: Kontrast-Schultern (Raglan)' 
                : 'Schnitt: Klassisch Einfarbig (Solid)';
            }
            pillsWrap.innerHTML = `
              <span class="analysis-pill">
                <span class="pill-color-dot" style="background-color: ${analysis.colors.primary};"></span>
                Körper: ${analysis.colors.primary.toUpperCase()}
              </span>
              <span class="analysis-pill">
                <span class="pill-color-dot" style="background-color: ${analysis.colors.accent};"></span>
                Schultern: ${analysis.colors.accent.toUpperCase()}
              </span>
              <span class="analysis-pill">
                <span class="pill-color-dot" style="background-color: ${analysis.colors.collar};"></span>
                Kragen
              </span>
            `;
          }

          if (analysis.colors?.primary) {
            const primInput = this.container.querySelector('#screen-prod-color');
            const primHex = this.container.querySelector('#screen-prod-color-hex');
            if (primInput) primInput.value = analysis.colors.primary;
            if (primHex) primHex.value = analysis.colors.primary.toUpperCase();
            this.formData.baseColor = analysis.colors.primary;
          }
          if (analysis.colors?.accent) {
            const accInput = this.container.querySelector('#screen-prod-accent-color');
            const accHex = this.container.querySelector('#screen-prod-accent-color-hex');
            if (accInput) accInput.value = analysis.colors.accent;
            if (accHex) accHex.value = analysis.colors.accent.toUpperCase();
            this.formData.accentColor = analysis.colors.accent;
          }
          if (analysis.detectedPattern) {
            const patSelect = this.container.querySelector('#screen-prod-pattern');
            if (patSelect) patSelect.value = analysis.detectedPattern;
          }
        }
      } catch (err) {
        console.warn('Auto-analysis error:', err);
      }
    };
    reader.readAsDataURL(file);
  }
}
