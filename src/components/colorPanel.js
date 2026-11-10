import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const OUTFIT_ELEMENTS = [
  {
    id: 'helmet',
    name: 'Kopfschutz',
    brandModel: 'KASK · SUPERPLASMA AQ',
    defaultColorName: 'Gelb',
    palette: [
      { name: 'Gelb', hex: '#FFCF24' },
      { name: 'Blau', hex: '#283B79' },
      { name: 'Weiss', hex: '#FFFFFF' },
      { name: 'Orange', hex: '#F98900' },
      { name: 'Grün', hex: '#1C5600' }
    ]
  },
  {
    id: 'primary',
    name: 'Oberteil',
    brandModel: 'BLÅKLÄDER · T-Shirt 3379',
    defaultColorName: '8894 Marineblau / Grau',
    palette: [
      { name: '8894 Marineblau / Grau', hex: '#242935' },
      { name: 'Weiss / Dunkelgrau', hex: '#FFFFFF' },
      { name: 'Rot / Schwarz', hex: '#C3303C' },
      { name: 'Kornblumenblau / Schwarz', hex: '#334B97' },
      { name: 'Dunkelmarineblau / Schwarz', hex: '#222337' },
      { name: 'Grau / Schwarz', hex: '#656A70' }
    ]
  },
  {
    id: 'trousers',
    name: 'Arbeitshose',
    brandModel: 'BLÅKLÄDER · Handwerker Arbeitshose 1750',
    defaultColorName: '8600 Marineblau',
    palette: [
      { name: '8600 Marineblau', hex: '#242935' },
      { name: 'Grau', hex: '#656A70' },
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Waldgrün', hex: '#1C5600' },
      { name: 'Kornblumenblau', hex: '#334B97' },
      { name: 'Braun / Sand', hex: '#8C7355' }
    ]
  },
  {
    id: 'boots',
    name: 'Sicherheitsschuhe',
    brandModel: 'SOBRAL Pro Safety Boot S3',
    defaultColorName: 'Schwarz',
    palette: [
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Grau', hex: '#656A70' },
      { name: 'Braun', hex: '#5C3D24' }
    ]
  }
];

export const SPORT_PALETTES = OUTFIT_ELEMENTS[1].palette;

export class ColorPanel {
  constructor(containerElement, state, onUpdate, viewer = null) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.viewer = viewer;
    this.activeZone = 'primary';

    this.render();
  }

  getColorName(zoneId, hex) {
    const el = OUTFIT_ELEMENTS.find(e => e.id === zoneId);
    if (!el) return hex;
    const match = el.palette.find(p => p.hex.toLowerCase() === (hex || '').toLowerCase());
    return match ? match.name : hex;
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="figma-color-panel">
        <!-- Section Header -->
        <div class="figma-panel-header">
          <h3 class="figma-panel-title">ELEMENTE & FARBEN</h3>
          <p class="figma-panel-subtitle">Wähle Produkte und passende Farben für deinen Look.</p>
        </div>

        <!-- 4 Outfit Cards with Inline Swatches (Figma Frame 1876:7821) -->
        <div class="figma-outfit-cards-list">
          ${OUTFIT_ELEMENTS.map(el => {
            const isSelected = this.activeZone === el.id;
            const currentHex = this.state.colors[el.id] || el.palette[0].hex;
            const currentColorName = this.getColorName(el.id, currentHex);

            // Dynamic brand title if different active product
            let brandText = el.brandModel;
            if (el.id === 'primary' && this.state.activeProduct?.name) {
              if (this.state.activeProduct.silhouette !== 'worker') {
                brandText = this.state.activeProduct.name;
              }
            }

            return `
              <div class="figma-outfit-card ${isSelected ? 'active' : ''}" data-zone="${el.id}">
                <div class="figma-card-header">
                  <div class="figma-card-name">${el.name}</div>
                  <div class="figma-card-brand">${brandText}</div>
                </div>

                <div class="figma-card-color-status">
                  Farbe: <span class="figma-color-status-name">${currentColorName}</span>
                </div>

                <!-- Row of square swatches -->
                <div class="figma-swatches-row">
                  ${el.palette.map(sw => {
                    const isSwatchActive = (currentHex || '').toLowerCase() === sw.hex.toLowerCase();
                    return `
                      <button class="figma-square-swatch ${isSwatchActive ? 'active' : ''}" 
                              data-zone="${el.id}" 
                              data-hex="${sw.hex}" 
                              data-name="${sw.name}"
                              style="background-color: ${sw.hex};" 
                              title="${sw.name} (${sw.hex})">
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
        this.render();
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
