// Palety – uprav podľa kachličiek a škárovacích hmôt, ktoré reálne ponúkaš.
// `id` sa používa aj v názve fotky: public/photos/{produkt}/{kachlicka}-{skara}.jpg

export type Swatch = { id: string; hex: string; name: { sk: string; en: string } };

export const TILES: Swatch[] = [
  { id: 'slonovina', hex: '#efdfc5', name: { sk: 'Krémová', en: 'Cream' } },
  { id: 'salvia', hex: '#93b08f', name: { sk: 'Šalviová', en: 'Sage' } },
  { id: 'namornicka', hex: '#1f2b72', name: { sk: 'Námornícka', en: 'Navy' } },
  { id: 'kobalt', hex: '#2346d6', name: { sk: 'Kobaltová', en: 'Cobalt' } },
  { id: 'smaragd', hex: '#0f8a5f', name: { sk: 'Smaragdová', en: 'Emerald' } },
  { id: 'horcica', hex: '#e3a52b', name: { sk: 'Horčicová', en: 'Mustard' } },
  { id: 'terakota', hex: '#c8553d', name: { sk: 'Terakota', en: 'Terracotta' } },
  { id: 'ruzova', hex: '#f2a7b8', name: { sk: 'Ružová', en: 'Pink' } },
  { id: 'nebo', hex: '#8ec5e8', name: { sk: 'Nebeská', en: 'Sky' } },
  { id: 'levandula', hex: '#a99ad8', name: { sk: 'Levanduľová', en: 'Lavender' } },
  { id: 'cierna', hex: '#232323', name: { sk: 'Čierna', en: 'Black' } },
];

export const GROUTS: Swatch[] = [
  { id: 'biela', hex: '#f7f6f2', name: { sk: 'Biela', en: 'White' } },
  { id: 'terakota', hex: '#c27150', name: { sk: 'Terakota', en: 'Terracotta' } },
  { id: 'ruzova', hex: '#f0bfc6', name: { sk: 'Ružová', en: 'Pink' } },
  { id: 'siva', hex: '#bdbab3', name: { sk: 'Svetlosivá', en: 'Light grey' } },
  { id: 'antracit', hex: '#45444a', name: { sk: 'Antracit', en: 'Anthracite' } },
  { id: 'cierna', hex: '#141414', name: { sk: 'Čierna', en: 'Black' } },
  { id: 'zlta', hex: '#f4cc4f', name: { sk: 'Žltá', en: 'Yellow' } },
];

export const tileById = (id: string) => TILES.find((t) => t.id === id) ?? TILES[0];
export const groutById = (id: string) => GROUTS.find((g) => g.id === id) ?? GROUTS[0];
