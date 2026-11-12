import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { getMaterialColorControls } from '../core/materialColors.js';
import { BASE_PALETTES, getProductZonePalette } from '../core/productPalettes.js';

export const HELMET_PALETTE = BASE_PALETTES.helmet;
export const PRIMARY_PALETTE = BASE_PALETTES.tops;
export const TROUSERS_PALETTE = BASE_PALETTES.trousers;
export const BOOTS_PALETTE = BASE_PALETTES.boots;
export const ACCENT_PALETTE = BASE_PALETTES.accent;
export const COLLAR_PALETTE = BASE_PALETTES.collar;

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
    brandModel: 'BLÅKLÄDER · Arbeits-Oberteil',
    defaultColorName: 'Marineblau',
    palette: PRIMARY_PALETTE
  },
  {
    id: 'trousers',
    name: 'Arbeitshose',
    brandModel: 'BLÅKLÄDER · Handwerker Arbeitshose',
    defaultColorName: 'Marineblau',
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
      return OUTFIT_ELEMENTS.map(el => {
        const palette = getProductZonePalette(activeProduct, el.id);
        return {
          ...el,
          defaultColorName: palette[0]?.name || el.defaultColorName,
          palette
        };
      });
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

    const resolveZoneTitle = (zoneId, fallbackTitle) => {
      if (zoneId !== 'primary') return fallbackTitle;
      if (activeProduct.silhouette === 'helmet' || activeProduct.category === 'headwear') return 'Kopfschutz';
      if (activeProduct.silhouette === 'trousers' || activeProduct.category === 'bottoms') return 'Arbeitshose';
      if (activeProduct.silhouette === 'shoes' || activeProduct.category === 'shoes') return 'Sicherheitsschuhe';
      if (activeProduct.category === 'tops' || activeProduct.category === 'outerwear') return 'Oberteil';
      return fallbackTitle;
    };

    if (controls && controls.length > 0) {
      return controls.map(ctrl => {
        const palette = getProductZonePalette(activeProduct, ctrl.id);
        return {
          id: ctrl.id,
          name: resolveZoneTitle(ctrl.id, ctrl.name || 'Farbe'),
          brandModel: activeProduct.name || ctrl.sub || '',
          defaultColorName: palette[0].name,
          palette
        };
      });
    }

    // Fallback single card for single garment scans
    const pal = getProductZonePalette(activeProduct, 'primary');

    return [{
      id: 'primary',
      name: resolveZoneTitle('primary', 'Oberteil'),
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

    // Swatch Click (update active state in-place without rebuilding entire panel DOM)
    this.container.querySelectorAll('.figma-square-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const zone = btn.dataset.zone;
        const hex = btn.dataset.hex;
        const name = btn.dataset.name;
        this.activeZone = zone;
        this.state.colors[zone] = hex;

        const card = btn.closest('.figma-outfit-card');
        if (card) {
          card.querySelectorAll('.figma-square-swatch').forEach(s => {
            s.classList.toggle('active', s === btn);
          });
          const statusEl = card.querySelector('.figma-color-status-name');
          if (statusEl && name) {
            statusEl.textContent = name;
          }
        }

        if (this.viewer) {
          this.viewer.updateMaterialColor(this.state.colors);
        }

        if (this.onUpdate) {
          this.onUpdate('colors');
        }
      });
    });
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
