/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONTENT — the only file you need to edit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Walima of Hamza Shafi & Komal Naveed · Saturday 28 November 2026, 1 PM
 *  Grand Orchid Farmhouse, Raiwind Road, Lahore.
 *
 *  Page order (one full screen each):
 *     1. Opening   — a sealed dusty-blue envelope, "Tap to Open": the wax
 *                    seal lifts, the flap opens, the letter rises, and the
 *                    HERO appears — the couple under the names.
 *     2. Letter    — Bismillah, the invitation, the names and the date.
 *     3. Countdown — the date under silver scratch-off foil, live countdown.
 *     4. Story     — a few words from the couple.
 *     5. Schedule  — timeline built from `schedule.items`.
 *     6. Venue     — name, address, map and "Open in Google Maps".
 *     7. Dress code
 *     8. Gallery   — swipeable photos from `gallery.photos`.
 *     9. Q&A       — tap a question to open it.
 *    10. RSVP      — name + guests, "I Will Attend" / "Can't Attend"
 *                    (sends the reply on WhatsApp).
 *    11. Dua       — gifts / prayers.
 *    12. Closing   — "In sha Allah".
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
    day: "Saturday, November 28, 2026",
    time: "At 1 PM Noon",
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

  /* 4 — Our story */
  story: {
    eyebrow: "Our Story",
    title: "With Joy",
    // One entry per paragraph.
    paragraphs: [
      "With hearts full of joy, we invite you to join us in the celebration of our Walima. Your presence will make our happiness even more special.",
    ],
    signature: "Hamza & Komal",
  },

  /* 5 — Schedule. Add, remove or reorder rows freely. */
  schedule: {
    eyebrow: "The Day",
    title: "Schedule",
    items: [
      { time: "1:00", period: "PM", title: "Guests Arrival & Welcome" },
      { time: "1:30", period: "PM", title: "Walima Lunch" },
      { time: "3:00", period: "PM", title: "Dua & End" },
    ],
  },

  /* 6 — Venue */
  venue: {
    eyebrow: "The Venue",
    name: "Grand Orchid",
    subName: "Farmhouse",
    address: "Raiwind Road",
    city: "Lahore",
    // Paste the exact pin here (Google Maps → Share → Copy link) to replace the search.
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Orchid+Farm+House+Raiwind+Road+Lahore",
    // Map shown on the card (no API key needed).
    mapEmbed: "https://maps.google.com/maps?q=Grand%20Orchid%20Farm%20House%2C%20Raiwind%20Road%2C%20Lahore&z=14&output=embed",
    openLocation: "Open in Google Maps",
  },

  /* 7 — Dress code */
  dressCode: {
    eyebrow: "Dress Code",
    title: "Formal Wear",
    note: "Come dressed for an elegant afternoon",
  },

  /* 8 — Gallery. Replace the files (portrait, about 4:5) or list your own. */
  gallery: {
    eyebrow: "Gallery",
    title: "Moments",
    hint: "Swipe",
    photos: [
      { src: "assets/gallery/01.jpg", alt: "" },
      { src: "assets/gallery/02.jpg", alt: "" },
      { src: "assets/gallery/03.jpg", alt: "" },
      { src: "assets/gallery/04.jpg", alt: "" },
      { src: "assets/gallery/05.jpg", alt: "" },
    ],
  },

  /* 9 — Questions & answers */
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

  /* 10 — RSVP. Replies are sent on WhatsApp. Put the host's number in
          international format without "+" or spaces (e.g. "923001234567");
          left empty, WhatsApp asks the guest which chat to send it to. */
  rsvp: {
    eyebrow: "RSVP",
    title: "Kindly Reply",
    byLine: "Please confirm your presence by",
    byDate: "20 November 2026",
    whatsapp: "",
    namePlaceholder: "Your name",
    guestsLabel: "Guests",
    maxGuests: 6,
    attend: "I Will Attend",
    decline: "Can't Attend",
    nameMissing: "Please write your name first",
    // The WhatsApp message. {name}, {guests} and {event} are filled in.
    messageYes: "Assalam o Alaikum! {name} will attend the {event} ({guests}). JazakAllah for the invitation.",
    messageNo: "Assalam o Alaikum! {name} regretfully can't attend the {event}. Wishing Hamza & Komal every happiness.",
    event: "Walima of Hamza & Komal on 28 November 2026",
    thanksYes: "JazakAllah — we can't wait to see you!",
    thanksNo: "JazakAllah — you'll be in our duas.",
    change: "Change reply",
  },

  /* 11 — Gifts & prayers */
  dua: {
    eyebrow: "Gifts",
    title: "Your Duas",
    line: "Your presence and prayers are enough for us.",
    arabic: "بَارَكَ ٱللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    translation: "May Allah bless you both, shower His blessings upon you, and unite you in goodness.",
  },

  /* 12 — Closing */
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
    // Background songs, played in order and looped. Add the audio files to
    // site/assets/audio/ with these names (MP3). Missing files are skipped;
    // with none present the music button stays hidden.
    music: [
      { src: "assets/audio/perfect.mp3", title: "Perfect — Ed Sheeran" },
      { src: "assets/audio/a-thousand-years.mp3", title: "A Thousand Years — Christina Perri" },
    ],
    musicVolume: 0.7,
    couple: "assets/svg/couple.svg", // the illustrated couple, 420x620
    paper: "assets/images/paper-blue.jpg", // most screens
    paperLight: "assets/images/paper-ice.jpg", // envelope, hero, letter
    paperDeep: "assets/images/paper-dusk.jpg", // closing
  },
};
