import content from "../content.js";
import { renderSections } from "./render.js";
import { initOpening } from "./opening.js";
import { initMusic } from "./music.js";
import { initCountdown } from "./countdown.js";
import { createFx } from "./fx.js";
import { initScratch } from "./scratch.js";
import { initRsvp } from "./rsvp.js";
import { haptic, initScrollDepth, initHeroParallax, initButterfly, initTouchMagic } from "./motion.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.toggle("reduce-motion", reducedMotion);

/* ── Document metadata ── */
document.documentElement.lang = content.meta.lang || "en";
document.title = content.meta.pageTitle;
document.querySelector('meta[name="description"]')?.setAttribute("content", content.meta.description);

/* ── Render ── */
const app = document.getElementById("app");
const scroller = document.getElementById("scroller");
scroller.innerHTML = renderSections(content);
const sections = [...scroller.querySelectorAll(".section")];
const byName = (n) => scroller.querySelector(`[data-section="${n}"]`);

/* ── Paper: every screen shares three watercolour sheets ── */
const papers = { light: content.media.paperLight, blue: content.media.paper, deep: content.media.paperDeep };
for (const s of sections) {
  const bg = s.querySelector(":scope > .bg");
  if (bg && !bg.style.backgroundImage) bg.style.backgroundImage = `url("${papers[s.dataset.paper] || papers.blue}")`;
}

/* ── Effects layer (petals, sparkles, confetti, fireworks) ── */
const fx = createFx(document.getElementById("fx"), { reducedMotion });
/** Viewport point → effects-canvas point. */
const local = (x, y) => { const r = app.getBoundingClientRect(); return [x - r.left, y - r.top]; };
const centre = (el) => { const r = el.getBoundingClientRect(); return local(r.left + r.width / 2, r.top + r.height / 2); };

/* ── Seamless boundaries: each screen fades, at its top and bottom edge, into
      one colour it shares with its neighbour (the mix of both papers and
      tints there), so no straight edge shows while a screen slides past. ── */
const PAPER_EDGES = { light: [[186, 204, 213], [195, 211, 219]], blue: [[162, 182, 195], [164, 184, 196]], deep: [[78, 99, 125], [85, 107, 132]] };
const over = (base, tint) => { // tint = "rgba(r, g, b, a)" laid over an opaque base
  const m = /rgba?\(([^)]+)\)/.exec(tint || "");
  if (!m) return base;
  const [r, g, b, a = 1] = m[1].split(",").map(Number);
  return base.map((c, i) => c + ([r, g, b][i] - c) * a);
};
const paintEdges = () => {
  const ends = sections.map((s) => {
    const amb = s.querySelector(":scope > .amb"), cs = amb && getComputedStyle(amb);
    const [top, bot] = PAPER_EDGES[s.dataset.paper] || PAPER_EDGES.blue;
    return [over(top, cs?.getPropertyValue("--t1")), over(bot, cs?.getPropertyValue("--t2"))];
  });
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(", ")})`;
  sections.forEach((s, i) => {
    if (i > 0) s.style.setProperty("--edge-top", rgb(ends[i - 1][1].map((v, k) => (v + ends[i][0][k]) / 2)));
    if (i < sections.length - 1) s.style.setProperty("--edge-bot", rgb(ends[i][1].map((v, k) => (v + ends[i + 1][0][k]) / 2)));
  });
};
paintEdges();

/* ── Controls ── */
const cue = document.getElementById("scrollCue");
cue.setAttribute("aria-label", content.ui.scrollDown);

const music = initMusic({
  button: document.getElementById("musicBtn"),
  tracks: content.media.music,
  volume: content.media.musicVolume,
  labels: { on: content.ui.musicOn, off: content.ui.musicOff },
});

/* ── Hero ── */
const hero = document.getElementById("hero");
const heroParallax = initHeroParallax(hero, { reducedMotion });
const butterfly = initButterfly(document.getElementById("butterfly"), {
  reducedMotion,
  onTap: (bf) => { haptic(10); fx.sparkle(...centre(bf), 10); },
});

/* ── Countdown: flip digits + silver scratch-off date ── */
const countdownEl = document.getElementById("countdown");
const countdown = initCountdown(countdownEl, { reducedMotion });
initScratch(countdownEl, {
  reducedMotion,
  onReveal: (x, y) => {
    haptic([18, 40, 18]);
    fx.petals();
    fx.sparkle(...local(x, y), 22, 1.6);
  },
});

/* ── Closing: fireworks while the screen is in view; tap the sky for more ── */
const closingEl = byName("closing");
let fwTimer = 0, fwSince = 0;
const fireworks = (on) => {
  clearTimeout(fwTimer);
  if (!on || reducedMotion) return;
  fwSince = performance.now();
  const loop = () => {
    fx.firework();
    const calm = performance.now() - fwSince > 9000;
    fwTimer = setTimeout(loop, calm ? 2600 + Math.random() * 2000 : 700 + Math.random() * 700);
  };
  fwTimer = setTimeout(loop, 900);
};
closingEl.addEventListener("pointerdown", (e) => {
  if (reducedMotion) return;
  const [x, y] = local(e.clientX, e.clientY);
  fx.firework(x, y);
  haptic(6);
});

/* ── Which screens are on screen (CSS pauses loops elsewhere) ── */
const onscreenObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      // a screen that only touches the viewport's edge reports "intersecting"
      // with a ratio of 0: it isn't really on screen
      const on = e.isIntersecting && e.intersectionRatio > 0;
      e.target.classList.toggle("is-onscreen", on);
      const name = e.target.dataset.section;
      if (name === "countdown") countdown.setVisible(on);
      if (name === "opening") heroParallax.setActive(on && opened);
      if (name === "closing") fireworks(on);
    }
  },
  { root: scroller, threshold: [0, 0.02] }
);

/* ── Active section: reveal its content, manage the cue ── */
let opened = false;
let current = sections[0];

const setCurrent = (s) => {
  current = s;
  if (s.dataset.section !== "opening" || opened) {
    s.classList.add("is-active");
  }
  const isLast = s === sections[sections.length - 1];
  cue.classList.toggle("is-visible", opened && !isLast);
  queueCue?.();
};

// Reveal a screen on its first visible pixel, so its card flows in with the
// swipe instead of popping in after the scroll has landed. (A neighbour that
// only touches the viewport's edge reports a ratio of 0: not yet.)
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting && e.intersectionRatio > 0 && e.target.dataset.section !== "opening") e.target.classList.add("is-active");
    }
  },
  { root: scroller, threshold: [0, 0.01] }
);
const activeObserver = new IntersectionObserver(
  (entries) => { for (const e of entries) if (e.isIntersecting) setCurrent(e.target); },
  { root: scroller, threshold: 0.5 }
);
// A tall section is never 50% visible on a short screen; use a midline band too.
const midObserver = new IntersectionObserver(
  (entries) => { for (const e of entries) if (e.isIntersecting) setCurrent(e.target); },
  { root: scroller, rootMargin: "-45% 0px -45% 0px" }
);

/* ── Opening: the envelope ── */
initOpening({
  section: byName("opening"),
  music,
  reducedMotion,
  onSeal(x, y) {
    haptic(28);
    fx.crumbs(...local(x, y));
  },
  onOpened() {
    opened = true;
    byName("opening").classList.add("is-active");
    scroller.classList.remove("is-locked");
    sections.forEach((s) => { revealObserver.observe(s); activeObserver.observe(s); midObserver.observe(s); onscreenObserver.observe(s); });
    setCurrent(current);
    fx.petals();
    heroParallax.setActive(true);
    initScrollDepth(scroller, sections, { reducedMotion });
    if (reducedMotion) return;
    // a sparkle where each name finishes writing, then the butterfly arrives
    const names = hero.querySelectorAll(".hero__name");
    [[names[0], 1450], [names[1], 2450]].forEach(([el, ms]) => setTimeout(() => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      fx.sparkle(...local(r.right - r.width * 0.12, r.top + r.height * 0.45), 14);
    }, ms));
    setTimeout(() => butterfly.arrive(), 2600);
  },
});

/* ── The cue steps aside whenever it would cover a card (short screens,
      large system text), and returns once the card has scrolled clear.
      Measured from layout, so reveal and scroll-depth transforms can't
      make it flicker. ── */
const cueBtn = cue.querySelector(".scroll-cue__btn");
let cueRaf = 0;
const checkCue = () => {
  cueRaf = 0;
  const card = current?.querySelector(":scope > .card, :scope > .closing");
  let clash = false;
  if (card && opened) {
    const bottom = current.offsetTop + card.offsetTop + card.offsetHeight - scroller.scrollTop;
    const top = current.offsetTop + card.offsetTop - scroller.scrollTop;
    const q = cueBtn.getBoundingClientRect(), s = scroller.getBoundingClientRect();
    clash = q.top - s.top < bottom - 4 && q.bottom - s.top > top;
  }
  cue.classList.toggle("is-tucked", clash);
};
// Decide only once the scroll has come to rest, so the cue doesn't blink
// in and out while a screen slides past.
let cueIdle = 0;
const queueCue = () => {
  clearTimeout(cueIdle);
  cueIdle = setTimeout(() => { if (!cueRaf) cueRaf = requestAnimationFrame(checkCue); }, 160);
};
scroller.addEventListener("scroll", queueCue, { passive: true });
window.addEventListener("resize", queueCue);
const cardSizes = new ResizeObserver(queueCue);
scroller.querySelectorAll(".card").forEach((c) => cardSizes.observe(c));

/* ── Scroll cue: jump to the next screen ── */
cue.addEventListener("click", () => {
  const top = scroller.scrollTop;
  const next = sections.find((s) => s.offsetTop > top + 8);
  if (!next) return;
  // Within a tall section, first move down by a screen.
  const end = current.offsetTop + current.offsetHeight;
  const target = end - top > scroller.clientHeight * 1.2 && current.offsetTop <= top + 8
    ? Math.min(top + scroller.clientHeight * 0.85, end - scroller.clientHeight)
    : next.offsetTop;
  scroller.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
});

/* ── Dress code: tap a hanger to set it swinging ── */
scroller.querySelectorAll(".hang").forEach((h, i) => h.addEventListener("click", () => {
  if (reducedMotion) return;
  haptic(8);
  const dir = i ? -1 : 1;
  h.animate([0, 16, -12, 8, -5, 2.5, 0].map((a) => ({ transform: `rotate(${a * dir}deg)` })), { duration: 1800, easing: "ease-in-out" });
}));

/* ── Q&A: one answer open at a time, with a little sparkle ── */
const faqs = [...scroller.querySelectorAll(".faq__item")];
faqs.forEach((d) => d.addEventListener("toggle", () => {
  if (!d.open) return;
  faqs.forEach((o) => { if (o !== d) o.open = false; });
  haptic(6);
  fx.sparkle(...centre(d.querySelector("summary i")), 8, 0.6);
}));

/* ── RSVP: confetti and hearts for yes, a gentle drift for no ── */
initRsvp(document.getElementById("rsvp"), content.rsvp, {
  onInvalid: () => haptic([30, 50, 30]),
  onFail: () => haptic([30, 50, 30]),
  onReply(answer, button) {
    const [x, y] = centre(button);
    if (answer === "yes") {
      haptic([20, 40, 20, 40, 60]);
      fx.confetti(x, y);
      fx.hearts(x, y, 12);
    } else {
      haptic(15);
      fx.drift();
    }
  },
});

/* ── Tap anywhere: sparkles; a finger leaves a trail of dust ── */
initTouchMagic(app, fx, { reducedMotion });

/* ── Keep the column sized to the visible viewport on mobile browsers ── */
const syncHeight = () => {
  // The on-screen keyboard shrinks the viewport: keep the layout still while typing.
  if (document.activeElement?.matches?.("input, select, textarea")) return;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-h", `${vh}px`);
};
syncHeight();
window.visualViewport?.addEventListener("resize", syncHeight);
window.addEventListener("orientationchange", () => setTimeout(syncHeight, 300));
