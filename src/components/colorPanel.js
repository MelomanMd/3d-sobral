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
  { name: 'Titanium Grey', hex: '#475569' }
];

export const GARMENT_ELEMENTS = [
  {
    id: 'primary',
    name: 'Hauptkörper (Body)',
    sub: 'Brust & Rücken',
    icon: 'shirt'
  },
  {
    id: 'accent',
    name: 'Schultereinsätze (Passe)',
    sub: 'Kontrast-Schultern',
    icon: 'layers'
  },
  {
    id: 'collar',
    name: 'Kragen (Bündchen)',
    sub: 'Halsausschnitt',
    icon: 'sparkles'
  },
  {
    id: 'secondary',
    name: 'Sekundärakzente',
    sub: 'Zierlinien',
    icon: 'palette'
  }
];

export class ColorPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeZone = 'primary';

    this.render();
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <!-- 1. Compact Garment Parts List with Inline Pickers -->
      <div class="panel-section" style="padding-bottom: 8px;">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.layers}</span>
          <span>Elemente & Farben</span>
        </div>

        <div class="compact-elements-list">
          ${GARMENT_ELEMENTS.map(el => {
            const isSelected = this.activeZone === el.id;
            const elColor = this.state.colors[el.id] || '#1b2034';
            return `
              <div class="compact-part-card ${isSelected ? 'active' : ''}" data-zone="${el.id}">
                <div class="compact-part-info">
                  <span class="part-title">${el.name}</span>
                  <span class="part-sub">${el.sub}</span>
                </div>
                
                <div class="compact-color-ctrl">
                  <div class="mini-picker-wrap" style="background-color: ${elColor};" title="Farbe wählen">
                    <input type="color" class="mini-native-picker" data-picker-zone="${el.id}" value="${elColor}">
                  </div>
                  <span class="compact-hex-tag">${elColor.toUpperCase()}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Quick Sport Palette Swatches Strip -->
      <div class="panel-section" style="padding-top: 8px; padding-bottom: 12px;">
        <div class="section-header-row" style="margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
            Schnellauswahl (${this.getActiveZoneName()})
          </span>
        </div>
        <div class="compact-swatches-row">
          ${SPORT_PALETTES.map(p => `
            <button class="mini-swatch-btn ${(this.state.colors[this.activeZone] || '').toLowerCase() === p.hex.toLowerCase() ? 'active' : ''}" 
                    data-hex="${p.hex}" 
                    title="${p.name} (${p.hex})" 
                    style="background-color: ${p.hex}">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 3. Pattern / Cut Selector -->
      <div class="panel-section" style="padding-top: 8px;">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.sparkles}</span>
          <span>${t('section_pattern')}</span>
        </div>
        <div class="compact-pattern-grid">
          ${PATTERNS.map(p => `
            <button class="compact-pattern-card ${this.state.patternId === p.id ? 'active' : ''}" data-pattern="${p.id}">
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
    return el ? el.name.split(' ')[0] : 'Element';
  }

  bindEvents() {
    // Select Element Part Card
    this.container.querySelectorAll('.compact-part-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.mini-picker-wrap')) return;
        this.activeZone = card.dataset.zone;
        this.render();
      });
    });

    // Inline Color Picker for each part
    this.container.querySelectorAll('.mini-native-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const zone = picker.dataset.pickerZone;
        const hex = e.target.value;
        this.state.colors[zone] = hex;
        this.activeZone = zone;

        const wrap = picker.closest('.mini-picker-wrap');
        if (wrap) wrap.style.backgroundColor = hex;
        const hexTag = picker.closest('.compact-part-card')?.querySelector('.compact-hex-tag');
        if (hexTag) hexTag.textContent = hex.toUpperCase();

        this.onUpdate();
      });
    });

    // Quick Swatches
    this.container.querySelectorAll('.mini-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        this.state.colors[this.activeZone] = hex;
        this.render();
        this.onUpdate();
      });
    });

    // Pattern Selection
    this.container.querySelectorAll('.compact-pattern-card').forEach(btn => {
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
