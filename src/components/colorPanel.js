import { PATTERNS } from '../core/patterns.js';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';

export const SPORT_PALETTES = [
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

export class ColorPanel {
  constructor(containerElement, state, onUpdate) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.activeZone = 'primary';

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.layers}</span>
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

      <div class="panel-section">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.palette}</span>
          <span>${t('section_color_zone')}</span>
        </div>
        <div class="zone-tabs">
          <button class="zone-tab ${this.activeZone === 'primary' ? 'active' : ''}" data-zone="primary">
            <span class="zone-color-indicator" style="background-color: ${this.state.colors.primary}"></span>
            <span>${t('zone_primary')}</span>
          </button>
          <button class="zone-tab ${this.activeZone === 'accent' ? 'active' : ''}" data-zone="accent">
            <span class="zone-color-indicator" style="background-color: ${this.state.colors.accent}"></span>
            <span>${t('zone_accent')}</span>
          </button>
          <button class="zone-tab ${this.activeZone === 'collar' ? 'active' : ''}" data-zone="collar">
            <span class="zone-color-indicator" style="background-color: ${this.state.colors.collar}"></span>
            <span>${t('zone_collar')}</span>
          </button>
          <button class="zone-tab ${this.activeZone === 'secondary' ? 'active' : ''}" data-zone="secondary">
            <span class="zone-color-indicator" style="background-color: ${this.state.colors.secondary}"></span>
            <span>${t('zone_secondary')}</span>
          </button>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-header-row">
          <span class="section-subtitle">${t('section_palette')}</span>
          <div class="custom-color-wrapper">
            <span class="hex-label">${this.state.colors[this.activeZone]}</span>
            <input type="color" class="native-color-picker" id="active-color-input" value="${this.state.colors[this.activeZone]}">
          </div>
        </div>

        <div class="palette-grid">
          ${SPORT_PALETTES.map(c => `
            <button class="swatch-btn ${this.state.colors[this.activeZone].toLowerCase() === c.hex.toLowerCase() ? 'active' : ''}" 
                    style="background-color: ${c.hex}" 
                    title="${c.name}"
                    data-hex="${c.hex}">
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.pattern-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const patternId = btn.dataset.pattern;
        this.state.patternId = patternId;
        this.render();
        this.onUpdate();
      });
    });

    this.container.querySelectorAll('.zone-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeZone = tab.dataset.zone;
        this.render();
      });
    });

    this.container.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        this.state.colors[this.activeZone] = hex;
        this.render();
        this.onUpdate();
      });
    });

    const colorInput = this.container.querySelector('#active-color-input');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.state.colors[this.activeZone] = hex;
        const hexLabel = this.container.querySelector('.hex-label');
        if (hexLabel) hexLabel.textContent = hex.toUpperCase();
        const indicator = this.container.querySelector(`.zone-tab.active .zone-color-indicator`);
        if (indicator) indicator.style.backgroundColor = hex;
        this.onUpdate();
      });
    }
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
