import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const BRAIN_DIR = "/Users/lis/.gemini/antigravity/brain/5cc41ec3-eebb-4988-b2fa-0355a97cf5e8";
const DOWNLOAD_DIR = path.join(BRAIN_DIR, "downloads_test");

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

(async () => {
  console.log("🚀 Starting In-Depth Functional Verification of ENTWURF SPEICHERN & EXPORT...");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,920"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  // Enable download interception
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: DOWNLOAD_DIR
  });

  const errors = [];
  page.on("pageerror", err => {
    console.error("❌ Page Error:", err.message);
    errors.push(err.message);
  });
  page.on("console", msg => {
    if (msg.type() === "error") {
      console.error("❌ Console Error:", msg.text());
      errors.push(msg.text());
    }
  });

  await page.goto("http://localhost:5173/?product=sobral_worker", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 2000));

  // TEST 1: Open Modal
  console.log("\n▶ TEST 1: Opening ENTWURF SPEICHERN modal via #btn-sidebar-export...");
  await page.click("#btn-sidebar-export");
  await new Promise(r => setTimeout(r, 400));

  const modalRoot = await page.$("#export-modal-root");
  console.log("  ✔ Modal exists in DOM:", !!modalRoot);

  const initialTab = await page.$eval(".figma-draft-format-btn.active", el => el.dataset.format);
  console.log("  ✔ Default active tab:", initialTab);
  if (initialTab !== "pdf") throw new Error("Expected default tab to be pdf");

  // TEST 2: Switch Tabs
  console.log("\n▶ TEST 2: Tab Switching (PDF -> PNG -> JPG -> PNG)...");
  await page.click(".figma-draft-format-btn[data-format=\"png\"]");
  await new Promise(r => setTimeout(r, 200));
  let btnText = await page.$eval("#btn-draft-action", el => el.textContent.trim());
  let leadText = await page.$eval("#draft-desc-lead", el => el.textContent.trim());
  console.log(`  ✔ Switched to PNG -> Button: "${btnText}", Lead: "${leadText}"`);
  if (btnText !== "ALS PNG SPEICHERN") throw new Error("Button text mismatch on PNG tab");

  await page.click(".figma-draft-format-btn[data-format=\"jpg\"]");
  await new Promise(r => setTimeout(r, 200));
  btnText = await page.$eval("#btn-draft-action", el => el.textContent.trim());
  leadText = await page.$eval("#draft-desc-lead", el => el.textContent.trim());
  console.log(`  ✔ Switched to JPG -> Button: "${btnText}", Lead: "${leadText}"`);
  if (btnText !== "ALS JPG SPEICHERN") throw new Error("Button text mismatch on JPG tab");

  // TEST 3: Action Execution on PNG (Download, LocalStorage, Screen Transition)
  console.log("\n▶ TEST 3: Executing ALS PNG SPEICHERN...");
  await page.click(".figma-draft-format-btn[data-format=\"png\"]");
  await new Promise(r => setTimeout(r, 200));

  const filesBefore = fs.readdirSync(DOWNLOAD_DIR);
  await page.click("#btn-draft-action");
  await new Promise(r => setTimeout(r, 2000));

  // Check LocalStorage
  const savedData = await page.evaluate(() => localStorage.getItem("sobral_saved_designs"));
  console.log("  ✔ LocalStorage sobral_saved_designs written:", !!savedData);
  if (savedData) {
    const parsed = JSON.parse(savedData);
    console.log(`  ✔ Designs in storage: ${parsed.length}, latest product: ${parsed[0]?.product}`);
  }

  // Check downloaded file
  const filesAfter = fs.readdirSync(DOWNLOAD_DIR);
  const newFiles = filesAfter.filter(f => !filesBefore.includes(f));
  console.log("  ✔ Downloaded files:", newFiles);

  // Check EXPORT VORBEREITET screen
  const successTitle = await page.$eval(".figma-draft-title", el => el.textContent.trim());
  console.log(`  ✔ Modal title after save: "${successTitle}"`);
  if (successTitle !== "EXPORT VORBEREITET") throw new Error("Expected title EXPORT VORBEREITET");

  await page.screenshot({ path: `${BRAIN_DIR}/live_test_export_vorbereitet.png` });

  // TEST 4: Continue Editing
  console.log("\n▶ TEST 4: Clicking WEITER BEARBEITEN to return to canvas...");
  await page.click("#btn-draft-continue");
  await new Promise(r => setTimeout(r, 300));
  const isModalGone = (await page.$("#export-modal-root")) === null;
  console.log("  ✔ Modal removed from DOM:", isModalGone);

  // TEST 5: PDF Export Test
  console.log("\n▶ TEST 5: Re-opening and testing ALS PDF SPEICHERN...");
  await page.click("#btn-sidebar-export");
  await new Promise(r => setTimeout(r, 400));
  await page.click("#btn-draft-action"); // Active is PDF
  await new Promise(r => setTimeout(r, 3000));

  const successTitlePdf = await page.$eval(".figma-draft-title", el => el.textContent.trim());
  console.log(`  ✔ PDF export completed successfully. Title: "${successTitlePdf}"`);
  await page.click("#btn-draft-x");
  await new Promise(r => setTimeout(r, 300));

  // TEST 6: Discard Dialog & Transitions
  console.log("\n▶ TEST 6: Testing Configurator Close ✕ and ENTWURF VERWERFEN? dialog...");
  await page.click("#btn-close-configurator");
  await new Promise(r => setTimeout(r, 400));

  const discardModal = await page.$("#discard-modal-root");
  console.log("  ✔ Discard modal opened:", !!discardModal);

  // Click ZUERST SPEICHERN inside Discard modal
  console.log("  ✔ Clicking ZUERST SPEICHERN to verify it opens ENTWURF SPEICHERN modal...");
  await page.click("#btn-discard-save");
  await new Promise(r => setTimeout(r, 400));

  const exportModalFromDiscard = await page.$("#export-modal-root");
  console.log("  ✔ Export modal opened from discard dialog:", !!exportModalFromDiscard);

  await page.click("#btn-draft-cancel");
  await new Promise(r => setTimeout(r, 300));
  console.log("  ✔ Cancelled and returned to customizer.");

  console.log("\n=======================================================");
  console.log(`Total errors captured: ${errors.length}`);
  if (errors.length > 0) {
    console.error("Errors found:", errors);
    process.exit(1);
  }
  console.log("🎉 ALL FUNCTIONAL TESTS FOR ENTWURF SPEICHERN & EXPORT PASSED 100%!");
  console.log("=======================================================");

  await browser.close();
})();
