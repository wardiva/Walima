/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONTENT — the only file you need to edit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Walima of Hamza Shafi & Komal Naveed · Saturday 28 November 2026, 1 PM
 *  Grand Orchid Farmhouse, Raiwind Road, Lahore.
 *
 *  Page order (one full screen each):
 *     1. Opening   — a sealed dusty-blue envelope, "Tap to Open": the wax
 *                    seal cracks, the flap opens, the letter rises and
 *                    grows into the HERO — the names written inside a
 *                    wreath that grows leaf by leaf.
 *     2. Letter    — Bismillah, the invitation, the names and the verse.
 *     3. Countdown — the date under silver scratch-off foil, live countdown.
 *     4. Schedule  — timeline built from `schedule.items`.
 *     5. Venue     — name, address, an illustrated map (tap → Google Maps)
 *                    and "Open in Google Maps".
 *     6. Dress code
 *     7. Q&A       — tap a question to open it.
 *     8. RSVP      — name, guests and a note, "I Will Attend" / "Can't
 *                    Attend". Replies go to the host's own Google Sheet and
 *                    Gmail (set `rsvp.endpoint`; see README → RSVP replies).
 *     9. Dua       — gifts / prayers.
 *    10. Closing   — "In sha Allah".
 *
 *  • Text supports plain strings only (no HTML).
 *  • Media paths are relative to the /site folder.
 *  • Dates with a time use ISO 8601 with Pakistan's UTC offset (+05:00).
 *  • Link previews (WhatsApp etc.) read index.html, not this file: if you
 *    change the names or date, update <title> and the og: tags there too.
 */
export default {
  meta: {
    pageTitle: "Hamza & Komal — Walima Invitation",
    description: "You are cordially invited to the Walima of Hamza Shafi & Komal Naveed, Saturday 28 November 2026, Lahore.",
    lang: "en",
  },

  /* Names as they appear throughout the invitation. */
  couple: {
    groom: { name: "Hamza Shafi", shortName: "Hamza" },
    bride: { name: "Komal Naveed", shortName: "Komal" },
    joiner: "&",
    monogram: "H&K", // pressed into the wax seal
  },

  /* 1 — The sealed envelope */
  intro: {
    envelopeLine: "The Walima of", // small capitals on the envelope
    tapToOpen: "Tap to Open",
  },

  /* 1 — Hero, once the envelope is open */
  hero: {
    eyebrow: "The Walima of",
    date: "28 · 11 · 2026",
  },

  /* 2 — The invitation */
  letter: {
    bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    lines: ["Together with their families,", "you are cordially invited to the"],
    eventLine: "Walima Ceremony of", // spaced capitals, above the names
    verseArabic: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    verseTranslation: "And He placed between you affection and mercy",
    verseReference: "(Quran 30:21)",
  },

  /* 3 — Countdown */
  countdown: {
    eyebrow: "Until the Walima",
    title: "Countdown",
    day: "Saturday",
    date: "28 Nov 2026",
    time: "1:00 PM",
    scratchHint: "Scratch to reveal", // printed on the silver foil over the date
    target: "2026-11-28T13:00:00+05:00",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  },

  /* 4 — Schedule. Add, remove or reorder rows freely. */
  schedule: {
    eyebrow: "The Day",
    title: "Schedule",
    items: [
      { time: "1:00", period: "PM", title: "Guests Arrival & Welcome" },
      { time: "1:30", period: "PM", title: "Walima Lunch" },
      { time: "3:00", period: "PM", title: "Dua & End" },
    ],
  },

  /* 5 — Venue */
  venue: {
    eyebrow: "The Venue",
    name: "Grand Orchid",
    subName: "Farmhouse",
    address: "Raiwind Road",
    city: "Lahore",
    // Where the map card and the button go. Paste the exact pin here
    // (Google Maps → Share → Copy link) to replace the search.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Orchid+Farm+House+Raiwind+Road+Lahore",
    openLocation: "Open in Google Maps",
  },

  /* 6 — Dress code */
  dressCode: {
    eyebrow: "Dress Code",
    title: "Formal Wear",
    note: "Come dressed for an elegant afternoon",
  },

  /* 7 — Questions & answers */
  faq: {
    eyebrow: "Q & A",
    title: "Good to Know",
    items: [
      { q: "When is the Walima?", a: "Saturday, Nov 28, 2026 at 1 PM Noon" },
      { q: "Where is it?", a: "Grand Orchid Farmhouse, Raiwind Road, Lahore" },
      { q: "What is the dress code?", a: "Formal" },
      { q: "Is parking available?", a: "Yes, available at the farmhouse" },
    ],
  },

  /* 8 — RSVP. Each reply is added to a Google Sheet in the host's own
          Google account, which also emails her (README → "RSVP replies").
          Paste the web-app URL that ends in /exec into `endpoint`. While it
          is empty the buttons show `closed` and nothing can be sent. */
  rsvp: {
    eyebrow: "RSVP",
    title: "Kindly Reply",
    byLine: "Please confirm your presence by",
    byDate: "25 November 2026",
    endpoint: "https://script.google.com/macros/s/AKfycbwsnjax1F9SFKIDIV9sB9LVYnO1pT6JliND5-m97LAbkNqVWiTajtWZDhvVrBWw4KmAaA/exec",
    namePlaceholder: "Your name",
    guestsLabel: "Guests",
    maxGuests: 20, // guests type a number from 1 to this (the sheet script caps at 20 too)
    guestsInvalid: "Please enter a number of guests from 1 to 20",
    messagePlaceholder: "A note for the couple (optional)",
    attend: "I Will Attend",
    decline: "Can't Attend",
    nameMissing: "Please write your name first",
    sending: "Sending",
    sendFailed: "Your reply didn't go through. Please check your connection and tap again.",
    closed: "Replies open soon, please check back shortly.",
    event: "Walima of Hamza & Komal, 28 November 2026", // shown in the host's email
    thanksYes: "JazakAllah — we can't wait to see you!",
    thanksNo: "JazakAllah — you'll be in our duas.",
    change: "Change reply",
  },

  /* 9 — Gifts & prayers */
  dua: {
    eyebrow: "Gifts",
    title: "Your Duas",
    line: "Your presence and prayers are enough for us.",
    arabic: "بَارَكَ ٱللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    translation: "May Allah bless you both, shower His blessings upon you, and unite you in goodness.",
  },

  /* 10 — Closing */
  closing: {
    lines: ["We can't wait", "to celebrate with you"],
    inshaAllah: "إِنْ شَاءَ ٱللَّٰهُ",
  },

  /* Persistent controls */
  ui: {
    scrollDown: "Scroll down",
    musicOn: "Play music",
    musicOff: "Pause music",
  },

  /* Media */
  media: {
    // Background music, looped. The file is in site/assets/audio/. A
    // missing file is skipped, and with none present the music button stays
    // hidden. This is a clip of the client's file starting at 2:08, the
    // chorus ("I have died every day waiting for you…"), and running to the
    // end. For an untrimmed file, add start: <seconds> to begin part-way
    // through, e.g. start: 128. More tracks play in order.
    music: [
      { src: "assets/audio/a-thousand-years.mp3", title: "A Thousand Years — Christina Perri" },
    ],
    musicVolume: 0.7,
    paper: "assets/images/paper-blue.jpg", // most screens
    paperLight: "assets/images/paper-ice.jpg", // envelope, hero, letter
    paperDeep: "assets/images/paper-dusk.jpg", // closing
  },
};
