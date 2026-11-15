"""Prepare web assets for the THAMBAPANNI single-file page."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = "src"
OUT = "assets/img"
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- dancer cutout
cover = Image.open(f"{SRC}/cover.jpg").convert("RGB")
x0, y0, x1, y1 = 200, 300, 1055, 1491
crop = cover.crop((x0, y0, x1, y1))
w, h = crop.size
g = np.array(crop.convert("L")).astype(np.float32)

# background = near-black pixels connected to the frame edge
b = np.where(g < 24, 0, 255).astype(np.uint8)
ff = Image.fromarray(b, "L").copy()
for x in range(0, w, 2):
    for y in (0, h - 1):
        if ff.getpixel((x, y)) == 0:
            ImageDraw.floodfill(ff, (x, y), 128, thresh=0)
for y in range(0, h, 2):
    for x in (0, w - 1):
        if ff.getpixel((x, y)) == 0:
            ImageDraw.floodfill(ff, (x, y), 128, thresh=0)
bg = np.array(ff) == 128

# subject = foreground island that contains the face
fgim = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), "L").copy()
ImageDraw.floodfill(fgim, (360, 480), 128, thresh=0)
subj = np.array(fgim) == 128

# gentle luma ramp: the negative spaces inside the crown let the stage show through
ramp = np.clip((g - 6.0) / 20.0, 0.0, 1.0)
alpha = np.where(subj, ramp, 0.0)
a = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(1.2))
rgba = crop.convert("RGBA")
rgba.putalpha(a)

# drop the magazine's gold flourish that sits above the crown
mask = np.array(rgba.getchannel("A"))
mask[:74, :] = 0
rgba.putalpha(Image.fromarray(mask, "L"))
bbox = Image.fromarray(mask, "L").point(lambda v: 255 if v > 8 else 0).getbbox()
dancer = rgba.crop(bbox)
dancer.save(f"{OUT}/dancer.png")
dancer = dancer.resize((round(dancer.width*900/dancer.height), 900), Image.LANCZOS)
dancer.save(f"{OUT}/dancer.webp", quality=78, method=6, alpha_quality=80)
print("dancer", dancer.size, os.path.getsize(f"{OUT}/dancer.webp") // 1024, "KB")

# ---------------------------------------------------------------- photographs
def save(name, path, width, quality=78, crop_box=None):
    im = Image.open(path).convert("RGB")
    if crop_box:
        im = im.crop(crop_box)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(f"{OUT}/{name}.webp", quality=quality, method=6)
    print(name, im.size, os.path.getsize(f"{OUT}/{name}.webp") // 1024, "KB")

save("stage", f"{SRC}/stage.jpg", 1500, 72)
save("cover", f"{SRC}/cover.jpg", 860, 74)
save("trophy", f"{SRC}/trophy.jpg", 820, 74)
save("kiribath", f"{SRC}/kiribath.jpg", 700, 72)
save("sweets", f"{SRC}/sweets.jpg", 700, 70)
save("fruit", f"{SRC}/fruit.jpg", 700, 72)
save("coconut", f"{SRC}/coconut.jpg", 700, 72)
save("jelly", f"{SRC}/jelly.jpg", 520, 72)
save("sambols", f"{SRC}/sambols.jpg", 700, 72)
save("corn", f"{SRC}/corn.jpg", 700, 66)
save("cones", f"{SRC}/cones.jpg", 560, 72)
save("snacks", f"{SRC}/food-snacks.jpg", 700, 72)

