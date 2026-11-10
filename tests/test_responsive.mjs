import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test Tablet Viewport (1024 x 768)
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:5173/?product=sobral_worker', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/tmp/sobral_tablet_1024.png' });

  // Test Mobile Viewport (414 x 896)
  await page.setViewport({ width: 414, height: 896 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/tmp/sobral_mobile_414.png' });

  await browser.close();
  console.log('Responsive screenshots generated!');
})();
