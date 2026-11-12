/**
 * mobileSelectPicker.js
 * Figma 2026 Mobile Select Picker / Bottom Sheet
 * Replaces native OS select popups on mobile with custom bottom sheet dialog
 * matching Figma screenshots (Artikel wählen, Platzierung wählen, etc.)
 */

let activePickerModal = null;

function formatPickerTitle(raw) {
  if (!raw) return 'Auswahl wählen';
  let clean = raw.trim().replace(/\s*[\*\:]\s*$/, '');
  if (clean.toLowerCase().endsWith('wählen')) return clean;

  const mapping = {
    'artikel': 'Artikel wählen',
    'platzierung': 'Platzierung wählen',
    'schriftart': 'Schriftart wählen',
    'textfarbe': 'Textfarbe wählen',
    'konturfarbe': 'Konturfarbe wählen'
  };

  const lower = clean.toLowerCase();
  if (mapping[lower]) return mapping[lower];

  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + ' wählen';
}

export function openMobileSelectSheet(selectEl) {
  closeMobileSelectSheet();

  if (!selectEl || !selectEl.options) return;

  // 1. Determine title from parent field group label
  const fieldGroup = selectEl.closest('.figma-field-group') || selectEl.closest('.figma-stepper-box') || selectEl.parentElement;
  const labelEl = fieldGroup ? fieldGroup.querySelector('.figma-label, .figma-stepper-label, label') : null;
  const rawTitle = labelEl ? labelEl.textContent.trim() : (selectEl.title || selectEl.name || 'Auswahl');
  const title = formatPickerTitle(rawTitle);

  // 2. Read options
  const options = Array.from(selectEl.options).map(opt => ({
    value: opt.value,
    text: opt.textContent.trim(),
    selected: opt.selected
  }));

  // 3. Build modal
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-select-picker-backdrop';
  backdrop.id = 'mobile-select-picker-modal';
  backdrop.innerHTML = `
    <div class="mobile-select-picker-sheet" role="dialog" aria-modal="true" aria-label="${title}">
      <h3 class="mobile-select-picker-title">${title}</h3>
      <div class="mobile-select-picker-options">
        ${options.map(opt => `
          <button type="button" class="btn-mobile-select-option ${opt.selected ? 'is-selected' : ''}" data-value="${opt.value}">
            ${opt.text}
          </button>
        `).join('')}
        <button type="button" class="btn-mobile-select-cancel" id="btn-mobile-select-cancel">
          Abbrechen
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  activePickerModal = backdrop;
  const openedAt = Date.now();

  // Animate in
  requestAnimationFrame(() => {
    backdrop.classList.add('is-open');
  });

  const closeWithAnimation = () => {
    backdrop.classList.remove('is-open');
    setTimeout(() => {
      backdrop.remove();
      if (activePickerModal === backdrop) activePickerModal = null;
    }, 220);
  };

  // Prevent clicks inside sheet from bubbling to backdrop
  const sheet = backdrop.querySelector('.mobile-select-picker-sheet');
  if (sheet) {
    sheet.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Option click
  backdrop.querySelectorAll('.btn-mobile-select-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.dataset.value;
      if (selectEl.value !== val) {
        selectEl.value = val;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      closeWithAnimation();
    });
  });

  // Cancel click
  backdrop.querySelector('#btn-mobile-select-cancel')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeWithAnimation();
  });

  // Backdrop click (ignore clicks in first 350ms to prevent ghost clicks from the opening tap)
  backdrop.addEventListener('click', (e) => {
    if (Date.now() - openedAt < 350) return;
    if (e.target === backdrop) {
      closeWithAnimation();
    }
  });

  // Escape key
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeWithAnimation();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);
}

export function closeMobileSelectSheet() {
  if (activePickerModal) {
    activePickerModal.remove();
    activePickerModal = null;
  }
}

export function initMobileSelectPicker() {
  // 1. Prevent default native picker on pointerdown without triggering open twice
  document.addEventListener('pointerdown', (e) => {
    if (window.innerWidth > 860) return;
    const select = e.target.closest('select.figma-select, select.figma-stepper-select');
    if (select) {
      e.preventDefault();
    }
  }, { capture: true });

  // 2. Open custom sheet on click
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    const select = e.target.closest('select.figma-select, select.figma-stepper-select');
    if (!select) return;
    e.preventDefault();
    e.stopPropagation();
    openMobileSelectSheet(select);
  }, { capture: true });
}

