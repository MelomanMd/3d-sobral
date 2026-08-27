import { PLACEMENT_ZONES } from '../core/textureEngine.js';

export class PhotoMockupViewer {
  constructor(containerElement, getStateFn, onStateChangeFn) {
    this.container = containerElement;
    this.getState = getStateFn;
    this.onStateChange = onStateChangeFn;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'photo-mockup-canvas';
    this.ctx = this.canvas.getContext('2d');

    this.currentAngle = 'front'; // 'front' or 'back'
    this.active = false;
    this.selectedItem = null;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.itemStartOffset = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.canvas.width = 1200;
    this.canvas.height = 1200;
    this.canvas.style.display = 'none';
    this.container.appendChild(this.canvas);

    this.bindEvents();
  }

  setActive(active, angle = 'front') {
    this.active = active;
    this.currentAngle = angle;
    this.canvas.style.display = active ? 'block' : 'none';
    if (active) {
      this.render();
    }
  }

  setAngle(angle) {
    this.currentAngle = angle;
    if (this.active) {
      this.render();
    }
  }

  async render() {
    if (!this.active) return;
    const state = this.getState();
    const activeProduct = state.activeProduct || {};
    let photoUrl = null;
    if (this.currentAngle === 'front') photoUrl = activeProduct.frontPreview;
    else if (this.currentAngle === 'back') photoUrl = activeProduct.backPreview;
    else if (this.currentAngle === 'left') photoUrl = activeProduct.leftPreview;
    else if (this.currentAngle === 'right') photoUrl = activeProduct.rightPreview;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (photoUrl) {
      const img = await this.loadImage(photoUrl);
      if (img) {
        // Draw background photo fitted
        ctx.drawImage(img, 0, 0, w, h);
      }
    } else {
      // Solid fallback background
      ctx.fillStyle = state.colors?.primary || '#1a2035';
      ctx.fillRect(0, 0, w, h);
    }

    const isFrontView = this.currentAngle === 'front';

    // 1. Draw Logos that match the current view
    const logos = state.logos || [];
    for (const logo of logos) {
      if (!logo.visible) continue;
      const zone = PLACEMENT_ZONES[logo.zone] || PLACEMENT_ZONES.chest_center;
      if (zone.isFront !== isFrontView) continue;

      await this.drawLogoOnPhoto(ctx, logo, w, h, zone);
    }

    // 2. Draw Texts that match the current view
    const texts = state.texts || [];
    for (const textItem of texts) {
      if (!textItem.visible || !textItem.text?.trim()) continue;
      const zone = PLACEMENT_ZONES[textItem.zone] || PLACEMENT_ZONES.chest_center;
      if (zone.isFront !== isFrontView) continue;

      this.drawTextOnPhoto(ctx, textItem, w, h, zone);
    }

    // 3. Draw Selection Highlight if active in 2D mode
    if (state.selectedItemId) {
      const isText = texts.some(t => t.id === state.selectedItemId);
      const item = isText ? texts.find(t => t.id === state.selectedItemId) : logos.find(l => l.id === state.selectedItemId);
      if (item && item.visible) {
        const zone = PLACEMENT_ZONES[item.zone] || PLACEMENT_ZONES.chest_center;
        if (zone.isFront === isFrontView) {
          this.drawSelectionBox(ctx, item, isText, w, h, zone);
        }
      }
    }
  }

  async drawLogoOnPhoto(ctx, logo, w, h, zone) {
    const img = await this.loadImage(logo.src);
    if (!img) return;

    // Center coordinates relative to photo chest / back
    const baseCenterX = isNaN(zone.u) ? 0.5 * w : (zone.isFront ? (zone.u / 0.5) * w : ((zone.u - 0.5) / 0.5) * w);
    const baseCenterY = isNaN(zone.v) ? 0.35 * h : (zone.v / 0.5) * h;

    const posX = baseCenterX + (logo.offsetX || 0) * 0.8;
    const posY = baseCenterY + (logo.offsetY || 0) * 0.8;

    const baseSize = w * 0.18 * (zone.defaultScale || 1.0);
    const aspect = img.naturalWidth / (img.naturalHeight || 1);
    let drawW = baseSize * (logo.scale || 1.0);
    let drawH = drawW / aspect;

    ctx.save();
    ctx.translate(posX, posY);
    if (logo.rotation) {
      ctx.rotate((logo.rotation * Math.PI) / 180);
    }
    ctx.globalAlpha = logo.opacity !== undefined ? logo.opacity : 1.0;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  drawTextOnPhoto(ctx, textItem, w, h, zone) {
    const baseCenterX = isNaN(zone.u) ? 0.5 * w : (zone.isFront ? (zone.u / 0.5) * w : ((zone.u - 0.5) / 0.5) * w);
    const baseCenterY = isNaN(zone.v) ? 0.35 * h : (zone.v / 0.5) * h;

    const posX = baseCenterX + (textItem.offsetX || 0) * 0.8;
    const posY = baseCenterY + (textItem.offsetY || 0) * 0.8;

    const fontSize = (textItem.fontSize || 50) * 1.0;
    const textStr = textItem.uppercase ? textItem.text.toUpperCase() : textItem.text;

    ctx.save();
    ctx.translate(posX, posY);
    if (textItem.rotation) {
      ctx.rotate((textItem.rotation * Math.PI) / 180);
    }

    ctx.font = `${textItem.fontWeight || 'bold'} ${fontSize}px ${textItem.fontFamily || 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (textItem.strokeWidth && textItem.strokeWidth > 0) {
      ctx.strokeStyle = textItem.strokeColor || '#000000';
      ctx.lineWidth = textItem.strokeWidth * 1.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(textStr, 0, 0);
    }

    ctx.fillStyle = textItem.color || '#ffffff';
    ctx.fillText(textStr, 0, 0);
    ctx.restore();
  }

  drawSelectionBox(ctx, item, isText, w, h, zone) {
    const baseCenterX = isNaN(zone.u) ? 0.5 * w : (zone.isFront ? (zone.u / 0.5) * w : ((zone.u - 0.5) / 0.5) * w);
    const baseCenterY = isNaN(zone.v) ? 0.35 * h : (zone.v / 0.5) * h;
    const posX = baseCenterX + (item.offsetX || 0) * 0.8;
    const posY = baseCenterY + (item.offsetY || 0) * 0.8;

    ctx.save();
    ctx.translate(posX, posY);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    const boxW = isText ? (item.text.length * (item.fontSize || 50) * 0.65 + 30) : 180 * (item.scale || 1.0);
    const boxH = isText ? ((item.fontSize || 50) + 30) : 180 * (item.scale || 1.0);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

    ctx.restore();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
      const clickY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

      const state = this.getState();
      const isFrontView = this.currentAngle === 'front';

      // Hit-test texts
      for (const textItem of state.texts || []) {
        if (!textItem.visible) continue;
        const zone = PLACEMENT_ZONES[textItem.zone] || PLACEMENT_ZONES.chest_center;
        if (zone.isFront !== isFrontView) continue;

        state.selectedItemId = textItem.id;
        this.isDragging = true;
        this.dragStart = { x: clickX, y: clickY };
        this.itemStartOffset = { x: textItem.offsetX || 0, y: textItem.offsetY || 0 };
        this.render();
        if (this.onStateChange) this.onStateChange();
        return;
      }

      // Hit-test logos
      for (const logo of state.logos || []) {
        if (!logo.visible) continue;
        const zone = PLACEMENT_ZONES[logo.zone] || PLACEMENT_ZONES.chest_center;
        if (zone.isFront !== isFrontView) continue;

        state.selectedItemId = logo.id;
        this.isDragging = true;
        this.dragStart = { x: clickX, y: clickY };
        this.itemStartOffset = { x: logo.offsetX || 0, y: logo.offsetY || 0 };
        this.render();
        if (this.onStateChange) this.onStateChange();
        return;
      }

      state.selectedItemId = null;
      this.render();
      if (this.onStateChange) this.onStateChange();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.active) return;
      const rect = this.canvas.getBoundingClientRect();
      const curX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
      const curY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

      const deltaX = (curX - this.dragStart.x) * 1.25;
      const deltaY = (curY - this.dragStart.y) * 1.25;

      const state = this.getState();
      const selectedId = state.selectedItemId;
      const item = state.texts.find(t => t.id === selectedId) || state.logos.find(l => l.id === selectedId);

      if (item) {
        item.offsetX = Math.round(this.itemStartOffset.x + deltaX);
        item.offsetY = Math.round(this.itemStartOffset.y + deltaY);
        this.render();
        if (this.onStateChange) this.onStateChange();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });
  }

  loadImage(src) {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
}
