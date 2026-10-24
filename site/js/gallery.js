// Gallery: a pile of polaroids. The top photo follows the finger (tilting as
// it goes); flick or tap it and it flies off and tucks under the pile. Dots
// and the arrow keys jump to a photo. Photos load when the screen comes near;
// a missing file removes its polaroid and dot. Vertical swipes still scroll
// the page (touch-action: pan-y).

export function initGallery(deck, dots, { reducedMotion = false, onFlick } = {}) {
  let cards = [...deck.querySelectorAll(".pol")];
  const buttons = [...dots.querySelectorAll("button")];
  if (!cards.length) return { load() {}, deal() {} };

  // A fixed, pleasing scatter for each position in the pile.
  const SCATTER = [[0, 0, -2.5], [6, -4, 4.5], [-7, 3, -6], [9, 6, 7.5], [-4, -7, -9], [3, 8, 10]];
  let order = cards.map((_, i) => i);   // order[0] = top of the pile

  const layout = (instant) => {
    order.forEach((ci, pos) => {
      const el = cards[ci];
      const [x, y, rot] = SCATTER[pos % SCATTER.length];
      el.style.zIndex = String(100 - pos);
      el.style.transition = instant ? "none" : "";
      el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      el.classList.toggle("is-top", pos === 0);
      el.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
    });
    const top = order[0];
    buttons.forEach((b, k) => (k === top ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  };
  layout(true);

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    for (const img of deck.querySelectorAll("img[data-src]")) {
      img.src = img.dataset.src;
      img.addEventListener("error", () => {
        const i = cards.indexOf(img.closest(".pol"));
        cards[i].hidden = true;
        if (buttons[i]) buttons[i].hidden = true;
        order = order.filter((k) => k !== i);
        layout();
      }, { once: true });
    }
  };

  /** Send the top card off one side, then tuck it under the pile. */
  let busy = false;
  const next = (dir = 1, fromX = 0, fromRot = 0) => {
    if (busy || order.length < 2) return;
    busy = true;
    const ci = order[0], el = cards[ci];
    const w = deck.clientWidth;
    el.style.transition = "none";
    el.style.transform = `translate(${fromX}px, 0) rotate(${fromRot}deg)`;
    const outX = dir * w * 1.15;
    const fly = el.animate(
      [{ transform: `translate(${fromX}px, 0) rotate(${fromRot}deg)` }, { transform: `translate(${outX}px, ${-w * 0.08}px) rotate(${dir * 24}deg)` }],
      { duration: reducedMotion ? 1 : 300, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" });
    onFlick?.(dir);
    fly.onfinish = () => {
      order.push(order.shift());
      el.style.zIndex = "0";
      fly.cancel();
      el.style.transform = `translate(${outX}px, ${-w * 0.08}px) rotate(${dir * 24}deg)`;
      el.getBoundingClientRect(); // commit the start position before easing back
      layout();
      setTimeout(() => (busy = false), 120);
    };
  };
  const goTo = (i) => {
    if (!order.includes(i)) return;
    const steps = order.indexOf(i);
    for (let s = 0; s < steps; s++) order.push(order.shift());
    layout();
  };

  /* ── drag the top card ── */
  let drag = null;
  deck.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".pol");
    if (!el || !el.classList.contains("is-top") || busy) return;
    drag = { el, x0: e.clientX, y0: e.clientY, dx: 0, t0: performance.now(), id: e.pointerId, moved: false };
    el.style.transition = "none";
  });
  deck.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(drag.dx) > 6 && Math.abs(drag.dx) > Math.abs(dy)) {
      drag.moved = true;
      deck.setPointerCapture?.(e.pointerId);
    }
    if (drag.moved) drag.el.style.transform = `translate(${drag.dx}px, ${dy * 0.15}px) rotate(${drag.dx * 0.07}deg)`;
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { el, dx, t0, moved } = drag;
    drag = null;
    const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    if (e.type === "pointercancel") { el.style.transition = ""; layout(); return; }
    if (!moved) { next(1); return; }                       // a tap: next photo
    if (Math.abs(dx) > deck.clientWidth * 0.22 || v > 0.6) next(Math.sign(dx) || 1, dx, dx * 0.07);
    else { el.style.transition = ""; layout(); }            // spring back
  };
  deck.addEventListener("pointerup", end);
  deck.addEventListener("pointercancel", end);

  buttons.forEach((b, i) => b.addEventListener("click", () => goTo(i)));
  deck.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(order[order.length - 1]); }
  });

  return {
    load,
    /** Deal the polaroids onto the table, one after another. */
    deal() { deck.classList.add("is-dealt"); },
  };
}
