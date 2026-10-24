# Hamza & Komal — Walima Invitation

A mobile-first invitation website for the Walima of **Hamza Shafi & Komal Naveed**:
Saturday, 28 November 2026, 1 PM, at Grand Orchid Farmhouse, Raiwind Road, Lahore.
It is the companion to the Barat invitation and uses the same structure.

Guests open a dusty-blue envelope sealed with a maroon **H&K** wax seal. The flap
opens, the letter rises, and an illustration of the couple appears. The rest of
the invitation is a series of full-screen sections: the invitation, a countdown
with a silver scratch-off date, our story, the schedule, the venue with a map,
the dress code, a gallery, Q&A, RSVP (sent on WhatsApp), duas, and a closing screen.

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
- **Illustration.** `site/assets/svg/couple.svg` is a hand-drawn vector of the
  couple in their outfits: the navy double-breasted suit with gold buttons,
  maroon tie and pocket chain, and the ice-blue lehenga with silver embroidery
  and a trailing veil.
- **Placeholders.** `tools/render_cards.js` renders the gallery placeholder cards
  and the link-preview image (`site/assets/images/og-walima.jpg`).
