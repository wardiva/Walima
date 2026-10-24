// RSVP: the guest writes their name, types how many are coming, may leave a
// short note, and taps "I Will Attend" or "Can't Attend". The reply is posted
// to the host's Google Apps Script web app (content.rsvp.endpoint), which adds
// a row to her Google Sheet and emails her (tools/rsvp-apps-script.gs).
//
//  • Sending is near-instant and never fails falsely: the reply is handed to
//    navigator.sendBeacon (text/plain, so no CORS preflight; Apps Script runs
//    doPost on that first POST, however slowly it then answers), falling back
//    to a keepalive no-cors fetch that is not awaited. The thank-you shows
//    after a short "Sending" beat. A failure message appears only when the
//    reply can't even be queued: offline, or the fallback rejects at once.
//  • Guests type a number (1 to maxGuests); empty counts as 1. It is ignored
//    for "Can't Attend", which sends 0.
//  • While `endpoint` is empty the form is closed ("Replies open soon") and
//    nothing can be sent, so no reply is ever silently lost.
//  • A hidden "website" field catches form-filling bots.
//  • The reply is remembered on this device so the card shows the thank-you
//    when the guest comes back.
//
// Reactions (main.js): onInvalid() when the name is missing (the field also
// shakes), onReply(answer, button) once the reply has been sent, so the burst
// starts from the tapped button, and onFail() when it couldn't be sent.

const KEY = "walima-hk-rsvp";
const SENDING_MS = 380;   // the short "Sending…" beat before the thank-you
const QUEUED_MS = 400;    // a fallback fetch still in flight by now has been queued

export function initRsvp(root, cfg, { onReply, onInvalid, onFail } = {}) {
  const form = root.querySelector(".rsvp__form");
  const fields = form.querySelector(".rsvp__fields");
  const done = root.querySelector(".rsvp__done");
  const thanks = root.querySelector(".rsvp__thanks");
  const error = root.querySelector(".rsvp__error");
  const { name, guests, message, website } = form.elements;
  const buttons = [...form.querySelectorAll('button[type="submit"]')];
  const endpoint = String(cfg.endpoint || "").trim();

  const show = (reply) => {
    form.hidden = !!reply;
    done.hidden = !reply;
    if (reply) thanks.textContent = reply.answer === "yes" ? cfg.thanksYes : cfg.thanksNo;
  };

  // Not set up yet: say so, and keep the form closed.
  if (!endpoint) {
    form.classList.add("is-closed");
    fields.disabled = true;
    error.textContent = cfg.closed;
  }

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (saved && saved.answer) {
    name.value = saved.name || "";
    if (saved.guests) guests.value = String(saved.guests);
    show(saved);
  }

  name.addEventListener("input", () => { if (endpoint) error.textContent = ""; });

  let sending = false;
  const setSending = (on, btn) => {
    sending = on;
    form.classList.toggle("is-sending", on);
    form.setAttribute("aria-busy", String(on));
    fields.disabled = on;
    for (const b of buttons) {
      const label = b.querySelector("span");
      if (on && b === btn) {
        b.classList.add("is-sending");
        label.dataset.text = label.textContent;
        label.textContent = cfg.sending;
      } else if (!on && label.dataset.text) {
        b.classList.remove("is-sending");
        label.textContent = label.dataset.text;
        delete label.dataset.text;
      }
    }
  };

  /** Queue the reply; rejects only if it can't be queued at all. */
  const post = (payload) => {
    if (navigator.onLine === false) return Promise.reject(new Error("offline"));
    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: "text/plain;charset=utf-8" }))) return Promise.resolve();
    } catch {}
    return new Promise((resolve, reject) => {
      let done = false;
      const settle = (fn, v) => { if (!done) { done = true; clearTimeout(t); fn(v); } };
      const t = setTimeout(() => settle(resolve), QUEUED_MS);
      try {
        fetch(endpoint, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body })
          .then(() => settle(resolve), (err) => settle(reject, err));
      } catch (err) {
        settle(reject, err);
      }
    });
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Guests: digits only, as they type.
  guests.addEventListener("input", () => {
    const digits = guests.value.replace(/\D+/g, "");
    if (digits !== guests.value) guests.value = digits;
    if (endpoint) error.textContent = "";
  });
  const shake = (input) => {
    const field = input.closest(".rsvp__field");
    field.classList.remove("is-shaking");
    void field.offsetWidth; // restart the shake
    field.classList.add("is-shaking");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !endpoint) return;
    const btn = e.submitter || buttons[0];
    const answer = btn.value === "no" ? "no" : "yes";
    const who = name.value.trim();
    if (!who) {
      error.textContent = cfg.nameMissing;
      shake(name);
      onInvalid?.();
      name.focus();
      return;
    }
    const max = Number(cfg.maxGuests) || 20;
    const typed = guests.value.trim();
    const n = typed === "" ? 1 : Number(typed);
    if (answer === "yes" && !(Number.isInteger(n) && n >= 1 && n <= max)) {
      error.textContent = cfg.guestsInvalid;
      shake(guests);
      onInvalid?.();
      guests.focus();
      return;
    }
    error.textContent = "";
    const reply = { answer, name: who, guests: n };

    if (website.value) { // a bot filled the hidden field: pretend all is well
      show(reply);
      return;
    }

    setSending(true, btn);
    try {
      await Promise.all([wait(SENDING_MS), post({
        answer,
        name: who.slice(0, 80),
        guests: answer === "yes" ? n : 0,
        message: message.value.trim().slice(0, 200),
        event: cfg.event || "",
        sentAt: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        userAgent: navigator.userAgent.slice(0, 200),
        page: location.href.split("#")[0],
      })]);
    } catch {
      setSending(false, btn);
      error.textContent = cfg.sendFailed;
      onFail?.();
      return;
    }
    setSending(false, btn);
    onReply?.(answer, btn);
    try { localStorage.setItem(KEY, JSON.stringify(reply)); } catch {}
    show(reply);
  });

  root.querySelector(".rsvp__change").addEventListener("click", () => {
    try { localStorage.removeItem(KEY); } catch {}
    show(null);
    if (endpoint) name.focus();
  });
}
