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

/** Maroon wax seal with an irregular poured edge and a pressed monogram. */
export function waxSeal(monogram = "H&K") {
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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
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
  <text x="50" y="62" text-anchor="middle" class="seal__mono seal__mono--shade">${esc(monogram)}</text>
  <text x="50" y="61" text-anchor="middle" class="seal__mono">${esc(monogram)}</text>
  <ellipse cx="34" cy="26" rx="13" ry="6" fill="#fff" opacity=".13" transform="rotate(-28 34 26)"/>
</svg>`;
}
