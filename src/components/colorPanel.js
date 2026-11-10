import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

// Official Figma 2026 Color Palettes from Frame 1884:*
export const FIGMA_OUTFIT_PALETTES = {
  helmet: [
    { name: 'Gelb', hex: '#FFCF24' },
    { name: 'Blau', hex: '#283B79' },
    { name: 'Weiss', hex: '#FFFFFF' },
    { name: 'Orange', hex: '#F98900' },
    { name: 'Grün', hex: '#1C5600' }
  ],
  primary: [ // Oberteil (Jacke & Ärmel)
    { name: 'Marineblau / Grau', hex: '#242935' },
    { name: 'Weiss / Dunkelgrau', hex: '#FFFFFF' },
    { name: 'Rot / Schwarz', hex: '#C3303C' },
    { name: 'Kornblumenblau / Schwarz', hex: '#334B97' },
    { name: 'Dunkelmarineblau / Schwarz', hex: '#222337' },
    { name: 'Grau / Schwarz', hex: '#656A70' }
  ],
  trousers: [ // Arbeitshose (Hose & Beine)
    { name: 'Marineblau', hex: '#242935' },
    { name: 'Grau', hex: '#656A70' },
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Marineblau / Schwarz', hex: '#1b2034' },
    { name: 'Waldgrün / Schwarz', hex: '#1C5600' },
    { name: 'Kornblumenblau / Schwarz', hex: '#334B97' }
  ],
  boots: [ // Sicherheitsschuhe
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Grau', hex: '#656A70' },
    { name: 'Braun', hex: '#836338' }
  ]
};

export const SPORT_PALETTES = FIGMA_OUTFIT_PALETTES.primary;

export const OUTFIT_ELEMENTS = [
  {
    id: 'helmet',
    name: 'Kopfschutz',
    sub: 'Helmschale',
    category: 'KASK Superplasma PL'
  },
  {
    id: 'primary',
    name: 'Oberteil',
    sub: 'Jacke & Ärmel',
    category: 'Blåkläder Softshell'
  },
  {
    id: 'trousers',
    name: 'Arbeitshose',
    sub: 'Hose & Beine',
    category: 'Blåkläder 1750 Stretch'
  },
  {
    id: 'boots',
    name: 'Sicherheitsschuhe',
    sub: 'Sicherheitsschuhe',
    category: 'Sobral Pro Safety S3'
  }
];

export class ColorPanel {
  constructor(containerElement, state, onUpdate, viewer = null) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.viewer = viewer;
    this.activeZone = 'primary';

    this.render();
  }

  getGarmentElements() {
    const product = this.state.activeProduct;
    if (this.viewer && this.viewer.isMultiMesh) {
      const controls = this.viewer.getColorControls();
      if (controls && controls.length) {
        return controls;
      }
    }
    return OUTFIT_ELEMENTS;
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  getActiveZoneName() {
    const el = OUTFIT_ELEMENTS.find(e => e.id === this.activeZone);
    return el ? el.name : 'Element';
  }

  render() {
    const elements = this.getGarmentElements();
    if (!elements.some(element => element.id === this.activeZone)) {
      this.activeZone = elements[0]?.id || 'primary';
    }

    const activePalette = FIGMA_OUTFIT_PALETTES[this.activeZone] || FIGMA_OUTFIT_PALETTES.primary;
    const currentColor = (this.state.colors[this.activeZone] || '#ffffff').toUpperCase();

    this.container.innerHTML = `
      <div class="color-panel-wrapper">
        <!-- 1. Section Header: ELEMENTE & FARBEN -->
        <div class="panel-section-header">
          <span class="section-title-tag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4.9V17L12 22l-9-4.9V7z"/></svg>
            <span>ELEMENTE & FARBEN</span>
          </span>
        </div>

        <!-- 2. 4 Outfit Items List (Cards with Color Preview & Hex Tag) -->
        <div class="outfit-elements-list">
          ${elements.map(el => {
            const isSelected = this.activeZone === el.id;
            const elColor = (this.state.colors[el.id] || '#ffffff').toUpperCase();
            return `
              <div class="outfit-part-card ${isSelected ? 'active' : ''}" data-zone="${el.id}">
                <div class="outfit-part-info">
                  <span class="outfit-part-name">${el.name}</span>
                  <span class="outfit-part-sub">${el.sub}</span>
                </div>
                
                <div class="outfit-color-preview-wrap">
                  <div class="outfit-color-box" style="background-color: ${elColor};" title="Farbe wählen">
                    <input type="color" class="outfit-native-picker" data-picker-zone="${el.id}" value="${elColor}">
                  </div>
                  <span class="outfit-hex-label">${elColor}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3. Dynamic Quick Palette Selection for Active Item -->
        <div class="palette-selection-section">
          <div class="palette-section-title">
            <span>SCHNELLAUSWAHL (${this.getActiveZoneName().toUpperCase()})</span>
          </div>

          <div class="figma-swatches-grid">
            ${activePalette.map(p => {
              const isActive = (this.state.colors[this.activeZone] || '').toLowerCase() === p.hex.toLowerCase();
              return `
                <button class="figma-swatch-card ${isActive ? 'active' : ''}" 
                        data-hex="${p.hex}" 
                        title="${p.name} (${p.hex})">
                  <span class="swatch-color-fill" style="background-color: ${p.hex};"></span>
                  <span class="swatch-color-name">${p.name}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Select Element Part Card
    this.container.querySelectorAll('.outfit-part-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.outfit-color-box')) return;
        this.activeZone = card.dataset.zone;
        this.render();
      });
    });

    // Native Color Picker input
    this.container.querySelectorAll('.outfit-native-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const zone = picker.dataset.pickerZone;
        const hex = e.target.value;
        this.state.colors[zone] = hex;
        this.activeZone = zone;

        // Live update label and box background
        const card = picker.closest('.outfit-part-card');
        if (card) {
          const hexLabel = card.querySelector('.outfit-hex-label');
          if (hexLabel) hexLabel.textContent = hex.toUpperCase();
          const colorBox = card.querySelector('.outfit-color-box');
          if (colorBox) colorBox.style.backgroundColor = hex;
        }

        if (this.onUpdate) this.onUpdate();
      });

      picker.addEventListener('change', () => {
        this.render();
      });
    });

    // Click Swatch from Quick Selection Grid
    this.container.querySelectorAll('.figma-swatch-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        this.state.colors[this.activeZone] = hex;

        if (this.viewer) {
          this.viewer.updateMaterialColor(this.state.colors);
        }

        if (this.onUpdate) this.onUpdate();
        this.render();
      });
    });
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
