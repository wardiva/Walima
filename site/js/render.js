// Section templates. Content comes exclusively from content.js; layout and
// styling live in CSS. Each function returns the markup for one screen.
//
// Motion hooks used by the templates (see motion.css):
//   data-reveal[="kind"]  fades/moves in when the screen becomes active
//   .write                 script text "written in" left to right
//   .w / .aw               words revealed one by one (Latin / Arabic)
//   data-depth             scroll parallax depth of an ornament
import * as icon from "./icons.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** data-reveal helper: r(2) → stagger step 2 */
const r = (i, kind = "") => `data-reveal${kind ? `="${kind}"` : ""} style="--i:${i}"`;

/** A string or a list of lines → escaped lines joined with <br> */
const lines = (v) => (Array.isArray(v) ? v : [v]).map(esc).join("<br />");

/** Words wrapped for a word-by-word reveal; `start` offsets the stagger. */
const words = (text, cls = "w", start = 0) =>
  String(text).trim().split(/\s+/).map((w, k) => `<span class="${cls}" style="--wi:${k + start}">${esc(w)}</span>`).join(" ");

/** Script text that writes itself in (a clip window sliding left → right). */
const write = (text, cls = "", delay = 0, ivory = false) =>
  `<span class="write ${cls}" style="--wd:${delay}s"><span class="write__in"><span class="script${ivory ? " script--ivory" : ""}">${esc(text)}</span></span></span>`;

const ART = "assets/images/";
let decoN = 0;
/** An ivory relief ornament: a positioned wrapper (parallax + bloom) around a
    swaying image. `seed` pins its sway (period and phase) when it matters. */
const deco = (name, cls, i = 0, depth = 0.12, seed) => {
  const n = seed ?? decoN; decoN++;
  const sway = `--sw:${(6 + (n * 37) % 5).toFixed(1)}s;--sd:${-((n * 53) % 7)}s`;
  return `<span class="deco ${cls}" data-depth="${depth}" data-reveal="bloom" style="--i:${i};--d:${depth};${sway}"><img src="${ART}${name}.webp" alt="" decoding="async" /></span>`;
};

/** Opens a screen; main.js paints its paper backdrop from data-paper. */
const section = (name, paper, extra = "") =>
  `<section class="section s-${name} ${extra}" data-section="${name}" data-paper="${paper}">
    <div class="bg"></div>
    ${ambient(name)}`;

/* ───────────── Living backgrounds ─────────────
   Each screen has its own ambient layer between the paper and the
   ornaments (styles in ambient.css). Together they are one day passing as
   you scroll: morning light → ink on paper → drifting clouds → afternoon
   sun → garden shade → the bride's chiffon → ink blooms, dandelion seeds
   and hearts on the wind → fairy lights at dusk → moonrise → a night of
   lanterns. Elements
   with data-depth also drift with the scroll (motion.js). */
const many = (n, cls, vars = () => "") => Array.from({ length: n }, (_, k) => `<i class="${cls}" style="--k:${k};${vars(k)}"></i>`).join("");
const AMBIENT = {
  opening: `<i class="amb__leak"></i><i class="amb__dapple"></i><i class="amb__leaves" data-depth="0.08"></i><i class="amb__leaves amb__leaves--far" data-depth="0.04"></i>`,
  letter: `<i class="amb__bloom amb__bloom--1" data-depth="0.1"></i><i class="amb__bloom amb__bloom--2" data-depth="-0.08"></i><i class="amb__bloom amb__bloom--3" data-depth="0.05"></i><i class="amb__dust"></i><i class="amb__dust amb__dust--2"></i>`,
  countdown: `<i class="amb__sun"></i>${many(4, "amb__cloud")}`,
  schedule: `<i class="amb__beams"></i><i class="amb__sun amb__sun--corner"></i><i class="amb__dust amb__dust--ivory"></i>`,
  venue: `<i class="amb__leaves amb__leaves--garden" data-depth="0.08"></i><i class="amb__dapple amb__dapple--garden"></i>${many(7, "amb__floret")}`,
  dress: `<i class="amb__silk amb__silk--1" data-depth="0.1"></i><i class="amb__silk amb__silk--2" data-depth="-0.08"></i><i class="amb__silk amb__silk--3"></i>${many(6, "amb__glint")}`,
  faq: `<i class="amb__bloom amb__bloom--4" data-depth="0.1"></i><i class="amb__bloom amb__bloom--5" data-depth="-0.06"></i>${many(8, "amb__seed")}`,
  rsvp: `<i class="amb__bokeh-set">${many(5, "amb__bokeh", (k) => `--w:${70 + (k * 23) % 60}`)}</i><i class="amb__curtain">${fairyLights()}</i>`,
  dua: `<i class="amb__stars"></i><i class="amb__stars amb__stars--2"></i><i class="amb__moon"><svg viewBox="0 0 100 100"><defs><radialGradient id="moonG" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e9d9b0"/></radialGradient><mask id="moonM"><rect width="100" height="100" fill="#fff"/><circle cx="64" cy="40" r="34" fill="#000"/></mask></defs><circle cx="50" cy="50" r="36" fill="url(#moonG)" mask="url(#moonM)"/></svg></i>`,
  closing: `<i class="amb__stars"></i><i class="amb__stars amb__stars--2"></i>${many(7, "amb__skylantern", (k) => `--w:${12 + (k * 5) % 9}`)}`,
};
/** Fairy lights: a few strands at irregular spacing and depth, each bulb with its own slow twinkle. */
function fairyLights() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const xs = [2.5, 7, 13, 27, 48, 72, 87, 93, 97.5];
  return xs.map((x, k) => {
    const depth = [0.9, 0.6, 1, 0.55, 0.5, 0.6, 1, 0.65, 0.9][k];
    const len = 62 + Math.round(rnd() * 34);
    let y = 4 + rnd() * 8, bulbs = "";
    while (y < 94) {
      bulbs += `<i class="amb__bulb" style="--y:${y.toFixed(1)}%;--s:${(0.7 + rnd() * 0.6).toFixed(2)};--d:${(2.2 + rnd() * 3).toFixed(2)}s;--dl:${(-rnd() * 5).toFixed(2)}s"></i>`;
      y += 9 + rnd() * 13;
    }
    const run = k % 3 === 1 ? `<i class="amb__run" style="--rd:${(9 + rnd() * 6).toFixed(1)}s;--rl:${(-rnd() * 9).toFixed(1)}s"><i></i></i>` : "";
    return `<i class="amb__strand" style="--x:${x}%;--len:${len}%;--depth:${depth};--sw:${(6 + rnd() * 4).toFixed(1)}s;--sd:${(-rnd() * 6).toFixed(1)}s">${bulbs}${run}</i>`;
  }).join("");
}
const ambient = (name) => (AMBIENT[name] ? `<div class="amb amb--${name}" aria-hidden="true">${AMBIENT[name]}</div>` : "");

/** Twinkling stars, positioned in CSS by :nth-child. */
const twinkles = (n, cls) => `<span class="twinkles ${cls}" aria-hidden="true">${"<i></i>".repeat(n)}</span>`;

function opening(c) {
  const { couple: cp, intro, hero: h, media: m } = c;
  return `
  <section class="section s-opening is-intro" id="opening" data-section="opening" data-paper="light">
    <div class="bg" style="background-image:url('${m.paperLight}')"></div>
    ${ambient("opening")}

    <!-- The sealed envelope -->
    <div class="env-scene" aria-hidden="true">
      <img class="deco env-scene__roses env-scene__roses--tl" src="${ART}roses-cluster.webp" alt="" />
      <img class="deco env-scene__roses env-scene__roses--br" src="${ART}roses-cluster.webp" alt="" />
      ${twinkles(8, "env-scene__twinkles")}
      <div class="env">
        <div class="env__back"></div>
        <div class="env__letter">
          <span class="arabic env__letter-bismillah" lang="ar">${esc(intro.letterBlessing)}</span>
          <span class="arabic env__letter-verse" lang="ar">${esc(intro.letterVerseArabic)}</span>
          <span class="env__letter-trans">${esc(intro.letterVerseTranslation)} ${esc(intro.letterVerseReference)}</span>
          <span class="serif env__letter-date">${esc(intro.letterDate)}</span>
        </div>
        <div class="env__front">
          <span class="caps env__line">${esc(intro.envelopeLine)}</span>
          <span class="script script--ivory env__names">${esc(intro.envelopeTitle)}</span>
        </div>
        <div class="env__flap"><div class="env__flap-out"></div><div class="env__flap-in"></div></div>
        <div class="env__seal">${icon.waxSeal()}</div>
      </div>
    </div>

    <button class="intro" id="tapToOpen" type="button" aria-label="${esc(intro.tapToOpen)}">
      <span class="intro__tap">
        <span class="intro__halo" aria-hidden="true"></span>
        <span class="caps">${esc(intro.tapToOpen)}</span>
      </span>
    </button>

    <!-- The hero, revealed once the envelope opens: inside a growing wreath,
         the groom, then the bride as her father's beloved daughter (never her name) -->
    <div class="hero" id="hero">
      <span class="hero__layer hero__garland-wrap" data-tilt="1.1">
        <span class="deco hero__garland" data-reveal="bloom" style="--i:0"><img src="${ART}garland-bows.webp" alt="" /></span>
      </span>
      <span class="caps hero__eyebrow" ${r(1)}>${esc(h.eyebrow)}</span>
      <div class="hero__ring">
        <span class="hero__layer hero__wreath" data-tilt="0.45">${icon.wreath()}</span>
        <h1 class="hero__names hero__layer" data-tilt="-0.25">
          <span class="sr-only">${esc(h.eyebrow)} ${esc(cp.groom.name)} ${esc(cp.joiner)} ${esc(cp.bride.display)} ${esc(cp.bride.parent)}</span>
          <span aria-hidden="true" class="hero__names-in">
            ${write(cp.groom.shortName, "hero__name", 0.55)}
            <span class="caps hero__with">${esc(cp.joiner)}</span>
            ${write(cp.bride.display, "hero__daughter", 1.45)}
            ${write(cp.bride.parent, "hero__name hero__name--parent", 2.15)}
          </span>
        </h1>
        ${twinkles(7, "hero__twinkles")}
        <button class="bf" id="butterfly" type="button" tabindex="-1" aria-hidden="true"><span class="bf__body">${icon.butterfly}</span></button>
      </div>
      <span class="serif hero__date" ${r(9)}>${esc(h.date)}</span>
      <span class="hero__layer hero__roses-wrap" data-tilt="1.6">
        <span class="deco hero__roses hero__roses--l" data-reveal="bloom" style="--i:5"><img src="${ART}roses-cluster.webp" alt="" /></span>
        <span class="deco hero__roses hero__roses--r" data-reveal="bloom" style="--i:6"><img src="${ART}roses-cluster.webp" alt="" /></span>
      </span>
      <span class="hero__layer hero__motes" data-tilt="2.2" aria-hidden="true">${"<i></i>".repeat(10)}</span>
    </div>
  </section>`;
}

function letter(c) {
  const l = c.letter, cp = c.couple;
  return `
  ${section("letter", "light")}
    ${deco("roses-spray", "d-letter-tl", 0, 0.22)}
    ${deco("roses-cluster", "d-letter-br", 1, -0.18)}
    <div class="card letter-card" ${r(0, "unfold")}>
      ${deco("crest-shell", "d-card-crest", 1, 0)}
      <div class="arabic letter-card__bismillah" lang="ar">${words(l.bismillah, "aw")}</div>
      <p class="letter-card__lead" ${r(4)}>${lines(l.lines)}</p>
      <span class="caps letter-card__event" ${r(5)}>${esc(l.eventLine)}</span>
      ${write(cp.groom.name, "letter-card__name", 1.0)}
      <span class="caps letter-card__with" ${r(9)}>${esc(cp.joiner)}</span>
      ${write(cp.bride.display, "letter-card__daughter", 1.6)}
      ${write(cp.bride.parent, "letter-card__name letter-card__name--parent", 2.2)}
    </div>
  </section>`;
}

/** One split-flap digit: static halves + two flaps (animated in countdown.js). */
const flipDigit = () => `<span class="fd"><span class="fd__half fd__top"><b>0</b></span><span class="fd__half fd__bot"><b>0</b></span><span class="fd__half fd__top fd__flap fd__flap--top"><b>0</b></span><span class="fd__half fd__bot fd__flap fd__flap--bot"><b>0</b></span></span>`;

function countdown(c) {
  const k = c.countdown;
  const units = ["days", "hours", "minutes", "seconds"];
  return `
  ${section("countdown", "blue")}
    ${deco("garland-roses", "d-top-garland", 0, 0.3)}
    ${deco("hydrangea", "d-cd-bl", 2, -0.2)}
    <div class="card cd-card" id="countdown" data-target="${esc(k.target)}" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(k.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(k.title, "", 0.45)}</h2>
      <div class="cd__when" data-hint="${esc(k.scratchHint)}" ${r(4)}>
        <span class="caps cd__day">${esc(k.day)}</span>
        <span class="serif cd__date">${esc(k.date)}</span>
        <span class="serif cd__time">${esc(k.time)}</span>
        <canvas class="cd__foil" aria-hidden="true"></canvas>
        <span class="cd__hint" aria-hidden="true">${icon.hand}</span>
      </div>
      <div class="cd__count" ${r(7)}>
        ${units.map((u, i) => `<div class="cd__cell" data-unit="${u}" style="--ci:${i}"><span class="flip" data-num role="timer" aria-label="00">${flipDigit()}${flipDigit()}</span><span class="caps cd__label">${esc(k.labels[u])}</span></div>`).join("")}
      </div>
    </div>
  </section>`;
}

function schedule(c) {
  const s = c.schedule;
  const row = (it, i) => `
        <li class="tl__row" style="--ri:${i}">
          <span class="serif tl__time">${esc(it.time)}${it.period ? `<small>${esc(it.period)}</small>` : ""}</span>
          <span class="tl__node" aria-hidden="true"></span>
          <span class="tl__what">${icon.timelineIcon(it.title)}<span>${esc(it.title)}</span></span>
        </li>`;
  return `
  ${section("schedule", "blue")}
    ${deco("crest-scroll", "d-top-crest", 0, 0.3)}
    ${deco("roses-cluster", "d-sched-br", 2, -0.2)}
    <div class="card sched-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(s.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(s.title, "", 0.4)}</h2>
      <ol class="tl" style="--rows:${s.items.length}">
        <span class="tl__line" aria-hidden="true"><span class="tl__run"><i></i></span></span>${s.items.map(row).join("")}
      </ol>
    </div>
  </section>`;
}

/**
 * An illustrated map in the invitation's palette: the main road (labelled
 * with venue.address), the farmhouse plot with the dropped pin, a compass
 * and a little car on its way. It's a picture, not a survey: tapping it
 * opens the real location (venue.mapsUrl) in Google Maps.
 */
function mapArt(v) {
  const rows = Array.from({ length: 9 }, (_, i) => `<rect x="${236 + i * 19}" y="150" width="15" height="120" rx="3"/>`).join("");
  const blocks = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) {
    if ((x + y * 2) % 7 === 3) continue;
    blocks.push(`<rect x="${-6 + x * 40}" y="${-8 + y * 34}" width="32" height="26" rx="4"/>`);
  }
  const trees = (cx, cy, n) => Array.from({ length: n }, (_, i) => {
    const a = i * 2.4, rr = 4 + (i % 3) * 5;
    return `<circle cx="${(cx + Math.cos(a) * rr).toFixed(1)}" cy="${(cy + Math.sin(a) * rr * 0.7).toFixed(1)}" r="${3.2 + (i % 2)}"/>`;
  }).join("");
  return `
<svg class="map-art" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g class="map-art__fields" transform="rotate(-6 320 210)">${rows}</g>
  <g class="map-art__blocks" transform="rotate(-8 90 60)">${blocks.join("")}</g>
  <g class="map-art__park"><ellipse cx="92" cy="196" rx="54" ry="34"/><g class="map-art__trees">${trees(92, 196, 11)}</g></g>
  <g class="map-art__park"><ellipse cx="348" cy="70" rx="40" ry="26"/><g class="map-art__trees">${trees(348, 70, 7)}</g></g>
  <g class="map-art__roads">
    <path d="M-10 150C110 136 250 170 410 146"/><path d="M58-10L104 260"/><path d="M-10 92C70 96 150 84 230 70"/><path d="M226 128L246 126"/>
  </g>
  <g class="map-art__main">
    <path class="map-art__casing" d="M296-12L148 262"/><path class="map-art__lane" d="M296-12L148 262"/><path class="map-art__dash" d="M296-12L148 262"/>
    <path id="mapRoadLabel" d="M156 252L292 0" fill="none"/>
    <text class="map-art__road-label"><textPath href="#mapRoadLabel" startOffset="50%" text-anchor="middle">${esc(String(v.address).toUpperCase())}</textPath></text>
  </g>
  <g class="map-art__plot"><rect x="238" y="104" width="58" height="44" rx="9"/><g class="map-art__trees">${trees(252, 116, 4)}${trees(284, 138, 3)}</g></g>
  <g class="map-art__car-path"><g class="map-art__car"><rect x="-4.5" y="-8" width="9" height="16" rx="3.2"/><rect class="map-art__glass" x="-3.3" y="-5.4" width="6.6" height="3.4" rx="1"/></g></g>
  <text class="map-art__city" x="40" y="62">${esc(String(v.city).toUpperCase())}</text>
  <g class="map-art__compass" transform="translate(370 32)"><circle r="14"/><path d="M0-11L3.6 0H-3.6Z"/><path class="map-art__compass-s" d="M0 11L3.6 0H-3.6Z"/><text y="-17">N</text></g>
  <g class="map-art__tag" transform="translate(276 178)"><rect x="-62" y="-15" width="124" height="30" rx="15"/><text y="6">${esc(v.name)}</text></g>
</svg>`;
}

function venue(c) {
  const v = c.venue;
  const where = `${v.name} ${v.subName}, ${v.address}, ${v.city}`;
  return `
  ${section("venue", "blue")}
    ${deco("garland-bows", "d-top-garland", 0, 0.3)}
    <div class="card venue-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="card-title venue__name" ${r(2)}>${write(v.name, "", 0.4)}</h2>
      <span class="venue__sub" ${r(5)}>${esc(v.subName)}</span>
      <span class="venue__addr" ${r(6)}>${esc(v.address)}</span>
      <span class="caps venue__city" ${r(7)}>${esc(v.city)}</span>
      <a class="venue__map" href="${esc(v.mapsUrl)}" target="_blank" rel="noopener" aria-label="${esc(v.openLocation)}: ${esc(where)}" ${r(8)}>
        ${mapArt(v)}
        <span class="pin-drop" aria-hidden="true"><span class="pin-drop__ripple"></span><span class="pin-drop__ripple pin-drop__ripple--2"></span><span class="pin-drop__shadow"></span><span class="pin-drop__pin">${icon.dropPin}</span></span>
        <span class="venue__map-open" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></span>
      </a>
      <a class="caps btn btn--navy btn--shine" href="${esc(v.mapsUrl)}" target="_blank" rel="noopener" ${r(9)}>${icon.pin}<span>${esc(v.openLocation)}</span></a>
    </div>
  </section>`;
}

function dressCode(c) {
  const d = c.dressCode;
  return `
  ${section("dress", "blue")}
    ${deco("roses-cluster", "d-dress-tl", 0, 0.25)}
    ${deco("roses-spray", "d-dress-br", 1, -0.2)}
    <div class="card dress-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(d.eyebrow)}</span>
      <div class="dress__icons" ${r(2)}>
        <span class="hang" style="--hi:0">${icon.hanger}${icon.suit}</span>
        <span class="hang" style="--hi:1">${icon.hanger}${icon.gown}</span>
      </div>
      <h2 class="card-title dress__title" ${r(4)}>${write(d.title, "", 0.9)}</h2>
      ${deco("divider-scroll", "d-card-divider", 6, 0)}
      <span class="dress__note" ${r(8)}>${esc(d.note)}</span>
    </div>
  </section>`;
}

function faq(c) {
  const f = c.faq;
  return `
  ${section("faq", "blue", "section--tall")}
    ${deco("roses-flourish", "d-faq-tr", 0, 0.25, 7)}
    ${deco("roses-spray", "d-faq-bl", 2, -0.2, 8)}
    ${twinkles(6, "float-hearts")}
    <div class="card faq-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(f.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(f.title, "", 0.4)}</h2>
      <div class="faq">
        ${f.items.map((it, i) => `
        <details class="faq__item" ${r(4 + i, i % 2 ? "right" : "left")}>
          <summary><span>${esc(it.q)}</span><i aria-hidden="true"></i></summary>
          <p>${esc(it.a)}</p>
        </details>`).join("")}
      </div>
    </div>
  </section>`;
}

function rsvp(c) {
  const v = c.rsvp;
  return `
  ${section("rsvp", "blue", "section--tall")}
    ${deco("garland-roses", "d-top-garland", 0, 0.3)}
    <div class="card rsvp-card" id="rsvp" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(v.title, "", 0.4)}</h2>
      <p class="rsvp__by" ${r(4)}>${esc(v.byLine)}<br /><span class="serif rsvp__date">${esc(v.byDate)}</span></p>
      <form class="rsvp__form" novalidate ${r(5)}>
        <fieldset class="rsvp__fields">
          <label class="rsvp__field rsvp__name">
            <span class="sr-only">${esc(v.namePlaceholder)}</span>
            <input name="name" type="text" autocomplete="name" placeholder="${esc(v.namePlaceholder)}" maxlength="60" required />
          </label>
          <label class="rsvp__field rsvp__guests">
            <span class="caps">${esc(v.guestsLabel)}</span>
            <input name="guests" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="2" value="1" aria-label="${esc(v.guestsLabel)} (1–${v.maxGuests})" />
          </label>
          <label class="rsvp__field rsvp__note">
            <span class="sr-only">${esc(v.messagePlaceholder)}</span>
            <input name="message" type="text" autocomplete="off" placeholder="${esc(v.messagePlaceholder)}" maxlength="200" />
          </label>
          <label class="rsvp__hp" aria-hidden="true">Website <input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
          <p class="rsvp__error" role="alert" aria-live="assertive"></p>
          <button class="caps btn btn--navy btn--shine" type="submit" value="yes">${icon.check}<span>${esc(v.attend)}</span></button>
          <button class="caps btn btn--ghost" type="submit" value="no"><span>${esc(v.decline)}</span></button>
        </fieldset>
      </form>
      <div class="rsvp__done" hidden>
        <span class="rsvp__mark" aria-hidden="true">${icon.heart}</span>
        <p class="rsvp__thanks"></p>
        <button class="caps rsvp__change" type="button">${esc(v.change)}</button>
      </div>
    </div>
  </section>`;
}

function dua(c) {
  const d = c.dua;
  return `
  ${section("dua", "blue")}
    ${deco("roses-cluster", "d-dua-tl", 0, 0.25)}
    ${deco("roses-cluster", "d-dua-br", 1, -0.2)}
    <span class="rays" aria-hidden="true"></span>
    <div class="card dua-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(d.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(d.title, "", 0.4)}</h2>
      <p class="dua__line" ${r(5)}>${esc(d.line)}</p>
      ${deco("divider-flowers", "d-card-divider", 6, 0)}
      <div class="arabic dua__arabic" lang="ar">${words(d.arabic, "aw")}</div>
      <p class="dua__trans" style="--wi:${d.arabic.trim().split(/\s+/).length + 1}">${esc(d.translation)}</p>
    </div>
  </section>`;
}

function closing(c) {
  const k = c.closing, cp = c.couple;
  return `
  ${section("closing", "deep")}
    ${deco("roses-cluster", "d-closing-bl", 2, -0.2)}
    ${deco("roses-cluster", "d-closing-tr", 3, 0.25)}
    <span class="lanterns" aria-hidden="true">
      <span class="lantern" style="--li:0">${icon.lantern("a")}<i class="lantern__glow"></i></span>
      <span class="lantern" style="--li:1">${icon.lantern("b")}<i class="lantern__glow"></i></span>
      <span class="lantern" style="--li:2">${icon.lantern("c")}<i class="lantern__glow"></i></span>
    </span>
    <div class="closing" ${r(0, "fade")}>
      ${deco("crest-shell", "d-closing-crest", 0, 0)}
      <span class="script script--ivory closing__line" ${r(1)}>${lines(k.lines)}</span>
      <span class="arabic closing__insha" lang="ar" ${r(4, "glow")}>${esc(k.inshaAllah)}</span>
    </div>
  </section>`;
}

export function renderSections(c) {
  decoN = 0;
  return [opening, letter, countdown, schedule, venue, dressCode, faq, rsvp, dua, closing]
    .map((fn) => fn(c))
    .join("");
}
