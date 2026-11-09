import { jsPDF } from 'jspdf';
import { getZoneName } from './textureEngine.js';
import { PATTERNS } from './patterns.js';
import { captureProductionReport } from './productionReport.js';

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
  const hex = /^#[0-9a-f]{6}$/i.test(hexColor || '') ? hexColor : '#1a1a1a';
  const rgb = value => [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));
  const target = rgb(hex);
  const closest = RAL_PANTONE_DATABASE.reduce((best, item) => {
    const distance = rgb(item.hex).reduce((sum, value, index) => sum + (value - target[index]) ** 2, 0);
    return distance < best.distance ? { item, distance } : best;
  }, { item: RAL_PANTONE_DATABASE[0], distance: Infinity }).item;
  return { ...closest, hex: hex.toUpperCase() };
}

export async function generateProductionPdf(viewer, state, sizeMatrix = null) {
  // Snapshot the same configuration used by both the render and the tables.
  const snapshot = structuredClone(state);
  const usesMaterials = viewer.isMultiMesh;
  const materialControls = viewer.getColorControls().map(control => ({ ...control }));
  const report = await captureProductionReport(viewer, snapshot);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const margin = 14, width = 182;
  let y = 0;
  const product = snapshot.activeProduct || {};
  const title = product.name || 'SOBRAL Workwear';
  const header = subtitle => {
    doc.setFillColor(18, 22, 32);
    doc.rect(0, 0, 210, 27, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SOBRAL - PLATZIERUNGSPLAN', margin, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(title, width).slice(0, 2), margin, 16);
    doc.setTextColor(20, 25, 35);
    doc.setFontSize(10);
    doc.text(subtitle, margin, 34);
    y = 40;
  };
  const ensure = height => {
    if (y + height <= 278) return;
    doc.addPage();
    header('FORTSETZUNG - MODELLREFERENZ');
  };
  const text = (value, size = 8, color = [35, 45, 60]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(value), width);
    for (const line of lines) {
      ensure(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
  };
  const section = value => {
    ensure(12);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(18, 22, 32);
    doc.text(value, margin, y);
    y += 6;
  };
  header('KONFIGURATION & UEBERSICHT');
  text(`Artikel: ${product.articleNumber || product.sku || product.id || '-'} | ${new Date().toLocaleString('de-CH')}`);
  text('MODELLREFERENZ - NICHT PHYSISCH KALIBRIERT', 9, [190, 55, 20]);
  text('Positionen beziehen sich auf die orthografische Projektion der aktuellen 3D-Geometrie. Keine erfundenen mm/cm. Fuer die Fertigung sind reale Masse und Bezugspunkte am ausgewaehlten Artikel separat zu bestaetigen.');

  const thumb = 43;
  for (let index = 0; index < report.views.length; index++) {
    const view = report.views[index];
    const x = margin + index * 46;
    doc.addImage(view.image, 'PNG', x, y, thumb, thumb, `model-${view.id}`, 'FAST');
    doc.setFontSize(7);
    doc.setTextColor(35, 45, 60);
    doc.text(view.label, x + thumb / 2, y + thumb + 4, { align: 'center' });
  }
  y += 53;
  section('FARBEN - NUR TATSAECHLICH VERWENDETE BEREICHE');
  const names = { primary: 'Grundfarbe', accent: 'Kontrastfarbe', collar: 'Kragen / Details', secondary: 'Weitere Musterfarbe' };
  const controls = usesMaterials ? materialControls :
    (PATTERNS.find(pattern => pattern.id === snapshot.patternId) || PATTERNS[0]).colorZones.map(id => ({ id, name: names[id] }));
  for (const control of controls) {
    const spec = getClosestColorSpec(snapshot.colors?.[control.id]);
    text(`${control.name}: ${spec.hex} | Naeherung: ${spec.ral}, ${spec.pantone}`);
  }
  text('RAL/Pantone sind Farbnaeherungen, keine verbindliche Farbfreigabe.', 7, [100, 110, 125]);

  section('MOTIVE & TEXTE');
  if (!report.items.length) text('Keine sichtbaren kundenspezifischen Motive oder Texte.');
  for (const item of report.items) {
    const zone = product.zones?.[item.zone]?.name || getZoneName(item.zone);
    const visible = report.views.some(view => view.placements.find(placement => placement.number === item.number)?.ink);
    text(`#${item.number} ${item.type === 'text' ? 'Text' : 'Logo'}: ${item.label}`);
    text(`Zone: ${zone} | Drehung: ${Number(item.rotation || 0).toFixed(1)} Grad | ${visible ? 'Auf Modell sichtbar' : 'NICHT AUF MODELL SICHTBAR - KEINE FREIGABE'}`, 7, visible ? [70, 80, 95] : [190, 40, 20]);
    if (item.type === 'text') text(`Schrift: ${item.fontFamily || 'sans-serif'} | Gewicht: ${item.fontWeight || 'bold'} | Farbe: ${item.color || '#ffffff'}`, 7);
  }

  section('GROESSEN & MENGEN');
  const matrix = sizeMatrix || {};
  const entries = Object.entries(matrix).filter(([, quantity]) => Number(quantity) > 0);
  text(entries.length ? entries.map(([size, quantity]) => `${size}: ${quantity}`).join(' | ') : 'Keine Mengen angegeben.');
  text(`Gesamt: ${entries.reduce((total, [, quantity]) => total + Number(quantity), 0)}`);

  for (const view of report.views) {
    if (!report.items.length) break;
    doc.addPage();
    header(`${view.label} - ORTHOGRAFISCHER PLATZIERUNGSPLAN`);
    text('X: von links nach rechts. Y: von oben nach unten. Ursprung = linke obere Ecke des gestrichelten Modellrahmens.', 7);
    text('Alle Angaben in % der projizierten Modellbreite/-hoehe; keine Nahtabstaende, keine mm. Sichtbare Druckkontur, nicht Leinwandrand.', 7);
    const box = { x: margin, y: y + 2, size: width };
    doc.addImage(view.image, 'PNG', box.x, box.y, box.size, box.size, `model-${view.id}`, 'FAST');
    const scale = box.size / view.pixels;
    const model = view.modelRect;
    doc.setDrawColor(60, 130, 220);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([1.5, 1.2], 0);
    doc.rect(box.x + model.x * scale, box.y + model.y * scale, model.width * scale, model.height * scale);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(40, 100, 190);
    doc.text('0 / 0', box.x + model.x * scale, box.y + model.y * scale - 1);
    for (const placement of view.placements) {
      if (!placement.ink) continue;
      const ink = placement.ink;
      const x = box.x + ink.x * scale;
      const top = box.y + ink.y * scale;
      const w = ink.width * scale, h = ink.height * scale;
      const cx = x + w / 2, cy = top + h / 2;
      doc.setDrawColor(255, 90, 20);
      doc.setLineWidth(0.25);
      doc.rect(x, top, w, h);
      doc.line(cx - 1.5, cy, cx + 1.5, cy);
      doc.line(cx, cy - 1.5, cx, cy + 1.5);
      doc.setFillColor(255, 255, 255);
      doc.rect(x, Math.max(box.y, top - 4), 9, 4, 'F');
      doc.setTextColor(170, 45, 0);
      doc.setFontSize(8);
      doc.text(`#${placement.number}`, x + 0.5, Math.max(box.y, top - 4) + 3);
    }
    y = box.y + box.size + 6;
    text('ID | Mitte X / Y (%) | sichtbare Breite / Hoehe (%)', 8);
    for (const placement of view.placements) {
      if (!placement.relative) {
        text(`#${placement.number}: In dieser Ansicht nicht sichtbar`, 7, [100, 110, 125]);
        continue;
      }
      const r = placement.relative;
      text(`#${placement.number} | X ${r.centerX.toFixed(1)} / Y ${r.centerY.toFixed(1)} | B ${r.width.toFixed(1)} / H ${r.height.toFixed(1)}`, 8);
    }
    text('Messung der sichtbaren, achsenparallelen Druckkontur aus dem Renderbild (Rastergenauigkeit ca. 1 Pixel). Verdeckte Teile sind hier nicht vermessen.', 7, [100, 110, 125]);
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 120, 135);
    doc.text(`SOBRAL | Modellreferenz, keine physische Massfreigabe | ${page} / ${pages}`, 105, 290, { align: 'center' });
  }
  return doc;
}

export async function downloadProductionPdf(viewer, state, sizeMatrix = null) {
  const doc = await generateProductionPdf(viewer, state, sizeMatrix);
  const safeTitle = (state.activeProduct?.name || 'Sobral_Workwear').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeTitle}_Produktions_Spezifikation.pdf`;
  doc.save(filename);
  return filename;
}
