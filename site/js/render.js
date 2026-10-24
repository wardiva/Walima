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
/** An ivory relief ornament: a positioned wrapper (parallax + bloom) around a swaying image. */
const deco = (name, cls, i = 0, depth = 0.12) => {
  const n = decoN++;
  const sway = `--sw:${(6 + (n * 37) % 5).toFixed(1)}s;--sd:${-((n * 53) % 7)}s`;
  return `<span class="deco ${cls}" data-depth="${depth}" data-reveal="bloom" style="--i:${i};${sway}"><img src="${ART}${name}.webp" alt="" decoding="async" loading="lazy" /></span>`;
};

/** Opens a screen; main.js paints its paper backdrop from data-paper. */
const section = (name, paper, extra = "") =>
  `<section class="section s-${name} ${extra}" data-section="${name}" data-paper="${paper}">
    <div class="bg"></div>`;

/** Twinkling stars, positioned in CSS by :nth-child. */
const twinkles = (n, cls) => `<span class="twinkles ${cls}" aria-hidden="true">${"<i></i>".repeat(n)}</span>`;

function opening(c) {
  const { couple: cp, intro, hero: h, media: m } = c;
  return `
  <section class="section s-opening is-intro" id="opening" data-section="opening" data-paper="light">
    <div class="bg" style="background-image:url('${m.paperLight}')"></div>

    <!-- The sealed envelope -->
    <div class="env-scene" aria-hidden="true">
      <img class="deco env-scene__roses env-scene__roses--tl" src="${ART}roses-cluster.webp" alt="" />
      <img class="deco env-scene__roses env-scene__roses--br" src="${ART}roses-cluster.webp" alt="" />
      ${twinkles(8, "env-scene__twinkles")}
      <div class="env">
        <div class="env__back"></div>
        <div class="env__letter">
          <span class="caps env__letter-eyebrow">${esc(intro.envelopeLine)}</span>
          <span class="script env__letter-names">${esc(cp.groom.shortName)} ${esc(cp.joiner)} ${esc(cp.bride.shortName)}</span>
        </div>
        <div class="env__front">
          <span class="caps env__line">${esc(intro.envelopeLine)}</span>
          <span class="script script--ivory env__names">${esc(cp.groom.shortName)} ${esc(cp.joiner)} ${esc(cp.bride.shortName)}</span>
        </div>
        <div class="env__flap"><div class="env__flap-out"></div><div class="env__flap-in"></div></div>
        <div class="env__seal">${icon.waxSeal(cp.monogram)}</div>
      </div>
    </div>

    <button class="intro" id="tapToOpen" type="button" aria-label="${esc(intro.tapToOpen)}">
      <span class="intro__tap">
        <span class="intro__halo" aria-hidden="true"></span>
        <span class="caps">${esc(intro.tapToOpen)}</span>
      </span>
    </button>

    <!-- The hero, revealed once the envelope opens: the names inside a growing wreath -->
    <div class="hero" id="hero">
      <span class="hero__layer hero__garland-wrap" data-tilt="1.1">
        <span class="deco hero__garland" data-reveal="bloom" style="--i:0"><img src="${ART}garland-bows.webp" alt="" /></span>
      </span>
      <span class="caps hero__eyebrow" ${r(1)}>${esc(h.eyebrow)}</span>
      <div class="hero__ring">
        <span class="hero__layer hero__wreath" data-tilt="0.45">${icon.wreath()}</span>
        <h1 class="hero__names hero__layer" data-tilt="-0.25">
          <span class="sr-only">${esc(h.eyebrow)} ${esc(cp.groom.name)} ${esc(cp.joiner)} ${esc(cp.bride.name)}</span>
          <span aria-hidden="true" class="hero__names-in">
            ${write(cp.groom.shortName, "hero__name", 0.55)}
            <span class="script hero__amp">${esc(cp.joiner)}</span>
            ${write(cp.bride.shortName, "hero__name", 1.55)}
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
      <span class="letter-card__amp" ${r(9, "pop")}>${esc(cp.joiner)}</span>
      ${write(cp.bride.name, "letter-card__name", 1.75)}
      <span class="serif letter-card__day" ${r(16)}>${esc(l.day)}</span>
      <span class="caps letter-card__time" ${r(17)}>${esc(l.time)}</span>
      <div class="arabic letter-card__verse" lang="ar" ${r(19, "glow")}>${esc(l.verseArabic)}</div>
      <span class="letter-card__trans" ${r(20)}>${esc(l.verseTranslation)} <span class="nowrap">${esc(l.verseReference)}</span></span>
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

function story(c) {
  const s = c.story;
  let n = 0;
  return `
  ${section("story", "blue")}
    ${deco("roses-flourish", "d-story-tr", 0, 0.25)}
    ${deco("roses-spray", "d-story-bl", 2, -0.2)}
    ${twinkles(6, "float-hearts")}
    <div class="card story-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(s.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(s.title, "", 0.4)}</h2>
      <button class="story__heart" id="storyHeart" type="button" tabindex="-1" aria-hidden="true" ${r(3, "pop")}><img src="${ART}ornament-heart.webp" alt="" /></button>
      ${s.paragraphs.map((p) => { const html = `<p class="story__p">${words(p, "w", n)}</p>`; n += p.split(/\s+/).length; return html; }).join("")}
      ${write(s.signature, "story__sig", 0.9 + n * 0.045)}
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

function venue(c) {
  const v = c.venue;
  return `
  ${section("venue", "blue")}
    ${deco("garland-bows", "d-top-garland", 0, 0.3)}
    <div class="card venue-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="card-title venue__name" ${r(2)}>${write(v.name, "", 0.4)}</h2>
      <span class="venue__sub" ${r(5)}>${esc(v.subName)}</span>
      <span class="venue__addr" ${r(6)}>${esc(v.address)}</span>
      <span class="caps venue__city" ${r(7)}>${esc(v.city)}</span>
      <div class="venue__map" ${r(8)}>
        <iframe data-src="${esc(v.mapEmbed)}" title="Map: ${esc(v.name)} ${esc(v.subName)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <span class="pin-drop" aria-hidden="true"><span class="pin-drop__ripple"></span><span class="pin-drop__ripple pin-drop__ripple--2"></span><span class="pin-drop__shadow"></span><span class="pin-drop__pin">${icon.dropPin}</span></span>
      </div>
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

function gallery(c) {
  const g = c.gallery, cp = c.couple;
  const caption = `${cp.groom.shortName} ${cp.joiner} ${cp.bride.shortName}`;
  return `
  ${section("gallery", "blue")}
    ${deco("crest-wave", "d-top-crest", 0, 0.3)}
    <div class="gal" ${r(0, "fade")}>
      <span class="caps card-eyebrow gal__eyebrow" ${r(1)}>${esc(g.eyebrow)}</span>
      <h2 class="card-title gal__title" ${r(2)}>${write(g.title, "", 0.4)}</h2>
      <div class="deck" id="galDeck" tabindex="0" role="group" aria-roledescription="carousel" aria-label="${esc(g.title)}">
        ${g.photos.map((p, i) => `
        <figure class="pol" style="--k:${i}"><span class="pol__photo"><img data-src="${esc(p.src)}" alt="${esc(p.alt)}" decoding="async" draggable="false" /></span><figcaption class="script pol__cap">${esc(caption)}</figcaption></figure>`).join("")}
      </div>
      <div class="gal__hint caps" ${r(6)}>${icon.hand}<span>${esc(g.hint)}</span></div>
      <div class="gal__dots" id="galDots" ${r(7)}>${g.photos.map((_, i) => `<button type="button" aria-label="Photo ${i + 1}"${i ? "" : ' aria-current="true"'}></button>`).join("")}</div>
    </div>
  </section>`;
}

function faq(c) {
  const f = c.faq;
  return `
  ${section("faq", "blue", "section--tall")}
    ${deco("roses-flourish", "d-faq-tl", 0, 0.25)}
    ${deco("hydrangea", "d-faq-br", 2, -0.2)}
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
  const opts = Array.from({ length: v.maxGuests }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
  return `
  ${section("rsvp", "blue", "section--tall")}
    ${deco("garland-roses", "d-top-garland", 0, 0.3)}
    <div class="card rsvp-card" id="rsvp" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="card-title" ${r(2)}>${write(v.title, "", 0.4)}</h2>
      <p class="rsvp__by" ${r(4)}>${esc(v.byLine)}<br /><span class="serif rsvp__date">${esc(v.byDate)}</span></p>
      <form class="rsvp__form" novalidate ${r(5)}>
        <label class="rsvp__field rsvp__name">
          <span class="sr-only">${esc(v.namePlaceholder)}</span>
          <input name="name" type="text" autocomplete="name" placeholder="${esc(v.namePlaceholder)}" maxlength="60" required />
        </label>
        <label class="rsvp__field rsvp__guests">
          <span class="caps">${esc(v.guestsLabel)}</span>
          <select name="guests">${opts}</select>
        </label>
        <p class="rsvp__error" role="alert"></p>
        <button class="caps btn btn--navy btn--shine" type="submit" value="yes">${icon.check}<span>${esc(v.attend)}</span></button>
        <button class="caps btn btn--ghost" type="submit" value="no"><span>${esc(v.decline)}</span></button>
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
      ${write(`${cp.groom.shortName} ${cp.joiner} ${cp.bride.shortName}`, "closing__mono", 1.3, true)}
    </div>
  </section>`;
}

export function renderSections(c) {
  decoN = 0;
  return [opening, letter, countdown, story, schedule, venue, dressCode, gallery, faq, rsvp, dua, closing]
    .map((fn) => fn(c))
    .join("");
}
