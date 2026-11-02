from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

SEA = (11, 93, 80, 255)
CREAM = (250, 248, 243, 255)
TERRA = (197, 106, 74, 255)
GOLD = (200, 164, 93, 255)
FONT = r"C:\Windows\Fonts\georgiab.ttf"


def make_icon(size: int, padding: float = 0.0) -> Image.Image:
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * 0.22), fill=SEA)

    inset = int(s * padding)
    w = s - inset * 2
    # sun
    sun = int(w * 0.105)
    sx = inset + int(w * 0.66)
    sy = inset + int(w * 0.18)
    d.ellipse((sx, sy, sx + sun, sy + sun), fill=TERRA)
    # gold horizon
    d.rectangle(
        (inset + int(w * 0.22), inset + int(w * 0.79), inset + int(w * 0.78), inset + int(w * 0.805)),
        fill=GOLD,
    )
    # monogram A
    font = ImageFont.truetype(FONT, int(w * 0.47))
    text = "A"
    box = d.textbbox((0, 0), text, font=font)
    tw = box[2] - box[0]
    th = box[3] - box[1]
    tx = (s - tw) // 2 - box[0]
    ty = inset + int(w * 0.33) - box[1]
    d.text((tx, ty), text, font=font, fill=CREAM)
    return img.resize((size, size), Image.LANCZOS)


for size in (512, 192, 180, 32):
    make_icon(size).save(OUT / f"icon-{size}.png")

make_icon(512, 0.10).save(OUT / "icon-maskable-512.png")
make_icon(192, 0.10).save(OUT / "icon-maskable-192.png")
make_icon(180).save(OUT / "apple-touch-icon.png")
make_icon(32).save(OUT / "favicon-32.png")
print("icons written")
