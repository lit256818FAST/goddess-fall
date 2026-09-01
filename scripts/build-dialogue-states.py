from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "art-source" / "dialogue-alpha"
SOURCE_FILES: Dict[str, Path] = {
    "arthur": SOURCE_ROOT / "arthur.png",
    "hans": SOURCE_ROOT / "hans.png",
    "asnoka": SOURCE_ROOT / "asnoka.png",
    "old-mara": SOURCE_ROOT / "mainline-npcs" / "old-mara.png",
    "gray-eyed": SOURCE_ROOT / "mainline-npcs" / "gray-eyed.png",
    "white-knight-captain": SOURCE_ROOT / "mainline-npcs" / "white-knight-captain.png",
    "night-judge": SOURCE_ROOT / "mainline-npcs" / "night-judge.png",
    "lake-dual-god": SOURCE_ROOT / "mainline-npcs" / "lake-dual-god.png",
    "unflagged": SOURCE_ROOT / "unflagged-side" / "unflagged.png",
    "seraphina": SOURCE_ROOT / "unflagged-side" / "seraphina.png",
    "reina": SOURCE_ROOT / "unflagged-side" / "reina.png",
    "odric": SOURCE_ROOT / "unflagged-side" / "odric.png",
    "cole": SOURCE_ROOT / "unflagged-side" / "cole.png",
    "agnes": SOURCE_ROOT / "unflagged-side" / "agnes.png",
}

CANVAS = (768, 768)
STATE_NAMES = ("idle", "attack", "hit")


def normalize(source: Image.Image) -> Image.Image:
    source = source.convert("RGBA")
    alpha = source.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("source has no visible alpha")
    left, top, right, bottom = bbox
    margin = max(10, int(min(source.size) * 0.02))
    crop = source.crop((max(0, left - margin), max(0, top - margin), min(source.width, right + margin), min(source.height, bottom + margin)))
    scale = min((CANVAS[0] - 72) / crop.width, (CANVAS[1] - 36) / crop.height)
    resized = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((CANVAS[0] - resized.width) // 2, CANVAS[1] - resized.height - 14))
    return canvas


def transformed(base: Image.Image, angle: float, scale: float, offset: Tuple[int, int]) -> Image.Image:
    subject = base.resize((round(base.width * scale), round(base.height * scale)), Image.Resampling.BICUBIC)
    subject = subject.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - subject.width) // 2 + offset[0]
    y = (CANVAS[1] - subject.height) // 2 + offset[1]
    canvas.alpha_composite(subject, (x, y))
    return canvas


def attack_frame(base: Image.Image) -> Image.Image:
    canvas = transformed(base, -6, 1.04, (14, -4))
    fx = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw = ImageDraw.Draw(fx)
    draw.arc((120, 198, 620, 650), 208, 325, fill=(216, 166, 76, 210), width=9)
    draw.arc((130, 208, 630, 660), 208, 325, fill=(255, 231, 164, 145), width=3)
    draw.line((534, 244, 692, 114), fill=(241, 203, 110, 180), width=5)
    draw.line((560, 270, 715, 142), fill=(245, 112, 54, 120), width=2)
    for x, y, radius in ((111, 270, 5), (642, 205, 4), (674, 358, 3), (173, 640, 3)):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(230, 86, 45, 210))
    canvas.alpha_composite(fx)
    return canvas


def hit_frame(base: Image.Image) -> Image.Image:
    canvas = transformed(base, 8, 1.02, (-13, 8))
    fx = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    draw = ImageDraw.Draw(fx)
    draw.line((610, 276, 494, 336), fill=(214, 62, 46, 220), width=8)
    draw.line((626, 292, 507, 350), fill=(255, 182, 92, 145), width=3)
    for x, y, radius in ((617, 272, 8), (650, 300, 5), (594, 309, 4), (676, 255, 3), (572, 350, 3)):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(191, 54, 44, 205))
    canvas.alpha_composite(fx)
    return ImageEnhance.Color(canvas).enhance(0.92)


def save_frame(image: Image.Image, source_dir: Path, runtime_dir: Path, key: str, state: str) -> None:
    image = image.convert("RGBA")
    image.save(source_dir / f"{key}-{state}.png", format="PNG", optimize=False)
    if state != "idle":
        image.save(runtime_dir / f"{key}-{state}.webp", format="WEBP", lossless=False, quality=74, method=4)


def main() -> None:
    source_dir = SOURCE_ROOT / "states"
    runtime_dir = ROOT / "public" / "assets" / "images-lazy" / "dialogue" / "states"
    source_dir.mkdir(parents=True, exist_ok=True)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    for key, source_path in SOURCE_FILES.items():
        base = normalize(Image.open(source_path))
        frames = {"idle": base, "attack": attack_frame(base), "hit": hit_frame(base)}
        for state in STATE_NAMES:
            save_frame(frames[state], source_dir, runtime_dir, key, state)
    print(f"built {len(SOURCE_FILES) * len(STATE_NAMES)} transparent dialogue frames")


if __name__ == "__main__":
    main()
