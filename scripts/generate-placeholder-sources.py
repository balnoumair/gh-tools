#!/usr/bin/env python3
"""Generate distinct 1024x1024 placeholder app-icon sources for the two
Electron products (Git Manager + PR Pulse). Drawn at 4x and downscaled for
clean anti-aliasing. Replace these with real artwork later, then re-run
`pnpm icons`.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 4               # supersample factor
SIZE = 1024 * S
# macOS icon grid: the squircle is inset from the canvas with transparent
# margins (≈100/1024) so the icon isn't oversized vs. native apps.
MARGIN = int(100 * S)
RADIUS = int(186 * S)   # corner radius of the inset squircle


def vgrad(top, bottom):
    """Vertical gradient image."""
    base = Image.new("RGB", (SIZE, SIZE), top)
    top_r, top_g, top_b = top
    bot_r, bot_g, bot_b = bottom
    px = base.load()
    for y in range(SIZE):
        t = y / (SIZE - 1)
        r = int(top_r + (bot_r - top_r) * t)
        g = int(top_g + (bot_g - top_g) * t)
        b = int(top_b + (bot_b - top_b) * t)
        for x in range(SIZE):
            px[x, y] = (r, g, b)
    return base


def rounded_mask():
    m = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle(
        [MARGIN, MARGIN, SIZE - 1 - MARGIN, SIZE - 1 - MARGIN],
        radius=RADIUS,
        fill=255,
    )
    return m


def finish(bg, glyph_layer, out_path):
    """Composite glyph over gradient, clip to squircle, downscale, save."""
    bg = bg.convert("RGBA")
    bg.alpha_composite(glyph_layer)
    bg.putalpha(rounded_mask())
    bg = bg.resize((1024, 1024), Image.LANCZOS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    bg.save(out_path)
    print("Wrote", out_path)


def git_manager():
    """Neutral dark squircle with a light git-branch mark (matches gh-mark)."""
    bg = vgrad((42, 42, 46), (19, 19, 21))
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fg = (243, 243, 244, 255)

    cx = SIZE // 2
    lw = int(70 * S)
    node_r = int(96 * S)
    left_x = int(SIZE * 0.40)
    right_x = int(SIZE * 0.62)
    top_y = int(SIZE * 0.30)
    bot_y = int(SIZE * 0.70)
    mid_y = (top_y + bot_y) // 2

    # vertical spine (top-left node -> bottom-left node)
    d.line([(left_x, top_y), (left_x, bot_y)], fill=fg, width=lw)
    # branch arm (spine -> right node)
    d.line([(left_x, mid_y), (right_x, mid_y)], fill=fg, width=lw)
    d.line([(right_x, mid_y), (right_x, top_y + node_r)], fill=fg, width=lw)

    for (nx, ny) in [(left_x, top_y), (left_x, bot_y), (right_x, top_y)]:
        d.ellipse([nx - node_r, ny - node_r, nx + node_r, ny + node_r], fill=fg)

    finish(bg, layer, os.path.join(ROOT, "assets", "git-manager", "icon-source.png"))


def pr_pulse():
    """Warm amber squircle with a white pulse/heartbeat line + notify dot."""
    bg = vgrad((240, 176, 98), (199, 110, 52))
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fg = (255, 255, 255, 255)

    lw = int(74 * S)
    midy = int(SIZE * 0.52)
    # heartbeat polyline across the middle
    pts = [
        (int(SIZE * 0.20), midy),
        (int(SIZE * 0.36), midy),
        (int(SIZE * 0.45), int(SIZE * 0.34)),
        (int(SIZE * 0.55), int(SIZE * 0.70)),
        (int(SIZE * 0.64), midy),
        (int(SIZE * 0.80), midy),
    ]
    d.line(pts, fill=fg, width=lw, joint="curve")
    for (px_, py_) in pts:
        d.ellipse([px_ - lw // 2, py_ - lw // 2, px_ + lw // 2, py_ + lw // 2], fill=fg)

    # notification dot (top-right)
    dot_r = int(108 * S)
    dx, dy = int(SIZE * 0.74), int(SIZE * 0.28)
    d.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=fg)

    finish(bg, layer, os.path.join(ROOT, "assets", "pr-pulse", "icon-source.png"))


if __name__ == "__main__":
    git_manager()
    pr_pulse()
