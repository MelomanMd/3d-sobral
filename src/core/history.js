// Undo / Redo History Manager for 3D Customizer

export class HistoryManager {
  constructor(initialState, onStateRestore) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 40;
    this.onStateRestore = onStateRestore;

    // Push initial snapshot
    this.currentSnapshot = this.clone(initialState);

    this.initKeyboardShortcuts();
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  push(state) {
    const newSnapshot = this.clone(state);
    // Ignore if identical to current snapshot
    if (JSON.stringify(newSnapshot) === JSON.stringify(this.currentSnapshot)) {
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
