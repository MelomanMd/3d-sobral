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

  // Backdrop click (ignore clicks in first 500ms and require pointerdown to have started on backdrop)
  let touchStartedOnBackdrop = false;
  backdrop.addEventListener('pointerdown', (e) => {
    if (e.target === backdrop) {
      touchStartedOnBackdrop = true;
    }
  });

  backdrop.addEventListener('click', (e) => {
    if (Date.now() - openedAt < 500) return;
    if (e.target === backdrop && touchStartedOnBackdrop) {
      closeWithAnimation();
    }
    touchStartedOnBackdrop = false;
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

let activeDesktopDropdown = null;

export function closeDesktopSelectDropdown() {
  if (activeDesktopDropdown) {
    activeDesktopDropdown.menu.remove();
    if (activeDesktopDropdown.selectEl) {
      activeDesktopDropdown.selectEl.classList.remove('is-dropdown-open');
    }
    activeDesktopDropdown = null;
  }
}

export function openDesktopSelectDropdown(selectEl) {
  // If already open for this select, toggle close
  if (activeDesktopDropdown && activeDesktopDropdown.selectEl === selectEl) {
    closeDesktopSelectDropdown();
    return;
  }
  closeDesktopSelectDropdown();

  if (!selectEl || !selectEl.options) return;

  const rect = selectEl.getBoundingClientRect();
  const options = Array.from(selectEl.options).map(opt => ({
    value: opt.value,
    text: opt.textContent.trim(),
    selected: opt.selected
  }));

  const menu = document.createElement('div');
  menu.className = 'figma-desktop-select-dropdown';
  menu.setAttribute('role', 'listbox');
  menu.innerHTML = options.map(opt => `
    <div class="figma-desktop-select-option ${opt.selected ? 'is-selected' : ''}" data-value="${opt.value}" role="option" aria-selected="${opt.selected}">
      ${opt.text}
    </div>
  `).join('');

  menu.style.position = 'fixed';
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = `${rect.bottom - 1}px`;
  menu.style.zIndex = '999999';

  document.body.appendChild(menu);
  selectEl.classList.add('is-dropdown-open');

  activeDesktopDropdown = { menu, selectEl };

  // Adjust if overflowing viewport bottom
  const menuRect = menu.getBoundingClientRect();
  if (menuRect.bottom > window.innerHeight - 10) {
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceAbove > spaceBelow) {
      menu.style.top = `${Math.max(10, rect.top - menuRect.height + 1)}px`;
    } else {
      menu.style.maxHeight = `${Math.max(100, spaceBelow - 20)}px`;
    }
  }

  // Handle option click
  menu.querySelectorAll('.figma-desktop-select-option').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = item.dataset.value;
      if (selectEl.value !== val) {
        selectEl.value = val;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      closeDesktopSelectDropdown();
    });
  });

  // Prevent click on menu from propagating to document
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  menu.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
}

export function initMobileSelectPicker() {
  // Desktop mousedown interception to prevent native browser select popup
  document.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 860) return;
    const select = e.target.closest('select.figma-select, select.figma-stepper-select');
    if (!select) return;

    e.preventDefault();
    openDesktopSelectDropdown(select);
  }, { capture: true });

  // Close desktop dropdown on outside mousedown
  document.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 860) return;
    if (activeDesktopDropdown) {
      const select = e.target.closest('select.figma-select, select.figma-stepper-select');
      if (select && select === activeDesktopDropdown.selectEl) return;
      if (activeDesktopDropdown.menu.contains(e.target)) return;
      closeDesktopSelectDropdown();
    }
  });

  // Mobile pointerdown opens custom bottom sheet and prevents native OS picker
  document.addEventListener('pointerdown', (e) => {
    if (window.innerWidth > 860) return;
    const select = e.target.closest('select.figma-select, select.figma-stepper-select');
    if (select) {
      e.preventDefault();
      e.stopPropagation();
      openMobileSelectSheet(select);
    }
  }, { capture: true });

  // Mobile click fallback
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    const select = e.target.closest('select.figma-select, select.figma-stepper-select');
    if (!select) return;
    e.preventDefault();
    e.stopPropagation();
    openMobileSelectSheet(select);
  }, { capture: true });

  // Close desktop dropdown on scroll, resize or Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDesktopSelectDropdown();
      closeMobileSelectSheet();
    }
  });

  window.addEventListener('scroll', () => {
    closeDesktopSelectDropdown();
  }, true);

  window.addEventListener('resize', () => {
    closeDesktopSelectDropdown();
    closeMobileSelectSheet();
  });
}

