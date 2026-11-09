import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

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
  let failOnce = false;
  await page.setRequestInterception(true);
  page.on('request', async request => {
    if (failOnce && request.url().includes('sobral-1751-klein.glb')) {
      failOnce = false;
      await request.respond({ status: 503, body: 'Test model download failure' });
      return;
    }
    if (request.url().endsWith('.glb')) await new Promise(resolve => setTimeout(resolve, 1000));
    await request.continue();
  });
  await page.goto('http://localhost:8080/customizer/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.model-load-overlay:not([hidden])');
  assert.equal(await page.$eval('#canvas-container', element => element.getAttribute('aria-busy')), 'true');
  await page.waitForFunction(() => window.appViewer?.loadedModelUrl && !window.appViewer.isModelLoading, { timeout: 60000 });
  assert.equal(await page.$eval('.model-load-overlay', element => element.hidden), true);
  console.log('PASS initial load: visible indicator, aria-busy, hidden after first frame');

  // A single UI selection must invoke GLB loading exactly once.
  const previous = await page.evaluate(() => {
    window.loadStages = [];
    const indicator = window.appViewer.loadingIndicator;
    new MutationObserver(() => window.loadStages.push({ label: indicator.label.textContent, progress: indicator.progress.getAttribute('value') }))
      .observe(indicator.element, { subtree: true, childList: true, attributes: true, characterData: true });
    return window.appViewer._loadId;
  });
  await page.click('#btn-product-dropdown');
  await page.click('.dropdown-product-item[data-id="sobral_3340"]');
  await page.waitForSelector('.model-load-overlay:not([hidden])');
  await page.waitForFunction(() => window.appViewer.loadedModelUrl?.includes('3340') && !window.appViewer.isModelLoading, { timeout: 60000 });
  assert.equal(await page.evaluate(() => window.appViewer._loadId), previous + 1, 'one UI selection, one load');
  const stages = await page.evaluate(() => window.loadStages);
  assert.ok(stages.some(stage => stage.progress !== null), 'real download progress reported');
  assert.ok(stages.some(stage => stage.label.includes('vorbereitet')), 'preparation stage reported');
  console.log('PASS UI selection: one load, progress, preparation stage');

  // The earlier request must not hide the latest request's loader or install its model.
  await page.evaluate(() => window.appCatalog.setActiveProduct('sobral_1750'));
  await page.waitForFunction(() => window.appViewer.lastRequestedModelUrl?.includes('1750'));
  await page.evaluate(() => window.appCatalog.setActiveProduct('sobral_4890'));
  await page.waitForFunction(() => window.appViewer.loadedModelUrl?.includes('4890') && !window.appViewer.isModelLoading, { timeout: 60000 });
  assert.ok(await page.evaluate(() => window.appCatalog.getActiveProduct().modelUrl === window.appViewer.loadedModelUrl));
  console.log('PASS rapid switching: latest selection wins');

  failOnce = true;
  await page.evaluate(() => window.appCatalog.setActiveProduct('sobral_1751'));
  await page.waitForSelector('.model-load-overlay[data-state="error"] .model-load-retry:not([hidden])', { timeout: 60000 });
  assert.equal(await page.$eval('#canvas-container', element => element.getAttribute('aria-busy')), 'false');
  await page.click('.model-load-retry');
  await page.waitForFunction(() => window.appViewer.loadedModelUrl?.includes('1751') && !window.appViewer.isModelLoading, { timeout: 60000 });
  assert.equal(await page.$eval('.model-load-overlay', element => element.hidden), true);
  console.log('PASS failure and retry: error displayed, retry loads model');
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
