// playwright.config.js
const path = require("path");

console.log("Playwright CONFIG __dirname is:", __dirname);

module.exports = {
  testDir: "tests/e2e", // where your JS specs live
  timeout: 10_000, // max time per test in ms
  use: {
    headless: false, // or true if you don’t need to see the browser
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      slowMo: 500, // ───── pause 500ms after every action ─────
      args: [
        `--disable-extensions-except=${path.join(__dirname)}`,
        `--load-extension=${path.join(__dirname)}`,
      ],
    },
  },
  projects: [
    {
      name: "chromium-extension",
      use: { viewport: { width: 1280, height: 800 }, channel: "chrome" },
    },
  ],
};
