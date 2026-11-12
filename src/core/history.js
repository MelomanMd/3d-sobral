// Undo / Redo History Manager for 3D Customizer

export class HistoryManager {
  constructor(initialState, onStateRestore) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 25;
    this.onStateRestore = onStateRestore;

    // Push initial snapshot
    this.currentSnapshot = this.clone(initialState);

    this.initKeyboardShortcuts();
    this.notifyChange();
  }

  // Shallow-structural snapshot: preserves immutable string references (like logo data URLs)
  // and product catalog descriptor instead of serializing megabytes on every click.
  clone(state) {
    if (!state || typeof state !== 'object') return state;
    return {
      ...state,
      colors: state.colors ? { ...state.colors } : {},
      texts: Array.isArray(state.texts) ? state.texts.map(t => ({ ...t })) : [],
      logos: Array.isArray(state.logos) ? state.logos.map(l => ({ ...l })) : []
    };
  }

  statesEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.activeProduct?.id !== b.activeProduct?.id || a.patternId !== b.patternId || a.selectedItemId !== b.selectedItemId) {
      return false;
    }
    const aColors = a.colors || {};
    const bColors = b.colors || {};
    const colorKeys = new Set([...Object.keys(aColors), ...Object.keys(bColors)]);
    for (const k of colorKeys) {
      if (aColors[k] !== bColors[k]) return false;
    }
    const itemsEqual = (arr1 = [], arr2 = []) => {
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        const x = arr1[i], y = arr2[i];
        const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
        for (const k of keys) {
          if (x[k] !== y[k]) return false;
        }
      }
      return true;
    };
    return itemsEqual(a.texts, b.texts) && itemsEqual(a.logos, b.logos);
  }

  push(state) {
    const newSnapshot = this.clone(state);
    if (this.statesEqual(newSnapshot, this.currentSnapshot)) {
      return;
    }

    this.undoStack.push(this.currentSnapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.currentSnapshot = newSnapshot;
    this.redoStack = []; // Clear redo on new action

    this.notifyChange();
  }

  undo() {
    if (!this.canUndo()) return;

    const prevSnapshot = this.undoStack.pop();
    this.redoStack.push(this.currentSnapshot);
    this.currentSnapshot = prevSnapshot;

    if (this.onStateRestore) {
      this.onStateRestore(this.clone(this.currentSnapshot));
    }
    this.notifyChange();
  }

  redo() {
    if (!this.canRedo()) return;

    const nextSnapshot = this.redoStack.pop();
    this.undoStack.push(this.currentSnapshot);
    this.currentSnapshot = nextSnapshot;

    if (this.onStateRestore) {
      this.onStateRestore(this.clone(this.currentSnapshot));
    }
    this.notifyChange();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an active input or textarea
      const target = e.target;
      if (target.tagName === 'INPUT' && target.type === 'text') return;
      if (target.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      }
    });
  }

  notifyChange() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = !this.canUndo();
    if (btnRedo) btnRedo.disabled = !this.canRedo();
  }
}
