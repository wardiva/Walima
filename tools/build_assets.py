#!/usr/bin/env python3
"""
Builds the invitation's artwork into site/assets/images.

  python3 -I tools/build_assets.py [cache_dir]

1. Downloads the CC0 / public-domain engravings listed in SOURCES (rawpixel,
   found through Openverse) into cache_dir (default: .asset-cache, git-ignored).
2. Turns each black-ink engraving into ivory relief with a soft beige shadow,
   so it reads like the plaster scrollwork on the printed Walima card.
3. Paints the dusty-blue watercolour paper used behind every screen.

Everything is written as WebP sized for a 480px-wide column at 2x.
"""
import io
import os
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images")
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, ".asset-cache")

RP = "https://images.rawpixel.com/image_png_1300/"
# name: (source url, output width in px). All CC0 (rawpixel public-domain set).
SOURCES = {
    "frame-cartouche": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcxOC0wOTMtcC5wbmc.png", 900),
    "crest-shell": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcyMC0xNzMtcC5wbmc.png", 760),
    "crest-scroll": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcyMC0xNzItcC5wbmc.png", 760),
    "crest-wave": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcyMC0xNzAtcC5wbmc.png", 760),
    "ornament-heart": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2pvYjcxMy0wNTMtcC5wbmc.png", 600),
    "divider-scroll": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2pvYjcxMy0xMDktcC5wbmc.png", 560),
    "divider-flowers": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcxOS0xMjMtcF8xLnBuZw.png", 560),
    "garland-bows": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcxNi0wNTYtcC5wbmc.png", 900),
    "garland-roses": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2pvYjcxNy0xMDUtcF8xLnBuZw.png", 900),
    "roses-cluster": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2pvYjcxNC0wNjEtcC5wbmc.png", 760),
    "roses-spray": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA0L2pvYjk3MC1lbGVtZW50LTM0OC5wbmc.png", 640),
    "roses-flourish": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2pvYjcxMy0wMzktcC5wbmc.png", 760),
    "hydrangea": (RP + "cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2pvYjcxMS0wNzgtcC5wbmc.png", 560),
}

IVORY = (251, 248, 241)
SHADOW = (150, 128, 104)


def fetch(name, url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name + ".png")
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "walima-invite-assets/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    return Image.open(path).convert("RGBA")


def ivory_relief(src, width):
    """Ink → ivory, with a soft offset shadow so it looks raised off the paper."""
    a = np.asarray(src).astype(np.float32) / 255
    ink = (1 - a[..., :3].mean(axis=2)) * a[..., 3]          # dark, opaque pixels = ink
    ink = np.clip((ink - 0.05) / 0.8, 0, 1)
    mask = Image.fromarray((ink * 255).astype(np.uint8))
    h = round(src.height * width / src.width)
    mask = mask.resize((width, h), Image.LANCZOS)

    pad = 8
    canvas = Image.new("RGBA", (width + pad * 2, h + pad * 2), (0, 0, 0, 0))
    shadow_a = mask.filter(ImageFilter.GaussianBlur(2.2)).point(lambda v: int(v * 0.5))
    shadow = Image.new("RGBA", mask.size, SHADOW + (0,))
    shadow.putalpha(shadow_a)
    canvas.alpha_composite(shadow, (pad + 2, pad + 3))
    face = Image.new("RGBA", mask.size, IVORY + (0,))
    face.putalpha(mask)
    canvas.alpha_composite(face, (pad, pad))
    return canvas


def noise(shape, scale, rng):
    """Smooth value noise: a small random field upsampled with bicubic."""
    h, w = shape
    small = rng.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255


def watercolor_paper(w, h, seed, light, mid, deep):
    """Mottled dusty-blue wash like the printed card: clouds, blooms, grain."""
    rng = np.random.default_rng(seed)
    n = sum(noise((h, w), s, rng) * wt for s, wt in ((420, 0.42), (190, 0.28), (80, 0.18), (28, 0.12)))
    n = (n - n.min()) / (n.max() - n.min())
    # pigment pooling: sharpen mid-tones into soft "blooms"
    bloom = noise((h, w), 140, rng)
    n = np.clip(n * 0.8 + (bloom > 0.62) * (bloom - 0.62) * 1.2, 0, 1)
    # lighter centre where the card sits, a touch deeper toward the edges
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    vign = ((xx / w - 0.5) ** 2 * 1.4 + (yy / h - 0.48) ** 2) ** 0.5
    n = np.clip(n * 0.75 + vign * 0.55, 0, 1)

    light, mid, deep = (np.array(c, np.float32) for c in (light, mid, deep))
    t = n[..., None]
    col = np.where(t < 0.5, light + (mid - light) * (t / 0.5), mid + (deep - mid) * ((t - 0.5) / 0.5))
    grain = (rng.random((h, w)).astype(np.float32) - 0.5) * 7
    fibres = (noise((h, w), 3, rng) - 0.5) * 6
    col = col + (grain + fibres)[..., None]
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, (url, width) in SOURCES.items():
        img = ivory_relief(fetch(name, url), width)
        img.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=88, method=6)
        print("art  ", name, img.size)

    # Paper: one portrait sheet per mood, 960x1700 (≈ 9:16 at 2x of 480px).
    papers = {
        "paper-blue": ((214, 225, 231), (171, 190, 202), (126, 149, 166), 11),
        "paper-ice": ((232, 238, 240), (200, 215, 222), (160, 182, 196), 23),
        "paper-dusk": ((150, 171, 189), (104, 128, 152), (52, 70, 98), 37),
    }
    for name, (light, mid, deep, seed) in papers.items():
        watercolor_paper(960, 1700, seed, light, mid, deep).save(
            os.path.join(OUT, name + ".jpg"), "JPEG", quality=84, optimize=True, progressive=True)
        print("paper", name)


if __name__ == "__main__":
    main()
