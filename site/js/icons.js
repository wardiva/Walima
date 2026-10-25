// Inline SVG icons and the wax seal.

export const pin = `
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`;

export const check = `
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

export const heart = `
<svg viewBox="0 0 24 21" aria-hidden="true"><path d="M12 19.5s-1.1-.8-2.9-2.3C4.8 13.6 1 10.4 1 6.3 1 3.3 3.3 1 6.2 1c2 0 3.8 1 5.8 3.2C14 2 15.8 1 17.8 1 20.7 1 23 3.3 23 6.3c0 4.1-3.8 7.3-8.1 10.9-1.8 1.5-2.9 2.3-2.9 2.3z"/></svg>`;

// Line drawings for the dress code: a double-breasted jacket and a lehenga.
export const suit = `
<svg class="dress__icon" viewBox="0 0 64 72" aria-hidden="true">
  <path d="M22 6l10 16 10-16"/><path d="M22 6c-6 2-11 4-14 8-2 4-3 12-3 20v26h12V34"/>
  <path d="M42 6c6 2 11 4 14 8 2 4 3 12 3 20v26H47V34"/><path d="M17 34v34h30V34"/>
  <path d="M22 6l-4 10 5 4-3 14M42 6l4 10-5 4 3 14"/><path d="M30 22l2 6 2-6"/>
  <circle cx="27" cy="42" r="1.2"/><circle cx="37" cy="42" r="1.2"/><circle cx="27" cy="52" r="1.2"/><circle cx="37" cy="52" r="1.2"/>
</svg>`;

export const gown = `
<svg class="dress__icon" viewBox="0 0 64 72" aria-hidden="true">
  <path d="M26 4c0 5 2 8 6 8s6-3 6-8"/><path d="M26 4l-4 6 2 16h16l2-16-4-6"/>
  <path d="M24 26c-4 12-12 26-16 42h48c-4-16-12-30-16-42"/>
  <path d="M10 62c7 3 37 3 44 0"/><path d="M32 30v34M27 30c-3 10-7 22-10 34M37 30c3 10 7 22 10 34"/>
</svg>`;

/** Maroon wax seal with an irregular poured edge, pressed with an olive
    sprig (as on the client's printed envelope): no letters. */
export function waxSeal() {
  // Poured edge: a circle whose radius wobbles with a few low harmonics.
  const pts = [];
  const N = 40;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const rr = 47 + 2.4 * Math.sin(a * 3 + 0.6) + 1.6 * Math.sin(a * 7 + 1.9) + 1.1 * Math.sin(a * 11 + 0.3);
    pts.push([50 + rr * Math.cos(a), 50 + rr * Math.sin(a)]);
  }
  // smooth closed curve through the points (Catmull-Rom → cubic Bézier)
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let k = 0; k < N; k++) {
    const p0 = pts[(k - 1 + N) % N], p1 = pts[k], p2 = pts[(k + 1) % N], p3 = pts[(k + 2) % N];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  // the sprig: a gently curved stem with paired, alternating leaves and one at the tip
  const leaf = (x, y, ang, len) =>
    `<path d="M0 0C${(len * 0.3).toFixed(1)} ${(-len * 0.3).toFixed(1)} ${(len * 0.72).toFixed(1)} ${(-len * 0.28).toFixed(1)} ${len} 0C${(len * 0.72).toFixed(1)} ${(len * 0.28).toFixed(1)} ${(len * 0.3).toFixed(1)} ${(len * 0.3).toFixed(1)} 0 0Z" transform="translate(${x} ${y}) rotate(${ang})"/>`;
  const leaves = [[66, 13.5], [58.5, 12.5], [51, 11.5], [43.5, 10.5], [36.5, 9]]
    .map(([y, len], k) => leaf(50 - 0.4, y, -140 + k * 2, len) + leaf(50 + 0.4, y - 3.2, -40 - k * 2, len)).join("") + leaf(50, 30, -90, 8.5);
  const sprig = `<path d="M50.6 76C49.2 64 50.9 46 50 29.5" fill="none" stroke-width="1.7" stroke-linecap="round"/>${leaves}`;
  return `
<svg class="seal" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <radialGradient id="sealWax" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="#a9404c"/><stop offset=".45" stop-color="#7c2431"/><stop offset="1" stop-color="#4f1119"/>
    </radialGradient>
    <radialGradient id="sealWell" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#6f1d29"/><stop offset=".85" stop-color="#7f2733"/><stop offset="1" stop-color="#5c1520"/>
    </radialGradient>
  </defs>
  <path d="${d}" fill="url(#sealWax)"/>
  <circle cx="50" cy="50" r="36" fill="url(#sealWell)"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#4a0f17" stroke-width="1.3" opacity=".7"/>
  <circle cx="50" cy="50" r="38.2" fill="none" stroke="#c46a74" stroke-width=".8" opacity=".45"/>
  <circle cx="50" cy="50" r="31" fill="none" stroke="#4a0f17" stroke-width=".6" stroke-dasharray="1 2.2" opacity=".55"/>
  <g class="seal__sprig seal__sprig--shade" transform="translate(0 1)">${sprig}</g>
  <g class="seal__sprig">${sprig}</g>
  <ellipse cx="34" cy="26" rx="13" ry="6" fill="#fff" opacity=".13" transform="rotate(-28 34 26)"/>
</svg>`;
}

/* ───────────── Motion artwork (all inline SVG, animated in CSS) ───────────── */

const f2 = (n) => +n.toFixed(2);

/**
 * Dusty-blue laurel wreath that grows leaf by leaf from the bottom up both
 * sides (each leaf is scaled in by CSS, staggered with --d). viewBox 400².
 */
export function wreath() {
  const C = 200, R = 166;
  const fills = ["#6f8aa0", "#8aa3b6", "#5f7a90", "#a3b8c6", "#7891a5"];
  const leaves = [], berries = [];
  let k = 0;
  const branch = (from, to, dir) => {
    const steps = 26;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const a = ((from + (to - from) * t) * Math.PI) / 180;
      const side = i % 2 ? 1 : -1;                    // outside / inside of the stem
      const rr = R + side * 3.5;
      const x = C + rr * Math.cos(a), y = C + rr * Math.sin(a);
      // growth direction along the circle
      const tx = -Math.sin(a) * dir, ty = Math.cos(a) * dir;
      const ang = (Math.atan2(ty, tx) * 180) / Math.PI + 90 + side * -38 * dir;
      const L = 30 - t * 13, W = L * 0.42;
      const d = 260 + i * 46;
      leaves.push(`<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(ang)})"><g class="lf" style="--d:${d}ms"><path fill="${fills[k++ % fills.length]}" d="M0 0C${f2(W)} ${f2(-L * 0.25)} ${f2(W * 0.8)} ${f2(-L * 0.78)} 0 ${f2(-L)}C${f2(-W * 0.8)} ${f2(-L * 0.78)} ${f2(-W)} ${f2(-L * 0.25)} 0 0Z"/><path class="lf__vein" d="M0 -2L0 ${f2(-L * 0.72)}"/></g></g>`);
      if (i % 5 === 3) {
        const bx = C + (R - side * 9) * Math.cos(a), by = C + (R - side * 9) * Math.sin(a);
        berries.push(`<circle class="bb" style="--d:${d + 120}ms" cx="${f2(bx)}" cy="${f2(by)}" r="2.6"/>`);
      }
    }
  };
  branch(98, 258, 1);   // left side, bottom → top
  branch(82, -78, -1);  // right side, bottom → top
  const arc = (a0, a1, sweep) => {
    const p = (a) => [C + R * Math.cos((a * Math.PI) / 180), C + R * Math.sin((a * Math.PI) / 180)].map(f2).join(" ");
    return `M${p(a0)}A${R} ${R} 0 0 ${sweep} ${p(a1)}`;
  };
  const flower = (x, y, s, d, rot = 0) => {
    const petals = Array.from({ length: 6 }, (_, i) =>
      `<ellipse cx="0" cy="-7" rx="4.6" ry="7.4" transform="rotate(${i * 60})"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><g class="fl" style="--d:${d}ms"><g class="fl__petals">${petals}</g><circle class="fl__mid" r="3.6"/></g></g>`;
  };
  return `
<svg class="wreath" viewBox="0 0 400 400" aria-hidden="true">
  <path class="wr-stem" d="${arc(98, 258, 1)}"/>
  <path class="wr-stem" d="${arc(82, -78, 0)}"/>
  ${leaves.join("")}
  ${berries.join("")}
  ${flower(200, 366, 1.55, 200)}
  ${flower(166, 360, 1.05, 420, 20)}
  ${flower(234, 360, 1.05, 480, -20)}
  ${flower(84, 316, 0.8, 900, 10)}
  ${flower(316, 316, 0.8, 960, -10)}
</svg>`;
}

/** A small dusty-blue butterfly; wings flap in CSS. */
export const butterfly = `
<svg class="bf__svg" viewBox="0 0 60 44" aria-hidden="true">
  <defs><linearGradient id="bfG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9d9e4"/><stop offset=".55" stop-color="#7e98ad"/><stop offset="1" stop-color="#4f6a82"/></linearGradient></defs>
  <g class="bf__w bf__w--l"><path d="M29 20C22 5 8-1 3 4s2 15 12 17C6 24 3 33 9 37s14-3 20-14z" fill="url(#bfG)"/><path d="M27 19C21 9 12 5 8 7M26 22C18 25 11 30 10 34" stroke="#fbf8f1" stroke-width=".8" fill="none" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill="#fbf8f1"/></g>
  <g class="bf__w bf__w--r"><path d="M31 20C38 5 52-1 57 4s-2 15-12 17c9 3 12 12 6 16s-14-3-20-14z" fill="url(#bfG)"/><path d="M33 19C39 9 48 5 52 7M34 22C42 25 49 30 50 34" stroke="#fbf8f1" stroke-width=".8" fill="none" opacity=".7"/><circle cx="52" cy="8" r="1.4" fill="#fbf8f1"/></g>
  <path d="M30 13c1.2 0 1.6 1.5 1.6 4v14c0 2-.6 3.5-1.6 3.5s-1.6-1.5-1.6-3.5V17c0-2.5.4-4 1.6-4z" fill="#3a3a4a"/>
  <path d="M29.4 13.5C28 9 26 7 24.5 6.5M30.6 13.5C32 9 34 7 35.5 6.5" stroke="#3a3a4a" stroke-width=".7" fill="none"/>
</svg>`;

/** Gold coat hanger the dress-code icons hang from. */
export const hanger = `
<svg class="hang__hook" viewBox="0 0 64 24" aria-hidden="true"><path d="M32 12V9.5a3.6 3.6 0 1 0-3.6-3.6"/><path d="M32 12L5 22.5h54z"/></svg>`;

/** Timeline icons, picked by keywords in each schedule row's title. */
const ICONS = {
  rings: `<svg class="tl__icon tl__icon--rings" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14.5" r="5.5"/><circle cx="15" cy="14.5" r="5.5"/><path class="ic-gem" d="M12 2.5l2.2 2.6L12 7.7 9.8 5.1z"/></svg>`,
  dish: `<svg class="tl__icon tl__icon--dish" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 19h19"/><path d="M4.5 19a7.5 7.5 0 0 1 15 0"/><path d="M12 11.5V10"/><circle cx="12" cy="9.2" r=".9"/><path class="ic-steam" d="M8 8c-1-1.2 1-2 0-3.4"/><path class="ic-steam ic-steam--2" d="M16 8c-1-1.2 1-2 0-3.4"/></svg>`,
  moon: `<svg class="tl__icon tl__icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3.5a8.5 8.5 0 1 0 6.6 13.6A7 7 0 0 1 14 3.5z"/><path class="ic-star" d="M18.5 3l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/></svg>`,
  heart: `<svg class="tl__icon tl__icon--heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>`,
};
export function timelineIcon(title = "") {
  if (/arriv|welcome|guest|reception/i.test(title)) return ICONS.rings;
  if (/lunch|dinner|food|meal|eat|tea|feast/i.test(title)) return ICONS.dish;
  if (/dua|end|prayer|farewell|rukhsat|close/i.test(title)) return ICONS.moon;
  return ICONS.heart;
}

/** The pin that drops onto the venue map. */
export const dropPin = `
<svg class="pin-drop__svg" viewBox="0 0 40 52" aria-hidden="true">
  <defs><linearGradient id="pinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9404c"/><stop offset=".6" stop-color="#7c2431"/><stop offset="1" stop-color="#4f1119"/></linearGradient></defs>
  <path d="M20 51s17-17.2 17-30A17 17 0 0 0 3 21c0 12.8 17 30 17 30z" fill="url(#pinG)" stroke="#fbf8f1" stroke-width="1.6"/>
  <circle cx="20" cy="21" r="6.5" fill="#e2c98f"/><ellipse cx="14" cy="13" rx="4" ry="2" fill="#fff" opacity=".25" transform="rotate(-30 14 13)"/>
</svg>`;

/** A pointing hand: hints for "scratch" and "swipe". */
export const hand = `
<svg class="hand" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.5V4.6a1.6 1.6 0 0 1 3.2 0V10m0-1.2a1.6 1.6 0 0 1 3.2 0V11m0-1a1.6 1.6 0 0 1 3.2 0v4.6c0 3.7-2.5 6.6-6.2 6.6h-1c-2.2 0-3.7-1-4.9-2.6l-2.9-4a1.6 1.6 0 0 1 2.5-2L9 15"/></svg>`;

/** A hanging lantern for the closing screen. */
export function lantern(id = "a") {
  return `
<svg class="lantern__svg" viewBox="0 0 60 130" aria-hidden="true">
  <defs><radialGradient id="lnG${id}" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#fff4d6"/><stop offset=".55" stop-color="#f1d48f"/><stop offset="1" stop-color="#c79a4c"/></radialGradient></defs>
  <path d="M30 0v40" stroke="#e2c98f" stroke-width="1.2"/>
  <circle cx="30" cy="42" r="3" fill="none" stroke="#e2c98f" stroke-width="1.4"/>
  <path d="M18 52h24l-4-7H22z" fill="#c9a764"/>
  <path d="M19 52c-6 10-6 34 0 44h22c6-10 6-34 0-44z" fill="url(#lnG${id})" opacity=".92"/>
  <path d="M30 52v44M24 52c-3 12-3 32 0 44M36 52c3 12 3 32 0 44" stroke="#a37c3c" stroke-width="1" fill="none" opacity=".75"/>
  <path d="M17 96h26l-4 8H21z" fill="#c9a764"/>
  <path d="M30 104v12" stroke="#c9a764" stroke-width="1.4"/><circle cx="30" cy="119" r="3" fill="#c9a764"/>
</svg>`;
}
