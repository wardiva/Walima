// RSVP: the guest writes their name, picks how many are coming, may leave a
// short note, and taps "I Will Attend" or "Can't Attend". The reply is posted
// to the host's Google Apps Script web app (content.rsvp.endpoint), which adds
// a row to her Google Sheet and emails her (tools/rsvp-apps-script.gs).
//
//  • Apps Script doesn't answer CORS preflights, so the reply is sent as
//    text/plain with mode "no-cors": the request goes through, the response
//    is opaque. A network failure or a 15 s timeout shows a retry message.
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
const TIMEOUT_MS = 15000;

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

  const post = async (payload) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !endpoint) return;
    const btn = e.submitter || buttons[0];
    const answer = btn.value === "no" ? "no" : "yes";
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
    error.textContent = "";
    const n = Number(guests.value) || 1;
    const reply = { answer, name: who, guests: n };

    if (website.value) { // a bot filled the hidden field: pretend all is well
      show(reply);
      return;
    }

    setSending(true, btn);
    try {
      await post({
        answer,
        name: who.slice(0, 80),
        guests: answer === "yes" ? n : 0,
        message: message.value.trim().slice(0, 200),
        event: cfg.event || "",
        sentAt: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        userAgent: navigator.userAgent.slice(0, 200),
        page: location.href.split("#")[0],
      });
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
