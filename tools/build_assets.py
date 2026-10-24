#!/usr/bin/env python3
"""
Builds the invitation's artwork into site/assets/images.

  python3 -I tools/build_assets.py [cache_dir]

1. Downloads the CC0 / public-domain engravings listed in SOURCES (rawpixel,
   found through Openverse) into cache_dir (default: .asset-cache, git-ignored).
2. Turns each black-ink engraving into ivory relief with a soft beige shadow,
   so it reads like the plaster scrollwork on the printed Walima card.
3. Paints the dusty-blue watercolour paper used behind every screen.
4. Generates the small textures for the living backgrounds (ambient layers):
   leaf shade, watercolour blooms, sheer chiffon,
   clouds and star fields. All are made here from noise and geometry (no
   stock images), white/blue/navy with alpha, so the CSS can tint and fade
   them. `python3 -I tools/build_assets.py --ambient` rebuilds only these.

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
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
CACHE = ARGS[0] if ARGS else os.path.join(ROOT, ".asset-cache")

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


# ───────────────────────── Ambient textures ─────────────────────────

def _rgba(color, alpha):
    """A solid colour with an alpha mask (float 0..1) → RGBA image."""
    h, w = alpha.shape
    img = np.zeros((h, w, 4), np.uint8)
    img[..., :3] = color
    img[..., 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(img, "RGBA")


def _blur(a, r):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def leaf_shade(w=640, h=960, seed=5):
    """Dappled shade of leafy branches, as if sunlight came through a window."""
    from PIL import ImageDraw
    rng = np.random.default_rng(seed)
    layers = []
    for depth, blur, n_branch in ((0, 16, 3), (1, 9, 3), (2, 5, 2)):
        im = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(im)
        for _ in range(n_branch):
            x, y = rng.uniform(-0.1, 0.6) * w, rng.uniform(-0.1, 0.3) * h
            ang = rng.uniform(0.6, 1.3)  # heading down-right
            for step in range(26):
                nx, ny = x + np.cos(ang) * 26, y + np.sin(ang) * 26
                d.line([(x, y), (nx, ny)], fill=200, width=3)
                for side in (-1, 1):
                    if rng.random() < 0.85:
                        la = ang + side * rng.uniform(0.7, 1.1)
                        L, W = rng.uniform(34, 58), rng.uniform(13, 20)
                        cx, cy = nx + np.cos(la) * L * 0.55, ny + np.sin(la) * L * 0.55
                        pts = []
                        for t in np.linspace(0, 2 * np.pi, 18):
                            px, py = np.cos(t) * L / 2, np.sin(t) * W / 2 * (1 - 0.35 * np.cos(t))
                            pts.append((cx + px * np.cos(la) - py * np.sin(la), cy + px * np.sin(la) + py * np.cos(la)))
                        d.polygon(pts, fill=255)
                x, y, ang = nx, ny, ang + rng.uniform(-0.25, 0.25)
        layers.append(_blur(np.asarray(im).astype(np.float32) / 255, blur) * (0.45 + 0.15 * depth))
    a = np.clip(sum(layers), 0, 1)
    return _rgba((31, 42, 68), a * 0.75)


def watercolor_bloom(size=560, seed=1, color=(95, 122, 144)):
    """A pigment bloom: soft wash, darker tide-line at the edge, granulation."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) / size - 0.5
    r = np.sqrt(xx ** 2 + yy ** 2)
    n = noise((size, size), 70, rng) * 0.6 + noise((size, size), 22, rng) * 0.4
    field = 1 - r * 2.3 + (n - 0.5) * 0.9
    blob = _blur((field > 0.18).astype(np.float32), 3)
    inner = _blur(blob, 14)
    edge = np.clip(blob - inner, 0, 1) * 2.2            # pigment pools at the rim
    gran = (noise((size, size), 4, rng) - 0.5) * 0.12
    wash = inner * (0.32 + (noise((size, size), 40, rng) - 0.5) * 0.3)
    a = np.clip((wash + edge * 0.55 + gran * blob) * blob, 0, 1)
    return _rgba(color, a)


def chiffon(w=1000, h=420, seed=3, color=(196, 216, 230)):
    """A length of sheer chiffon caught by the wind: folds, sheen, soft edges."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xx / w
    ph = rng.uniform(0, 6.28)
    centre = h * (0.5 + 0.13 * np.sin(u * 4.2 + ph) + 0.05 * np.sin(u * 11 + ph * 2))
    half = h * (0.26 + 0.1 * np.sin(u * 3.1 + ph * 0.5) + 0.05 * u)
    v = (yy - centre) / half                             # -1..1 across the cloth
    inside = np.clip(1 - np.abs(v), 0, 1) ** 0.45
    folds = 0.5 + 0.5 * np.cos(u * 22 + v * 2.2 + np.sin(u * 6) * 2.4)
    sheen = np.exp(-((v + 0.25 * np.sin(u * 9)) / 0.18) ** 2)
    end = np.clip(u / 0.12, 0, 1) * np.clip((1 - u) / 0.2, 0, 1)
    hem = np.exp(-((np.abs(v) - 0.92) / 0.06) ** 2) * 0.35  # the rolled edge catches light
    a = inside * end * (0.34 + 0.26 * folds + 0.3 * sheen) + hem * end
    col = np.zeros((h, w, 4), np.float32)
    base = np.array(color, np.float32)
    col[..., :3] = base + (255 - base) * (0.35 * folds + 0.6 * sheen)[..., None]
    col[..., 3] = np.clip(a, 0, 1) * 255
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGBA")


def cloud(w=640, h=300, seed=2):
    """A soft cumulus: overlapping blurred puffs, a cool shadow underneath."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.zeros((h, w), np.float32)
    for _ in range(14):
        cx = rng.uniform(0.18, 0.82) * w
        r = rng.uniform(0.05, 0.115) * w * (1.3 - abs(cx / w - 0.5) * 1.3)
        cy = h * 0.7 - r * rng.uniform(0.3, 1.05)
        a = np.maximum(a, np.clip(1 - np.hypot(xx - cx, (yy - cy) * 1.05) / r, 0, 1) ** 0.7)
    a = np.clip(a * 2.0, 0, 1) * np.clip((h * 0.76 - yy) / (h * 0.12), 0, 1)
    a = _blur(a, 16) * (0.82 + 0.18 * noise((h, w), 26, rng))
    shade = np.clip((yy / h - 0.4) * 2.0, 0, 1) * a
    col = np.zeros((h, w, 4), np.float32)
    col[..., :3] = np.array((255, 255, 255), np.float32) - shade[..., None] * np.array((40, 26, 12), np.float32)
    col[..., 3] = a * 255 * 0.92
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGBA")


def stars(size=512, seed=4, count=70):
    """Tileable star field: tiny points with a few brighter ones."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    a = np.zeros((size, size), np.float32)
    for _ in range(count):
        px, py = rng.random(2) * size
        b = rng.uniform(0.35, 1) ** 2
        r = 0.7 + b * 1.3
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                d = np.hypot(xx - px - ox, yy - py - oy)
                a = np.maximum(a, np.clip(1 - d / (r + 1.2), 0, 1) * (0.5 + b * 0.5))
                if b > 0.75:
                    a = np.maximum(a, np.exp(-d / 6) * 0.25 * b)
    return _rgba((255, 250, 236), a)


def ambient_textures():
    os.makedirs(OUT, exist_ok=True)
    out = {
        "amb-leaves": leaf_shade(),
        "amb-bloom-a": watercolor_bloom(seed=1, color=(95, 122, 144)),
        "amb-bloom-b": watercolor_bloom(seed=7, color=(140, 166, 186)),
        "amb-chiffon-a": chiffon(seed=3, color=(196, 216, 230)),
        "amb-chiffon-b": chiffon(seed=8, color=(214, 226, 236)),
        "amb-cloud-a": cloud(seed=2),
        "amb-cloud-b": cloud(seed=6),
        "amb-stars-a": stars(seed=4, count=60),
        "amb-stars-b": stars(seed=12, count=45),
    }
    for name, img in out.items():
        path = os.path.join(OUT, name + ".webp")
        img.save(path, "WEBP", quality=80, method=6)
        print("amb  ", name, img.size, os.path.getsize(path) // 1024, "KB")


def main():
    if "--ambient" in sys.argv:
        ambient_textures()
        return
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

    ambient_textures()


if __name__ == "__main__":
    main()
