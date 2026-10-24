# Hamza & Komal — Walima Invitation

A mobile-first invitation website for the Walima of **Hamza Shafi & Komal Naveed**:
Saturday, 28 November 2026, 1 PM, at Grand Orchid Farmhouse, Raiwind Road, Lahore.
It is the companion to the Barat invitation and uses the same structure.

Guests open a dusty-blue envelope sealed with a maroon **H&K** wax seal. The seal
cracks, the flap opens, the letter rises and grows to fill the screen, and the
names write themselves inside a dusty-blue wreath that grows leaf by leaf. The
rest of the invitation is a series of full-screen sections, in this order:

1. the invitation
2. a flip-clock countdown with a silver scratch-off date
3. the schedule
4. our story
5. the venue, with an illustrated map that opens Google Maps
6. the dress code
7. a polaroid gallery
8. Q&A
9. RSVP (each reply goes to the host's Google Sheet and Gmail)
10. duas
11. a closing screen with lanterns and fireworks

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
| Where RSVPs go | `rsvp.endpoint`: see [RSVP replies](#rsvp-replies) below. Until it is set, the RSVP card shows "Replies open soon" and nothing can be sent. |
| Exact Google Maps pin | `venue.mapsUrl` (Google Maps → Share → Copy link) |

## RSVP replies

Each reply is added as a row to a Google Sheet in **your own Google account**,
and the same account receives an email for each reply, with a subject such as
*"RSVP: Ayesha Khan will attend (3 guests)"*. It's free, needs no other service,
and your email address never appears in the website: the script emails the
account that set it up.

One-time setup (about 5 minutes, on a computer):

1. Go to [sheets.new](https://sheets.new) while signed in to the Google account
   that should receive the replies. Name the sheet, for example "Walima RSVPs".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code, paste the whole of
   [`tools/rsvp-apps-script.gs`](tools/rsvp-apps-script.gs), and click **Save** (💾).
4. Choose **sendTestRsvp** in the menu next to **▷ Run**, then click **Run**.
   When Google asks, choose **Review permissions**, then your account, then
   **Advanced → Go to (project name) (unsafe)** (it's your own script), then
   **Allow**. A test row appears in a new "RSVPs" tab and a test email arrives;
   you can delete the test row.
5. Click **Deploy → New deployment**. Under the gear (⚙) choose **Web app**. Set
   **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** (and
   **Authorize** again if asked).
6. Copy the **Web app URL** (it ends in `/exec`) and paste it as `endpoint` in the
   `rsvp` section of `site/content.js`, for example
   `endpoint: "https://script.google.com/macros/s/AKfy…/exec",`, then redeploy the site.

Opening the `/exec` URL in a browser shows "The Walima RSVP endpoint is
running." If you change the script later, use **Deploy → Manage deployments →
✎ → Version: New version → Deploy**; the URL stays the same.

Notes:

- The sheet keeps every reply, including changed ones. The totals in each email
  count only each guest's latest reply.
- A free Gmail account can send about 100 emails a day from Apps Script, which
  is plenty for an invitation.
- The browser can't read Apps Script's response, so the site shows success once
  the reply has been sent. If the guest is offline or the request times out, it
  asks them to tap again.

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
- **Venue map.** The map is an illustration drawn in code (`mapArt()` in
  `site/js/render.js`): the road is labelled with `venue.address`, and it shows
  the farmhouse plot with the dropped pin, a compass, and a little car on its way.
  It isn't to scale. Tapping it, or the button below it, opens `venue.mapsUrl` in
  Google Maps.
- **Placeholders.** `tools/render_cards.js` renders the gallery placeholder cards
  and the link-preview image (`site/assets/images/og-walima.jpg`).
