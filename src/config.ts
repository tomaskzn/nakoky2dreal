// Základné nastavenia webu – tu doplň svoje údaje.
export const SITE = {
  name: 'Na kocky',
  // E-mail, na ktorý majú chodiť dopyty (použije sa aj ako záloha cez mailto).
  email: 'ahoj@nakocky.sk',
  instagram: 'https://www.instagram.com/',
  // Bezplatný kľúč z https://web3forms.com (zadaj tam svoj e-mail, kľúč príde e-mailom).
  // Kým je prázdny, formulár otvorí e-mailového klienta s predvyplnenou správou.
  web3formsKey: '',
};

export const LANGS = ['sk', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const SECTION: Record<Lang, string> = { sk: 'produkty', en: 'products' };

// Web môže bežať v podpriečinku (napr. GitHub Pages: /nakoky2dreal/) – všetky odkazy idú cez withBase.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (path: string) => `${BASE}${path}`;

export const productUrl = (lang: Lang, slug: string) => withBase(`/${lang}/${SECTION[lang]}/${slug}/`);
