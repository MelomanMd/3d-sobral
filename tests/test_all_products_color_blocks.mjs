import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'fs';

const BRAIN_DIR = '/Users/lis/.gemini/antigravity/brain/5cc41ec3-eebb-4988-b2fa-0355a97cf5e8';

(async () => {
  console.log('🏁 Starting Verification of Color Blocks for ALL Products...\n');

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
        errors.push(`Console error: ${txt}`);
      }
    }
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__viewer && window.__appState);

  const productList = [
    { id: 'sobral_worker', expectedCards: 4, type: 'outfit' },
    { id: 'sobral_workwear_tshirt', expectedCards: 1, type: 'tshirt' },
    { id: 'sobral_3300', expectedCards: 2, type: 'tshirt' },
    { id: 'sobral_3340', expectedCards: 1, type: 'sweatshirt' },
    { id: 'sobral_3362', expectedCards: 1, type: 'jacket' },
    { id: 'sobral_3366', expectedCards: 3, type: 'hoodie' },
    { id: 'sobral_4890', expectedCards: 1, type: 'jacket' },
    { id: 'sobral_1750', expectedCards: 1, type: 'trousers' },
    { id: 'sobral_2003', expectedCards: 3, type: 'beanie' },
    { id: 'sobral_whe00113', expectedCards: 3, type: 'helmet' },
    { id: 'sobral_1751', expectedCards: 1, type: 'trousers' },
    { id: 'sobral_hakro_polo', expectedCards: 1, type: 'polo' }
  ];

  let passedCount = 0;

  for (const item of productList) {
    console.log(`\n🔍 Testing Product: [${item.id}] (expected: ${item.expectedCards} card(s))...`);

    // Open catalog modal
    await page.evaluate(() => {
      document.getElementById('btn-change-product').click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Click product card
    await page.evaluate((id) => {
      const card = document.querySelector(`.product-catalog-card[data-id="${id}"]`);
      if (card) {
        const btn = card.querySelector('.btn-select-product') || card;
        btn.click();
      }
    }, item.id);

    // Wait for 3D model loading and panel update
    await new Promise(r => setTimeout(r, 1200));

    // Read cards in ColorPanel
    const panelCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.figma-outfit-card'));
      const title = document.querySelector('.sidebar-title-main')?.textContent?.trim();
      return {
        sidebarTitle: title,
        cards: cards.map(c => ({
          name: c.querySelector('.figma-card-name')?.textContent?.trim(),
          brand: c.querySelector('.figma-card-brand')?.textContent?.trim(),
          zone: c.dataset.zone,
          swatchesCount: c.querySelectorAll('.figma-square-swatch').length
        }))
      };
    });

    console.log(`  Sidebar Title: "${panelCards.sidebarTitle}"`);
    console.log(`  Found Cards (${panelCards.cards.length}):`, panelCards.cards.map(c => `${c.name} (${c.zone})`).join(', '));

    // Verification checks
    if (panelCards.cards.length !== item.expectedCards) {
      const err = `❌ Product ${item.id}: Expected ${item.expectedCards} cards but got ${panelCards.cards.length}!`;
      console.error(' ', err);
      errors.push(err);
    } else {
      console.log(`  ✔ Exact card count matches: ${panelCards.cards.length} == ${item.expectedCards}`);
      passedCount++;
    }

    // Check that trousers don't have helmet or shoes
    if (item.type === 'trousers') {
      const hasHelmet = panelCards.cards.some(c => c.zone === 'helmet' || c.name.toLowerCase().includes('kopf'));
      const hasShoes = panelCards.cards.some(c => c.zone === 'boots' || c.name.toLowerCase().includes('schuh'));
      if (hasHelmet || hasShoes) {
        errors.push(`❌ Product ${item.id} (Trousers) has unwanted helmet/shoes cards!`);
      } else {
        console.log('  ✔ No phantom helmet or shoes cards on trousers.');
      }
    }

    // Check that helmet doesn't have trousers or shoes
    if (item.type === 'helmet' || item.type === 'beanie') {
      const hasTrousers = panelCards.cards.some(c => c.zone === 'trousers' || c.name.toLowerCase().includes('hose'));
      const hasShoes = panelCards.cards.some(c => c.zone === 'boots' || c.name.toLowerCase().includes('schuh'));
      if (hasTrousers || hasShoes) {
        errors.push(`❌ Product ${item.id} (Helmet/Beanie) has unwanted trousers/shoes cards!`);
      } else {
        console.log('  ✔ No phantom trousers or shoes cards on headwear.');
      }
    }

    // Check that tops don't have trousers, shoes, or helmet
    if (['tshirt', 'sweatshirt', 'jacket', 'hoodie', 'polo'].includes(item.type)) {
      const hasTrousers = panelCards.cards.some(c => c.zone === 'trousers' || c.name.toLowerCase().includes('hose'));
      const hasShoes = panelCards.cards.some(c => c.zone === 'boots' || c.name.toLowerCase().includes('schuh'));
      const hasHelmet = panelCards.cards.some(c => c.zone === 'helmet' || c.name.toLowerCase().includes('kopf'));
      if (hasTrousers || hasShoes || hasHelmet) {
        errors.push(`❌ Product ${item.id} (${item.type}) has phantom trousers/shoes/helmet cards!`);
      } else {
        console.log(`  ✔ No phantom trousers, shoes, or helmet cards on ${item.type}.`);
      }
    }

    // Take screenshots for key sample types
    if (['sobral_worker', 'sobral_3300', 'sobral_3340', 'sobral_1750', 'sobral_whe00113', 'sobral_3366'].includes(item.id)) {
      const shotPath = `${BRAIN_DIR}/product_verify_${item.id}.png`;
      await page.screenshot({ path: shotPath });
      console.log(`  📸 Saved screenshot: ${shotPath}`);
    }
  }

  console.log('\n======================================================');
  console.log(`🏁 AUDIT FINISHED. Passed: ${passedCount}/${productList.length}. Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors found:\n', errors.join('\n'));
    process.exit(1);
  } else {
    console.log('🎉 ALL 12 PRODUCTS VERIFIED: 0 PHANTOM CARDS, 100% CLEAN COLOR BLOCKS!');
  }
  console.log('======================================================\n');

  await browser.close();
})();
