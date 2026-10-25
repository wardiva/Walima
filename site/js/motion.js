// Scroll storytelling and touch delight, shared by every screen.
//
//  • Depth: as a screen scrolls away its card sinks back under the next one
//    (it lags the scroll and shrinks), and the incoming card rises in. The
//    ornaments drift at their own depth (data-depth). One rAF per scroll
//    frame, and only the screens that touch the viewport are updated.
//  • Hero parallax: garland, wreath, names and roses shift with device tilt
//    (where the browser offers it without a permission prompt), a finger
//    dragged across the hero, or the mouse.
//  • Tap anywhere for a sparkle burst; a little dust follows the finger.
//  • haptic(): a short vibration where supported (Android).
// With Reduce Motion everything here stays still.

export const haptic = (pattern = 12) => {
  try { if (navigator.vibrate && navigator.userActivation?.hasBeenActive !== false) navigator.vibrate(pattern); } catch {}
};

export function initScrollDepth(scroller, sections, { reducedMotion }) {
  if (reducedMotion) return;
  // Where the browser has scroll-driven animations, the depth effect lives in
  // CSS (motion.css, .depth-css): it runs on the compositor in step with the
  // scroll and snap, with no thresholds to jump at.
  if (window.CSS?.supports?.("animation-timeline: view()")) {
    document.documentElement.classList.add("depth-css");
    return;
  }
  // Fallback: the same curves, updated every frame while the page is moving.
  const items = sections.filter((s) => s.dataset.section !== "opening").map((s) => ({
    s,
    card: s.querySelector(":scope > .card, :scope > .closing"),
    decos: [...s.querySelectorAll(":scope > .deco")].map((el) => ({ el, depth: +el.dataset.depth || 0 })),
  }));
  const hero = sections[0]?.querySelector(".hero");
  let raf = 0, lastTop = -1, idle = 0;

  const update = () => {
    const top = scroller.scrollTop, vh = scroller.clientHeight;
    if (top === lastTop) { if (++idle > 20) { raf = 0; return; } } else { idle = 0; lastTop = top; }
    if (hero) {
      const p = Math.min(1, top / vh);
      hero.style.translate = `0 ${(p * vh * 0.45).toFixed(1)}px`;
      hero.style.scale = String(1 - p * 0.08);
    }
    for (const it of items) {
      const st = it.s.offsetTop - top, sh = it.s.offsetHeight;
      if (st > vh * 1.05 || st + sh < -vh * 0.05) continue;     // well off screen: leave as is (no jump)
      let p = 0;
      if (st > 0) p = Math.min(1, st / vh);                          // entering from below
      else if (st + sh < vh) p = Math.max(-1, (st + sh - vh) / vh);   // leaving upwards
      if (it.card) {
        const a = Math.max(p, 0), l = Math.max(-p, 0);
        it.card.style.translate = `0 ${(a * vh * 0.16 + l * vh * 0.15).toFixed(1)}px`;
        it.card.style.scale = String(1 - a * 0.07 - l * 0.06);
        it.card.style.rotate = `x ${(a * 14).toFixed(2)}deg`;
      }
      for (const d of it.decos) d.el.style.translate = `0 ${(p * vh * d.depth).toFixed(1)}px`;
    }
    raf = requestAnimationFrame(update);
  };
  const kick = () => { idle = 0; if (!raf) raf = requestAnimationFrame(update); };
  scroller.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  kick();
}

/** Hero layers follow tilt / finger / mouse, eased in one rAF while the hero is on screen. */
export function initHeroParallax(hero, { reducedMotion }) {
  if (reducedMotion || !hero) return { setActive() {} };
  const layers = [...hero.querySelectorAll("[data-tilt]")].map((el) => ({ el, k: +el.dataset.tilt }));
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false, idleT = 0;
  const unit = () => hero.clientWidth / 504;

  const loop = (t) => {
    // a slow idle drift so it breathes even without input
    const ix = Math.sin(t / 2600) * 0.25, iy = Math.cos(t / 3400) * 0.2;
    const gx = performance.now() - idleT > 2500 ? ix : 0, gy = performance.now() - idleT > 2500 ? iy : 0;
    x += (tx + gx - x) * 0.06; y += (ty + gy - y) * 0.06;
    const u = unit() * 14;
    for (const l of layers) l.el.style.translate = `${(x * l.k * u).toFixed(2)}px ${(y * l.k * u).toFixed(2)}px`;
    raf = active ? requestAnimationFrame(loop) : 0;
  };
  const set = (nx, ny) => { tx = Math.max(-1, Math.min(1, nx)); ty = Math.max(-1, Math.min(1, ny)); idleT = performance.now(); };

  // Tilt: Android and desktop browsers fire this freely; iOS needs a permission
  // prompt, which we don't trigger, so iPhones use the finger instead.
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || !active) return;
    set(e.gamma / 25, (e.beta - 45) / 30);
  });
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  }, { passive: true });
  hero.addEventListener("touchmove", (e) => {
    const t = e.touches[0], r = hero.getBoundingClientRect();
    set(((t.clientX - r.left) / r.width - 0.5) * 2.4, ((t.clientY - r.top) / r.height - 0.5) * 1.2);
  }, { passive: true });

  return {
    setActive(on) {
      active = on;
      if (on && !raf) raf = requestAnimationFrame(loop);
    },
  };
}

/** The butterfly lands on the wreath; tap it and it flutters off and comes back. */
export function initButterfly(bf, { reducedMotion, onTap }) {
  if (!bf) return { arrive() {} };
  let state = "away", timer = 0;
  const arrive = () => {
    if (state !== "away") return;
    state = "flying";
    bf.classList.remove("is-leaving");
    bf.classList.add("is-arriving");
    timer = setTimeout(() => { state = "landed"; bf.classList.add("is-landed"); }, reducedMotion ? 0 : 3200);
  };
  bf.addEventListener("click", () => {
    if (state !== "landed") return;
    onTap?.(bf);
    state = "leaving";
    bf.classList.remove("is-arriving", "is-landed");
    bf.classList.add("is-leaving");
    clearTimeout(timer);
    timer = setTimeout(() => { state = "away"; bf.classList.remove("is-leaving"); requestAnimationFrame(() => requestAnimationFrame(arrive)); }, 4200);
  });
  return { arrive };
}

/** A soft ring spreads across the paper where the finger landed (under the cards). */
function ripple(e) {
  const section = e.target.closest(".section");
  const amb = section?.querySelector(":scope > .amb");
  if (!amb) return;
  const r = section.getBoundingClientRect();
  const el = document.createElement("i");
  el.className = "amb__ripple";
  el.style.left = `${e.clientX - r.left}px`;
  el.style.top = `${e.clientY - r.top}px`;
  amb.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

/** Tap anywhere: sparkles and a ripple on the paper. Drag a finger: dust. */
export function initTouchMagic(app, fx, { reducedMotion, skip = "button, a, input, select, textarea, summary, label, iframe, .cd__when, .bf, .s-closing" }) {
  if (reducedMotion) return;
  const pos = (x, y) => { const r = app.getBoundingClientRect(); return [x - r.left, y - r.top]; };
  app.addEventListener("pointerdown", (e) => {
    if (e.target.closest(skip)) return;
    fx.sparkle(...pos(e.clientX, e.clientY), 12);
    ripple(e);
  }, { passive: true });
  let lx = 0, ly = 0;
  const trail = (x, y) => {
    if (Math.hypot(x - lx, y - ly) < 16) return;
    lx = x; ly = y;
    fx.dust(...pos(x, y));
  };
  app.addEventListener("touchstart", (e) => { lx = e.touches[0].clientX; ly = e.touches[0].clientY; }, { passive: true });
  app.addEventListener("touchmove", (e) => { const t = e.touches[0]; trail(t.clientX, t.clientY); }, { passive: true });
  app.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" && e.buttons) trail(e.clientX, e.clientY); }, { passive: true });
}
