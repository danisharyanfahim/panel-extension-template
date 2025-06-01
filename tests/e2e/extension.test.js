// tests/e2e/extension.test.js
const { test, expect, chromium } = require("@playwright/test");
const path = require("path");

test.describe("Chrome Extension Side Panel", () => {
  let context;
  let mainPage; // “normal” website page (to verify injection)
  let extensionId; // e.g. “pkddlioomiggbjanhmfmifelhbilgfhp”

  // Helper: poll for a background page (MV2) or service worker (MV3)
  async function detectExtensionId(ctx) {
    const timeout = 5000;
    const interval = 250;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      // Check for MV3 service workers:
      const sws = ctx.serviceWorkers();
      if (sws.length > 0) {
        const url = sws[0].url();
        const m = url.match(/^chrome-extension:\/\/([^/]+)\//);
        if (m && m[1]) return m[1];
      }

      // Wait a bit and retry:
      await new Promise((r) => setTimeout(r, interval));
    }

    // If neither appeared within timeout:
    return null;
  }

  test.beforeAll(async () => {
    // ─── launch the extension ───
    const EXTENSION_PATH = path.join(__dirname, "..", "..");
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    // ─── detect extensionId as before ───
    extensionId = await detectExtensionId(context);
    console.log("✔️  Detected extensionId:", extensionId);

    // ─── instead of creating a NEW page, reuse the existing about:blank ───
    const pages = context.pages(); // an array of all open pages
    mainPage = pages[0]; // the initial about:blank page
    await mainPage.goto("https://example.com");
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("opens and closes the side panel via popup.html", async () => {
    // 1) Open popup.html directly in a new tab
    const popupURL = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupURL);
    await popupPage.waitForLoadState("domcontentloaded");

    // 2) Click “Open Side Panel” in the popup
    const openBtn = popupPage.locator("#openPanelBtn");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // 3) Verify #myExtensionPanel appears in the main page
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "visible",
      timeout: 5000,
    });
    const panel = mainPage.locator("#myExtensionPanel");
    await expect(panel).toBeVisible();

    // 4) Click “Close Side Panel” in the popup
    const closeBtn = popupPage.locator("#closePanelBtn");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await popupPage.close();

    // 5) Confirm #myExtensionPanel is removed
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "detached",
      timeout: 30000,
    });
  });
});
