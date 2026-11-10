import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  console.log('1. Loading Tab 01 (Elemente & Farben)...');
  await page.goto('http://localhost:5173/?product=sobral_worker', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/tmp/figma_align_01_colors.png' });

  console.log('2. Loading Tab 02 (Beschriftung)...');
  await page.click('#tab-btn-text');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: '/tmp/figma_align_02_text.png' });

  console.log('3. Loading Tab 03 (Logo Upload)...');
  await page.click('#tab-btn-logos');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: '/tmp/figma_align_03_logo.png' });

  console.log('4. Loading Quote Modal...');
  await page.click('#btn-sidebar-quote');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: '/tmp/figma_align_04_quote.png' });

  await browser.close();
  console.log('Done!');
})();
