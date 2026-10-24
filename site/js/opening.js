// Sealed envelope → tap → the wax seal squashes and cracks (wax crumbs, a
// short buzz), the flap opens, the letter rises, the envelope falls away and
// the letter grows to fill the screen, becoming the hero: the names inside a
// wreath that grows leaf by leaf.
//
// Every step is a class on the section (see sections.css / motion.css), so
// the motion lives in CSS. With Reduce Motion the envelope simply fades to
// the hero.

const STEPS = [
  // [class, ms after the tap]
  ["flap-open", 420],   // the seal has cracked
  ["flap-back", 900],   // past vertical: the flap now sits behind the letter
  ["letter-out", 1000],
  ["env-drop", 1750],   // the envelope falls away below the letter
  ["letter-zoom", 1950],// the letter grows to fill the screen
];
const OPENED_AT = 2600;  // the hero is revealed

export function initOpening({ section, music, reducedMotion, onSeal, onOpened }) {
  const tap = section.querySelector("#tapToOpen");
  const seal = section.querySelector(".env__seal");
  const letter = section.querySelector(".env__letter");
  let started = false;

  const zoomTarget = () => {
    // Scale the risen letter so it covers the screen, centred.
    const app = section.getBoundingClientRect();
    const r = letter.getBoundingClientRect();
    const s = Math.max(app.width / r.width, app.height / r.height) * 1.08;
    const dy = app.top + app.height / 2 - (r.top + r.height / 2);
    letter.style.setProperty("--zs", s.toFixed(3));
    letter.style.setProperty("--zy", `${dy.toFixed(1)}px`);
  };

  const open = () => {
    if (started) return;
    started = true;
    section.classList.remove("is-intro");
    section.classList.add("is-opening");
    music.start(); // inside the user gesture, so mobile browsers allow audio

    if (reducedMotion) {
      section.classList.add("is-opened");
      onOpened();
      return;
    }
    // the seal cracks a beat after the press
    setTimeout(() => {
      const r = seal.getBoundingClientRect();
      onSeal?.(r.left + r.width / 2, r.top + r.height / 2);
    }, 230);
    for (const [cls, ms] of STEPS) {
      setTimeout(() => {
        if (cls === "letter-zoom") zoomTarget();
        section.classList.add(cls);
      }, ms);
    }
    setTimeout(() => {
      section.classList.add("is-opened");
      onOpened();
    }, OPENED_AT);
  };

  tap.addEventListener("click", open);
  section.addEventListener("keydown", (e) => {
    if (!started && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open();
    }
  });
}
