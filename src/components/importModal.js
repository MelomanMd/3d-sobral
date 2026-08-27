import confetti from 'canvas-confetti';
import { t } from '../core/i18n.js';
import { ICONS } from '../core/icons.js';
import { DEFAULT_LOGOS, getLogoDataUrl } from '../core/defaultLogos.js';

export const PRESET_DESIGNS = [
  {
    id: 'championship',
    name: 'Championship Pro',
    description: 'Vexa Sport in Crimson Red & Stealth Black',
    patternId: 'vexa',
    colors: {
      primary: '#121316',
      accent: '#dc2626',
      collar: '#f8fafc',
      secondary: '#ffffff'
    },
    texts: [
      {
        id: 'text_1',
        text: 'SOBRAL',
        zone: 'chest_center',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 58,
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 4,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      },
      {
        id: 'text_2',
        text: '10',
        zone: 'back_number',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 92,
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#dc2626',
        strokeWidth: 6,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ],
    logos: [
      {
        id: 'logo_1',
        name: 'Royal Lion Crest',
        src: getLogoDataUrl(DEFAULT_LOGOS[0]),
        zone: 'chest_left',
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        tint: 'original',
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ]
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Stealth',
    description: 'Cyber Hex Mesh with Neon Lime Highlights',
    patternId: 'cyber_hex',
    colors: {
      primary: '#0f172a',
      accent: '#84cc16',
      collar: '#84cc16',
      secondary: '#38bdf8'
    },
    texts: [
      {
        id: 'text_1',
        text: 'CYBER',
        zone: 'chest_center',
        fontFamily: "'Russo One', sans-serif",
        fontSize: 54,
        fontWeight: '900',
        color: '#84cc16',
        strokeColor: '#0f172a',
        strokeWidth: 5,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      },
      {
        id: 'text_2',
        text: '99',
        zone: 'back_number',
        fontFamily: "'Teko', 'Impact', sans-serif",
        fontSize: 100,
        fontWeight: '900',
        color: '#84cc16',
        strokeColor: '#38bdf8',
        strokeWidth: 6,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ],
    logos: [
      {
        id: 'logo_1',
        name: 'Thunder Eagle',
        src: getLogoDataUrl(DEFAULT_LOGOS[1]),
        zone: 'chest_left',
        scale: 1.1,
        rotation: 0,
        opacity: 1.0,
        tint: '#84cc16',
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ]
  },
  {
    id: 'speed_racing',
    name: 'Sunset Racing',
    description: 'Speed Racing stripes with Sunset Gold & Orange',
    patternId: 'racing',
    colors: {
      primary: '#18181b',
      accent: '#ea580c',
      collar: '#f59e0b',
      secondary: '#ffffff'
    },
    texts: [
      {
        id: 'text_1',
        text: 'RACING',
        zone: 'chest_center',
        fontFamily: "'Bebas Neue', 'Impact', sans-serif",
        fontSize: 60,
        fontWeight: '900',
        color: '#f59e0b',
        strokeColor: '#000000',
        strokeWidth: 4,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      },
      {
        id: 'text_2',
        text: '07',
        zone: 'back_number',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 90,
        fontWeight: '900',
        color: '#ea580c',
        strokeColor: '#f59e0b',
        strokeWidth: 6,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ],
    logos: [
      {
        id: 'logo_1',
        name: 'Speed Shield',
        src: getLogoDataUrl(DEFAULT_LOGOS[2]),
        zone: 'chest_left',
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        tint: '#f59e0b',
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ]
  },
  {
    id: 'ocean_wave',
    name: 'Ocean Gradient',
    description: 'Dynamic Gradient Flow in Royal Blue & Aqua',
    patternId: 'gradient',
    colors: {
      primary: '#1d4ed8',
      accent: '#06b6d4',
      collar: '#ffffff',
      secondary: '#f8fafc'
    },
    texts: [
      {
        id: 'text_1',
        text: 'ATLANTIC',
        zone: 'chest_center',
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 50,
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#1d4ed8',
        strokeWidth: 4,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      },
      {
        id: 'text_2',
        text: '24',
        zone: 'back_number',
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        fontSize: 92,
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#06b6d4',
        strokeWidth: 5,
        curve: 0,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ],
    logos: [
      {
        id: 'logo_1',
        name: 'Alpha Wolf',
        src: getLogoDataUrl(DEFAULT_LOGOS[3]),
        zone: 'chest_left',
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        tint: '#ffffff',
        offsetX: 0,
        offsetY: 0,
        visible: true
      }
    ]
  }
];

export class ImportModal {
  constructor(onLoadDesignFn) {
    this.onLoadDesign = onLoadDesignFn;
    this.modalEl = null;
    this.activeTab = 'presets'; // 'presets', 'file', 'paste'
  }

  open() {
    this.close();

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'import-modal-root';
    modal.innerHTML = `
      <div class="modal-card modal-card-large">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge">${t('import_modal_badge')}</span>
            <h2 class="modal-title">${t('import_modal_title')}</h2>
          </div>
          <button class="modal-close-btn" id="import-btn-close">${ICONS.close}</button>
        </div>

        <div class="modal-tabs-nav">
          <button class="modal-tab-btn ${this.activeTab === 'presets' ? 'active' : ''}" data-tab="presets">
            <span class="btn-icon-svg">${ICONS.sparkles}</span>
            <span>${t('import_presets_tab')}</span>
          </button>
          <button class="modal-tab-btn ${this.activeTab === 'file' ? 'active' : ''}" data-tab="file">
            <span class="btn-icon-svg">${ICONS.folderOpen}</span>
            <span>${t('import_file_tab')}</span>
          </button>
          <button class="modal-tab-btn ${this.activeTab === 'paste' ? 'active' : ''}" data-tab="paste">
            <span class="btn-icon-svg">${ICONS.fileJson}</span>
            <span>${t('import_paste_tab')}</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Presets Tab Content -->
          <div class="import-tab-pane ${this.activeTab === 'presets' ? 'active' : ''}" id="pane-presets">
            <div class="presets-template-grid">
              ${PRESET_DESIGNS.map(preset => `
                <div class="preset-template-card" data-id="${preset.id}">
                  <div class="preset-color-strip">
                    <span style="background:${preset.colors.primary}"></span>
                    <span style="background:${preset.colors.accent}"></span>
                    <span style="background:${preset.colors.collar}"></span>
                  </div>
                  <div class="preset-card-body">
                    <div class="preset-card-title">${preset.name}</div>
                    <div class="preset-card-desc">${preset.description}</div>
                  </div>
                  <button class="btn-sm btn-primary-action btn-apply-preset" data-id="${preset.id}">
                    <span class="btn-icon-svg">${ICONS.check}</span>
                    <span>${t('import_apply_btn')}</span>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- File Upload Tab Content -->
          <div class="import-tab-pane ${this.activeTab === 'file' ? 'active' : ''}" id="pane-file">
            <div class="import-drop-zone" id="import-drop-zone">
              <input type="file" id="import-file-input" accept=".json,application/json" style="display:none">
              <div class="drop-content">
                <span class="drop-icon-svg">${ICONS.fileJson}</span>
                <span class="drop-text">${t('import_drop_title')}</span>
                <span class="drop-hint">${t('import_drop_hint')}</span>
              </div>
            </div>
          </div>

          <!-- Paste JSON Tab Content -->
          <div class="import-tab-pane ${this.activeTab === 'paste' ? 'active' : ''}" id="pane-paste">
            <div class="paste-json-container">
              <textarea class="paste-json-textarea" id="paste-json-textarea" placeholder="${t('import_paste_placeholder')}"></textarea>
              <div class="paste-action-row">
                <button class="btn-primary-action" id="btn-apply-paste-json">
                  <span class="btn-icon-svg">${ICONS.check}</span>
                  <span>${t('import_apply_btn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    this.bindEvents(modal);
  }

  bindEvents(modal) {
    modal.querySelector('#import-btn-close').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Tab Switching
    modal.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.activeTab = tab;
        modal.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        modal.querySelectorAll('.import-tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tab}`));
      });
    });

    // Apply Presets
    modal.querySelectorAll('.btn-apply-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.id;
        const preset = PRESET_DESIGNS.find(p => p.id === presetId);
        if (preset) {
          this.loadState({
            patternId: preset.patternId,
            colors: { ...preset.colors },
            texts: JSON.parse(JSON.stringify(preset.texts)),
            logos: JSON.parse(JSON.stringify(preset.logos))
          });
        }
      });
    });

    // File Upload
    const dropZone = modal.querySelector('#import-drop-zone');
    const fileInput = modal.querySelector('#import-file-input');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.readFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.readFile(e.target.files[0]);
        }
      });
    }

    // Paste JSON
    const btnApplyPaste = modal.querySelector('#btn-apply-paste-json');
    if (btnApplyPaste) {
      btnApplyPaste.addEventListener('click', () => {
        const textarea = modal.querySelector('#paste-json-textarea');
        const text = textarea ? textarea.value.trim() : '';
        if (!text) return;
        try {
          const parsed = JSON.parse(text);
          this.loadState(parsed);
        } catch (err) {
          alert(t('import_error_invalid'));
        }
      });
    }
  }

  readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        this.loadState(parsed);
      } catch (err) {
        alert(t('import_error_invalid'));
      }
    };
    reader.readAsText(file);
  }

  loadState(data) {
    if (!data || (!data.patternId && !data.colors)) {
      alert(t('import_error_invalid'));
      return;
    }

    this.onLoadDesign(data);
    this.close();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
