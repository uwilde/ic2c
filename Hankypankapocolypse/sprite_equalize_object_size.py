#!/usr/bin/env python3
"""
Equalize Object Size Across Images
----------------------------------
- Detects the non-background subject (transparent or flat background tolerance)
- Crops to the subject's bbox
- Scales each subject so that a chosen size metric matches a chosen target
- Pads back to a common canvas with alignment

Examples:
  python sprite_equalize_object_size.py --metric maxdim --target largest --halign center --valign middle
  python sprite_equalize_object_size.py --ext .png --outdir processed_equalized

Metrics:
  - maxdim: max(width, height) of the cropped subject (default)
  - width: cropped width
  - height: cropped height
  - area: sqrt(area)  (area = count of non-bg pixels from mask; uses sqrt to convert to a length-like number)

Targets:
  - largest (default): uses the largest metric across images
  - smallest: uses the smallest metric
  - median: uses the median metric
  - value:N  (e.g., value:256) fixed pixel size to scale the metric to

Background handling:
  - If image has alpha, we use alpha to locate subject.
  - Else we assume a flat background and use a tolerance threshold around a guessed bg color
    (taken from the 4 corners) to build a mask.

Output canvas:
  - By default we set a common canvas to the *max* cropped W,H across the *scaled* subjects.
  - Align the subject on the canvas with --halign and --valign.
"""

import argparse
from pathlib import Path
from typing import List, Tuple, Optional
from PIL import Image, ImageChops

def parse_color(s: str) -> Optional[Tuple[int, int, int]]:
    s = s.strip().lower()
    named = {"white": (255, 255, 255), "black": (0, 0, 0)}
    if s in named:
        return named[s]
    if s.startswith("#"):
        s = s[1:]
    if len(s) == 6:
        try:
            return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))
        except Exception:
            return None
    return None

def guess_flat_bg(img: Image.Image) -> Tuple[int, int, int]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    samples = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w-1, 0)),
        rgb.getpixel((0, h-1)),
        rgb.getpixel((w-1, h-1)),
    ]
    freq = {}
    for c in samples:
        freq[c] = freq.get(c, 0) + 1
    best = max(freq.items(), key=lambda kv: kv[1])[0]
    return best

def alpha_mask(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return img.split()[3]

def flat_bg_mask(img: Image.Image, bg_color: Tuple[int, int, int], tolerance: int) -> Image.Image:
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, bg_color)
    diff = ImageChops.difference(rgb, bg)
    gray = diff.convert("L")
    mask = gray.point(lambda p: 255 if p > tolerance else 0)
    return mask

def subject_bbox(img: Image.Image, bg_mode: str = "auto", tolerance: int = 12) -> Tuple[Image.Image, Tuple[int,int,int,int]]:
    # Return (RGBA image, bbox of subject on that image)
    img_rgba = img.convert("RGBA")
    a = img_rgba.split()[3]
    bbox_a = a.getbbox()
    if bbox_a and bbox_a != (0,0,img.width,img.height):
        return (img_rgba, bbox_a)
    # Fall back to flat bg
    if bg_mode == "auto":
        bg = guess_flat_bg(img_rgba)
    else:
        parsed = parse_color(bg_mode)
        bg = parsed if parsed else guess_flat_bg(img_rgba)
    m = flat_bg_mask(img_rgba, bg, tolerance)
    bbox = m.getbbox()
    if bbox is None:
        bbox = (0,0,img_rgba.width,img_rgba.height)
    return (img_rgba, bbox)

def crop_subject(img: Image.Image, bg_mode: str = "auto", tolerance: int = 12) -> Image.Image:
    rgba, bbox = subject_bbox(img, bg_mode=bg_mode, tolerance=tolerance)
    return rgba.crop(bbox)

def metric_value(img: Image.Image, metric: str = "maxdim") -> float:
    w, h = img.size
    metric = metric.lower()
    if metric == "width":
        return float(w)
    if metric == "height":
        return float(h)
    if metric == "area":
        # approximate area by counting non-transparent pixels (if no alpha, assume full rect)
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        a = img.split()[3]
        # For speed, downsample mask a bit if huge
        mask = a
        area = float(mask.point(lambda p: 1 if p > 0 else 0).histogram()[255])
        return area**0.5  # convert to length-like number
    # default maxdim
    return float(max(w, h))

def compute_target(values, target_spec: str) -> float:
    ts = target_spec.lower()
    vals = sorted(values)
    if ts == "largest":
        return vals[-1]
    if ts == "smallest":
        return vals[0]
    if ts == "median":
        n = len(vals)
        if n % 2 == 1:
            return vals[n//2]
        else:
            return (vals[n//2 - 1] + vals[n//2]) / 2.0
    if ts.startswith("value:"):
        try:
            return float(ts.split(":",1)[1])
        except Exception:
            pass
    # default
    return vals[-1]

def place_on_canvas(img: Image.Image, canvas_size: Tuple[int,int], halign: str, valign: str) -> Image.Image:
    cw, ch = canvas_size
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    w, h = img.size
    if halign == "left":
        x = 0
    elif halign in ("center","centre"):
        x = (cw - w)//2
    else:
        x = cw - w
    if valign == "top":
        y = 0
    elif valign in ("middle","center","centre"):
        y = (ch - h)//2
    else:
        y = ch - h
    canvas = Image.new("RGBA", (cw, ch), (0,0,0,0))
    canvas.paste(img, (x,y), img)
    return canvas

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ext", default=".png")
    ap.add_argument("--outdir", default="processed_equalized")
    ap.add_argument("--inplace", action="store_true")
    ap.add_argument("--bg", default="auto", help="auto|white|black|#RRGGBB")
    ap.add_argument("--tolerance", type=int, default=12)
    ap.add_argument("--metric", default="maxdim", choices=["maxdim","width","height","area"])
    ap.add_argument("--target", default="largest", help="largest|smallest|median|value:N")
    ap.add_argument("--halign", default="center", choices=["left","center","right"])
    ap.add_argument("--valign", default="middle", choices=["top","middle","bottom"])
    ap.add_argument("paths", nargs="*", help="Optional list of files/folders to process. Defaults to current folder.")
    args = ap.parse_args()

    here = Path(".").resolve()
    paths = [Path(p) for p in args.paths] if args.paths else [here]
    files = []
    for p in paths:
        if p.is_file() and p.suffix.lower()==args.ext.lower():
            files.append(p)
        elif p.is_dir():
            files += sorted([q for q in p.iterdir() if q.is_file() and q.suffix.lower()==args.ext.lower() and not q.name.startswith(".")])

    if not files:
        print(f"No {args.ext} files found.")
        return

    # First pass: crop and compute metric
    items = []
    metrics = []
    for fp in files:
        try:
            with Image.open(fp) as im:
                cropped = crop_subject(im, bg_mode=args.bg, tolerance=args.tolerance)
                mval = metric_value(cropped, metric=args.metric)
                items.append((fp, cropped))   # keep cropped open for reuse
                metrics.append(mval)
        except Exception as e:
            print(f"[WARN] {fp.name}: {e}")

    if not items:
        print("Nothing to process.")
        return

    target_val = compute_target(metrics, args.target)

    # Scale subjects so their metric equals target
    scaled = []
    max_w = max_h = 0
    for (fp, cropped), mv in zip(items, metrics):
        try:
            if mv == 0:
                s = 1.0
            else:
                s = target_val / mv
            new_w = max(1, int(round(cropped.width * s)))
            new_h = max(1, int(round(cropped.height * s)))
            resized = cropped.resize((new_w, new_h), Image.LANCZOS)
            max_w = max(max_w, new_w)
            max_h = max(max_h, new_h)
            scaled.append((fp, resized))
        finally:
            cropped.close()

    # Determine canvas (largest scaled W,H)
    canvas_size = (max_w, max_h)

    out_dir = here if args.inplace else (here / args.outdir)
    if not args.inplace:
        out_dir.mkdir(parents=True, exist_ok=True)

    for fp, im in scaled:
        try:
            final_im = place_on_canvas(im, canvas_size, args.halign, args.valign)
            save_path = fp if args.inplace else (out_dir / fp.name)
            final_im.save(save_path, "PNG")
        finally:
            im.close()

    print(f"Done. Wrote {len(scaled)} file(s).")
    if not args.inplace:
        print(f"Output folder: {out_dir}")
    print(f"Target metric value: {target_val:.2f} ({args.metric}, target={args.target})")

if __name__ == "__main__":
    main()
