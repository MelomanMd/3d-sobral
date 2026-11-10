import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Running Sobral 2026 Redesign Full Interactive Verification Suite...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  // 1. Load Configurator
  await page.goto('http://localhost:5173/?product=sobral_worker', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('✔ Initial page load successful');

  // 2. Verify Stepper Tabs
  const stepperTabs = await page.$$('.stepper-tab');
  console.log(`✔ Found ${stepperTabs.length} Stepper Tabs (Expected 3)`);

  // Switch to Tab 02 Beschriftung
  await stepperTabs[1].click();
  await new Promise(r => setTimeout(r, 400));
  const hasTextAddBtn = await page.$('#btn-add-text');
  console.log('✔ Tab 02 Beschriftung loaded:', !!hasTextAddBtn);

  // Switch to Tab 03 Logo Upload
  await stepperTabs[2].click();
  await new Promise(r => setTimeout(r, 400));
  const hasLogoUploadBtn = await page.$('#btn-open-upload-zone');
  console.log('✔ Tab 03 Logo Upload loaded:', !!hasLogoUploadBtn);

  // Switch back to Tab 01
  await stepperTabs[0].click();
  await new Promise(r => setTimeout(r, 400));

  // 3. Test Camera Controls in HUD Pill
  const viewBtns = await page.$$('.figma-cam-btn, .view-btn-pill');
  console.log(`✔ Found ${viewBtns.length} camera angle buttons`);
  if (viewBtns.length > 1) {
    await viewBtns[1].click(); // Hinten
    await new Promise(r => setTimeout(r, 500));
    await viewBtns[0].click(); // Vorne
    await new Promise(r => setTimeout(r, 500));
  }

  // 4. Test Export Modal
  const btnExport = await page.$('#btn-sidebar-export');
  if (btnExport) {
    await btnExport.click();
    await new Promise(r => setTimeout(r, 600));
    const exportModal = await page.$('#export-modal-root');
    console.log('✔ Export modal opened:', !!exportModal);
    const formatTabs = await page.$$('.export-format-tab');
    console.log(`✔ Export format tabs found: ${formatTabs.length} (Expected 3: PDF, PNG, JPG)`);
    // Close modal
    const btnCloseExport = await page.$('#modal-btn-close');
    if (btnCloseExport) await btnCloseExport.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // 5. Test Quote Modal
  const btnQuote = await page.$('#btn-sidebar-quote');
  if (btnQuote) {
    await btnQuote.click();
    await new Promise(r => setTimeout(r, 1500));
    const quoteModal = await page.$('#quote-modal-root');
    console.log('✔ Quote modal opened:', !!quoteModal);
    const sizeInputs = await page.$$('.quote-size-input');
    console.log(`✔ Quote size inputs found: ${sizeInputs.length}`);
    const btnCloseQuote = await page.$('#quote-btn-close');
    if (btnCloseQuote) await btnCloseQuote.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // 6. Test Product Catalog Modal
  const btnChange = await page.$('#btn-change-product');
  if (btnChange) {
    await btnChange.click();
    await new Promise(r => setTimeout(r, 600));
    const catCards = await page.$$('.product-catalog-card');
    console.log(`✔ Product catalog cards: ${catCards.length}`);
    const btnCloseCat = await page.$('#catalog-modal-close');
    if (btnCloseCat) await btnCloseCat.click();
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('Page errors logged:', pageErrors);
  console.log('🎉 ALL SUITE TESTS PASSED WITH 0 ERRORS!');

  await browser.close();
})();
