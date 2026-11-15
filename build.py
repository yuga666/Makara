#!/usr/bin/env python3
"""Inline every asset into a single self-contained index.html."""
import base64
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

FONTS = ["anton", "archivo", "cormorant", "sinhala"]
IMAGES = [
    "dancer", "stage", "cover", "trophy", "kiribath", "sweets", "fruit",
    "coconut", "jelly", "sambols", "corn", "cones", "snacks",
]
PARTS = {
    "{{HALO}}": "parts/halo.svg",
    "{{STAGE_LINE}}": "parts/stage-line.svg",
    "{{PILLAR_L}}": "parts/pillar-l.svg",
    "{{PILLAR_R}}": "parts/pillar-r.svg",
}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def uri(path, mime):
    with open(os.path.join(ROOT, path), "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode("ascii")


page = read("src/page.html")
css = read("src/styles.css")
js = read("src/main.js")

page = page.replace("{{CSS}}", css)
page = page.replace("{{JS}}", js)

for name in FONTS:
    page = page.replace("{{FONT:%s}}" % name, uri(f"assets/fonts/{name}.woff2", "font/woff2"))

for name in IMAGES:
    ext = "webp"
    page = page.replace("{{IMG:%s}}" % name, uri(f"assets/img/{name}.{ext}", "image/webp"))
js = js.replace("{{IMG:trophy}}", uri("assets/img/trophy.webp", "image/webp"))

for token, path in PARTS.items():
    page = page.replace(token, read(path))

leftovers = re.findall(r"\{\{[A-Z]+:[a-z-]+\}\}", page)
if leftovers:
    raise SystemExit("unresolved placeholders: %s" % sorted(set(leftovers)))

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(page)

size = os.path.getsize(out)
print(f"wrote index.html — {size/1024/1024:.2f} MB")
