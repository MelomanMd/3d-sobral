import { resolveAssetUrl } from './products.js';

let cachedLogoPromise = null;

function loadWatermarkLogo() {
  if (!cachedLogoPromise) {
    cachedLogoPromise = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = resolveAssetUrl('/images/sobral-workwear-logo.svg');
    });
  }
  return cachedLogoPromise;
}

function loadImageDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function drawStageBackground(ctx, width, height, watermarkImg) {
  // Match .configurator-modal-window .viewport-area radial stage gradient
  ctx.fillStyle = '#18191f';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const centerX = width * 0.5;
  const centerY = height * 0.95;
  const maxRadius = Math.max(width, height) * 0.72;
  ctx.translate(centerX, centerY);
  ctx.scale(1.1, 0.7);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
  grad.addColorStop(0.0, '#b53205');
  grad.addColorStop(0.32, '#611b02');
  grad.addColorStop(0.72, '#1e1f26');
  grad.addColorStop(1.0, '#18191f');
  ctx.fillStyle = grad;
  ctx.fillRect(-width, -height * 2, width * 2, height * 2.5);
  ctx.restore();

  if (watermarkImg && watermarkImg.width && watermarkImg.height) {
    const logoWidth = width * 0.58;
    const aspect = watermarkImg.height / watermarkImg.width;
    const logoHeight = logoWidth * aspect;
    const x = (width - logoWidth) / 2;
    const y = (height - logoHeight) / 2 + height * 0.11;

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.filter = 'contrast(160%) brightness(140%)';
    ctx.drawImage(watermarkImg, x, y, logoWidth, logoHeight);
    ctx.restore();
  }
}

/**
 * Composites a transparent 3D model snapshot onto the dark Sobral stage background
 * with the subtle Sobral watermark logo behind the product.
 */
export async function compositeBrandedExport(modelDataUrl, options = {}) {
  const { mimeType = 'image/png', quality = 0.94, width = null, height = null } = options;
  const [modelImg, watermarkImg] = await Promise.all([
    loadImageDataUrl(modelDataUrl),
    loadWatermarkLogo()
  ]);

  const outWidth = width || modelImg.naturalWidth || modelImg.width || 1920;
  const outHeight = height || modelImg.naturalHeight || modelImg.height || 1920;

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');

  drawStageBackground(ctx, outWidth, outHeight, watermarkImg);
  ctx.drawImage(modelImg, 0, 0, outWidth, outHeight);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  const dataUrl = canvas.toDataURL(mimeType, quality);
  return { blob, dataUrl, width: outWidth, height: outHeight };
}

