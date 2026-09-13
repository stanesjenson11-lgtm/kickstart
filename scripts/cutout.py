#!/usr/bin/env python3
"""
Cut the projector out of a hero plate.

Reproducible on purpose: everything that steers the cut is written down below in
texture space (fractions of the plate), so a better plate or a retouched source
is re-cut with one command.

    python scripts/cutout.py phone
    python scripts/cutout.py desktop --src path/to/unsplash-original.jpg

Why a traced polygon and not GrabCut alone: the projector's faces are as dark as
the set behind them, and colour-only segmentation tore holes straight through
them. So the outline is traced by hand to within about a percent; everything
well inside it is definitely projector, everything well outside definitely not,
and GrabCut only decides a narrow band along the edge, where the machine's lit
rims actually do separate from the dark.

Writes to public/hero/:
    cutout-<plate>.png  the projector only, RGBA, cropped to its bounds
    mask-<plate>.png    a grown, soft matte of the whole plate, for the plate
                        shader to fill the patch the projector vacates
and prints the crop rect in texture space for lib/content.ts.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hero"

# Points are (x, y) and boxes (x0, y0, x1, y1), as fractions of the plate.
PLATES = {
    "phone": {
        "src": OUT / "projector-phone.png",
        # Clockwise from the back-left corner of the vent slab.
        "polygon": [
            (0.2015, 0.5378), (0.3188, 0.5415), (0.3631, 0.5433), (0.4029, 0.5458),
            (0.4317, 0.5545), (0.4437, 0.5944), (0.4760, 0.5956), (0.4849, 0.6031),
            (0.4849, 0.6317), (0.4760, 0.6380), (0.4162, 0.6367), (0.4118, 0.6529),
            (0.4516, 0.6549), (0.4760, 0.6629), (0.4791, 0.6953), (0.4694, 0.7077),
            (0.4694, 0.7140), (0.4428, 0.7177), (0.3985, 0.7339), (0.3985, 0.7464),
            (0.3587, 0.7464), (0.3587, 0.7339), (0.1373, 0.7190), (0.1350, 0.7264),
            (0.1151, 0.7264), (0.1107, 0.7152), (0.1041, 0.6778), (0.1240, 0.6704),
            (0.1337, 0.6554), (0.1395, 0.5607),
        ],
        # Half-width of the edge band GrabCut decides, as a fraction of plate
        # width: about twice the tracing error at this resolution.
        "band": 0.008,
        "background": [(0.492, 0.0, 1.0, 1.0)],  # the plume beyond the lens face
        "foreground": [],
        "max_width": 900,
        # Lettering, as (x0, y0, x1, y1) in pixels of the finished cutout: the
        # front DUKANE label and the D on the side of the lens housing. --mirror
        # puts these back the right way round.
        "legible": [(190, 98, 232, 198), (288, 52, 314, 94)],
    },
    "desktop": {
        "src": None,  # --src: the 4000px Unsplash original of the landscape plate
        # Clockwise from the back-left corner of the vent slab.
        "polygon": [
            (0.2018, 0.2826), (0.3608, 0.2961), (0.3946, 0.3003), (0.4284, 0.3113),
            (0.4791, 0.3283), (0.4837, 0.4399), (0.5101, 0.4433), (0.5276, 0.4611),
            (0.5287, 0.5499), (0.5101, 0.5651), (0.4679, 0.5618), (0.4622, 0.5922),
            (0.4961, 0.6049), (0.5242, 0.6261), (0.5242, 0.7107), (0.5101, 0.7445),
            (0.4510, 0.8376), (0.4453, 0.8714), (0.4143, 0.8714), (0.4115, 0.8333),
            (0.1691, 0.8080), (0.1477, 0.8080), (0.1353, 0.7851), (0.1229, 0.6684),
            (0.1477, 0.6430), (0.1511, 0.5964), (0.1567, 0.3426),
        ],
        # About 2.5x the tracing error at this resolution.
        "band": 0.006,
        "background": [(0.54, 0.0, 1.0, 1.0)],  # the plume beyond the lens face
        "foreground": [],
        "max_width": 1400,
        "legible": [(715, 372, 870, 742), (1100, 195, 1214, 356)],
    },
}


def to_px(box, w, h):
    x0, y0, x1, y1 = box
    return int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)


def ellipse(r):
    r = max(1, int(r))
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def largest_component(mask):
    """Keep the machine itself; GrabCut leaves stray islands of lit crate."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n <= 1:
        return mask
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return (labels == keep).astype(np.uint8)


def fill_small_holes(mask, max_frac=0.002):
    """Close pinholes inside the body without filling real gaps."""
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    if hierarchy is None:
        return mask
    limit = mask.sum() * max_frac
    out = mask.copy()
    for i, c in enumerate(contours):
        if hierarchy[0][i][3] != -1 and cv2.contourArea(c) < limit:
            cv2.drawContours(out, [c], -1, 1, thickness=-1)
    return out


def decontaminate(img, alpha, band):
    """
    Repaint the soft rim from the interior only, so the edge carries the
    projector's own colour rather than a fringe of black set or white smoke.
    """
    interior = (alpha >= 0.98).astype(np.uint8)
    dist = cv2.distanceTransform(1 - interior, cv2.DIST_L2, 3)
    unknown = ((interior == 0) & (dist <= band)).astype(np.uint8) * 255
    filled = cv2.inpaint(img, unknown, 3, cv2.INPAINT_TELEA)
    out = img.copy()
    rim = (unknown > 0) & (alpha > 0.005)
    out[rim] = filled[rim]
    return out


def cut(name, src, preview):
    cfg = PLATES[name]
    img = cv2.imread(str(src), cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"cannot read {src}")
    h, w = img.shape[:2]

    pts = np.array([(x * w, y * h) for x, y in cfg["polygon"]], np.int32)
    poly = np.zeros((h, w), np.uint8)
    cv2.fillPoly(poly, [pts], 1)
    b = max(2, int(cfg["band"] * w))
    inner = cv2.erode(poly, ellipse(b))
    outer = cv2.dilate(poly, ellipse(b))

    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[outer == 1] = cv2.GC_PR_BGD
    mask[poly == 1] = cv2.GC_PR_FGD
    mask[inner == 1] = cv2.GC_FGD
    for box in cfg["background"]:
        a, bb, c, d = to_px(box, w, h)
        mask[bb:d, a:c] = cv2.GC_BGD
    for box in cfg["foreground"]:
        a, bb, c, d = to_px(box, w, h)
        mask[bb:d, a:c] = cv2.GC_FGD

    # GrabCut on a margin around the machine only: the full 4000px frame is ten
    # million pixels of set the model never needed to see.
    ys, xs = np.where(outer == 1)
    m = int(0.02 * w)
    rx0, ry0 = max(0, xs.min() - m), max(0, ys.min() - m)
    rx1, ry1 = min(w, xs.max() + 1 + m), min(h, ys.max() + 1 + m)
    roi = img[ry0:ry1, rx0:rx1]
    rmask = mask[ry0:ry1, rx0:rx1].copy()
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(roi, rmask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)

    fg = np.zeros((h, w), np.uint8)
    fg[ry0:ry1, rx0:rx1] = np.where((rmask == cv2.GC_FGD) | (rmask == cv2.GC_PR_FGD), 1, 0)
    fg = largest_component(fg)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, ellipse(max(2, w / 470)))
    fg = fill_small_holes(fg)

    # About one displayed pixel of feather at the size each plate is shown.
    alpha = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), max(0.9, w / 2200))
    rgb = decontaminate(img, alpha, band=max(3, int(0.0015 * w)))

    ys, xs = np.where(alpha > 0.01)
    pad = max(4, int(0.002 * w))
    cx0, cy0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    cx1, cy1 = min(w, xs.max() + pad + 1), min(h, ys.max() + pad + 1)

    rgba = cv2.cvtColor(rgb, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    crop = rgba[cy0:cy1, cx0:cx1]
    if crop.shape[1] > cfg["max_width"]:
        s = cfg["max_width"] / crop.shape[1]
        crop = cv2.resize(crop, (cfg["max_width"], round(crop.shape[0] * s)),
                          interpolation=cv2.INTER_AREA)
    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / f"cutout-{name}.png"), crop)

    # Plate matte: grown past the feather so the fill also covers the halo the
    # machine's own edge leaves in the plate; soft, and small, since it is a blur.
    grown = cv2.dilate(fg, ellipse(0.007 * w))
    matte = cv2.GaussianBlur(grown.astype(np.float32), (0, 0), w / 235)
    mw = min(w // 2, 1024)
    matte = cv2.resize(matte, (mw, round(h * mw / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(OUT / f"mask-{name}.png"), np.clip(matte * 255, 0, 255).astype(np.uint8))

    rect = {
        "x": round(cx0 / w, 5), "y": round(cy0 / h, 5),
        "w": round((cx1 - cx0) / w, 5), "h": round((cy1 - cy0) / h, 5),
    }
    print(json.dumps({"plate": name, "size": [w, h], "rect": rect,
                      "cutout": [crop.shape[1], crop.shape[0]],
                      "coverage": round(float(fg.mean()), 5)}))

    if preview:
        # Left: the plate with the outline (green) and band (orange).
        # Right: the cutout on grey.
        marked = img.copy()
        lw = max(1, w // 900)
        cv2.drawContours(marked, [pts], -1, (0, 255, 0), lw)
        for ring in (inner, outer):
            cs, _ = cv2.findContours(ring, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(marked, cs, -1, (0, 160, 255), lw)
        for box in cfg["background"]:
            a, bb, c, d = to_px(box, w, h)
            cv2.rectangle(marked, (a, bb), (c, d), (0, 0, 255), lw)
        grey = np.full_like(img, 128)
        a3 = alpha[..., None]
        comp = (rgb * a3 + grey * (1 - a3)).astype(np.uint8)
        left, right = marked[ry0:ry1, rx0:rx1], comp[ry0:ry1, rx0:rx1]
        gap = np.full((left.shape[0], max(8, w // 400), 3), 255, np.uint8)
        sheet = np.hstack([left, gap, right])
        s = min(1.5, 1440 / sheet.shape[1])
        sheet = cv2.resize(sheet, None, fx=s, fy=s,
                           interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
        cv2.imwrite(str(preview), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])


def mirror(name):
    """
    The projector facing the other way, for after it turns round in the shot.

    A photograph can only be mirrored, and a mirror reverses the lettering on
    the machine. Each legible patch is taken from the original the right way
    round and laid back into its mirrored position, feathered at the edges so
    the patch does not show as a rectangle.
    """
    cfg = PLATES[name]
    src = cv2.imread(str(OUT / f"cutout-{name}.png"), cv2.IMREAD_UNCHANGED)
    if src is None:
        raise SystemExit(f"cut {name} first")
    h, w = src.shape[:2]
    out = cv2.flip(src, 1).astype(np.float32)
    for x0, y0, x1, y1 in cfg["legible"]:
        patch = src[y0:y1, x0:x1].astype(np.float32)
        ph, pw = patch.shape[:2]
        feather = max(2, min(pw, ph) // 10)
        m = np.zeros((ph, pw), np.float32)
        m[feather:-feather, feather:-feather] = 1
        m = cv2.GaussianBlur(m, (0, 0), feather / 2)[..., None]
        mx0 = w - x1
        region = out[y0:y1, mx0:mx0 + pw]
        out[y0:y1, mx0:mx0 + pw] = patch * m + region * (1 - m)
    cv2.imwrite(str(OUT / f"cutout-{name}-left.png"), np.clip(out, 0, 255).astype(np.uint8))
    print(json.dumps({"plate": name, "mirrored": [w, h], "patches": len(cfg["legible"])}))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("plate", choices=sorted(PLATES))
    p.add_argument("--src", type=Path)
    p.add_argument("--preview", type=Path)
    p.add_argument("--mirror", action="store_true",
                   help="write cutout-<plate>-left.png from an existing cutout")
    args = p.parse_args()
    if args.mirror:
        mirror(args.plate)
        raise SystemExit(0)
    src = args.src or PLATES[args.plate]["src"]
    if src is None:
        raise SystemExit(f"{args.plate} needs --src")
    cut(args.plate, src, args.preview)
