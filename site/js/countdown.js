// Live countdown to the event start (content.countdown.target), shown on
// split-flap digits. Each digit is four halves: the static top shows the new
// value, the static bottom the old one, and two flaps (rotateX only) fold
// the old top down and the new bottom into place. Off screen, or with Reduce
// Motion, digits change without flipping.

const FLIP_MS = 560;

function makeDigit(el, reduced) {
  const [top, bot, flapT, flapB] = el.querySelectorAll(".fd__half b");
  let value = null;
  return {
    set(v, animate) {
      if (v === value) return;
      const old = value ?? v;
      value = v;
      if (!animate || reduced || old === v) {
        top.textContent = bot.textContent = flapT.textContent = flapB.textContent = v;
        el.classList.remove("is-flipping");
        return;
      }
      top.textContent = v; bot.textContent = old;
      flapT.textContent = old; flapB.textContent = v;
      el.classList.add("is-flipping");
      const ft = flapT.parentElement, fb = flapB.parentElement;
      ft.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], { duration: FLIP_MS / 2, easing: "cubic-bezier(.5,0,.9,.5)", fill: "forwards" });
      const a = fb.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(90deg)", offset: 0.5 }, { transform: "rotateX(-12deg)", offset: 0.82 }, { transform: "rotateX(0deg)" }],
        { duration: FLIP_MS, easing: "cubic-bezier(.2,.6,.35,1)", fill: "forwards" });
      a.onfinish = () => { if (value === v) { bot.textContent = v; el.classList.remove("is-flipping"); } };
    },
  };
}

export function initCountdown(root, { reducedMotion = false } = {}) {
  const target = Date.parse(root.dataset.target);
  const units = {};
  root.querySelectorAll("[data-unit]").forEach((cell) => {
    const flip = cell.querySelector(".flip");
    units[cell.dataset.unit] = { flip, digits: [...flip.querySelectorAll(".fd")].map((d) => makeDigit(d, reducedMotion)) };
  });
  const pad = (n) => String(n).padStart(2, "0");
  let visible = false;

  // Days can need a third tile (more than 99 days out).
  const ensure = (u, len) => {
    while (u.digits.length < len) {
      const clone = u.flip.firstElementChild.cloneNode(true);
      u.flip.prepend(clone);
      u.digits.unshift(makeDigit(clone, reducedMotion));
    }
  };

  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    const v = { days: pad(d), hours: pad(h), minutes: pad(m), seconds: pad(s) };
    for (const k in v) {
      const u = units[k];
      if (!u) continue;
      ensure(u, v[k].length);
      const str = v[k].padStart(u.digits.length, "0");
      u.digits.forEach((dg, i) => dg.set(str[i], visible));
      u.flip.setAttribute("aria-label", v[k]);
    }
  };
  tick();
  // Align ticks to the wall-clock second.
  setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));

  return {
    /** Flip only while the countdown is on screen. */
    setVisible(on) { visible = on; },
  };
}
