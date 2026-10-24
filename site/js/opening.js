// Sealed envelope → tap → the wax seal lifts, the flap opens, the letter
// rises, and the envelope melts away to the hero (the couple and names).
//
// Every step is a class on the section (see sections.css), so the motion
// lives in CSS. With Reduce Motion the envelope simply fades to the hero.

const STEPS = [
  // [class, ms after the tap]
  ["flap-open", 420],   // the seal has lifted
  ["flap-back", 900],   // past vertical: the flap now sits behind the letter
  ["letter-out", 1000],
];
const OPENED_AT = 2150;  // the envelope fades, the hero arrives

export function initOpening({ section, music, reducedMotion, onOpened }) {
  const tap = section.querySelector("#tapToOpen");
  let started = false;

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
    for (const [cls, ms] of STEPS) setTimeout(() => section.classList.add(cls), ms);
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
