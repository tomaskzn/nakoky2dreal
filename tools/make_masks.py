"""Vytvorí masky na prefarbenie fotiek: {foto}.mask.png vedľa fotky.
R = váha kachličky, G = váha škáry, B = posun svetlosti L* voči priemernej kachličke (128 = 0, 2.5 = 1 L*).
Spustenie: python tools/make_masks.py [--debug DIR]
Potrebuje: pip install pillow numpy scipy
"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, median_filter, grey_dilation

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'photos')
CFG = json.load(open(os.path.join(os.path.dirname(__file__), 'masks.json')))
debug = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--debug' else None
SCALE = 2.5  # kódovanie posunu svetlosti do modrého kanála
MED = 13  # okno mediánu (väčšie než šírka škáry)


def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def luma(rgb):
    return to_lab(rgb)[..., 0] / 100.0


def luma_from_lab(lab):
    # svetlosť 0..1 v rovnakej (gama) škále ako luma(): L*/100 je jej dobrá aproximácia
    return lab[..., 0] / 100.0


def lab_to_rgb(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    inv = lambda t: np.where(t ** 3 > 0.008856, t ** 3, (t - 16 / 116) / 7.787)
    xyz = np.stack([inv(fx) * 0.9505, inv(fy), inv(fz) * 1.089], -1)
    M = np.array([[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]])
    c = np.clip(xyz @ M.T, 0, 1)
    c = np.where(c > 0.0031308, 1.055 * c ** (1 / 2.4) - 0.055, 12.92 * c)
    return c * 255


def lut(rgb):
    """Rovnaký výpočet ako src/lib/recolor.ts: farba pre každý posun svetlosti 0..255."""
    base = to_lab(np.array(rgb, np.float32)[None, None])[0, 0]
    d = (np.arange(256) - 128) / SCALE
    Lp = np.clip(base[0] + d * 0.9, 2, 98)
    k = np.where(Lp < base[0], np.sqrt(Lp / max(base[0], 1)), 1.0) * 0.92
    return lab_to_rgb(np.stack([Lp, base[1] * k, base[2] * k], -1))


def recolor(im, wt, wg, shade, nt, ng):
    idx = np.clip(np.round(128 + shade * SCALE), 0, 255).astype(int)
    lt, lg = lut(nt)[idx], lut(ng)[idx]
    w = np.clip(wt + wg, 0, 1)[..., None]
    out = im * (1 - w) + lt * wt[..., None] + lg * wg[..., None]
    return out.clip(0, 255).astype(np.uint8)


def line_se(angle, length=11):
    a = np.deg2rad(angle)
    r = length // 2
    se = np.zeros((length, length), bool)
    for t in np.linspace(-r, r, length * 3):
        se[int(round(r + t * np.sin(a))), int(round(r + t * np.cos(a)))] = True
    return se


SES = [line_se(a) for a in range(0, 180, 12)]


def close_lines(m):
    """Uzavretie čiarovými štruktúrnymi prvkami vo viacerých smeroch (premostenie medzier v škárach)."""
    from scipy.ndimage import grey_closing
    return np.max([grey_closing(m, footprint=se) for se in SES], axis=0)


def poly_mask(size, polys):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([tuple(x) for x in p], fill=255)
    return np.asarray(m, dtype=np.float32) / 255.0


for name, cfg in CFG.items():
    path = os.path.join(ROOT, name)
    im = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32)
    H, W, _ = im.shape
    lab = to_lab(im)
    L = luma(im)
    wt = np.zeros((H, W), np.float32)
    wg = np.zeros((H, W), np.float32)
    shade = np.zeros((H, W), np.float32)
    for piece in cfg['pieces']:
        region = poly_mask((W, H), [piece['poly']])
        if piece.get('exclude'):
            region *= 1 - poly_mask((W, H), piece['exclude'])
        region = gaussian_filter(region, 1.2)
        inside = region > 0.5
        # škára = tenká čiara, ktorá sa od okolia (medián ~ kachlička) odlišuje smerom k farbe škáry
        med = np.stack([median_filter(lab[..., i], size=MED) for i in range(3)], -1)
        bt = to_lab(np.array(piece['tile'], np.float32)[None, None])[0, 0]
        bg = to_lab(np.array(piece['grout'], np.float32)[None, None])[0, 0]
        g = (bg - bt) * np.array([1.0, 1.0, 1.0])
        # je to vôbec nábytok? (farba okolia blízko kachličky alebo škáry, svetlosť sa ignoruje)
        bt_ab = np.median(med[inside][:, 1:], axis=0) if inside.any() else bt[1:]
        dt = np.sqrt(((med[..., 1:] - bt_ab) ** 2).sum(-1))
        dg = np.sqrt(((med[..., 1:] - bg[1:]) ** 2).sum(-1))
        f = np.clip((piece.get('tol', 26) - np.minimum(dt, dg)) / 6.0, 0, 1)
        f = gaussian_filter(f, 1.0)
        region = region * f
        D = lab - med
        proj = (D * g).sum(-1) / (g * g).sum()
        pg = np.clip((proj - 0.07) / 0.26, 0, 1)
        pg = grey_dilation(pg, size=(3, 3))  # škára širšia, aby bola vidieť aj na zmenšenej fotke
        pg = np.clip(gaussian_filter(pg, 0.6) * 1.15, 0, 1) * region
        pt = (1 - pg) * region
        Lmed = lab[..., 0] * 0 + med[..., 0]
        tile_px = inside & (pg < 0.3)
        lt = np.median(lab[..., 0][tile_px]) if tile_px.any() else 50.0
        # kachlička: posun svetlosti pixelu (tiene, lesk, textúra glazúry)
        st = lab[..., 0] - lt
        # tmavý podklad (napr. námornícka) má prehnaný kontrast lesku – stlmiť; lesk orezať, aby sa neprepaľoval
        st = np.clip(st * (0.55 if lt < 40 else 1.0), -28, 14)
        # škára: osvetlenie okolia + jemne zapustená (tmavšia)
        sg = gaussian_filter(Lmed, 2.0) - lt - 4.0
        tot2 = np.maximum(pt + pg, 1e-4)
        s = (st * pt + sg * pg) / tot2
        upd = (pt + pg) > (wt + wg)
        shade = np.where(upd, s, shade)
        wt = np.where(upd, pt, wt)
        wg = np.where(upd, pg, wg)
    out = np.stack([
        np.clip(wt * 255, 0, 255),
        np.clip(wg * 255, 0, 255),
        np.clip(128 + shade * SCALE, 0, 255),
    ], -1).astype(np.uint8)
    mpath = path.rsplit('.', 1)[0] + '.mask.png'
    Image.fromarray(out).save(mpath, optimize=True)
    print(name, '->', os.path.getsize(mpath) // 1024, 'kB')
    if debug:
        os.makedirs(debug, exist_ok=True)
        for tag, nt, ng in (('a', [147, 176, 143], [247, 246, 242]), ('b', [31, 43, 114], [240, 191, 198]), ('c', [227, 165, 43], [69, 68, 74])):
            rec = recolor(im, wt, wg, shade, nt, ng)
            Image.fromarray(rec).save(os.path.join(debug, name.replace('/', '_').replace('.jpg', f'_{tag}.jpg')))
