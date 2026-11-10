import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { getMaterialColorControls } from '../core/materialColors.js';

export const HELMET_PALETTE = [
  { name: 'Gelb', hex: '#FFCF24' },
  { name: 'Blau', hex: '#4D9CFF' },
  { name: 'Weiss', hex: '#FFFFFF' },
  { name: 'Orange', hex: '#FF7A00' },
  { name: 'Grün', hex: '#1E5E1E' },
  { name: 'Schwarz', hex: '#1D1D1B' }
];

export const PRIMARY_PALETTE = [
  { name: '8894 Marineblau / Grau', hex: '#242935' },
  { name: 'Weiss / Dunkelgrau', hex: '#FFFFFF' },
  { name: 'Rot / Schwarz', hex: '#C3303C' },
  { name: 'Kornblumenblau / Schwarz', hex: '#284282' },
  { name: 'Dunkelmarineblau / Schwarz', hex: '#1B2034' },
  { name: 'Grau / Schwarz', hex: '#70757E' }
];

export const TROUSERS_PALETTE = [
  { name: '8600 Marineblau', hex: '#242935' },
  { name: 'Grau', hex: '#5A6069' },
  { name: 'Schwarz', hex: '#1D1D1B' },
  { name: 'Waldgrün', hex: '#2D4436' },
  { name: 'Kornblumenblau', hex: '#284282' },
  { name: 'Braun / Sand', hex: '#7D6246' }
];

export const BOOTS_PALETTE = [
  { name: 'Schwarz', hex: '#1D1D1B' },
  { name: 'Grau', hex: '#5A6069' },
  { name: 'Braun', hex: '#5C3D24' }
];

export const ACCENT_PALETTE = [
  { name: 'Orange', hex: '#FF4400' },
  { name: 'Gelb', hex: '#FFCF24' },
  { name: 'Rot', hex: '#C3303C' },
  { name: 'Weiss', hex: '#FFFFFF' },
  { name: 'Schwarz', hex: '#1D1D1B' },
  { name: 'Grau', hex: '#70757E' }
];

export const COLLAR_PALETTE = [
  { name: 'Marineblau', hex: '#242935' },
  { name: 'Schwarz', hex: '#1D1D1B' },
  { name: 'Grau', hex: '#5A6069' },
  { name: 'Weiss', hex: '#FFFFFF' }
];

export const OUTFIT_ELEMENTS = [
  {
    id: 'helmet',
    name: 'Kopfschutz',
    brandModel: 'KASK · SUPERPLASMA AQ',
    defaultColorName: 'Gelb',
    palette: HELMET_PALETTE
  },
  {
    id: 'primary',
    name: 'Oberteil',
    brandModel: 'BLÅKLÄDER · T-Shirt 3379',
    defaultColorName: '8894 Marineblau / Grau',
    palette: PRIMARY_PALETTE
  },
  {
    id: 'trousers',
    name: 'Arbeitshose',
    brandModel: 'BLÅKLÄDER · Handwerker Arbeitshose 1750',
    defaultColorName: '8600 Marineblau',
    palette: TROUSERS_PALETTE
  },
  {
    id: 'boots',
    name: 'Sicherheitsschuhe',
    brandModel: 'SOBRAL Pro Safety Boot S3',
    defaultColorName: 'Schwarz',
    palette: BOOTS_PALETTE
  }
];

export const SPORT_PALETTES = PRIMARY_PALETTE;

export class ColorPanel {
  constructor(containerElement, state, onUpdate, viewer = null) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.viewer = viewer;
    this.activeZone = 'primary';

    if (this.viewer?.container) {
      this._onModelLoaded = () => this.render();
      this.viewer.container.addEventListener('model-loaded', this._onModelLoaded);
    }

    this.render();
  }

  destroy() {
    if (this.viewer?.container && this._onModelLoaded) {
      this.viewer.container.removeEventListener('model-loaded', this._onModelLoaded);
    }
  }

  getVisibleCards() {
    const activeProduct = this.state.activeProduct || { silhouette: 'worker' };
    const isWorker = activeProduct.silhouette === 'worker' || activeProduct.category === 'outfits';

    if (isWorker) {
      return OUTFIT_ELEMENTS;
    }

    // Standalone product: query controls from viewer or product definition
    let controls = [];
    if (this.viewer?.getColorControls) {
      controls = this.viewer.getColorControls();
    }

    if (!controls || controls.length === 0) {
      const roles = activeProduct.colorMaterials
        ? Object.values(activeProduct.colorMaterials).flat()
        : (activeProduct.materialRoles || []);
      controls = getMaterialColorControls(activeProduct, roles);
    }

    if (controls && controls.length > 0) {
      return controls.map(ctrl => {
        let palette = PRIMARY_PALETTE;
        let cardName = ctrl.name || 'Farbe';

        if (activeProduct.silhouette === 'helmet' || activeProduct.category === 'headwear') {
          if (ctrl.id === 'collar') {
            palette = COLLAR_PALETTE;
          } else if (ctrl.id === 'accent') {
            palette = ACCENT_PALETTE;
          } else {
            palette = HELMET_PALETTE;
          }
        } else if (activeProduct.silhouette === 'trousers' || activeProduct.category === 'bottoms') {
          palette = TROUSERS_PALETTE;
          if (ctrl.id === 'primary') cardName = 'Arbeitshose';
        } else if (activeProduct.silhouette === 'shoes' || activeProduct.category === 'shoes') {
          palette = BOOTS_PALETTE;
          if (ctrl.id === 'primary') cardName = 'Sicherheitsschuhe';
        } else if (ctrl.id === 'accent') {
          palette = ACCENT_PALETTE;
        } else if (ctrl.id === 'collar') {
          palette = COLLAR_PALETTE;
        } else {
          palette = PRIMARY_PALETTE;
          if (ctrl.id === 'primary' && (activeProduct.category === 'tops' || activeProduct.category === 'outerwear')) {
            cardName = 'Oberteil';
          }
        }

        return {
          id: ctrl.id,
          name: cardName,
          brandModel: activeProduct.name || ctrl.sub || '',
          defaultColorName: palette[0].name,
          palette: palette
        };
      });
    }

    // Fallback single card for single garment scans
    let catName = 'Oberteil';
    let pal = PRIMARY_PALETTE;
    if (activeProduct.silhouette === 'helmet' || activeProduct.category === 'headwear') {
      catName = 'Kopfschutz';
      pal = HELMET_PALETTE;
    } else if (activeProduct.silhouette === 'trousers' || activeProduct.category === 'bottoms') {
      catName = 'Arbeitshose';
      pal = TROUSERS_PALETTE;
    } else if (activeProduct.silhouette === 'shoes' || activeProduct.category === 'shoes') {
      catName = 'Sicherheitsschuhe';
      pal = BOOTS_PALETTE;
    }

    return [{
      id: 'primary',
      name: catName,
      brandModel: activeProduct.name,
      defaultColorName: pal[0].name,
      palette: pal
    }];
  }

  getColorName(card, hex) {
    if (!card) return hex;
    const match = card.palette.find(p => p.hex.toLowerCase() === (hex || '').toLowerCase());
    return match ? match.name : (card.defaultColorName || hex);
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  render() {
    const cards = this.getVisibleCards();
    const isWorker = this.state.activeProduct?.silhouette === 'worker' || this.state.activeProduct?.category === 'outfits';

    this.container.innerHTML = `
      <div class="figma-color-panel">
        <!-- Section Header -->
        <div class="figma-panel-header">
          <h3 class="figma-panel-title">ELEMENTE & FARBEN</h3>
          <p class="figma-panel-subtitle">${isWorker ? 'Wähle Produkte und passende Farben für deinen Look.' : 'Passe die Farben deines Artikels an.'}</p>
        </div>

        <!-- Outfit Cards with Inline Swatches (Figma 01_produkte_farben.png) -->
        <div class="figma-outfit-cards-list">
          ${cards.map(el => {
            const currentHex = (this.state.colors[el.id] || el.palette[0].hex).toLowerCase();
            const currentColorName = this.getColorName(el, currentHex);

            return `
              <div class="figma-outfit-card" data-zone="${el.id}">
                <div class="figma-card-header">
                  <div class="figma-card-name">${el.name}</div>
                  <div class="figma-card-brand">${el.brandModel}</div>
                </div>

                <div class="figma-card-color-status">
                  Farbe: <span class="figma-color-status-name">${currentColorName}</span>
                </div>

                <!-- Row of square swatches -->
                <div class="figma-swatches-row">
                  ${el.palette.map((sw, idx) => {
                    const isSwatchActive = currentHex === sw.hex.toLowerCase() || (idx === 0 && !el.palette.some(p => p.hex.toLowerCase() === currentHex));
                    return `
                      <button class="figma-square-swatch ${isSwatchActive ? 'active' : ''}" 
                              data-zone="${el.id}" 
                              data-hex="${sw.hex}" 
                              data-name="${sw.name}"
                              style="background-color: ${sw.hex};" 
                              title="${sw.name}">
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Card Selection
    this.container.querySelectorAll('.figma-outfit-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.figma-square-swatch')) return;
        this.activeZone = card.dataset.zone;
      });
    });

    // Swatch Click
    this.container.querySelectorAll('.figma-square-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const zone = btn.dataset.zone;
        const hex = btn.dataset.hex;
        this.activeZone = zone;
        this.state.colors[zone] = hex;

        if (this.viewer) {
          this.viewer.updateMaterialColor(this.state.colors);
        }

        if (this.onUpdate) {
          this.onUpdate();
        }

        this.render();
      });
    });
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
