// Izometrický SVG náhľad kúsku obloženého kachličkami.
// Farby idú cez CSS premenné --tile a --grout, takže prefarbenie je len zmena štýlu.
import type { Product } from '../data/products';

const C = Math.cos(Math.PI / 6);
const S = 0.5;
// veľkosť kachličky a šírka škáry (zvýraznená, aby bola vidieť) sa nastavia podľa produktu
let T = 10;
let G = 0.9;

const n = (v: number) => +v.toFixed(2);

// deterministický „ručný" odtieň pre každú kachličku
function shade(i: number, j: number, k: number) {
  const x = Math.sin(i * 12.9898 + j * 78.233 + k * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

function tiles(fw: number, fh: number, k: number) {
  let s = `<rect width="${fw}" height="${fh}" fill="var(--grout)"/>`;
  for (let u = 0, i = 0; u < fw - 0.01; u += T, i++) {
    for (let v = 0, j = 0; v < fh - 0.01; v += T, j++) {
      const w = Math.min(T, fw - u) - G;
      const h = Math.min(T, fh - v) - G;
      s += `<rect x="${n(u + G / 2)}" y="${n(v + G / 2)}" width="${n(w)}" height="${n(h)}" rx="0.6" fill="var(--tile)"/>`;
      const r = shade(i, j, k);
      if (r > 0.55) {
        s += `<rect x="${n(u + G / 2)}" y="${n(v + G / 2)}" width="${n(w)}" height="${n(h)}" rx="0.6" fill="#fff" opacity="${n((r - 0.55) * 0.22)}"/>`;
      }
    }
  }
  return s;
}

function holes(p: Product) {
  const H = p.dims.h;
  let s = '';
  for (const o of p.openings) {
    const x0 = o.x;
    const vt = H - o.z - o.h;
    const vb = H - o.z;
    const t = Math.min(o.depth ?? p.dims.d, o.h, o.w);
    const through = (o.depth ?? p.dims.d) >= p.dims.d;
    // zadná stena (pri priechodnom otvore len jemný tieň – vidno cez kúsok)
    if (through) {
      s += `<rect x="${x0}" y="${vt}" width="${o.w}" height="${o.h}" fill="#000" opacity=".06"/>`;
    } else {
      s += `<rect x="${x0}" y="${vt}" width="${o.w}" height="${o.h}" fill="var(--tile)"/>`;
      s += `<rect x="${x0}" y="${vt}" width="${o.w}" height="${o.h}" fill="#000" opacity=".5"/>`;
    }
    // ľavá vnútorná stena
    const lw = `${x0},${vt} ${x0},${vb} ${x0 + t},${vb - t} ${x0 + t},${vt}`;
    s += `<polygon points="${lw}" fill="var(--tile)"/><polygon points="${lw}" fill="#000" opacity=".32"/>`;
    // dno
    const fl = `${x0},${vb} ${x0 + o.w},${vb} ${x0 + o.w},${vb - t} ${x0 + t},${vb - t}`;
    s += `<polygon points="${fl}" fill="var(--tile)"/><polygon points="${fl}" fill="#000" opacity=".14"/>`;
    // tieň stropu
    s += `<rect x="${x0}" y="${vt}" width="${o.w}" height="${Math.min(4, o.h)}" fill="#000" opacity=".18"/>`;
    // hrana otvoru
    s += `<rect x="${x0}" y="${vt}" width="${o.w}" height="${o.h}" fill="none" stroke="var(--grout)" stroke-width="${G}"/>`;
  }
  return s;
}

export function renderProduct(p: Product, cls = '') {
  const { w: W, d: D, h: H } = p.dims;
  T = p.tileSize;
  G = T * 0.09;
  const pad = 6;
  const minX = -D * C - pad;
  const maxX = W * C + pad;
  const minY = -H - pad;
  const maxY = (W + D) * S + pad + 4;

  const top = `<g transform="matrix(${n(C)} ${S} ${n(-C)} ${S} 0 ${-H})">${tiles(W, D, 1)}<rect width="${W}" height="${D}" fill="#fff" opacity=".12"/></g>`;
  const front = `<g transform="matrix(${n(C)} ${S} 0 1 ${n(-D * C)} ${n(D * S - H)})">${tiles(W, H, 2)}${holes(p)}</g>`;
  const side = `<g transform="matrix(${n(-C)} ${S} 0 1 ${n(W * C)} ${n(W * S - H)})">${tiles(D, H, 3)}<rect width="${D}" height="${H}" fill="#000" opacity=".2"/></g>`;
  // tieň na zemi
  const sh = `<polygon points="${n(-D * C)},${n(D * S)} 0,0 ${n(W * C)},${n(W * S)} ${n((W - D) * C)},${n((W + D) * S)}" fill="#000" opacity=".12" transform="translate(5 4)" filter="url(#blur-${p.slug})"/>`;

  return `<svg class="render ${cls}" viewBox="${n(minX)} ${n(minY)} ${n(maxX - minX)} ${n(maxY - minY)}" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><filter id="blur-${p.slug}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>${sh}${top}${front}${side}</svg>`;
}
