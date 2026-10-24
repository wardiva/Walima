import content from "../content.js";
import { renderSections } from "./render.js";
import { initOpening } from "./opening.js";
import { initMusic } from "./music.js";
import { initCountdown } from "./countdown.js";
import { createPetals } from "./petals.js";
import { initScratch } from "./scratch.js";
import { initGallery } from "./gallery.js";
import { initRsvp } from "./rsvp.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Document metadata ── */
document.documentElement.lang = content.meta.lang || "en";
document.title = content.meta.pageTitle;
document.querySelector('meta[name="description"]')?.setAttribute("content", content.meta.description);

/* ── Render ── */
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

/* ── Controls ── */
const cue = document.getElementById("scrollCue");
cue.setAttribute("aria-label", content.ui.scrollDown);

const music = initMusic({
  button: document.getElementById("musicBtn"),
  tracks: content.media.music,
  volume: content.media.musicVolume,
  labels: { on: content.ui.musicOn, off: content.ui.musicOff },
});

const petals = createPetals(document.getElementById("petals"), { reducedMotion });

/* ── Gallery and map load one screen ahead ── */
const gallery = initGallery(document.getElementById("galTrack"), document.getElementById("galDots"));
const nearObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const s = e.target;
      const map = s.querySelector("iframe[data-src]");
      if (map) map.src = map.dataset.src;
      if (s.dataset.section === "gallery") gallery.load();
      nearObserver.unobserve(s);
    }
  },
  { root: scroller, rootMargin: "100% 0px" }
);

/* ── Active section: reveal its content, manage the cue ── */
let opened = false;
let current = sections[0];

const setCurrent = (s) => {
  current = s;
  if (s.dataset.section !== "opening" || opened) s.classList.add("is-active");
  const isLast = s === sections[sections.length - 1];
  cue.classList.toggle("is-visible", opened && !isLast);
};

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
  onOpened() {
    opened = true;
    byName("opening").classList.add("is-active");
    scroller.classList.remove("is-locked");
    sections.forEach((s) => { nearObserver.observe(s); activeObserver.observe(s); midObserver.observe(s); });
    setCurrent(current);
    petals.burst();
  },
});

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

/* ── Countdown, with the date under scratch-off silver foil (petals on reveal) ── */
const countdownEl = document.getElementById("countdown");
initCountdown(countdownEl);
initScratch(countdownEl, { reducedMotion, onReveal: () => petals.burst() });

/* ── Q&A: one answer open at a time ── */
const faqs = [...scroller.querySelectorAll(".faq__item")];
faqs.forEach((d) => d.addEventListener("toggle", () => {
  if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
}));

/* ── RSVP ── */
initRsvp(document.getElementById("rsvp"), content.rsvp);

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
