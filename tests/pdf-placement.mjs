import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';

const server = await createServer({ server: { host: '127.0.0.1', port: 5187, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5187/', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => window.appViewer?.loadedModelUrl && !window.appViewer.isModelLoading, { timeout: 60000 });
  await page.evaluate(async () => {
    window.reportModule = await import('/src/core/productionReport.js');
    window.pdfModule = await import('/src/core/pdfExport.js');
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(20, 10, 160, 80);
    window.testLogo = canvas.toDataURL();
  });
  for (const productId of ['sobral_workwear_tshirt', 'sobral_3340', 'sobral_worker', 'sobral_whe00113']) {
    const loadId = await page.evaluate(id => {
      const previous = window.appViewer._loadId;
      window.appCatalog.setActiveProduct(id);
      return previous;
    }, productId);
    await page.waitForFunction(previous => window.appViewer._loadId > previous && window.appViewer.loadedModelUrl && !window.appViewer.isModelLoading, { timeout: 60000 }, loadId);
    const result = await page.evaluate(async productId => {
      const viewer = window.appViewer;
      const state = viewer.getState();
      const helmet = productId === 'sobral_whe00113';
      state.logos = [{ id: 'pdf-logo', name: 'Logo Front', visible: true, src: window.testLogo, zone: helmet ? 'crown' : 'chest_center', scale: 0.45, offsetX: 8, offsetY: -5, rotation: 23 }];
      state.texts = [{ id: 'pdf-text', text: 'SOBRAL TEST', visible: true, zone: helmet ? 'back' : 'back_center', offsetX: -6, offsetY: 8, rotation: -17, fontSize: 40, color: '#ffffff' }];
      await Promise.all([viewer.updateDecals(), viewer.updateDecals()]);
      if (viewer.isMultiMesh && viewer.decalGroup.children.length !== 2) throw new Error('Concurrent decal updates duplicated or dropped artwork');
      const before = { position: viewer.camera.position.toArray(), target: viewer.controls.target.toArray(), ratio: viewer.renderer.getPixelRatio() };
      const report = await window.reportModule.captureProductionReport(viewer, structuredClone(state), 640);
      const after = { position: viewer.camera.position.toArray(), target: viewer.controls.target.toArray(), ratio: viewer.renderer.getPixelRatio() };
      window.lastReport = report;
      return { before, after, views: report.views.map(view => ({ id: view.id, model: view.modelRect, placements: view.placements })), calibrated: report.calibrated };
    }, productId);
    assert.deepEqual(result.after, result.before, `${productId}: camera/renderer restored`);
    assert.equal(result.calibrated, false);
    assert.deepEqual(result.views.map(view => view.id), ['front', 'back', 'left', 'right']);
    const frontLogo = result.views[0].placements.find(item => item.number === 1);
    const backText = result.views[1].placements.find(item => item.number === 2);
    assert.ok(frontLogo.ink && backText.ink, `${productId}: front logo and back text measured on actual surface`);
    for (const view of result.views) for (const placement of view.placements) {
      if (!placement.ink) continue;
      const { ink, relative } = placement;
      assert.ok(Math.abs(relative.centerX - (ink.x + ink.width / 2 - view.model.x) / view.model.width * 100) < 1e-8);
      assert.ok(Math.abs(relative.width - ink.width / view.model.width * 100) < 1e-8);
    }
    console.log(`PASS ${productId}: front ${JSON.stringify(frontLogo.relative)}, back ${JSON.stringify(backText.relative)}`);
  }
  const loadingGuard = await page.evaluate(async () => {
    const viewer = window.appViewer;
    viewer.isModelLoading = true;
    try {
      await window.reportModule.captureProductionReport(viewer, structuredClone(viewer.getState()), 640);
      return false;
    } catch (error) {
      return error.message.includes('geladen');
    } finally {
      viewer.isModelLoading = false;
    }
  });
  assert.ok(loadingGuard, 'export waits for a fully loaded model');
  // Rotation/offset changes must alter measured ink, not merely the table text.
  const movement = await page.evaluate(async () => {
    const viewer = window.appViewer;
    const state = viewer.getState();
    state.texts = [];
    const previous = await window.reportModule.captureProductionReport(viewer, structuredClone(state), 640);
    state.logos[0].offsetX += 20;
    state.logos[0].rotation += 35;
    const next = await window.reportModule.captureProductionReport(viewer, structuredClone(state), 640);
    const savedLogos = state.logos;
    state.logos = [];
    const blank = await window.reportModule.captureProductionReport(viewer, structuredClone(state), 640);
    state.logos = savedLogos;
    const pixels = async url => {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 640;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, 640, 640).data;
    };
    const visible = await pixels(next.views[0].image);
    const empty = await pixels(blank.views[0].image);
    let minX = 640, minY = 640, maxX = -1, maxY = -1;
    for (let y = 0; y < 640; y++) for (let x = 0; x < 640; x++) {
      const i = (y * 640 + x) * 4;
      if (Math.max(...[0, 1, 2].map(c => Math.abs(visible[i + c] - empty[i + c]))) < 15) continue;
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    const measured = next.views[0].placements[0].ink;
    const actual = { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
    for (const key of ['x', 'y', 'width', 'height']) {
      if (Math.abs(measured[key] - actual[key]) > 4) throw new Error(`Ink box does not match actual visible render: ${JSON.stringify({ measured, actual })}`);
    }
    return [previous.views[0].placements[0].relative, next.views[0].placements[0].relative];
  });
  assert.notDeepEqual(movement[0], movement[1], 'actual placement measurements respond to move/rotation');

  const pdf = await page.evaluate(async () => {
    const viewer = window.appViewer;
    const state = viewer.getState();
    // A logo intentionally placed outside the model must be reported, not guessed.
    state.logos.push({ ...state.logos[0], id: 'outside', name: 'Outside model', offsetX: 10000 });
    const doc = await window.pdfModule.generateProductionPdf(viewer, state, { M: 2, L: 3 });
    const result = { pages: doc.getNumberOfPages(), raw: doc.internal.pages.flat().join('\n'), bytes: Array.from(new Uint8Array(doc.output('arraybuffer'))) };
    for (let page = doc.getNumberOfPages(); page >= 1; page--) if (page !== 2) doc.deletePage(page);
    result.detailBytes = Array.from(new Uint8Array(doc.output('arraybuffer')));
    return result;
  });
  assert.ok(pdf.pages >= 5, 'overview plus four large placement diagrams');
  assert.ok(pdf.raw.includes('NICHT AUF MODELL SICHTBAR'), 'unresolved artwork explicitly flagged');
  assert.ok(pdf.raw.includes('NICHT PHYSISCH KALIBRIERT'), 'physical units are not invented');
  assert.ok(pdf.raw.includes('Mitte X / Y'), 'placement measurements included');
  await fs.writeFile('/tmp/sobral-placement-test.pdf', Buffer.from(pdf.bytes));
  await fs.writeFile('/tmp/sobral-placement-detail.pdf', Buffer.from(pdf.detailBytes));
  const images = await page.evaluate(() => window.lastReport.views.map(view => ({ id: view.id, image: view.image })));
  for (const image of images) await fs.writeFile(`/tmp/sobral-placement-${image.id}.png`, Buffer.from(image.image.split(',')[1], 'base64'));
  assert.deepEqual(errors, []);
  console.log(`PASS PDF: ${pdf.pages} pages, exact model projections, missing-placement warning; /tmp/sobral-placement-test.pdf`);
} finally {
  await browser.close();
  await server.close();
}
