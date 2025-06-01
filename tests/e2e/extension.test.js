// tests/e2e/extension.test.js
const { test, expect, chromium } = require("@playwright/test");
const path = require("path");

test.describe("Chrome Extension Side Panel", () => {
  let context;
  let mainPage;
  let extensionId;

  // Helper: poll for MV3 service worker and extract extensionId
  async function detectExtensionId(ctx) {
    const timeout = 5000;
    const interval = 250;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const sws = ctx.serviceWorkers();
      if (sws.length > 0) {
        const url = sws[0].url();
        const m = url.match(/^chrome-extension:\/\/([^/]+)\//);
        if (m && m[1]) return m[1];
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    return null;
  }

  test.beforeAll(async () => {
    const EXTENSION_PATH = path.join(__dirname, "..", "..");
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    extensionId = await detectExtensionId(context);
    console.log("✔️  Detected extensionId:", extensionId);

    // Reuse the initial about:blank as mainPage
    const pages = context.pages();
    mainPage = pages[0];
    await mainPage.goto("https://example.com");
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("opens and closes the side panel via popup.html", async () => {
    // 1) Open popup.html
    const popupURL = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupURL);
    await popupPage.waitForLoadState("domcontentloaded");

    // 2) Click “Open Side Panel” in popup
    const openBtn = popupPage.locator("#openPanelBtn");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // 3) Wait for #myExtensionPanel in mainPage
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "visible",
      timeout: 5000,
    });
    await expect(mainPage.locator("#myExtensionPanel")).toBeVisible();

    // 4) Click “Close Side Panel” in popup
    const closeBtn = popupPage.locator("#closePanelBtn");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await popupPage.close();

    // 5) Verify panel is removed
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "detached",
      timeout: 5000,
    });
  });

  test("opens and closes the side panel via panel close button", async () => {
    // 1) Open popup.html and click “Open Side Panel”
    const popupURL = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupURL);
    await popupPage.waitForLoadState("domcontentloaded");

    const openBtn = popupPage.locator("#openPanelBtn");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // 2) Wait for the panel iframe to appear
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "visible",
      timeout: 5000,
    });
    const panel = mainPage.locator("#myExtensionPanel");
    await expect(panel).toBeVisible();

    // 3) Within that panel, find the iframe and its close button
    const frame = mainPage.frameLocator("#myExtensionIframe");
    const panelCloseBtn = frame.locator("#closeBtn");
    await expect(panelCloseBtn).toBeVisible();

    // 4) Click the close button inside the iframe
    await panelCloseBtn.click();

    // 5) Verify the panel is removed
    await mainPage.waitForSelector("#myExtensionPanel", {
      state: "detached",
      timeout: 5000,
    });

    await popupPage.close();
  });
});
