// RSVP: the guest writes their name, picks how many are coming and taps
// "I Will Attend" or "Can't Attend". The reply opens in WhatsApp, addressed
// to the host's number (content.rsvp.whatsapp) or, without one, to whichever
// chat the guest picks. The choice is remembered on this device so the card
// shows the thank-you when they come back.
//
// Reactions (main.js): onInvalid() when the name is missing (the field also
// shakes), onReply(answer, button) just before the form turns into the
// thank-you, so the burst can start from the tapped button.

const KEY = "walima-hk-rsvp";

const fill = (tpl, vals) => tpl.replace(/\{(\w+)\}/g, (_, k) => vals[k] ?? "");

export function initRsvp(root, cfg, { onReply, onInvalid } = {}) {
  const form = root.querySelector(".rsvp__form");
  const done = root.querySelector(".rsvp__done");
  const thanks = root.querySelector(".rsvp__thanks");
  const error = root.querySelector(".rsvp__error");
  const name = form.elements.name;
  const guests = form.elements.guests;

  const show = (reply) => {
    form.hidden = !!reply;
    done.hidden = !reply;
    if (reply) thanks.textContent = reply.answer === "yes" ? cfg.thanksYes : cfg.thanksNo;
  };

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (saved && saved.answer) {
    name.value = saved.name || "";
    if (saved.guests) guests.value = String(saved.guests);
    show(saved);
  }

  name.addEventListener("input", () => (error.textContent = ""));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const answer = e.submitter?.value === "no" ? "no" : "yes";
    const who = name.value.trim();
    if (!who) {
      error.textContent = cfg.nameMissing;
      const field = name.closest(".rsvp__field");
      field.classList.remove("is-shaking");
      void field.offsetWidth; // restart the shake
      field.classList.add("is-shaking");
      onInvalid?.();
      name.focus();
      return;
    }
    const n = Number(guests.value) || 1;
    const text = fill(answer === "yes" ? cfg.messageYes : cfg.messageNo, {
      name: who,
      guests: n === 1 ? "1 guest" : `${n} guests`,
      event: cfg.event,
    });
    const number = String(cfg.whatsapp || "").replace(/\D/g, "");
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");

    onReply?.(answer, e.submitter || form.querySelector('[value="yes"]'));
    const reply = { answer, name: who, guests: n };
    try { localStorage.setItem(KEY, JSON.stringify(reply)); } catch {}
    show(reply);
  });

  root.querySelector(".rsvp__change").addEventListener("click", () => {
    try { localStorage.removeItem(KEY); } catch {}
    show(null);
    name.focus();
  });
}
