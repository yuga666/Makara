"""Generate the gold line-art decorations used by the hero and sections."""
import math
import os

os.makedirs("parts", exist_ok=True)


def rosette(cx, cy, r=16, petals=8, sw=1.4, fo=0.5):
    out = [f'<g transform="translate({cx:.1f} {cy:.1f})">']
    out.append(f'<circle r="{r*0.24:.2f}" fill="currentColor" fill-opacity="{fo}"/>')
    for i in range(petals):
        a = i * 360 / petals
        out.append(
            f'<path d="M0 {-r*0.24:.2f} C {r*0.46:.2f} {-r*0.52:.2f} {r*0.42:.2f} {-r*0.94:.2f} 0 {-r:.2f} '
            f'C {-r*0.42:.2f} {-r*0.94:.2f} {-r*0.46:.2f} {-r*0.52:.2f} 0 {-r*0.24:.2f} Z" '
            f'transform="rotate({a:.1f})" fill="none" stroke="currentColor" stroke-width="{sw}"/>'
        )
    out.append("</g>")
    return "".join(out)


def halo():
    C = 600
    o = ['<g id="halo">']
    # outer bead rings
    o.append(f'<circle cx="{C}" cy="{C}" r="578" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/>')
    o.append(f'<circle cx="{C}" cy="{C}" r="560" fill="none" stroke="currentColor" stroke-width="2.2"/>')
    o.append(f'<circle cx="{C}" cy="{C}" r="428" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7"/>')
    o.append(f'<circle cx="{C}" cy="{C}" r="408" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>')

    # rays outside the ring
    for i in range(72):
        a = math.radians(i * 5)
        r0, r1 = 560, 560 + (26 if i % 6 == 0 else 12)
        o.append(
            f'<path d="M{C + math.cos(a)*r0:.1f} {C + math.sin(a)*r0:.1f} L {C + math.cos(a)*r1:.1f} {C + math.sin(a)*r1:.1f}" stroke="currentColor" stroke-width="{1.4 if i%6==0 else .9}" opacity=".7"/>'
        )

    # outer petal ring (24 lotuses)
    n = 24
    for i in range(n):
        a0 = i * 360 / n
        o.append(
            f'<g transform="translate({C} {C}) rotate({a0 + 7.5:.2f})">'
            f'<path d="M-44 -416 C -72 -470 -30 -540 0 -552 C 30 -540 72 -470 44 -416 '
            f'C 22 -424 -22 -424 -44 -416 Z" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.5"/>'
            f'<path d="M0 -430 L 0 -536" stroke="currentColor" stroke-width="1" opacity=".55"/>'
            f'</g>'
        )

    # inner flame ring (12)
    for i in range(12):
        a0 = i * 30
        o.append(
            f'<g transform="translate({C} {C}) rotate({a0 + 15})">'
            f'<path d="M0 -404 C 16 -432 12 -460 0 -486 C -12 -460 -16 -432 0 -404 Z" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.3"/>'
            f'</g>'
        )

    # main lotus petal ring between r 300 and 400
    for i in range(12):
        a0 = i * 30
        o.append(
            f'<g transform="translate({C} {C}) rotate({a0 + 15})">'
            f'<path d="M-62 -300 C -96 -352 -46 -404 0 -410 C 46 -404 96 -352 62 -300 '
            f'C 32 -308 -32 -308 -62 -300 Z" fill="currentColor" fill-opacity=".04" stroke="currentColor" stroke-width="1.8"/>'
            f'</g>'
        )

    # beaded ring at r 300
    for i in range(60):
        a = math.radians(i * 6)
        o.append(f'<circle cx="{C + math.cos(a)*300:.1f}" cy="{C + math.sin(a)*300:.1f}" r="3" fill="none" stroke="currentColor" stroke-width="1" opacity=".7"/>')
    o.append(f'<circle cx="{C}" cy="{C}" r="272" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".8"/>')

    # 8 rosettes on the ring
    for i in range(8):
        a = math.radians(i * 45 + 22.5)
        o.append(rosette(C + math.cos(a) * 344, C + math.sin(a) * 344, 26, 8, 1.3, 0.35))

    # tiny dots between
    for i in range(24):
        a = math.radians(i * 15)
        o.append(f'<circle cx="{C + math.cos(a)*462:.1f}" cy="{C + math.sin(a)*462:.1f}" r="2" fill="currentColor" fill-opacity=".45"/>')

    # central soft rings (behind the head)
    o.append(f'<circle cx="{C}" cy="{C}" r="240" fill="none" stroke="currentColor" stroke-width="1" opacity=".25"/>')
    o.append(f'<circle cx="{C}" cy="{C}" r="180" fill="none" stroke="currentColor" stroke-width=".8" opacity=".2"/>')
    o.append("</g>")
    return "\n".join(o)


def pillar(flip=False):
    o = ['<g>']
    # shaft rails
    o.append('<path d="M34 150 L 34 1450" stroke="currentColor" stroke-width="2" opacity=".9"/>')
    o.append('<path d="M186 150 L 186 1450" stroke="currentColor" stroke-width="2" opacity=".9"/>')
    o.append('<path d="M50 190 L 50 1420" stroke="currentColor" stroke-width=".9" opacity=".55"/>')
    o.append('<path d="M170 190 L 170 1420" stroke="currentColor" stroke-width=".9" opacity=".55"/>')
    # capital
    o.append('<rect x="20" y="120" width="180" height="14" fill="none" stroke="currentColor" stroke-width="2"/>')
    o.append('<rect x="34" y="134" width="152" height="10" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".8"/>')
    o.append('<path d="M60 160 q 50 -24 100 0 q -50 16 -100 0 Z" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.4"/>')
    # base
    o.append('<rect x="20" y="1450" width="180" height="14" fill="none" stroke="currentColor" stroke-width="2"/>')
    o.append('<rect x="34" y="1436" width="152" height="14" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".8"/>')
    # repeating diamonds / lotus nodes down the shaft
    for i in range(8):
        y = 220 + i * 150
        o.append(f'<path d="M110 {y} l 34 48 l -34 48 l -34 -48 Z" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".65"/>')
        o.append(rosette(110, y + 48, 15, 8, 1.1, 0.35))
    # beads
    for i in range(44):
        y = 200 + i * 27.5
        o.append(f'<circle cx="42" cy="{y:.1f}" r="2" fill="currentColor" fill-opacity=".4"/>')
        o.append(f'<circle cx="178" cy="{y:.1f}" r="2" fill="currentColor" fill-opacity=".4"/>')
    # a little flame at the top
    o.append('<path d="M110 40 C 124 70 116 96 110 108 C 104 96 96 70 110 40 Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.4"/>')
    o.append('<path d="M110 96 L 110 120" stroke="currentColor" stroke-width="1.2"/>')
    o.append("</g>")
    svg = (
        '<svg viewBox="0 0 220 1500" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" aria-hidden="true">'
        + "\n".join(o)
        + "</svg>"
    )
    if flip:
        svg = svg.replace('<svg ', '<svg style="transform:scaleX(-1)" ')
    return svg


def stage_line():
    o = ['<svg viewBox="0 0 1507 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" aria-hidden="true">']
    o.append('<path d="M0 66 L1507 66" stroke="currentColor" stroke-width="1.2" opacity=".55"/>')
    o.append('<path d="M0 74 L1507 74" stroke="currentColor" stroke-width="2"/>')
    o.append('<path d="M0 118 L1507 118" stroke="currentColor" stroke-width="1" opacity=".4"/>')
    for i in range(19):
        x = 40 + i * 80
        o.append(
            f'<path d="M{x} 92 C {x} 74 {x+28} 64 {x+28} 64 C {x+28} 64 {x+56} 74 {x+56} 92 '
            f'C {x+42} 86 {x+14} 86 {x} 92 Z" fill="currentColor" fill-opacity=".10" stroke="currentColor" stroke-width="1.1" opacity=".8"/>'
        )
        o.append(f'<circle cx="{x+28}" cy="86" r="2" fill="currentColor" fill-opacity=".6"/>')
    o.append('</svg>')
    return "\n".join(o)


def corner(flip_x=False, flip_y=False):
    o = ['<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" aria-hidden="true">']
    o.append('<path d="M4 236 L4 120 C4 54 54 4 120 4 L236 4" stroke="currentColor" stroke-width="1.4" opacity=".65"/>')
    o.append('<path d="M22 236 L22 126 C22 68 68 22 126 22 L236 22" stroke="currentColor" stroke-width=".9" opacity=".4"/>')
    o.append('<path d="M22 120 C40 120 58 108 62 88 C 50 96 42 94 38 84 C 56 82 68 68 68 48" stroke="currentColor" stroke-width="1.2"/>')
    o.append('<path d="M120 22 C120 40 108 58 88 62 C 96 50 94 42 84 38 C 82 56 68 68 48 68" stroke="currentColor" stroke-width="1.2"/>')
    o.append('<circle cx="60" cy="60" r="5" fill="currentColor" fill-opacity=".6"/>')
    o.append('</svg>')
    return "\n".join(o)


open("parts/halo.svg", "w").write(
    '<svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" aria-hidden="true">'
    + halo()
    + "</svg>"
)
open("parts/pillar-l.svg", "w").write(pillar())
open("parts/pillar-r.svg", "w").write(pillar(flip=True))
open("parts/stage-line.svg", "w").write(stage_line())
open("parts/corner.svg", "w").write(corner())
print("decor written", os.path.getsize("parts/halo.svg"))
