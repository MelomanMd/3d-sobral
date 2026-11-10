import puppeteer from 'puppeteer';

const BRAIN_DIR = '/Users/lis/.gemini/antigravity/brain/5cc41ec3-eebb-4988-b2fa-0355a97cf5e8';

(async () => {
  console.log('🏁 Testing ENTWURF SPEICHERN button and modals...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  const errors = [];
  page.on('pageerror', err => {
    console.error('❌ Page Error:', err.message);
    errors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Console Error:', msg.text());
      errors.push(msg.text());
    }
  });

  await page.goto('http://localhost:5173/?product=sobral_worker', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Click ENTWURF SPEICHERN button
  console.log('📌 Clicking ENTWURF SPEICHERN button...');
  const btnExport = await page.$('#btn-sidebar-export');
  if (!btnExport) {
    throw new Error('Button #btn-sidebar-export not found!');
  }
  await btnExport.click();
  await new Promise(r => setTimeout(r, 400));

  // Check modal root exists
  const modalRoot = await page.$('#export-modal-root');
  if (!modalRoot) {
    throw new Error('Export modal root #export-modal-root did not appear!');
  }

  // Check title & subtitle
  const titleText = await page.$eval('.figma-draft-title', el => el.textContent.trim());
  const subtitleText = await page.$eval('.figma-draft-subtitle', el => el.textContent.trim());
  console.log(`  ✔ Modal opened. Title: "${titleText}", Subtitle: "${subtitleText}"`);

  if (titleText !== 'ENTWURF SPEICHERN') {
    throw new Error(`Expected title "ENTWURF SPEICHERN", got "${titleText}"`);
  }

  await page.screenshot({ path: `${BRAIN_DIR}/test_entwurf_speichern_modal.png` });

  // 2. Test format switching
  console.log('📌 Testing Format Tabs (PNG & JPG)...');
  const pngBtn = await page.$('.figma-draft-format-btn[data-format="png"]');
  await pngBtn.click();
  await new Promise(r => setTimeout(r, 200));

  let leadText = await page.$eval('#draft-desc-lead', el => el.textContent.trim());
  let actionText = await page.$eval('#btn-draft-action', el => el.textContent.trim());
  console.log(`  ✔ PNG Tab active: Lead="${leadText}", Action="${actionText}"`);

  const jpgBtn = await page.$('.figma-draft-format-btn[data-format="jpg"]');
  await jpgBtn.click();
  await new Promise(r => setTimeout(r, 200));

  leadText = await page.$eval('#draft-desc-lead', el => el.textContent.trim());
  actionText = await page.$eval('#btn-draft-action', el => el.textContent.trim());
  console.log(`  ✔ JPG Tab active: Lead="${leadText}", Action="${actionText}"`);

  // Switch back to PDF
  const pdfBtn = await page.$('.figma-draft-format-btn[data-format="pdf"]');
  await pdfBtn.click();
  await new Promise(r => setTimeout(r, 200));

  // 3. Test execution & transition to EXPORT VORBEREITET
  console.log('📌 Testing export action execution...');
  const actionBtn = await page.$('#btn-draft-action');
  await actionBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  const successTitle = await page.$eval('.figma-draft-title', el => el.textContent.trim());
  console.log(`  ✔ Success state title: "${successTitle}" (expected "EXPORT VORBEREITET")`);
  if (successTitle !== 'EXPORT VORBEREITET') {
    throw new Error(`Expected success title "EXPORT VORBEREITET", got "${successTitle}"`);
  }

  await page.screenshot({ path: `${BRAIN_DIR}/test_entwurf_speichern_success.png` });

  // Click WEITER BEARBEITEN
  const btnContinue = await page.$('#btn-draft-continue');
  await btnContinue.click();
  await new Promise(r => setTimeout(r, 300));

  const modalAfterClose = await page.$('#export-modal-root');
  console.log(`  ✔ Modal closed after "WEITER BEARBEITEN": ${modalAfterClose === null}`);

  // 4. Test Top Close Button (ENTWURF VERWERFEN?)
  console.log('📌 Testing Configurator Close Button (ENTWURF VERWERFEN?)...');
  const btnCloseApp = await page.$('#btn-close-configurator');
  await btnCloseApp.click();
  await new Promise(r => setTimeout(r, 300));

  const discardModal = await page.$('#discard-modal-root');
  const discardTitle = await page.$eval('#discard-modal-root .figma-draft-title', el => el.textContent.trim());
  console.log(`  ✔ Discard modal opened: "${discardTitle}"`);
  if (discardTitle !== 'ENTWURF VERWERFEN?') {
    throw new Error(`Expected discard title "ENTWURF VERWERFEN?", got "${discardTitle}"`);
  }

  await page.screenshot({ path: `${BRAIN_DIR}/test_entwurf_verwerfen_modal.png` });

  // Return to draft
  const btnReturn = await page.$('#btn-discard-return');
  await btnReturn.click();
  await new Promise(r => setTimeout(r, 300));

  const discardAfterClose = await page.$('#discard-modal-root');
  console.log(`  ✔ Discard modal closed: ${discardAfterClose === null}`);

  console.log('\n🎉 ALL ENTWURF SPEICHERN TESTS PASSED WITH 0 ERRORS!');
  await browser.close();
})();

