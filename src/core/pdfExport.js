import { jsPDF } from 'jspdf';
import { getZoneName } from './textureEngine.js';

// Nearest RAL & Pantone color approximation database for workwear
const RAL_PANTONE_DATABASE = [
  { name: 'Reinorange', hex: '#ff4400', ral: 'RAL 2004', pantone: 'Pantone 021 C' },
  { name: 'Warnorange', hex: '#ea580c', ral: 'RAL 2000', pantone: 'Pantone 151 C' },
  { name: 'Schwarzblau', hex: '#1b2034', ral: 'RAL 5004', pantone: 'Pantone 289 C' },
  { name: 'Nachtblau', hex: '#243249', ral: 'RAL 5013', pantone: 'Pantone 534 C' },
  { name: 'Tiefschwarz', hex: '#1a1a1a', ral: 'RAL 9005', pantone: 'Pantone Black 6 C' },
  { name: 'Stealth Black', hex: '#121316', ral: 'RAL 9011', pantone: 'Pantone Black C' },
  { name: 'Verkehrsweiss', hex: '#ffffff', ral: 'RAL 9016', pantone: 'Pantone Bright White' },
  { name: 'Reinweiss', hex: '#f8fafc', ral: 'RAL 9010', pantone: 'Pantone 11-0601 TPG' },
  { name: 'Blaugrau', hex: '#5b6c84', ral: 'RAL 7031', pantone: 'Pantone 7545 C' },
  { name: 'Schiefergrau', hex: '#475569', ral: 'RAL 7015', pantone: 'Pantone 432 C' },
  { name: 'Anthrazitgrau', hex: '#272d33', ral: 'RAL 7016', pantone: 'Pantone 447 C' },
  { name: 'Verkehrsrot', hex: '#dc2626', ral: 'RAL 3020', pantone: 'Pantone 485 C' },
  { name: 'Ultramarinblau', hex: '#1d4ed8', ral: 'RAL 5002', pantone: 'Pantone 286 C' },
  { name: 'Signalgelb', hex: '#f5ce32', ral: 'RAL 1003', pantone: 'Pantone 116 C' },
  { name: 'Leuchtgelb', hex: '#84cc16', ral: 'RAL 1026', pantone: 'Pantone 809 C' },
  { name: 'Schokoladenbraun', hex: '#3d2514', ral: 'RAL 8017', pantone: 'Pantone 462 C' },
  { name: 'Graubeige / Sand', hex: '#8c7355', ral: 'RAL 1019', pantone: 'Pantone 7531 C' }
];

export function getClosestColorSpec(hexColor) {
  if (!hexColor) return { ral: 'RAL 9005', pantone: 'Pantone Black C', hex: '#1a1a1a' };
  const cleanHex = hexColor.trim().toLowerCase();
  
  const parseHex = (h) => {
    let hex = h.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  try {
    const target = parseHex(cleanHex);
    let closest = RAL_PANTONE_DATABASE[0];
    let minDistance = Infinity;

    for (const item of RAL_PANTONE_DATABASE) {
      const current = parseHex(item.hex);
      const dist = Math.sqrt(
        Math.pow(target.r - current.r, 2) +
        Math.pow(target.g - current.g, 2) +
        Math.pow(target.b - current.b, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = item;
      }
    }
    return {
      hex: cleanHex.toUpperCase(),
      name: closest.name,
      ral: closest.ral,
      pantone: closest.pantone
    };
  } catch (e) {
    return { hex: cleanHex.toUpperCase(), name: 'Sonderfarbe', ral: 'Individuell', pantone: 'Individuell' };
  }
}

/**
 * Add a subtle watermark over an image context
 */
function applyWatermark(dataUrl, watermarkText = 'SOBRAL WORKWEAR') {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Semi-transparent angled watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = `bold ${Math.round(canvas.width * 0.055)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText + ' • PRODUKTIONSMUSTER', 0, 0);

      // Border frame around render
      ctx.restore();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Generate a complete print-ready PDF specification sheet
 */
export async function generateProductionPdf(viewer, state, sizeMatrix = null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  // Capture 4 mockup angles
  const [rawFront, rawBack, rawLeft, rawRight] = await Promise.all([
    viewer.captureAngle('front', 800, 800, true),
    viewer.captureAngle('back', 800, 800, true),
    viewer.captureAngle('left', 800, 800, true),
    viewer.captureAngle('right', 800, 800, true)
  ]);

  const [frontUrl, backUrl, leftUrl, rightUrl] = await Promise.all([
    applyWatermark(rawFront),
    applyWatermark(rawBack),
    applyWatermark(rawLeft),
    applyWatermark(rawRight)
  ]);

  // Page 1: Header, 4 Mockup Views, Colors & Materials, and Size Matrix
  // Header Bar (Dark Navy #121620)
  doc.setFillColor(18, 22, 32);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Orange Accent line
  doc.setFillColor(255, 68, 0);
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SOBRAL WORKWEAR • PRODUKTIONS-SPEZIFIKATION', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 205, 220);
  const prodName = state.activeProduct?.name || 'Spezialanfertigung';
  const artNumber = state.activeProduct?.articleNumber || state.activeProduct?.id || 'SOB-WORKWEAR';
  const timestamp = new Date().toLocaleDateString('de-CH') + ' ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Artikel: ${artNumber} - ${prodName} | Datum: ${timestamp} | Freigabe-Muster`, margin, 18);

  // SECTION 1: 4 MOCKUP RENDERS (Front, Back, Left, Right)
  let curY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 22, 32);
  doc.text('1. 3D-ANSICHTEN / MOCKUP-FREIGABE (4 PERSPEKTIVEN)', margin, curY);

  curY += 3;
  const imgBoxW = (contentWidth - 6) / 4; // ~44 mm each
  const imgBoxH = 48; // mm

  const views = [
    { label: 'FRONT', url: frontUrl },
    { label: 'RÜCKEN', url: backUrl },
    { label: 'LINKS', url: leftUrl },
    { label: 'RECHTS', url: rightUrl }
  ];

  views.forEach((v, idx) => {
    const x = margin + idx * (imgBoxW + 2);
    // Dark background box
    doc.setFillColor(22, 26, 36);
    doc.roundedRect(x, curY, imgBoxW, imgBoxH, 1.5, 1.5, 'F');
    // Add image
    doc.addImage(v.url, 'JPEG', x + 1, curY + 1, imgBoxW - 2, imgBoxH - 6);
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(v.label, x + imgBoxW / 2, curY + imgBoxH - 2, { align: 'center' });
  });

  curY += imgBoxH + 6;

  // SECTION 2: COLOR & MATERIAL SPECIFICATION TABLE (HEX / RAL / Pantone)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 22, 32);
  doc.text('2. FARB- UND MATERIAL-SPEZIFIKATION (HEX / RAL / PANTONE)', margin, curY);
  curY += 3;

  // Component breakdown
  const components = [];
  const prod = state.activeProduct || {};
  const isWorker = prod.silhouette === 'worker' || prod.articleNumber === 'WORKER-PRO';

  if (isWorker) {
    components.push({ part: 'Schutzhelm (KASK)', hex: state.colors.helmet || '#ffffff' });
    components.push({ part: 'Arbeitsjacke (Body/Ärmel)', hex: state.colors.primary || '#243249' });
    components.push({ part: 'Arbeitshose (Beine)', hex: state.colors.trousers || '#1b2034' });
    components.push({ part: 'Arbeitsschuhe (S3)', hex: state.colors.boots || '#1a1a1a' });
  } else if (prod.silhouette === 'helmet' || prod.articleNumber === 'WHE00113') {
    components.push({ part: 'Helmschale (Outer Shell)', hex: state.colors.primary || '#ffffff' });
    components.push({ part: 'Belüftungseinsätze / Krone', hex: state.colors.accent || '#ff4400' });
    components.push({ part: 'Kinnriemen / Befestigung', hex: state.colors.collar || '#1b2034' });
  } else if (prod.silhouette === 'trousers' || prod.articleNumber === '1750') {
    components.push({ part: 'Hauptgewebe (Hose)', hex: state.colors.primary || '#1b2034' });
    components.push({ part: 'Knieverstärkung & Stretch', hex: state.colors.accent || '#ff4400' });
    components.push({ part: 'Bund / Akzente', hex: state.colors.collar || '#1b2034' });
  } else {
    components.push({ part: 'Hauptkörper (Body)', hex: state.colors.primary || '#1b2034' });
    components.push({ part: 'Akzente / Schultern', hex: state.colors.accent || '#ff4400' });
    components.push({ part: 'Kragen / Bündchen', hex: state.colors.collar || '#1b2034' });
  }

  // Draw Table Header
  const colW = [50, 32, 45, 55]; // sum = 182 mm
  doc.setFillColor(240, 243, 248);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 70);
  doc.text('KOMPONENTE / BAUTEIL', margin + 3, curY + 4.2);
  doc.text('HEX-CODE', margin + colW[0] + 3, curY + 4.2);
  doc.text('RAL-REFERENZ', margin + colW[0] + colW[1] + 3, curY + 4.2);
  doc.text('PANTONE-REFERENZ / FARBNAME', margin + colW[0] + colW[1] + colW[2] + 3, curY + 4.2);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  components.forEach((c) => {
    const spec = getClosestColorSpec(c.hex);
    // Alternating row or border
    doc.setDrawColor(230, 233, 240);
    doc.line(margin, curY + 6.5, margin + contentWidth, curY + 6.5);

    // Color swatch
    doc.setFillColor(spec.hex);
    doc.rect(margin + 2, curY + 1.2, 4.5, 4.5, 'FD');

    doc.setTextColor(20, 25, 35);
    doc.text(c.part, margin + 9, curY + 4.5);
    doc.text(spec.hex, margin + colW[0] + 3, curY + 4.5);
    doc.text(spec.ral, margin + colW[0] + colW[1] + 3, curY + 4.5);
    doc.text(`${spec.pantone} (${spec.name})`, margin + colW[0] + colW[1] + colW[2] + 3, curY + 4.5);

    curY += 6.5;
  });

  curY += 4;

  // SECTION 3: EXACT LOGO & GRAPHICS PLACEMENT TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 22, 32);
  doc.text('3. LOGO- & DRUCKPOSITIONEN (EXAKTE KOORDINATEN & DIMENSIONEN)', margin, curY);
  curY += 3;

  const logoColW = [42, 45, 38, 32, 25]; // sum = 182 mm
  doc.setFillColor(240, 243, 248);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 70);
  doc.text('GRAFIK / MOTIV', margin + 3, curY + 4.2);
  doc.text('PLATZIERUNGSZONE', margin + logoColW[0] + 3, curY + 4.2);
  doc.text('OFFSET (X / Y)', margin + logoColW[0] + logoColW[1] + 3, curY + 4.2);
  doc.text('BREITE x HÖHE (CA.)', margin + logoColW[0] + logoColW[1] + logoColW[2] + 3, curY + 4.2);
  doc.text('STATUS', margin + logoColW[0] + logoColW[1] + logoColW[2] + logoColW[3] + 3, curY + 4.2);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const activeLogos = (state.logos || []).filter(l => l.visible);
  const activeTexts = (state.texts || []).filter(tItem => tItem.visible && tItem.text);

  if (activeLogos.length === 0 && activeTexts.length === 0) {
    doc.setTextColor(120, 130, 145);
    doc.text('Keine kundenspezifischen Logos oder Texte platziert (Blanko-Freigabe).', margin + 3, curY + 5);
    curY += 7;
  } else {
    activeLogos.forEach(logo => {
      const zoneName = prod.zones?.[logo.zone]?.name || getZoneName(logo.zone);
      const offXmm = Math.round((logo.offsetX || 0) * 0.5); // approx mm
      const offYmm = Math.round((logo.offsetY || 0) * 0.5);
      const scalePct = Math.round((logo.scale || 1.0) * 100);
      const estWidthCm = ((logo.scale || 1.0) * 8.5).toFixed(1);
      const estHeightCm = ((logo.scale || 1.0) * 5.0).toFixed(1);

      doc.setDrawColor(230, 233, 240);
      doc.line(margin, curY + 7, margin + contentWidth, curY + 7);

      doc.setTextColor(20, 25, 35);
      doc.text(logo.name || 'Kundengrafik', margin + 3, curY + 4.8);
      doc.text(zoneName, margin + logoColW[0] + 3, curY + 4.8);
      doc.text(`X: ${offXmm >= 0 ? '+' : ''}${offXmm} mm | Y: ${offYmm >= 0 ? '+' : ''}${offYmm} mm`, margin + logoColW[0] + logoColW[1] + 3, curY + 4.8);
      doc.text(`${estWidthCm} x ${estHeightCm} cm (${scalePct}%)`, margin + logoColW[0] + logoColW[1] + logoColW[2] + 3, curY + 4.8);
      doc.setTextColor(255, 68, 0);
      doc.text('Vektordruck', margin + logoColW[0] + logoColW[1] + logoColW[2] + logoColW[3] + 3, curY + 4.8);

      curY += 7.5;
    });

    activeTexts.forEach(txt => {
      const zoneName = prod.zones?.[txt.zone]?.name || getZoneName(txt.zone);
      const offXmm = Math.round((txt.offsetX || 0) * 0.5);
      const offYmm = Math.round((txt.offsetY || 0) * 0.5);

      doc.setDrawColor(230, 233, 240);
      doc.line(margin, curY + 7, margin + contentWidth, curY + 7);

      doc.setTextColor(20, 25, 35);
      doc.text(`Text: "${txt.text}"`, margin + 3, curY + 4.8);
      doc.text(zoneName, margin + logoColW[0] + 3, curY + 4.8);
      doc.text(`X: ${offXmm >= 0 ? '+' : ''}${offXmm} mm | Y: ${offYmm >= 0 ? '+' : ''}${offYmm} mm`, margin + logoColW[0] + logoColW[1] + 3, curY + 4.8);
      doc.text(`Farbe: ${txt.color}`, margin + logoColW[0] + logoColW[1] + logoColW[2] + 3, curY + 4.8);
      doc.setTextColor(30, 130, 60);
      doc.text('Stick / Flock', margin + logoColW[0] + logoColW[1] + logoColW[2] + logoColW[3] + 3, curY + 4.8);

      curY += 7.5;
    });
  }

  curY += 4;

  // SECTION 4: SIZE & QUANTITY MATRIX TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 22, 32);
  doc.text('4. MENGEN- UND GRÖSSENMATRIX (STÜCKZAHLEN PRO GRÖSSE)', margin, curY);
  curY += 3;

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'TOTAL'];
  const sizeColW = contentWidth / sizes.length; // ~20.2 mm each

  // Header
  doc.setFillColor(240, 243, 248);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 70);

  sizes.forEach((s, idx) => {
    doc.text(s, margin + idx * sizeColW + sizeColW / 2, curY + 4.2, { align: 'center' });
  });

  curY += 6;

  // Values row
  const matrix = sizeMatrix || {
    XS: 0, S: 5, M: 15, L: 20, XL: 15, '2XL': 10, '3XL': 2, '4XL': 0
  };
  const total = Object.values(matrix).reduce((a, b) => (parseInt(a) || 0) + (parseInt(b) || 0), 0);

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, curY, contentWidth, 7, 'F');
  doc.setDrawColor(200, 205, 220);
  doc.rect(margin, curY, contentWidth, 7, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 25, 35);

  sizes.forEach((s, idx) => {
    const val = s === 'TOTAL' ? total : (matrix[s] !== undefined ? matrix[s] : '-');
    if (s === 'TOTAL') doc.setTextColor(255, 68, 0);
    else doc.setTextColor(20, 25, 35);
    doc.text(String(val), margin + idx * sizeColW + sizeColW / 2, curY + 4.8, { align: 'center' });
  });

  curY += 12;

  // SECTION 5: APPROVAL & SIGN-OFF BOX
  doc.setDrawColor(220, 224, 235);
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(margin, curY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 50, 70);
  doc.text('PRODUKTIONSFREIGABE & UNTERSCHRIFT:', margin + 4, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 100, 120);
  doc.text('Mit Ihrer Freigabe bestätigen Sie die Richtigkeit der angegebenen Farben (RAL/Pantone), Positionen und Abmessungen.', margin + 4, curY + 9);

  doc.text('Datum / Ort: ___________________________', margin + 4, curY + 18);
  doc.text('Unterschrift Kunde: ___________________________', margin + 95, curY + 18);

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 145, 160);
  doc.text('Sobral AG • Industriestrasse • CH-Schweiz • www.sobral.ch • Vertrauliche Produktionsspezifikation', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc;
}

/**
 * Trigger browser download of the generated PDF
 */
export async function downloadProductionPdf(viewer, state, sizeMatrix = null) {
  const doc = await generateProductionPdf(viewer, state, sizeMatrix);
  const safeTitle = (state.activeProduct?.name || 'Sobral_Workwear').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeTitle}_Produktions_Spezifikation.pdf`;
  doc.save(filename);
  return filename;
}
