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

export const HELMET_SAFETY_PALETTES = [
  { name: 'Original Weiss', hex: '#ffffff' },
  { name: 'Signalgelb', hex: '#f5ce32' },
  { name: 'Warnorange', hex: '#f07730' },
  { name: 'Royalblau', hex: '#2768ad' },
  { name: 'Anthrazit / Schwarz', hex: '#272d33' },
  { name: 'Leuchtorange', hex: '#ff5500' }
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
  constructor(containerElement, state, onUpdate, viewer = null) {
    this.container = containerElement;
    this.state = state;
    this.onUpdate = onUpdate;
    this.viewer = viewer;
    this.activeZone = 'primary';

    this.render();
  }

  getGarmentElements() {
    const prod = this.state.activeProduct || {};
    const sil = prod.silhouette || '';
    const art = prod.articleNumber || '';

    if (sil === 'helmet' || art === 'WHE00113') {
      return [
        { id: 'primary', name: 'Helmschale (Shell)', sub: 'Hauptfarbe', icon: 'shield' },
        { id: 'accent', name: 'Belüftung / Krone', sub: 'Einsätze', icon: 'layers' },
        { id: 'collar', name: 'Kinnriemen & Polster', sub: 'Befestigung', icon: 'sparkles' }
      ];
    }
    if (sil === 'trousers' || art === '1750') {
      return [
        { id: 'primary', name: 'Hauptstoff (Hose)', sub: 'Beine & Gesäss', icon: 'scissors' },
        { id: 'accent', name: 'Kniepolster & Stretch', sub: 'Verstärkungen', icon: 'layers' },
        { id: 'collar', name: 'Bund & Bündchen', sub: 'Details', icon: 'sparkles' }
      ];
    }
    if (sil === 'hoodie' || sil === 'jacket' || art === '3362' || art === '3366' || art === '4890') {
      return [
        { id: 'primary', name: 'Hauptstoff (Body)', sub: 'Vorder- & Rückseite', icon: 'shirt' },
        { id: 'accent', name: 'Kapuzenfutter & Einsätze', sub: 'Kontraste', icon: 'layers' },
        { id: 'collar', name: 'Bündchen & Kragen', sub: 'Rippstrick', icon: 'sparkles' }
      ];
    }
    if (sil === 'beanie' || art === '2003') {
      return [
        { id: 'primary', name: 'Strickmütze (Shell)', sub: 'Aussenstoff', icon: 'shirt' },
        { id: 'accent', name: 'Label & Akzent', sub: 'Details', icon: 'layers' },
        { id: 'collar', name: 'Fleece-Innenfutter', sub: 'Innenseite', icon: 'sparkles' }
      ];
    }

    return GARMENT_ELEMENTS;
  }

  setActiveZone(zone) {
    this.activeZone = zone;
    this.render();
  }

  render() {
    const elements = this.getGarmentElements();
    const prod = this.state.activeProduct || {};
    const isHelmet = prod.silhouette === 'helmet' || prod.articleNumber === 'WHE00113';
    const activePalette = isHelmet ? HELMET_SAFETY_PALETTES : SPORT_PALETTES;
    const compVis = this.viewer?.componentVisibility || { prints: true, straps: true, inside: true };

    this.container.innerHTML = `
      <!-- 1. Compact Garment / Helmet Parts List with Inline Pickers -->
      <div class="panel-section" style="padding-bottom: 8px;">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.layers}</span>
          <span>Elemente & Farben</span>
        </div>

        <div class="compact-elements-list">
          ${elements.map(el => {
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

      <!-- 2. Quick Palette Swatches Strip -->
      <div class="panel-section" style="padding-top: 8px; padding-bottom: 12px;">
        <div class="section-header-row" style="margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
            ${isHelmet ? t('helmet_safety_colors') : `Schnellauswahl (${this.getActiveZoneName()})`}
          </span>
        </div>
        <div class="compact-swatches-row">
          ${activePalette.map(p => `
            <button class="mini-swatch-btn ${(this.state.colors[this.activeZone] || '').toLowerCase() === p.hex.toLowerCase() ? 'active' : ''}" 
                    data-hex="${p.hex}" 
                    title="${p.name} (${p.hex})" 
                    style="background-color: ${p.hex}">
            </button>
          `).join('')}
        </div>
      </div>

      ${isHelmet ? `
        <!-- Helmet Bauteile & Sichtbarkeit Switches -->
        <div class="panel-section" style="padding-top: 8px;">
          <div class="section-title">
            <span class="title-icon-svg">${ICONS.layers}</span>
            <span>${t('helmet_components')}</span>
          </div>
          <div class="helmet-switches-list">
            <label class="switch-row-card" for="switch-prints">
              <span class="switch-label">${t('helmet_prints')}</span>
              <input type="checkbox" id="switch-prints" class="custom-toggle" data-comp="prints" ${compVis.prints ? 'checked' : ''}>
            </label>
            <label class="switch-row-card" for="switch-straps">
              <span class="switch-label">${t('helmet_straps')}</span>
              <input type="checkbox" id="switch-straps" class="custom-toggle" data-comp="straps" ${compVis.straps ? 'checked' : ''}>
            </label>
            <label class="switch-row-card" for="switch-inside">
              <span class="switch-label">${t('helmet_inside')}</span>
              <input type="checkbox" id="switch-inside" class="custom-toggle" data-comp="inside" ${compVis.inside ? 'checked' : ''}>
            </label>
          </div>
        </div>
      ` : `
        <!-- 3. Pattern / Cut Selector for Garments -->
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
      `}

      <!-- Darstellung & Studio (Background, Wireframe & Reset) -->
      <div class="panel-section" style="padding-top: 8px;">
        <div class="section-title">
          <span class="title-icon-svg">${ICONS.sun}</span>
          <span>${t('display_settings')}</span>
        </div>
        <div class="display-settings-card">
          <div class="display-row">
            <label class="display-label" for="select-panel-bg">${t('bg_label')}</label>
            <select id="select-panel-bg" class="custom-select-sm">
              <option value="light" ${(this.viewer?.currentBackground || 'light') === 'light' ? 'selected' : ''}>☀️ ${t('bg_studio_light')}</option>
              <option value="white" ${(this.viewer?.currentBackground) === 'white' ? 'selected' : ''}>⚪ ${t('bg_white')}</option>
              <option value="dark" ${(this.viewer?.currentBackground) === 'dark' ? 'selected' : ''}>🌙 ${t('bg_studio_dark')}</option>
            </select>
          </div>
          <div class="display-row">
            <label class="display-label" for="switch-panel-wireframe">Drahtgitter / Wireframe</label>
            <input type="checkbox" id="switch-panel-wireframe" class="custom-toggle" ${this.viewer?.isWireframe ? 'checked' : ''}>
          </div>
          <button class="reset-link-btn" id="btn-panel-reset">
            ${t('reset_view')}
          </button>
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

    // Helmet Component Visibility Toggles
    this.container.querySelectorAll('.custom-toggle[data-comp]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const comp = e.target.dataset.comp;
        if (this.viewer && comp) {
          this.viewer.setComponentVisibility({ [comp]: e.target.checked });
        }
      });
    });

    // Background selection
    const selectBg = this.container.querySelector('#select-panel-bg');
    if (selectBg) {
      selectBg.addEventListener('change', (e) => {
        if (this.viewer) {
          this.viewer.setBackground(e.target.value);
        }
      });
    }

    // Wireframe toggle
    const switchWireframe = this.container.querySelector('#switch-panel-wireframe');
    if (switchWireframe) {
      switchWireframe.addEventListener('change', (e) => {
        if (this.viewer) {
          this.viewer.setWireframe(e.target.checked);
        }
      });
    }

    // Panel Reset View
    const btnReset = this.container.querySelector('#btn-panel-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.viewer) {
          this.viewer.resetView();
          this.render();
        }
      });
    }
  }

  updateState(newState) {
    this.state = newState;
    this.render();
  }
}
