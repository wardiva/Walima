// Background music: a short playlist played in order and looped. Browsers
// block autoplay with sound, so playback starts on the "Tap to Open" gesture;
// the floating button toggles it afterwards. Tracks whose file is missing are
// skipped; if none can play, the button stays hidden.

export function initMusic({ button, tracks, volume = 0.7, labels }) {
  const audio = new Audio();
  audio.preload = "none";
  audio.volume = 0;
  let list = tracks.slice();
  let index = 0;
  let wanted = false;     // user intent
  let fadeRaf = 0;

  const setUi = (playing) => {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", playing ? labels.off : labels.on);
  };
  setUi(false);

  // Show the button only once we know at least one track exists.
  Promise.all(list.map((t) =>
    fetch(t.src, { method: "HEAD" }).then((r) => r.ok && t, () => false)
  )).then((ok) => {
    list = ok.filter(Boolean);
    if (!list.length) return;
    button.hidden = false;
    requestAnimationFrame(() => button.classList.add("is-ready"));
    if (!audio.src) audio.src = list[0].src;
    if (wanted) play();
  });

  const fadeTo = (target, ms = 1200) => {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      try { audio.volume = from + (target - from) * k; } catch {}
      if (k < 1) fadeRaf = requestAnimationFrame(step);
      else if (target === 0) audio.pause();
    };
    fadeRaf = requestAnimationFrame(step);
  };

  // Next song when one ends; the last one wraps to the first.
  audio.addEventListener("ended", () => {
    index = (index + 1) % list.length;
    audio.src = list[index].src;
    audio.play().catch(() => {});
  });
  // A file that fails mid-way: drop it and move on.
  audio.addEventListener("error", () => {
    if (!list.length || !audio.src) return;
    list.splice(index, 1);
    if (!list.length) { button.hidden = true; return; }
    index %= list.length;
    audio.src = list[index].src;
    if (wanted) audio.play().catch(() => {});
  });

  const play = () => {
    wanted = true;
    button.classList.add("has-started");
    setUi(true);
    if (!list.length || !audio.src) return; // starts once the check above finishes
    const p = audio.play();
    if (p && p.catch) p.catch(() => { wanted = false; setUi(false); });
    fadeTo(volume);
  };
  const pause = () => {
    wanted = false;
    setUi(false);
    fadeTo(0, 400);
  };

  button.addEventListener("click", () => (wanted ? pause() : play()));

  // Don't keep playing in a background tab; resume when the guest returns.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (wanted && audio.src) audio.play().catch(() => {});
  });

  return { start: play, audio };
}
