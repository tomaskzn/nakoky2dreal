// Produkty – rozmery v cm, cena v € (orientačná, uprav podľa seba).
// `openings` sú otvory na prednej strane: x/z od ľavého spodného rohu, w/h rozmer otvoru.
// `photos` je galéria (súbory v public/photos/{slug}/). Fotky konkrétnych kombinácií farieb
// pomenuj {kachlicka}-{skara}.jpg – konfigurátor ich ukáže automaticky.

import { withBase } from '../config';

type L = { sk: string; en: string };
export type Opening = { x: number; z: number; w: number; h: number; depth?: number };
export type Photo = { file: string; alt: L; recolor?: boolean }; // recolor: existuje {foto}.mask.png
export type Product = {
  slug: string;
  name: L;
  tagline: L;
  desc: L;
  dims: { w: number; d: number; h: number };
  tileSize: number;
  price: number;
  openings: Opening[];
  tile: string;
  grout: string;
  photos: Photo[];
};

export const PRODUCTS: Product[] = [
  {
    slug: 'stolik-na-gramofon',
    name: { sk: 'Stolík na gramofón', en: 'Record player stand' },
    tagline: { sk: 'Hore gramofón, v strede zosilňovač, dole platne.', en: 'Turntable on top, amp in the middle, records below.' },
    desc: {
      sk: 'Polička na zosilňovač a tri priehradky na vinylové platne. Pevná doska, na ktorej gramofón stojí ako pribitý.',
      en: 'A shelf for your amplifier and three compartments for vinyl. A solid top that keeps your turntable steady.',
    },
    dims: { w: 60, d: 45, h: 82.5 },
    tileSize: 7.5,
    price: 490,
    openings: [
      { x: 7.5, z: 52.5, w: 45, h: 22.5, depth: 40 },
      { x: 7.5, z: 7.5, w: 12.5, h: 37.5, depth: 40 },
      { x: 23.75, z: 7.5, w: 12.5, h: 37.5, depth: 40 },
      { x: 40, z: 7.5, w: 12.5, h: 37.5, depth: 40 },
    ],
    tile: 'slonovina',
    grout: 'terakota',
    photos: [
      { recolor: true, file: 'slonovina-terakota.jpg', alt: { sk: 'Krémový stolík na gramofón s terakotovou škárou v obývačke', en: 'Cream record player stand with terracotta grout in a living room' } },
    ],
  },
  {
    slug: 'konferencny-stolik',
    name: { sk: 'Konferenčný stolík', en: 'Coffee table' },
    tagline: { sk: 'Stred obývačky. Doslova.', en: 'The centre of the living room. Literally.' },
    desc: {
      sk: 'Nízky stolík s priechodnou policou na knihy a časopisy. Odolný povrch znesie hrnčeky aj spoločenské hry. Na želanie aj v plnej verzii bez otvoru.',
      en: 'A low table with a pass-through shelf for books and magazines. The surface handles mugs and board games. Also available as a solid block.',
    },
    dims: { w: 97.5, d: 60, h: 37.5 },
    tileSize: 7.5,
    price: 590,
    openings: [{ x: 7.5, z: 7.5, w: 82.5, h: 22.5, depth: 60 }],
    tile: 'slonovina',
    grout: 'terakota',
    photos: [
      { recolor: true, file: 'slonovina-terakota.jpg', alt: { sk: 'Krémový konferenčný stolík s policou na knihy', en: 'Cream coffee table with a shelf for books' } },
      { recolor: true, file: '../kocka/blok-slonovina.jpg', alt: { sk: 'Plná verzia konferenčného stolíka bez otvoru', en: 'Solid version of the coffee table' } },
    ],
  },
  {
    slug: 'nocny-stolik',
    name: { sk: 'Nočný stolík', en: 'Bedside table' },
    tagline: { sk: 'Na knihu, lampu a pohár vody.', en: 'For a book, a lamp and a glass of water.' },
    desc: {
      sk: 'Otvorená kocka s priechodom, do ktorej sa zmestia knihy aj časopisy. Kachličky sa ľahko utierajú, takže mu neublíži ani rozliaty čaj.',
      en: 'An open cube with room for books and magazines. Tiles wipe clean, so spilled tea is no drama.',
    },
    dims: { w: 52.5, d: 45, h: 52.5 },
    tileSize: 7.5,
    price: 290,
    openings: [{ x: 7.5, z: 7.5, w: 37.5, h: 37.5, depth: 45 }],
    tile: 'salvia',
    grout: 'biela',
    photos: [
      { recolor: true, file: 'trio.jpg', alt: { sk: 'Tri otvorené nočné stolíky: krémový, šalviový a námornícky', en: 'Three open bedside tables: cream, sage and navy' } },
    ],
  },
  {
    slug: 'kocka',
    name: { sk: 'Kocka', en: 'The Cube' },
    tagline: { sk: 'Základ všetkého. Bez otvorov.', en: 'The basic one. No openings.' },
    desc: {
      sk: 'Plná kocka, ktorá poslúži ako stolík, taburet alebo podstavec pod kvetinu. Daj ich viac vedľa seba a kombinuj farby.',
      en: 'A solid cube that works as a side table, stool or plant stand. Line up a few and mix the colours.',
    },
    dims: { w: 45, d: 45, h: 52.5 },
    tileSize: 7.5,
    price: 190,
    openings: [],
    tile: 'namornicka',
    grout: 'ruzova',
    photos: [
      { recolor: true, file: 'trio.jpg', alt: { sk: 'Tri plné kocky: krémová, šalviová a námornícka', en: 'Three solid cubes: cream, sage and navy' } },
    ],
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const photoUrl = (p: Product, file: string) => withBase(`/photos/${p.slug}/${file}`.replace(/\/[^/]+\/\.\.\//, '/'));
