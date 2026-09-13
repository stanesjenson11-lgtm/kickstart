#!/usr/bin/env python3
"""
Cut the projector out of a hero plate.

    python scripts/cutout.py phone
    python scripts/cutout.py desktop

The projector's faces are as dark as the set behind them, so no colour-based
segmentation finds its edge reliably: GrabCut notched the dark sides, kept a
fringe of smoke on the lens and a strip of lit crate under the tray. So the
outline is traced by hand, on brightened close-ups of each plate, in plate
pixels: straight runs between corners, smooth curves through points marked S,
and the lens face as a true ellipse joined by the tangents off the barrel. It
is filled anti-aliased at sub-pixel precision, so every edge and corner is
clean, and the same trace always gives the same cut.

Writes to public/hero/:
    cutout-<plate>.png       the projector only, RGBA, cropped to its bounds
    cutout-<plate>-left.png  the same, mirrored, lettering put back the right way round
    mask-<plate>.png         a grown, soft matte of the whole plate, for the plate
                             shader to fill the patch the projector vacates
and prints the crop rect and lens anchor in texture space for lib/content.ts.
"""
import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hero"

S = "s"  # a smooth point: the outline curves through it rather than turning


def lens(cx, cy, rx, ry, deg):
    """The lens face: an ellipse, centre and half-axes in pixels, turned clockwise."""
    return {"ellipse": (cx, cy, rx, ry, deg)}


# Outlines run clockwise from the back-left corner of the vent slab.
PLATES = {
    "phone": {
        "src": OUT / "projector-phone.png",
        "size": (941, 1672),
        "outline": [
            (195, 898), (307.5, 905.75), (332.5, 908), (366, 910.5), (368, 912.5),
            (378, 912.5), (382, 914), (383, 918), (410, 927.5),
            (420, 991), lens(440, 1031, 15.6, 35.4, 8), (411, 1064), (395, 1082), (395, 1100),
            (403, 1094, S), (420, 1092.5, S), (433, 1096, S), (443, 1103, S), (449, 1113, S),
            (451.5, 1124, S), (450, 1137, S), (446.5, 1150, S), (441.5, 1162, S), (435, 1172, S),
            (427.5, 1178.5),
            (367.5, 1223),
            (375, 1239, S), (370, 1247.5, S), (357.5, 1250, S), (345, 1247.5, S),
            (340, 1240, S), (341, 1227.5),
            (134, 1196), (132.5, 1210, S), (122.5, 1214, S), (110, 1212.5, S), (104, 1199),
            (97.5, 1137.5), (126, 1120),
            (115, 1116), (115, 1100), (116, 1085), (126, 1082),
            (131, 938),
        ],
        # Where the beam leaves the lens, as plate fractions.
        "lens": (0.48506, 0.61749),
        "max_width": 900,
        # Lettering, (x0, y0, x1, y1) in plate pixels: the front DUKANE label and
        # the D on the side of the lens housing.
        "legible": [(281, 991, 323, 1091), (379, 945, 405, 987)],
    },
    "desktop": {
        # The 4000px Unsplash original of the landscape plate.
        "src": ROOT / "assets-src" / "hero" / "plate-desktop.jpg",
        "size": (4000, 2667),
        "outline": [
            (855, 747), (1440, 791), (1659, 805),
            (1684, 803, S), (1702, 812, S), (1709, 824),
            (1765, 830), (1771, 858), (1890, 877), (1899, 881),
            (1940, 1174), lens(2049, 1346, 58, 156, 7), (1907, 1492), (1835, 1581), (1837, 1628),
            (1870, 1624, S), (1939, 1617, S), (2001, 1633, S), (2045, 1667, S),
            (2076, 1717, S), (2094, 1780, S), (2094, 1830, S), (2079, 1874, S),
            (2057, 1905, S), (2032, 1924),
            (2030, 1963), (1957, 2013), (1780, 2203),
            (1792, 2240, S), (1790, 2293, S), (1763, 2333, S), (1717, 2347, S),
            (1663, 2340, S), (1623, 2313, S), (1610, 2275, S), (1618, 2230),
            (670, 2100), (668, 2135, S), (640, 2165, S), (600, 2175, S), (560, 2168, S),
            (543, 2140, S), (535, 2080),
            (504, 2000), (487, 1808), (575, 1732),
            (575, 1722), (570, 1712), (574, 1690), (579, 1640), (579, 1585), (611, 1583),
            (628, 914),
        ],
        "lens": (0.52852, 0.50553),
        "max_width": 1400,
        "legible": [(1330, 1184, 1516, 1627), (1791, 972, 1928, 1165)],
    },
}


def ellipse_at(e, t):
    cx, cy, rx, ry, deg = e
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    x, y = rx * np.cos(t), ry * np.sin(t)
    return np.stack([cx + x * c - y * s, cy + x * s + y * c], -1)


def tangent(e, p, leaving):
    """
    The parameter on ellipse `e` where a line through `p` touches it with the
    ellipse on its right, which is the inside of a clockwise outline.
    """
    cx, cy, rx, ry, deg = e
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    t = np.linspace(0, 2 * math.pi, 7200, endpoint=False)
    q = ellipse_at(e, t)
    dx0, dy0 = -rx * np.sin(t), ry * np.cos(t)
    dx, dy = dx0 * c - dy0 * s, dx0 * s + dy0 * c
    f = (q[:, 0] - p[0]) * dy - (q[:, 1] - p[1]) * dx
    for i in np.where(np.sign(f) != np.sign(np.roll(f, -1)))[0]:
        tx, ty = (p - q[i]) if leaving else (q[i] - p)
        if (cx - q[i, 0]) * -ty + (cy - q[i, 1]) * tx > 0:
            return t[i]
    raise ValueError(f"no tangent from {p} to {e}")


def catmull(p0, p1, p2, p3, n=12):
    """Centripetal Catmull-Rom from p1 to p2: smooth, and never overshoots."""
    k = lambda a, b: max(float(np.hypot(*(b - a))), 1e-6) ** 0.5
    t0, t1 = 0.0, k(p0, p1)
    t2, t3 = t1 + k(p1, p2), t1 + k(p1, p2) + k(p2, p3)
    out = []
    for t in np.linspace(t1, t2, n, endpoint=False):
        a1 = ((t1 - t) * p0 + (t - t0) * p1) / (t1 - t0)
        a2 = ((t2 - t) * p1 + (t - t1) * p2) / (t2 - t1)
        a3 = ((t3 - t) * p2 + (t - t2) * p3) / (t3 - t2)
        b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0)
        b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1)
        out.append(((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1))
    return out


def outline(spec):
    """The traced outline as a dense polygon, in plate pixels."""
    nodes = []
    for i, item in enumerate(spec):
        if isinstance(item, dict):
            e = item["ellipse"]
            before = np.array(spec[i - 1][:2], float)
            after = np.array(spec[(i + 1) % len(spec)][:2], float)
            t1, t2 = tangent(e, before, False), tangent(e, after, True)
            t2 += 2 * math.pi if t2 < t1 else 0
            arc = ellipse_at(e, np.linspace(t1, t2, max(8, int((t2 - t1) * max(e[2], e[3])))))
            nodes += [(p, False) for p in arc]
        else:
            nodes.append((np.array(item[:2], float), len(item) > 2))
    pts = []
    for i, (p1, s1) in enumerate(nodes):
        p2, s2 = nodes[(i + 1) % len(nodes)]
        if not (s1 or s2):
            pts.append(p1)
            continue
        p0 = nodes[i - 1][0] if s1 else 2 * p1 - p2
        p3 = nodes[(i + 2) % len(nodes)][0] if s2 else 2 * p2 - p1
        pts += catmull(p0, p1, p2, p3)
    return np.array(pts)


def ellipse(r):
    r = max(1, int(r))
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


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


def mirrored(crop, patches):
    """
    The projector facing the other way, for after it turns round in the shot.

    A photograph can only be mirrored, and a mirror reverses the lettering on
    the machine. Each legible patch is taken from the original the right way
    round and laid back into its mirrored position, feathered at the edges so
    the patch does not show as a rectangle.
    """
    w = crop.shape[1]
    out = cv2.flip(crop, 1).astype(np.float32)
    for x0, y0, x1, y1 in patches:
        patch = crop[y0:y1, x0:x1].astype(np.float32)
        ph, pw = patch.shape[:2]
        feather = max(2, min(pw, ph) // 10)
        m = np.zeros((ph, pw), np.float32)
        m[feather:-feather, feather:-feather] = 1
        m = cv2.GaussianBlur(m, (0, 0), feather / 2)[..., None]
        mx0 = w - x1
        region = out[y0:y1, mx0:mx0 + pw]
        out[y0:y1, mx0:mx0 + pw] = patch * m + region * (1 - m)
    return np.clip(out, 0, 255).astype(np.uint8)


def cut(name, src):
    cfg = PLATES[name]
    img = cv2.imread(str(src), cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"cannot read {src}")
    h, w = img.shape[:2]
    if (w, h) != cfg["size"]:
        raise SystemExit(f"{src} is {w}x{h}; the outline was traced on {cfg['size']}")

    # Filled at 1/16 px with anti-aliasing, then about one displayed pixel of
    # softness at the size each plate is shown.
    mask = np.zeros((h, w), np.uint8)
    poly = np.round(outline(cfg["outline"]) * 16).astype(np.int32)
    cv2.fillPoly(mask, [poly], 255, cv2.LINE_AA, shift=4)
    alpha = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), max(0.5, w / 5000))
    rgb = decontaminate(img, alpha, band=max(2, round(w / 1300)))

    ys, xs = np.where(alpha > 0.01)
    pad = max(4, int(0.002 * w))
    cx0, cy0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    cx1, cy1 = min(w, xs.max() + pad + 1), min(h, ys.max() + pad + 1)

    rgba = cv2.cvtColor(rgb, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    crop = rgba[cy0:cy1, cx0:cx1]
    s = min(1.0, cfg["max_width"] / crop.shape[1])
    if s < 1:
        crop = cv2.resize(crop, (cfg["max_width"], round(crop.shape[0] * s)),
                          interpolation=cv2.INTER_AREA)
    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / f"cutout-{name}.png"), crop)
    patches = [(round((x0 - cx0) * s), round((y0 - cy0) * s), round((x1 - cx0) * s),
                round((y1 - cy0) * s)) for x0, y0, x1, y1 in cfg["legible"]]
    cv2.imwrite(str(OUT / f"cutout-{name}-left.png"), mirrored(crop, patches))

    # Plate matte: grown past the edge so the fill also covers the halo the
    # machine's own edge leaves in the plate; soft, and small, since it is a blur.
    grown = cv2.dilate((alpha > 0.5).astype(np.uint8), ellipse(0.007 * w))
    matte = cv2.GaussianBlur(grown.astype(np.float32), (0, 0), w / 235)
    mw = min(w // 2, 1024)
    matte = cv2.resize(matte, (mw, round(h * mw / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(OUT / f"mask-{name}.png"), np.clip(matte * 255, 0, 255).astype(np.uint8))

    lx, ly = cfg["lens"]
    print(json.dumps({
        "plate": name,
        "rect": {"x": round(cx0 / w, 5), "y": round(cy0 / h, 5),
                 "w": round((cx1 - cx0) / w, 5), "h": round((cy1 - cy0) / h, 5)},
        "lens": [round((lx * w - cx0) / (cx1 - cx0), 3), round((ly * h - cy0) / (cy1 - cy0), 3)],
        "cutout": [crop.shape[1], crop.shape[0]],
    }))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("plate", choices=sorted(PLATES))
    p.add_argument("--src", type=Path)
    args = p.parse_args()
    cut(args.plate, args.src or PLATES[args.plate]["src"])
