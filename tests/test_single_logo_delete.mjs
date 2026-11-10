import puppeteer from 'puppeteer-core';

(async () => {
  console.log('🏁 Testing deletion of the LAST remaining logo...');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('404')) {
        errors.push(txt);
      }
    }
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__viewer && window.__appState);

  // Switch to Tab 03 (Logos)
  await page.click('#tab-btn-logos');
  await new Promise(r => setTimeout(r, 600));

  // Initial logo cards count
  let cards = await page.$$('.figma-layer-card');
  console.log('1. Initial logo layers:', cards.length);

  // Delete first logo
  let delBtns = await page.$$('.btn-delete-logo');
  console.log('   Delete buttons found:', delBtns.length);
  if (delBtns.length > 0) {
    await delBtns[0].click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Check remaining
  cards = await page.$$('.figma-layer-card');
  console.log('2. Remaining logo layers:', cards.length);

  // Check delete button on the LAST remaining logo
  delBtns = await page.$$('.btn-delete-logo');
  console.log('   Delete buttons on last remaining logo:', delBtns.length);

  if (delBtns.length === 1 && cards.length === 1) {
    console.log('  ✔ Delete button is PRESENT on the last remaining logo!');
    // Now delete the LAST logo!
    await delBtns[0].click();
    await new Promise(r => setTimeout(r, 400));

    cards = await page.$$('.figma-layer-card');
    console.log('3. Logo layers after deleting last logo:', cards.length);

    const emptyText = await page.evaluate(() => {
      const emptyDiv = document.querySelector('.figma-items-cards-grid');
      return emptyDiv ? emptyDiv.textContent.trim() : '';
    });
    console.log('   Empty state message:', emptyText.substring(0, 60));

    if (cards.length === 0 && emptyText.includes('Keine Logos')) {
      console.log('  ✔ Successfully deleted ALL logos! Empty state shown cleanly.');
    } else {
      errors.push('Failed to reach clean empty state');
    }
  } else {
    errors.push('Delete button missing on last logo');
  }

  // Re-add a logo via Logo Library
  console.log('4. Re-adding a logo via Logo Library...');
  await page.click('#btn-open-library');
  await new Promise(r => setTimeout(r, 400));
  const firstCard = await page.$('.library-logo-card');
  if (firstCard) {
    await firstCard.click();
    await new Promise(r => setTimeout(r, 500));
  }

  cards = await page.$$('.figma-layer-card');
  console.log('   Logo layers after re-adding:', cards.length);
  delBtns = await page.$$('.btn-delete-logo');
  console.log('   Delete buttons on newly added logo:', delBtns.length);

  if (cards.length === 1 && delBtns.length === 1) {
    console.log('  ✔ Newly added single logo also has delete button!');
  } else {
    errors.push('Newly added single logo missing delete button');
  }

  await page.screenshot({ path: '/Users/lis/.gemini/antigravity/brain/5cc41ec3-eebb-4988-b2fa-0355a97cf5e8/test_last_logo_deleted.png' });

  console.log('\nAudit complete. Errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
    process.exit(1);
  } else {
    console.log('🎉 LAST LOGO DELETION VERIFIED WITH 0 ERRORS!');
  }

  await browser.close();
})();

