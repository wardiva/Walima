// Section templates. Content comes exclusively from content.js; layout and
// styling live in CSS. Each function returns the markup for one screen.
import * as icon from "./icons.js";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** data-reveal helper: r(2) → stagger step 2 */
const r = (i, kind = "") => `data-reveal${kind ? `="${kind}"` : ""} style="--i:${i}"`;

/** A string or a list of lines → escaped lines joined with <br> */
const lines = (v) => (Array.isArray(v) ? v : [v]).map(esc).join("<br />");

const ART = "assets/images/";
/** An ivory relief ornament placed by its class (see sections.css). */
const deco = (name, cls, i = 0) =>
  `<img class="deco ${cls}" src="${ART}${name}.webp" alt="" decoding="async" loading="lazy" ${r(i, "bloom")} />`;

/** Opens a screen; main.js paints its paper backdrop from data-paper. */
const section = (name, paper, extra = "") =>
  `<section class="section s-${name} ${extra}" data-section="${name}" data-paper="${paper}">
    <div class="bg"></div>`;

function opening(c) {
  const { couple: cp, intro, hero: h, media: m } = c;
  return `
  <section class="section s-opening is-intro" id="opening" data-section="opening" data-paper="light">
    <div class="bg" style="background-image:url('${m.paperLight}')"></div>

    <!-- The sealed envelope -->
    <div class="env-scene" aria-hidden="true">
      <img class="deco env-scene__roses env-scene__roses--tl" src="${ART}roses-cluster.webp" alt="" />
      <img class="deco env-scene__roses env-scene__roses--br" src="${ART}roses-cluster.webp" alt="" />
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

    <!-- The hero, revealed once the envelope opens -->
    <div class="hero">
      <img class="deco hero__garland" src="${ART}garland-bows.webp" alt="" ${r(0, "bloom")} />
      <h1 class="hero__text">
        <span class="caps hero__eyebrow" ${r(1)}>${esc(h.eyebrow)}</span>
        <span class="script hero__name" ${r(2)}>${esc(cp.groom.shortName)}</span>
        <span class="script hero__amp" ${r(3)}>${esc(cp.joiner)}</span>
        <span class="script hero__name" ${r(4)}>${esc(cp.bride.shortName)}</span>
        <span class="serif hero__date" ${r(6)}>${esc(h.date)}</span>
      </h1>
      <div class="hero__stage">
        <img class="deco hero__roses hero__roses--l" src="${ART}roses-cluster.webp" alt="" ${r(5, "bloom")} />
        <img class="deco hero__roses hero__roses--r" src="${ART}roses-cluster.webp" alt="" ${r(6, "bloom")} />
        <img class="hero__couple" src="${m.couple}" alt="${esc(cp.groom.name)} and ${esc(cp.bride.name)}" ${r(4, "card")} />
        <span class="hero__sparkles" aria-hidden="true">${"<i></i>".repeat(9)}</span>
      </div>
    </div>
  </section>`;
}

function letter(c) {
  const l = c.letter, cp = c.couple;
  return `
  ${section("letter", "light")}
    ${deco("roses-spray", "d-letter-tl", 0)}
    ${deco("roses-cluster", "d-letter-br", 1)}
    <div class="card letter-card" ${r(0, "card")}>
      ${deco("crest-shell", "d-card-crest", 1)}
      <div class="arabic letter-card__bismillah" lang="ar" ${r(1)}>${esc(l.bismillah)}</div>
      <p class="letter-card__lead" ${r(3)}>${lines(l.lines)}</p>
      <span class="caps letter-card__event" ${r(4)}>${esc(l.eventLine)}</span>
      <span class="script letter-card__name" ${r(5)}>${esc(cp.groom.name)}</span>
      <span class="letter-card__amp" ${r(6)}>${esc(cp.joiner)}</span>
      <span class="script letter-card__name" ${r(7)}>${esc(cp.bride.name)}</span>
      <span class="serif letter-card__day" ${r(8)}>${esc(l.day)}</span>
      <span class="caps letter-card__time" ${r(9)}>${esc(l.time)}</span>
      <div class="arabic letter-card__verse" lang="ar" ${r(10)}>${esc(l.verseArabic)}</div>
      <span class="letter-card__trans" ${r(11)}>${esc(l.verseTranslation)} <span class="nowrap">${esc(l.verseReference)}</span></span>
    </div>
  </section>`;
}

function countdown(c) {
  const k = c.countdown;
  const units = ["days", "hours", "minutes", "seconds"];
  return `
  ${section("countdown", "blue")}
    ${deco("garland-roses", "d-top-garland", 0)}
    ${deco("hydrangea", "d-cd-bl", 2)}
    <div class="card cd-card" id="countdown" data-target="${esc(k.target)}" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(k.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(k.title)}</h2>
      <div class="cd__when" data-hint="${esc(k.scratchHint)}" ${r(4)}>
        <span class="caps cd__day">${esc(k.day)}</span>
        <span class="serif cd__date">${esc(k.date)}</span>
        <span class="serif cd__time">${esc(k.time)}</span>
        <canvas class="cd__foil" aria-hidden="true"></canvas>
      </div>
      <div class="cd__count" ${r(8)}>
        ${units.map((u) => `<div class="cd__cell" data-unit="${u}"><span class="serif cd__num" data-num>00</span><span class="caps cd__label">${esc(k.labels[u])}</span></div>`).join("")}
      </div>
    </div>
  </section>`;
}

function story(c) {
  const s = c.story;
  return `
  ${section("story", "blue")}
    ${deco("roses-flourish", "d-story-tr", 0)}
    ${deco("roses-spray", "d-story-bl", 2)}
    <div class="card story-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(s.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(s.title)}</h2>
      ${deco("ornament-heart", "d-card-heart", 3)}
      ${s.paragraphs.map((p, i) => `<p class="story__p" ${r(4 + i)}>${esc(p)}</p>`).join("")}
      <span class="script story__sig" ${r(6)}>${esc(s.signature)}</span>
    </div>
  </section>`;
}

function schedule(c) {
  const s = c.schedule;
  const row = (it, i) => `
        <li class="tl__row" ${r(4 + i)}>
          <span class="serif tl__time">${esc(it.time)}${it.period ? `<small>${esc(it.period)}</small>` : ""}</span>
          <span class="tl__node" aria-hidden="true"></span>
          <span class="tl__what">${esc(it.title)}</span>
        </li>`;
  return `
  ${section("schedule", "blue")}
    ${deco("crest-scroll", "d-top-crest", 0)}
    ${deco("roses-cluster", "d-sched-br", 2)}
    <div class="card sched-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(s.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(s.title)}</h2>
      <ol class="tl">${s.items.map(row).join("")}
      </ol>
    </div>
  </section>`;
}

function venue(c) {
  const v = c.venue;
  return `
  ${section("venue", "blue")}
    ${deco("garland-bows", "d-top-garland", 0)}
    <div class="card venue-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="script card-title venue__name" ${r(2)}>${esc(v.name)}</h2>
      <span class="venue__sub" ${r(3)}>${esc(v.subName)}</span>
      <span class="venue__addr" ${r(4)}>${esc(v.address)}</span>
      <span class="caps venue__city" ${r(5)}>${esc(v.city)}</span>
      <div class="venue__map" ${r(6)}><iframe data-src="${esc(v.mapEmbed)}" title="Map: ${esc(v.name)} ${esc(v.subName)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
      <a class="caps btn btn--navy" href="${esc(v.mapsUrl)}" target="_blank" rel="noopener" ${r(7)}>${icon.pin}<span>${esc(v.openLocation)}</span></a>
    </div>
  </section>`;
}

function dressCode(c) {
  const d = c.dressCode;
  return `
  ${section("dress", "blue")}
    ${deco("roses-cluster", "d-dress-tl", 0)}
    ${deco("roses-spray", "d-dress-br", 1)}
    <div class="card dress-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(d.eyebrow)}</span>
      <div class="dress__icons" ${r(2)}>${icon.suit}${icon.gown}</div>
      <h2 class="script card-title dress__title" ${r(3)}>${esc(d.title)}</h2>
      ${deco("divider-scroll", "d-card-divider", 4)}
      <span class="dress__note" ${r(5)}>${esc(d.note)}</span>
    </div>
  </section>`;
}

function gallery(c) {
  const g = c.gallery;
  return `
  ${section("gallery", "blue")}
    ${deco("crest-wave", "d-top-crest", 0)}
    <div class="gal" ${r(0, "card")}>
      <span class="caps card-eyebrow gal__eyebrow" ${r(1)}>${esc(g.eyebrow)}</span>
      <h2 class="script card-title gal__title" ${r(2)}>${esc(g.title)}</h2>
      <div class="gal__track" id="galTrack" tabindex="0" aria-label="${esc(g.title)}" ${r(3)}>
        ${g.photos.map((p, i) => `
        <figure class="gal__slide"><img data-src="${esc(p.src)}" alt="${esc(p.alt)}" decoding="async" ${i ? "" : 'class="is-first"'} /></figure>`).join("")}
      </div>
      <div class="gal__dots" id="galDots" ${r(4)}>${g.photos.map((_, i) => `<button type="button" aria-label="Photo ${i + 1}"${i ? "" : ' aria-current="true"'}></button>`).join("")}</div>
    </div>
  </section>`;
}

function faq(c) {
  const f = c.faq;
  return `
  ${section("faq", "blue", "section--tall")}
    ${deco("roses-flourish", "d-faq-tl", 0)}
    ${deco("hydrangea", "d-faq-br", 2)}
    <div class="card faq-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(f.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(f.title)}</h2>
      <div class="faq">
        ${f.items.map((it, i) => `
        <details class="faq__item" ${r(3 + i)}>
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
    ${deco("garland-roses", "d-top-garland", 0)}
    <div class="card rsvp-card" id="rsvp" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(v.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(v.title)}</h2>
      <p class="rsvp__by" ${r(3)}>${esc(v.byLine)}<br /><span class="serif rsvp__date">${esc(v.byDate)}</span></p>
      <form class="rsvp__form" novalidate ${r(4)}>
        <label class="rsvp__field">
          <span class="sr-only">${esc(v.namePlaceholder)}</span>
          <input name="name" type="text" autocomplete="name" placeholder="${esc(v.namePlaceholder)}" maxlength="60" required />
        </label>
        <label class="rsvp__field rsvp__guests">
          <span class="caps">${esc(v.guestsLabel)}</span>
          <select name="guests">${opts}</select>
        </label>
        <p class="rsvp__error" role="alert"></p>
        <button class="caps btn btn--navy" type="submit" value="yes">${icon.check}<span>${esc(v.attend)}</span></button>
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
    ${deco("roses-cluster", "d-dua-tl", 0)}
    ${deco("roses-cluster", "d-dua-br", 1)}
    <div class="card dua-card" ${r(0, "card")}>
      <span class="caps card-eyebrow" ${r(1)}>${esc(d.eyebrow)}</span>
      <h2 class="script card-title" ${r(2)}>${esc(d.title)}</h2>
      <p class="dua__line" ${r(3)}>${esc(d.line)}</p>
      ${deco("divider-flowers", "d-card-divider", 4)}
      <div class="arabic dua__arabic" lang="ar" ${r(5)}>${esc(d.arabic)}</div>
      <p class="dua__trans" ${r(6)}>${esc(d.translation)}</p>
    </div>
  </section>`;
}

function closing(c) {
  const k = c.closing, cp = c.couple;
  return `
  ${section("closing", "deep")}
    ${deco("roses-cluster", "d-closing-bl", 2)}
    ${deco("roses-cluster", "d-closing-tr", 3)}
    <div class="closing" ${r(0, "fade")}>
      ${deco("crest-shell", "d-closing-crest", 0)}
      <span class="script script--ivory closing__line" ${r(1)}>${lines(k.lines)}</span>
      <span class="arabic closing__insha" lang="ar" ${r(3)}>${esc(k.inshaAllah)}</span>
      <span class="script script--ivory closing__mono" ${r(5)}>${esc(cp.groom.shortName)} ${esc(cp.joiner)} ${esc(cp.bride.shortName)}</span>
    </div>
  </section>`;
}

export function renderSections(c) {
  return [opening, letter, countdown, story, schedule, venue, dressCode, gallery, faq, rsvp, dua, closing]
    .map((fn) => fn(c))
    .join("");
}
