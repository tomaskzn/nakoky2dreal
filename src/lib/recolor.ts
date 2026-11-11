// Prefarbenie fotky v prehliadači podľa masky {foto}.mask.png
// R = váha kachličky, G = váha škáry, B = posun svetlosti L* (128 = 0, 2.5 = 1 L*).
// Nová farba sa skladá v Lab: svetlosť cieľovej farby + posun z pôvodnej fotky (tiene, lesk),
// takže sa farba neprepaľuje a ostane textúra glazúry. Masky vyrába tools/make_masks.py.

const SCALE = 2.5;

const hexRgb = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function rgbToLab([r, g, b]: number[]) {
  const lin = (c: number) => ((c /= 255) > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const R = lin(r), G = lin(g), B = lin(b);
  const x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.9505;
  const y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.089;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function labToRgb(L: number, a: number, b: number) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const x = inv(fx) * 0.9505, y = inv(fy), z = inv(fz) * 1.089;
  const g = (c: number) => {
    c = Math.min(1, Math.max(0, c));
    return 255 * (c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c);
  };
  return [
    g(3.2406 * x - 1.5372 * y - 0.4986 * z),
    g(-0.9689 * x + 1.8758 * y + 0.0415 * z),
    g(0.0557 * x - 0.204 * y + 1.057 * z),
  ];
}

// farba pre každý posun svetlosti 0..255 (rovnaký výpočet ako lut() v tools/make_masks.py)
function lut(hex: string) {
  const [L0, a0, b0] = rgbToLab(hexRgb(hex));
  const t = new Float32Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const L = Math.min(98, Math.max(2, L0 + ((i - 128) / SCALE) * 0.9));
    const k = (L < L0 ? Math.sqrt(L / Math.max(L0, 1)) : 1) * 0.92;
    const [r, g, b] = labToRgb(L, a0 * k, b0 * k);
    t[i * 3] = r; t[i * 3 + 1] = g; t[i * 3 + 2] = b;
  }
  return t;
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

export const maskUrl = (photo: string) => photo.replace(/\.(jpe?g|png|webp)$/i, '.mask.png');

export type Recolorer = { canvas: HTMLCanvasElement; paint: (tile: string, grout: string) => void };

const cache = new Map<string, Promise<{ photo: ImageData; mask: ImageData }>>();

function pixels(src: string) {
  if (!cache.has(src)) {
    cache.set(
      src,
      Promise.all([load(src), load(maskUrl(src))]).then(([p, m]) => {
        const c = document.createElement('canvas');
        c.width = p.naturalWidth;
        c.height = p.naturalHeight;
        const x = c.getContext('2d', { willReadFrequently: true })!;
        x.drawImage(p, 0, 0);
        const photo = x.getImageData(0, 0, c.width, c.height);
        x.clearRect(0, 0, c.width, c.height);
        x.drawImage(m, 0, 0, c.width, c.height);
        const mask = x.getImageData(0, 0, c.width, c.height);
        return { photo, mask };
      }),
    );
  }
  return cache.get(src)!;
}

export async function recolorer(src: string, canvas = document.createElement('canvas')): Promise<Recolorer> {
  const { photo, mask } = await pixels(src);
  canvas.width = photo.width;
  canvas.height = photo.height;
  const ctx = canvas.getContext('2d')!;
  const out = new ImageData(photo.width, photo.height);
  const P = photo.data, M = mask.data, O = out.data;

  const paint = (tile: string, grout: string) => {
    const T = lut(tile), G = lut(grout);
    for (let i = 0; i < P.length; i += 4) {
      const wt = M[i] / 255, wg = M[i + 1] / 255;
      const w = wt + wg;
      if (w < 0.004) {
        O[i] = P[i]; O[i + 1] = P[i + 1]; O[i + 2] = P[i + 2]; O[i + 3] = 255;
        continue;
      }
      const j = M[i + 2] * 3;
      const k = 1 - Math.min(w, 1);
      O[i] = P[i] * k + T[j] * wt + G[j] * wg;
      O[i + 1] = P[i + 1] * k + T[j + 1] * wt + G[j + 1] * wg;
      O[i + 2] = P[i + 2] * k + T[j + 2] * wt + G[j + 2] * wg;
      O[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  };
  return { canvas, paint };
}
