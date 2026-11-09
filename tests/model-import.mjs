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
  page.on('console', message => {
    if (message.type() === 'error' && message.text().includes('Error loading 3D model')) errors.push(message.text());
  });
  // A removed comparison product must not reappear from older local storage.
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('sobral_active_product_id', 'sobral_worker_comparison');
    localStorage.setItem('sobral_custom_products', JSON.stringify([{ id: 'sobral_worker_comparison', modelUrl: '/removed.glb' }]));
  });
  await page.goto('http://localhost:8080/customizer/', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => window.appViewer?.loadedModelUrl && window.appCatalog, { timeout: 60000 });
  assert.equal(await page.$('.lang-switch-group'), null);
  const expected = {
    sobral_workwear_tshirt: ['primary', 'accent', 'collar'],
    sobral_3300: ['primary', 'collar'],
    sobral_3340: ['primary'],
    sobral_3362: ['primary'],
    sobral_3366: ['primary', 'accent', 'collar'],
    sobral_4890: ['primary'],
    sobral_1750: ['primary'],
    sobral_2003: ['primary', 'accent', 'collar'],
    sobral_whe00113: ['primary', 'accent', 'collar'],
    sobral_worker: ['helmet', 'primary', 'trousers', 'boots'],
    sobral_1751: ['primary'],
    sobral_hakro_polo: ['primary']
  };
  const products = await page.evaluate(() => window.appCatalog.getProducts().map(product => product.id));
  assert.deepEqual(products.sort(), Object.keys(expected).sort());

  for (const [id, zones] of Object.entries(expected)) {
    const loadId = await page.evaluate(id => {
      const previous = window.appViewer._loadId;
      window.appCatalog.setActiveProduct(id);
      return previous;
    }, id);
    await page.waitForFunction(previous => window.appViewer._loadId > previous && window.appViewer.loadedModelUrl && window.appViewer.shirtGroup, { timeout: 60000 }, loadId);
    const visibleZones = await page.$$eval('.mini-native-picker', inputs => inputs.map(input => input.dataset.pickerZone));
    assert.deepEqual(visibleZones, zones, `${id}: only supported color controls`);
    if (id !== 'sobral_workwear_tshirt') assert.equal(await page.$('.compact-pattern-card'), null, `${id}: no unsupported texture patterns`);
    if (id === 'sobral_whe00113') {
      assert.ok(await page.$('#switch-straps'), 'original segmented helmet retains component toggles');
      const helmet = await page.evaluate(() => ({
        meshes: window.appViewer.productMeshes.length,
        original: window.appViewer.loadedModelUrl.endsWith('/sobral-whe00113.glb'),
        untouchedTexture: [...window.appViewer.clonedMaterials.values()].every(material => !material._sobralTintMap)
      }));
      assert.ok(helmet.original && helmet.meshes > 1 && helmet.untouchedTexture, 'original helmet loaded without scan texture conversion');
    }

    for (const zone of zones) {
      for (const hex of ['#ef2439', '#2874ef']) {
        await page.$eval(`[data-picker-zone="${zone}"]`, (input, value) => {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, hex);
        await page.waitForFunction(({ zone, hex }) => {
          const viewer = window.appViewer;
          if (!viewer.isMultiMesh) return true;
          const control = viewer.getColorControls().find(control => control.id === zone);
          return control && control.roles.every(role => [...viewer.materialGroups.get(role)].every(material => `#${material.color.getHexString()}` === hex));
        }, { timeout: 10000 }, { zone, hex });
      }
    }

    const result = await page.evaluate(() => {
      const viewer = window.appViewer;
      const product = window.appCatalog.getActiveProduct();
      let triangles = 0;
      for (const mesh of viewer.productMeshes) triangles += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
      const scanChecks = [];
      if (product.colorMaterials) {
        for (const control of viewer.getColorControls()) for (const role of control.roles) {
          for (const material of viewer.materialGroups.get(role)) {
            const canvas = material.map?.image;
            const data = canvas?.getContext?.('2d').getImageData(0, 0, 1, 1).data;
            scanChecks.push(!!material._sobralTintMap && data[0] === data[1] && data[1] === data[2]);
          }
        }
      }
      const neutral = [...(viewer.materialGroups.get('neutral') || [])];
      return { triangles, scanChecks, neutralUnchanged: neutral.every(material => !!material.map && material.color.getHexString() === 'ffffff') };
    });
    assert.ok(result.triangles > 0, `${id}: geometry loaded`);
    assert.ok(result.scanChecks.every(Boolean), `${id}: baked hue neutralized, detail texture retained`);
    if (id === 'sobral_worker') {
      assert.equal(result.triangles, 760748);
      assert.ok(result.neutralUnchanged, 'worker face/skin remain untouched');
    }
    console.log(`PASS ${id}: ${zones.join(', ')}; ${result.triangles} triangles`);
  }

  // Audit each procedural pattern against actual rendered pixels. Test all four
  // possible fields, including hidden ones: shown fields must change the image,
  // hidden fields must not. This catches metadata-only/material-only false passes.
  const initialLoad = await page.evaluate(() => {
    const previous = window.appViewer._loadId;
    window.appCatalog.setActiveProduct('sobral_workwear_tshirt');
    return previous;
  });
  await page.waitForFunction(previous => window.appViewer._loadId > previous && window.appViewer.loadedModelUrl, { timeout: 60000 }, initialLoad);
  const patternZones = {
    raglan_shoulder: ['primary', 'accent', 'collar'],
    solid: ['primary', 'collar'],
    vexa: ['primary', 'accent', 'collar', 'secondary'],
    racing: ['primary', 'accent', 'collar', 'secondary'],
    cyber_hex: ['primary', 'accent', 'collar'],
    gradient: ['primary', 'accent', 'collar', 'secondary']
  };
  for (const [patternId, zones] of Object.entries(patternZones)) {
    await page.click(`[data-pattern="${patternId}"]`);
    const visible = await page.$$eval('.mini-native-picker', inputs => inputs.map(input => input.dataset.pickerZone));
    assert.deepEqual(visible, zones, `${patternId}: exact supported UI fields`);
    const changes = await page.evaluate(async patternId => {
      const viewer = window.appViewer;
      const engine = new viewer.textureEngine.constructor(256);
      const state = { ...viewer.getState(), patternId, texts: [], logos: [], selectedItemId: null };
      const colors = { primary: '#445566', accent: '#aa6633', collar: '#889944', secondary: '#ccddee' };
      await engine.render({ ...state, colors });
      const baseline = engine.ctx.getImageData(0, 0, 256, 256).data;
      const changes = {};
      for (const zone of Object.keys(colors)) {
        await engine.render({ ...state, colors: { ...colors, [zone]: '#ef1439' } });
        const pixels = engine.ctx.getImageData(0, 0, 256, 256).data;
        let changed = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] !== baseline[i] || pixels[i + 1] !== baseline[i + 1] || pixels[i + 2] !== baseline[i + 2]) changed++;
        }
        changes[zone] = changed;
      }
      engine.texture.dispose();
      return changes;
    }, patternId);
    for (const [zone, count] of Object.entries(changes)) {
      assert.equal(count > 0, zones.includes(zone), `${patternId}/${zone}: rendered pixel effect matches UI`);
    }
    console.log(`PASS pattern ${patternId}: ${JSON.stringify(changes)}`);
  }
  // Selecting a zone that disappears in another pattern must reset the palette
  // target, rather than silently editing a hidden field.
  await page.click('[data-pattern="vexa"]');
  await page.click('.compact-part-card[data-zone="secondary"]');
  await page.click('[data-pattern="solid"]');
  assert.equal(await page.$('.compact-part-card[data-zone="secondary"]'), null);
  assert.equal(await page.$eval('.compact-part-card.active', card => card.dataset.zone), 'primary');

  // Reopen a long dropdown after choosing its last model. Active item must be
  // visible, even after the asynchronous model switch re-renders the header.
  await page.click('#btn-product-dropdown');
  await page.$eval('.dropdown-products-list', list => { list.scrollTop = list.scrollHeight; });
  await page.click('.dropdown-product-item[data-id="sobral_hakro_polo"]');
  await page.waitForFunction(() => window.appViewer.loadedModelUrl?.includes('hakro'), { timeout: 60000 });
  await page.click('#btn-product-dropdown');
  const scroll = await page.$eval('.dropdown-products-list', list => {
    const item = list.querySelector('.active');
    const a = item.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    return { top: list.scrollTop, visible: a.top >= b.top - 1 && a.bottom <= b.bottom + 1 };
  });
  assert.ok(scroll.top > 0 && scroll.visible, 'dropdown retains scroll and shows active last item');
  await page.click('#btn-product-dropdown');
  await page.click('#btn-product-dropdown');
  const reopenedTop = await page.$eval('.dropdown-products-list', list => list.scrollTop);
  assert.equal(reopenedTop, scroll.top, 'reopening preserves scroll offset');
  assert.deepEqual(errors, []);
  console.log('PASS: all 12 products and 6 procedural patterns audited; every shown field has an effect, every unused pattern field is hidden; dropdown scroll retained.');
} finally {
  await browser.close();
}
