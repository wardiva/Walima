// Gallery: a swipeable strip of photos (CSS scroll-snap) with dots. The
// photos load when the gallery screen comes near; the centred one is lifted.

export function initGallery(track, dots) {
  const slides = [...track.querySelectorAll(".gal__slide")];
  const buttons = [...dots.querySelectorAll("button")];
  if (!slides.length) return { load() {} };

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    for (const img of track.querySelectorAll("img[data-src]")) {
      img.src = img.dataset.src;
      // A missing photo hides its slide (and its dot) instead of a broken frame.
      img.addEventListener("error", () => {
        const i = slides.indexOf(img.closest(".gal__slide"));
        slides[i].hidden = true;
        if (buttons[i]) buttons[i].hidden = true;
      }, { once: true });
    }
  };

  let current = -1;
  const setCurrent = (i) => {
    if (i === current) return;
    current = i;
    slides.forEach((s, k) => s.classList.toggle("is-current", k === i));
    buttons.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  };

  // The slide nearest the strip's centre is the current one.
  let raf = 0;
  const measure = () => {
    raf = 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, dist = Infinity;
    slides.forEach((s, k) => {
      if (s.hidden) return;
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = k; }
    });
    setCurrent(best);
  };
  track.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(measure); }, { passive: true });
  window.addEventListener("resize", measure);

  const go = (i) => {
    const s = slides[i];
    if (!s) return;
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: "smooth" });
  };
  buttons.forEach((b, i) => b.addEventListener("click", () => go(i)));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(Math.min(slides.length - 1, current + 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(Math.max(0, current - 1)); }
  });

  measure();
  return { load };
}
