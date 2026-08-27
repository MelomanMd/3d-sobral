import * as THREE from 'three';
import { PATTERNS } from './patterns.js';
import { t } from './i18n.js';

export const PLACEMENT_ZONES = {
  chest_center: { name: 'Brustmitte', u: 0.26, v: 0.23, defaultScale: 1.0, isFront: true },
  chest_left: { name: 'Linke Brust (Wappen)', u: 0.33, v: 0.19, defaultScale: 0.5, isFront: true },
  chest_right: { name: 'Rechte Brust', u: 0.18, v: 0.19, defaultScale: 0.5, isFront: true },
  back_top: { name: 'Rücken: Name', u: 0.75, v: 0.14, defaultScale: 0.8, isFront: false },
  back_number: { name: 'Rücken: Nummer', u: 0.75, v: 0.27, defaultScale: 1.3, isFront: false },
  back_center: { name: 'Rücken: Sponsor / Mitte', u: 0.75, v: 0.22, defaultScale: 1.0, isFront: false },
  sleeve_left: { name: 'Linker Ärmel', u: 0.57, v: 0.75, defaultScale: 0.6, isFront: false },
  sleeve_right: { name: 'Rechter Ärmel', u: 0.14, v: 0.75, defaultScale: 0.6, isFront: true }
};

export function getZoneName(zoneKey) {
  return t(`zone_${zoneKey}`) || PLACEMENT_ZONES[zoneKey]?.name || zoneKey;
}

export class TextureEngine {
  constructor(size = 2048) {
    this.size = size;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.imageElementCache = new Map();
    this.processedPhotoCache = new Map();
    this.baseModelTexture = null;
  }

  setBaseModelTexture(textureImg) {
    this.baseModelTexture = textureImg;
  }

  getTexture() {
    return this.texture;
  }

  async loadImage(src) {
    if (!src) return null;
    if (this.imageElementCache.has(src)) {
      return this.imageElementCache.get(src);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageElementCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn('Failed to load image:', src);
        resolve(null);
      };
      img.src = src;
    });
  }

  async getProcessedPhotoCanvas(src) {
    if (!src) return null;
    if (this.processedPhotoCache.has(src)) {
      return this.processedPhotoCache.get(src);
    }

    const img = await this.loadImage(src);
    if (!img) return null;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample background color from top-left corner
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is background (near white or near corner color)
        const isWhite = r > 238 && g > 238 && b > 238;
        const distCorner = Math.sqrt((bgR - r) ** 2 + (bgG - g) ** 2 + (bgB - b) ** 2);
        const isCornerBg = (bgR > 220 || bgG > 220 || bgB > 220) && distCorner < 45;

        if (isWhite || isCornerBg) {
          data[i + 3] = 0; // Cutout background cleanly
        } else if (r > 220 && g > 220 && b > 220) {
          // Feathered edge for smooth transition
          const feather = Math.min((255 - r) / 35, (255 - g) / 35, (255 - b) / 35);
          data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, feather)));
        }
      }

      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Canvas image processing fallback:', e);
    }

    this.processedPhotoCache.set(src, canvas);
    return canvas;
  }

  async render(state, options = {}) {
    const {
      colors,
      patternId,
      texts = [],
      logos = [],
      selectedItemId = null
    } = state;
    const { hideSelection = false } = options;
    const ctx = this.ctx;
    const w = this.size;
    const h = this.size;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Pattern & Colors (Solid, Raglan, Vexa, Racing, Gradient)
    const pattern = PATTERNS.find(p => p.id === patternId) || PATTERNS[0];
    pattern.render(ctx, w, h, colors);

    // 1.5. Project authentic product photos onto 3D model if uploaded
    if (state.productFrontPhoto) {
      const frontPhotoCanvas = await this.getProcessedPhotoCanvas(state.productFrontPhoto);
      if (frontPhotoCanvas) {
        ctx.drawImage(frontPhotoCanvas, w * 0.04, h * 0.07, w * 0.42, h * 0.42);
      }
    }

    if (state.productBackPhoto) {
      const backPhotoCanvas = await this.getProcessedPhotoCanvas(state.productBackPhoto);
      if (backPhotoCanvas) {
        ctx.drawImage(backPhotoCanvas, w * 0.54, h * 0.07, w * 0.42, h * 0.42);
      }
    }

    if (state.productLeftPhoto) {
      const leftPhotoCanvas = await this.getProcessedPhotoCanvas(state.productLeftPhoto);
      if (leftPhotoCanvas) {
        ctx.drawImage(leftPhotoCanvas, w * 0.04, h * 0.53, w * 0.18, h * 0.18);
      }
    }

    if (state.productRightPhoto) {
      const rightPhotoCanvas = await this.getProcessedPhotoCanvas(state.productRightPhoto);
      if (rightPhotoCanvas) {
        ctx.drawImage(rightPhotoCanvas, w * 0.47, h * 0.53, w * 0.18, h * 0.18);
      }
    }

    // 2. Draw Custom Logos
    for (const logo of logos) {
      if (!logo.visible) continue;
      await this.drawLogo(ctx, logo, w, h);
    }

    // 3. Draw Custom Texts
    for (const textItem of texts) {
      if (!textItem.visible || !textItem.text.trim()) continue;
      this.drawText(ctx, textItem, w, h);
    }

    // 7. Draw Selection Bounding Box and Resize Handles if an item is selected
    if (selectedItemId && !hideSelection) {
      const selectedText = texts.find(t => t.id === selectedItemId);
      if (selectedText && selectedText.visible) {
        this.drawTextSelectionGizmo(ctx, selectedText, w, h);
      } else {
        const selectedLogo = logos.find(l => l.id === selectedItemId);
        if (selectedLogo && selectedLogo.visible) {
          await this.drawLogoSelectionGizmo(ctx, selectedLogo, w, h);
        }
      }
    }

    // Flag Three.js texture for GPU upload
    this.texture.needsUpdate = true;
  }

  async drawLogo(ctx, logo, w, h) {
    const zone = PLACEMENT_ZONES[logo.zone] || PLACEMENT_ZONES.chest_center;
    const img = await this.loadImage(logo.src);
    if (!img) return;

    const posX = (zone.u + (logo.offsetX || 0) * 0.001) * w;
    const posY = (zone.v + (logo.offsetY || 0) * 0.001) * h;

    const baseSize = w * 0.22 * (zone.defaultScale || 1.0);
    const aspect = img.naturalWidth / (img.naturalHeight || 1);
    let drawW = baseSize * (logo.scale || 1.0);
    let drawH = drawW / aspect;

    ctx.save();
    ctx.translate(posX, posY);
    if (logo.rotation) {
      ctx.rotate((logo.rotation * Math.PI) / 180);
    }
    ctx.globalAlpha = logo.opacity !== undefined ? logo.opacity : 1.0;

    if (logo.tint && logo.tint !== 'original') {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = img.naturalWidth;
      offCanvas.height = img.naturalHeight;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(img, 0, 0);

      offCtx.globalCompositeOperation = 'source-in';
      offCtx.fillStyle = logo.tint;
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

      ctx.drawImage(offCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }

    ctx.restore();
  }

  drawText(ctx, item, w, h) {
    const zone = PLACEMENT_ZONES[item.zone] || PLACEMENT_ZONES.chest_center;
    const posX = (zone.u + (item.offsetX || 0) * 0.001) * w;
    const posY = (zone.v + (item.offsetY || 0) * 0.001) * h;

    const baseFontSize = (item.fontSize || 54) * (w / 1024) * (zone.defaultScale || 1.0);

    ctx.save();
    ctx.translate(posX, posY);

    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    ctx.font = `${item.fontWeight || 'bold'} ${baseFontSize}px ${item.fontFamily || 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = item.uppercase ? item.text.toUpperCase() : item.text;

    if (item.curve && Math.abs(item.curve) > 5) {
      this.drawCurvedText(ctx, text, baseFontSize, item.curve, item);
    } else {
      this.drawDirectText(ctx, text, 0, 0, item);
    }

    ctx.restore();
  }

  drawDirectText(ctx, text, x, y, item) {
    if (item.strokeWidth && item.strokeWidth > 0) {
      ctx.strokeStyle = item.strokeColor || '#000000';
      ctx.lineWidth = item.strokeWidth * (this.size / 1024);
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, x, y);
    }

    ctx.fillStyle = item.color || '#ffffff';
    ctx.fillText(text, x, y);
  }

  drawCurvedText(ctx, text, fontSize, curveAmount, item) {
    const radius = 6000 / Math.abs(curveAmount);
    const direction = curveAmount > 0 ? 1 : -1;

    const chars = text.split('');
    const charWidths = chars.map(c => ctx.measureText(c).width);
    const totalWidth = charWidths.reduce((a, b) => a + b, 0);

    let currentAngle = (-totalWidth / (2 * radius)) * direction;

    ctx.save();
    ctx.translate(0, direction * radius);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const charW = charWidths[i];
      const charAngle = (charW / radius) * direction;

      ctx.save();
      ctx.rotate(currentAngle + charAngle / 2);
      ctx.translate(0, -direction * radius);

      if (item.strokeWidth && item.strokeWidth > 0) {
        ctx.strokeStyle = item.strokeColor || '#000000';
        ctx.lineWidth = item.strokeWidth * (this.size / 1024);
        ctx.lineJoin = 'round';
        ctx.strokeText(char, 0, 0);
      }

      ctx.fillStyle = item.color || '#ffffff';
      ctx.fillText(char, 0, 0);

      ctx.restore();
      currentAngle += charAngle;
    }

    ctx.restore();
  }

  // Draw sleek selection bounding box & 4 corner resize handles
  drawTextSelectionGizmo(ctx, item, w, h) {
    const zone = PLACEMENT_ZONES[item.zone] || PLACEMENT_ZONES.chest_center;
    const posX = (zone.u + (item.offsetX || 0) * 0.001) * w;
    const posY = (zone.v + (item.offsetY || 0) * 0.001) * h;
    const baseFontSize = (item.fontSize || 54) * (w / 1024) * (zone.defaultScale || 1.0);

    ctx.save();
    ctx.font = `${item.fontWeight || 'bold'} ${baseFontSize}px ${item.fontFamily || 'sans-serif'}`;
    const text = item.uppercase ? item.text.toUpperCase() : item.text;
    const metrics = ctx.measureText(text);
    const boxW = metrics.width + 36;
    const boxH = baseFontSize * 1.35 + 24;

    ctx.translate(posX, posY);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    this.renderGizmoBox(ctx, boxW, boxH);
    ctx.restore();
  }

  async drawLogoSelectionGizmo(ctx, item, w, h) {
    const zone = PLACEMENT_ZONES[item.zone] || PLACEMENT_ZONES.chest_center;
    const img = await this.loadImage(item.src);
    if (!img) return;

    const posX = (zone.u + (item.offsetX || 0) * 0.001) * w;
    const posY = (zone.v + (item.offsetY || 0) * 0.001) * h;

    const baseSize = w * 0.22 * (zone.defaultScale || 1.0);
    const aspect = img.naturalWidth / (img.naturalHeight || 1);
    const drawW = baseSize * (item.scale || 1.0);
    const drawH = drawW / aspect;

    const boxW = drawW + 28;
    const boxH = drawH + 28;

    ctx.save();
    ctx.translate(posX, posY);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    this.renderGizmoBox(ctx, boxW, boxH);
    ctx.restore();
  }

  renderGizmoBox(ctx, boxW, boxH) {
    const halfW = boxW / 2;
    const halfH = boxH / 2;

    // Glowing selection border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(-halfW, -halfH, boxW, boxH);

    // Subtle background tint
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(-halfW, -halfH, boxW, boxH);

    // Corner resize handles
    ctx.setLineDash([]);
    const handleSize = 18;
    const corners = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH }
    ];

    corners.forEach(c => {
      // White box with blue border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    });

    // Top rotation stem handle
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, -halfH - 24);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -halfH - 24, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Get item bounds and handle positions in UV space
  getItemUVBounds(item, type = 'text') {
    const zone = PLACEMENT_ZONES[item.zone] || PLACEMENT_ZONES.chest_center;
    const centerU = zone.u + (item.offsetX || 0) * 0.001;
    const centerV = zone.v + (item.offsetY || 0) * 0.001;

    let halfW = 0.08;
    let halfH = 0.04;

    if (type === 'text') {
      const textLen = Math.max(item.text.length, 2);
      halfW = (item.fontSize * 0.00045 * (zone.defaultScale || 1.0) * textLen) / 2 + 0.025;
      halfH = (item.fontSize * 0.00065 * (zone.defaultScale || 1.0)) / 2 + 0.02;
    } else {
      halfW = (0.12 * (item.scale || 1.0) * (zone.defaultScale || 1.0)) / 2 + 0.02;
      halfH = halfW;
    }

    return { centerU, centerV, halfW, halfH };
  }

  // Check if UV is over a resize corner handle of the active item
  findHandleAtUV(u, v, item, type = 'text') {
    if (!item) return null;
    const { centerU, centerV, halfW, halfH } = this.getItemUVBounds(item, type);

    const handleRadius = 0.024;
    const corners = [
      { name: 'tl', u: centerU - halfW, v: centerV - halfH },
      { name: 'tr', u: centerU + halfW, v: centerV - halfH },
      { name: 'br', u: centerU + halfW, v: centerV + halfH },
      { name: 'bl', u: centerU - halfW, v: centerV + halfH },
      { name: 'rot', u: centerU, v: centerV - halfH - 0.025 }
    ];

    for (const c of corners) {
      const dist = Math.hypot(u - c.u, v - c.v);
      if (dist <= handleRadius) {
        return c.name;
      }
    }
    return null;
  }

  // Find if a UV coordinate is over any text item
  findTextAtUV(u, v, texts = []) {
    for (let i = texts.length - 1; i >= 0; i--) {
      const item = texts[i];
      if (!item.visible || !item.text.trim()) continue;

      const { centerU, centerV, halfW, halfH } = this.getItemUVBounds(item, 'text');
      if (Math.abs(u - centerU) <= halfW + 0.015 && Math.abs(v - centerV) <= halfH + 0.015) {
        return item;
      }
    }
    return null;
  }

  // Find if a UV coordinate is over any logo item
  findLogoAtUV(u, v, logos = []) {
    for (let i = logos.length - 1; i >= 0; i--) {
      const item = logos[i];
      if (!item.visible) continue;

      const { centerU, centerV, halfW, halfH } = this.getItemUVBounds(item, 'logo');
      if (Math.abs(u - centerU) <= halfW + 0.015 && Math.abs(v - centerV) <= halfH + 0.015) {
        return item;
      }
    }
    return null;
  }

  toDataURL(type = 'image/png', quality = 0.95) {
    return this.canvas.toDataURL(type, quality);
  }
}
