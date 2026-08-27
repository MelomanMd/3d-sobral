import { PATTERNS } from '../core/patterns.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const SPORT_PALETTES = [
  { name: 'Navy Dunkelblau', hex: '#1b2034' },
  { name: 'Stahlgrau', hex: '#5b6c84' },
  { name: 'Stealth Black', hex: '#121316' },
  { name: 'Pure White', hex: '#f8fafc' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Neon Lime', hex: '#84cc16' },
  { name: 'Cyber Purple', hex: '#7c3aed' },
  { name: 'Sunset Gold', hex: '#f59e0b' },
  { name: 'Racing Orange', hex: '#ea580c' },
  { name: 'Aqua Cyan', hex: '#06b6d4' },
  { name: 'Titanium Grey', hex: '#475569' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Electric Pink', hex: '#db2777' }
];

export const GARMENT_ELEMENTS = [
  {
    id: 'primary',
    name: 'Hauptkörper (Body)',
    sub: 'Brust, Rücken & Rumpf',
    icon: 'shirt'
  },
  {
    id: 'accent',
    name: 'Schultereinsätze (Passe)',
    sub: 'Kontrast-Schultern & Raglan',
    icon: 'layers'
  },
  {
    id: 'collar',
    name: 'Kragen (Bündchen)',
    sub: 'Halsausschnitt & Rippe',
    icon: 'sparkles'
  },
  {
    id: 'secondary',
    name: 'Sekundärakzente',
    sub: 'Zierstreifen & Paspeln',
    icon: 'palette'
  }
];

export class ColorPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeZone = 'primary'; // 'primary', 'accent', 'collar', 'secondary'

    this.render();
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  render() {
    const activeColor = this.state.colors[this.activeZone] || '#1b2034';

    this.container.innerHTML = `
      <!-- 1. Garment Parts & Elements List -->
      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.layers}</span>
          <span>Elemente des Kleidungsstücks</span>
        </div>
        <p class="section-hint" style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
          Wählen Sie ein Element aus oder klicken Sie direkt auf das 3D-Modell:
        </p>

        <div class="element-cards-grid">
          ${GARMENT_ELEMENTS.map(el => {
            const isSelected = this.activeZone === el.id;
            const elColor = this.state.colors[el.id] || '#1b2034';
            return `
              <div class="element-part-card ${isSelected ? 'active' : ''}" data-zone="${el.id}">
                <div class="part-card-left">
                  <span class="part-color-dot" style="background-color: ${elColor};"></span>
                  <div class="part-text-wrap">
                    <span class="part-title">${el.name}</span>
                    <span class="part-sub">${el.sub}</span>
                  </div>
                </div>
                <div class="part-hex-tag">${elColor.toUpperCase()}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Active Element Color Customizer -->
      <div class="panel-section">
        <div class="section-header-row">
          <span class="section-title">
            <span class="title-icon-svg">${ICONS.palette}</span>
            <span>Farbe für ${this.getActiveZoneName()}</span>
          </span>
          <div class="custom-color-wrapper">
            <span class="hex-label">${activeColor.toUpperCase()}</span>
            <input type="color" class="native-color-picker" id="active-color-input" value="${activeColor}">
          </div>
        </div>

        <div class="palette-swatches-grid" style="margin-top: 12px;">
          ${SPORT_PALETTES.map(p => `
            <button class="swatch-btn ${activeColor.toLowerCase() === p.hex.toLowerCase() ? 'active' : ''}" 
                    data-hex="${p.hex}" 
                    title="${p.name} (${p.hex})" 
                    style="background-color: ${p.hex}">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 3. Pattern / Cut Selector -->
      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.sparkles}</span>
          <span>${t('section_pattern')}</span>
        </div>
        <div class="pattern-grid">
          ${PATTERNS.map(p => `
            <button class="pattern-card ${this.state.patternId === p.id ? 'active' : ''}" data-pattern="${p.id}">
              <div class="pattern-preview pattern-${p.id}"></div>
              <span class="pattern-name">${p.getName ? p.getName() : p.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  getActiveZoneName() {
    const el = GARMENT_ELEMENTS.find(e => e.id === this.activeZone);
    return el ? el.name : 'Element';
  }

  bindEvents() {
    // Select Element Part Card
    this.container.querySelectorAll('.element-part-card').forEach(card => {
      card.addEventListener('click', () => {
        this.activeZone = card.dataset.zone;
        this.render();
      });
    });

    // Color Swatch Selection
    this.container.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        this.state.colors[this.activeZone] = hex;
        this.render();
        this.onUpdate();
      });
    });

    // Native Color Input
    const colorInput = this.container.querySelector('#active-color-input');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.state.colors[this.activeZone] = hex;
        const hexLabel = this.container.querySelector('.hex-label');
        if (hexLabel) hexLabel.textContent = hex.toUpperCase();
        const activeDot = this.container.querySelector(`.element-part-card.active .part-color-dot`);
        if (activeDot) activeDot.style.backgroundColor = hex;
        const activeTag = this.container.querySelector(`.element-part-card.active .part-hex-tag`);
        if (activeTag) activeTag.textContent = hex.toUpperCase();
        this.onUpdate();
      });
    }

    // Pattern Selection
    this.container.querySelectorAll('.pattern-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const patternId = btn.dataset.pattern;
        this.state.patternId = patternId;
        this.render();
        this.onUpdate();
      });
    });
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
