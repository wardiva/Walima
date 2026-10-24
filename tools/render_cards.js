// Renders the link-preview image.
//   node tools/render_cards.js        (needs Playwright + a static server on :8765 serving site/)
// The link preview uses a high-resolution capture of the sealed envelope
// from the running site.
const { chromium } = require("playwright");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

(async () => {
  const b = await chromium.launch();
  // 1. the sealed envelope, captured from the site
  const site = await b.newPage({ viewport: { width: 480, height: 820 }, deviceScaleFactor: 3, reducedMotion: "reduce" });
  await site.goto("http://127.0.0.1:8765/");
  // only the envelope, on a transparent page
  await site.addStyleTag({ content: "html,body,.app,.bg,.backdrop{background:transparent!important}.backdrop,.bg,.deco,.intro,.twinkles{display:none!important}" });
  await site.waitForTimeout(2000);
  const envPng = path.join(ROOT, ".asset-cache", "envelope.png");
  await site.locator(".env").screenshot({ path: envPng, omitBackground: true });
  await site.close();

  const page = await b.newPage({ deviceScaleFactor: 1 });
  const url = (q) => "file://" + path.join(ROOT, "tools", "cards.html") + "?" + q;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(url(`card=og&env=${encodeURIComponent("file://" + envPng)}`));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ROOT, "site/assets/images/og-walima.jpg"), type: "jpeg", quality: 86 });
  await b.close();
})();
