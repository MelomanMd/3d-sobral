import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('http://localhost:5173/?product=sobral_worker', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Open modal
  await page.click('#btn-change-product');
  await new Promise(r => setTimeout(r, 600));

  // Screenshot updated modal
  await page.screenshot({ path: '/tmp/sobral_modal_worker.png' });

  // Click on Softshell card
  const softshellCard = await page.$('.product-catalog-card[data-id="sobral_4890"]');
  if (softshellCard) {
    console.log('Clicking Softshell card...');
    await softshellCard.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Switched product successfully!');
  }

  // Screenshot after switch
  await page.screenshot({ path: '/tmp/sobral_after_switch.png' });
  await browser.close();
  console.log('Done test');
})();
