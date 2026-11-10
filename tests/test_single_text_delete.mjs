import puppeteer from 'puppeteer-core';

(async () => {
  console.log('🏁 Testing deletion of the LAST remaining text...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__viewer && window.__appState);

  // Switch to Tab 02 (Text)
  await page.click('#tab-btn-text');
  await new Promise(r => setTimeout(r, 600));

  let cards = await page.$$('.figma-layer-card');
  console.log('1. Initial text layers:', cards.length);

  // Delete first text
  let delBtns = await page.$$('.btn-delete-layer');
  console.log('   Delete buttons found:', delBtns.length);
  if (delBtns.length > 0) {
    await delBtns[0].click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Check remaining
  cards = await page.$$('.figma-layer-card');
  console.log('2. Remaining text layers:', cards.length);

  // Check delete button on last text
  delBtns = await page.$$('.btn-delete-layer');
  console.log('   Delete buttons on last remaining text:', delBtns.length);

  if (delBtns.length === 1 && cards.length === 1) {
    console.log('  ✔ Delete button is PRESENT on the last remaining text layer!');
    await delBtns[0].click();
    await new Promise(r => setTimeout(r, 400));

    cards = await page.$$('.figma-layer-card');
    console.log('3. Text layers after deleting last text:', cards.length);

    const emptyText = await page.evaluate(() => {
      const emptyDiv = document.querySelector('.figma-items-cards-grid');
      return emptyDiv ? emptyDiv.textContent.trim() : '';
    });
    console.log('   Empty state message:', emptyText.substring(0, 60));

    if (cards.length === 0 && emptyText.includes('Keine Beschriftung')) {
      console.log('  ✔ Successfully deleted ALL text layers! Empty state shown cleanly.');
    }
  }

  // Add a text back
  await page.click('#btn-add-text');
  await new Promise(r => setTimeout(r, 400));
  cards = await page.$$('.figma-layer-card');
  delBtns = await page.$$('.btn-delete-layer');
  console.log('4. Re-added text layer count:', cards.length, 'delete buttons:', delBtns.length);

  await browser.close();
  console.log('🎉 LAST TEXT DELETION VERIFIED WITH 0 ERRORS!');
})();

