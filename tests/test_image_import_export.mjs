import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = '/Users/lis/.gemini/antigravity/brain/5cc41ec3-eebb-4988-b2fa-0355a97cf5e8';
const DOWNLOAD_DIR = path.join(BRAIN_DIR, 'downloads_img_test');

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

(async () => {
  console.log('🏁 Starting Comprehensive Image Import & Export Verification...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR
  });

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

  // =========================================================================
  // 1. TEST LOGO LIBRARY MODAL IMAGES (IMPORT / SELECTION)
  // =========================================================================
  console.log('📌 1. Testing MEINE LOGO-BIBLIOTHEK Modal Images & Selection...');
  await page.click('#tab-btn-logos');
  await new Promise(r => setTimeout(r, 400));

  await page.click('#btn-open-library');
  await new Promise(r => setTimeout(r, 400));

  const modalEl = await page.$('#logo-library-modal');
  console.log('  ✔ Library Modal opened:', !!modalEl);

  // Check thumbnails visibility and dimensions
  const thumbs = await page.$$eval('.library-card-thumb img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 40) + '...',
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    visible: img.offsetWidth > 0 && img.offsetHeight > 0
  })));
  console.log(`  ✔ Found ${thumbs.length} preset images in library:`);
  thumbs.forEach((t, i) => {
    console.log(`    Img ${i + 1}: natural=${t.naturalWidth}x${t.naturalHeight}, rendered visible=${t.visible}`);
    if (t.naturalWidth === 0 || t.naturalHeight === 0) {
      throw new Error(`Thumbnail ${i + 1} failed to load or has 0x0 natural dimensions!`);
    }
  });

  await page.screenshot({ path: `${BRAIN_DIR}/library_modal_images_fixed.png` });

  // Check + NEUES LOGO HOCHLADEN button inside library modal
  const btnLibUpload = await page.$('#btn-library-upload-new');
  console.log('  ✔ "+ NEUES LOGO HOCHLADEN" button exists inside library modal:', !!btnLibUpload);
  if (!btnLibUpload) throw new Error('Missing upload button inside library modal!');

  // Test selecting preset logo (SOBRAL Emblem Circle)
  console.log('  ✔ Selecting preset logo "SOBRAL Emblem Circle"...');
  await page.click('.library-logo-card[data-id="logo_sobral_crest"]');
  await new Promise(r => setTimeout(r, 800));

  const activeLogoName = await page.evaluate(() => {
    const el = document.querySelector('.figma-layer-card.active .figma-layer-name');
    return el ? el.textContent : null;
  });
  console.log(`  ✔ Selected logo applied to outfit: "${activeLogoName}"`);
  if (activeLogoName !== 'SOBRAL Emblem Circle') {
    throw new Error(`Expected active logo "SOBRAL Emblem Circle", got "${activeLogoName}"`);
  }

  // =========================================================================
  // 2. TEST UPLOAD FROM WITHIN LIBRARY MODAL
  // =========================================================================
  console.log('\n📌 2. Testing File Import from within MEINE LOGO-BIBLIOTHEK...');
  await page.click('#btn-open-library');
  await new Promise(r => setTimeout(r, 400));

  const dummyImgPath = `${BRAIN_DIR}/dummy_custom_import.png`;
  // Create dummy PNG
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CUSTOM', 15, 65);
    window.__DUMMY_DATA__ = canvas.toDataURL('image/png');
  });

  const dummyDataUrl = await page.evaluate(() => window.__DUMMY_DATA__);
  const base64Data = dummyDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(dummyImgPath, Buffer.from(base64Data, 'base64'));

  const libFileInput = await page.$('#library-upload-file-input');
  await libFileInput.uploadFile(dummyImgPath);
  await new Promise(r => setTimeout(r, 1000));

  const importedLogoName = await page.evaluate(() => {
    const el = document.querySelector('.figma-layer-card.active .figma-layer-name');
    return el ? el.textContent : null;
  });
  console.log(`  ✔ Custom logo imported from library modal: "${importedLogoName}"`);
  if (!importedLogoName.includes('dummy_custom_import')) {
    throw new Error(`Expected custom imported logo, got "${importedLogoName}"`);
  }

  // =========================================================================
  // 3. TEST EXPORT MODAL (PNG & JPG REAL DOWNLOADS)
  // =========================================================================
  console.log('\n📌 3. Testing ENTWURF SPEICHERN Modal (PNG & JPG Downloads)...');
  await page.click('#btn-sidebar-export');
  await new Promise(r => setTimeout(r, 500));

  // Switch to PNG
  await page.click('.figma-draft-format-btn[data-format="png"]');
  await new Promise(r => setTimeout(r, 200));

  const filesBeforePng = fs.readdirSync(DOWNLOAD_DIR);
  await page.click('#btn-draft-action'); // ALS PNG SPEICHERN
  await new Promise(r => setTimeout(r, 2000));

  const filesAfterPng = fs.readdirSync(DOWNLOAD_DIR);
  const newPngFiles = filesAfterPng.filter(f => !filesBeforePng.includes(f));
  console.log('  ✔ PNG download triggered successfully:', newPngFiles);
  if (newPngFiles.length === 0) throw new Error('PNG download was not triggered!');

  // Close modal via WEITER BEARBEITEN
  await page.click('#btn-draft-continue');
  await new Promise(r => setTimeout(r, 400));

  // Re-open for JPG
  await page.click('#btn-sidebar-export');
  await new Promise(r => setTimeout(r, 500));
  await page.click('.figma-draft-format-btn[data-format="jpg"]');
  await new Promise(r => setTimeout(r, 200));

  const filesBeforeJpg = fs.readdirSync(DOWNLOAD_DIR);
  await page.click('#btn-draft-action'); // ALS JPG SPEICHERN
  await new Promise(r => setTimeout(r, 2500));

  const filesAfterJpg = fs.readdirSync(DOWNLOAD_DIR);
  const newJpgFiles = filesAfterJpg.filter(f => !filesBeforeJpg.includes(f));
  console.log('  ✔ JPG download triggered successfully:', newJpgFiles);
  if (newJpgFiles.length === 0) throw new Error('JPG download was not triggered!');

  await page.click('#btn-draft-continue');
  await new Promise(r => setTimeout(r, 300));

  console.log('\n=======================================================');
  console.log(`Total errors captured: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  }
  console.log('🎉 100% OF IMAGE IMPORT & EXPORT TESTS PASSED WITH 0 ERRORS!');
  console.log('=======================================================');

  await browser.close();
})();
