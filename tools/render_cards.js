// Renders the placeholder gallery cards and the link-preview image.
//   node tools/render_cards.js        (needs Playwright + a static server on :8765 serving site/)
// The link preview uses a high-resolution capture of the sealed envelope
// from the running site; the first gallery card uses the hero's wreath and
// names, captured the same way.
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

  // 2. the hero's wreath and names (Reduce Motion: fully drawn at once)
  const hero = await b.newPage({ viewport: { width: 480, height: 820 }, deviceScaleFactor: 3, reducedMotion: "reduce" });
  await hero.goto("http://127.0.0.1:8765/");
  await hero.waitForTimeout(800);
  await hero.click("#tapToOpen");
  await hero.addStyleTag({ content: "html,body,.app,.bg,.backdrop{background:transparent!important}.backdrop,.bg,.deco,.fx,.bf,.twinkles{display:none!important}" });
  await hero.waitForTimeout(1500);
  const wreathPng = path.join(ROOT, ".asset-cache", "wreath.png");
  await hero.locator(".hero__ring").screenshot({ path: wreathPng, omitBackground: true });
  await hero.close();

  const page = await b.newPage({ deviceScaleFactor: 1 });
  const url = (q) => "file://" + path.join(ROOT, "tools", "cards.html") + "?" + q;
  for (const id of ["g1", "g2", "g3", "g4", "g5"]) {
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.goto(url(`card=${id}&wreath=${encodeURIComponent("file://" + wreathPng)}`));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, "site/assets/gallery", `0${id.slice(1)}.jpg`), type: "jpeg", quality: 84 });
  }
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(url(`card=og&env=${encodeURIComponent("file://" + envPng)}`));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ROOT, "site/assets/images/og-walima.jpg"), type: "jpeg", quality: 86 });
  await b.close();
})();
