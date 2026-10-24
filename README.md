# Hamza & Komal — Walima Invitation

A mobile-first invitation website for the Walima of **Hamza Shafi & Komal Naveed**:
Saturday, 28 November 2026, 1 PM, at Grand Orchid Farmhouse, Raiwind Road, Lahore.
It is the companion to the Barat invitation and uses the same structure.

Guests open a dusty-blue envelope sealed with a maroon **H&K** wax seal. The seal
cracks, the flap opens, the letter rises and grows to fill the screen, and the
names write themselves inside a dusty-blue wreath that grows leaf by leaf. The
rest of the invitation is a series of full-screen sections: the invitation, a
flip-clock countdown with a silver scratch-off date, our story, the schedule, the
venue with a map, the dress code, a polaroid gallery, Q&A, RSVP (sent on
WhatsApp), duas, and a closing screen with lanterns and fireworks.

## Editing

Everything a guest reads is in **`site/content.js`**: names, dates, schedule,
venue, Q&A, RSVP settings and media paths. If you change the names or the date,
also update `<title>` and the `og:` tags in `site/index.html`. WhatsApp reads
those tags for the link preview.

Before sharing, do these:

| What | Where |
| --- | --- |
| Background songs: add `perfect.mp3` and `a-thousand-years.mp3` | `site/assets/audio/` (the music button appears once at least one file is there) |
| Couple photos: replace `01.jpg`–`05.jpg` (portrait, about 4:5), or list your own | `site/assets/gallery/` and `gallery.photos` in `content.js` |
| RSVP deadline | `rsvp.byDate` (currently 20 November 2026) |
| WhatsApp number that receives RSVPs | `rsvp.whatsapp`, for example `923001234567`. If empty, the guest picks the chat. |
| Exact Google Maps pin | `venue.mapsUrl` (Google Maps → Share → Copy link) |

## Running locally

```sh
cd site && python3 -m http.server 8765
# open http://localhost:8765
```

There is no build step. Deploy the `site/` folder as is (on Vercel, set the
project's root directory to `site`).

## Design

- **Palette.** The printed Walima card supplies the dusty-blue watercolour paper,
  the cocoa script and the maroon date. The groom's outfit adds navy and gold;
  the bride's adds ice blue and silver.
- **Type.** These are matched to the card: Imperial Script (names), Quicksand (body),
  Libre Baskerville (dates) and Amiri (Arabic). All are self-hosted Google Fonts (OFL).
- **Artwork.** The flowers and scrollwork are CC0 / public-domain engravings from
  rawpixel, found through Openverse and tinted ivory so they read like the
  card's plaster relief. `tools/build_assets.py` downloads them, processes them
  and paints the watercolour paper. Run `python3 -I tools/build_assets.py` to rebuild.
- **Hero.** A typographic hero: the names are written in (Imperial Script) inside
  a dusty-blue laurel wreath drawn in code (`wreath()` in `site/js/icons.js`).
  There is no illustration of the couple.
- **Motion.** Every screen has a moment that plays on arrival or answers a touch.
  The sections are listed in the comment at the top of `site/content.js`, and each
  one's motion is in `site/css/motion.css`. Particles (petals, sparkles, confetti,
  hearts, wax crumbs, fireworks) share one canvas (`site/js/fx.js`). Scroll depth,
  hero tilt, tap-anywhere sparkles and haptics are in `site/js/motion.js`. Only
  `transform` and `opacity` are animated, loops pause off screen, and with
  *Reduce Motion* turned on the screens fade in calmly with no particles. No
  libraries are used.
- **Placeholders.** `tools/render_cards.js` renders the gallery placeholder cards
  and the link-preview image (`site/assets/images/og-walima.jpg`).
