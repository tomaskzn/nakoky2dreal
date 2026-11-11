# Na kocky – web

Statický web (Astro), SK + EN.

**Online:** po každom pushnutí do vetvy `main` sa web sám nasadí na GitHub Pages
(`.github/workflows/deploy.yml`) – adresa je `https://<používateľ>.github.io/<repozitár>/`.

**Lokálne** (treba [Node.js](https://nodejs.org) 20+):

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # výstup v dist/
```

## Čo upraviť
| Čo | Kde |
|---|---|
| E-mail, Instagram, kľúč formulára (Web3Forms) | `src/config.ts` |
| Produkty, ceny, rozmery, texty, otvory | `src/data/products.ts` |
| Farby kachličiek a škár | `src/data/colors.ts` |
| Ostatné texty SK/EN | `src/i18n.ts` |
| Logo / favicon | `public/favicon.svg`, logo v `src/layouts/Base.astro` |

## Fotky variantov
Ulož fotku ako `public/photos/{produkt}/{kachlicka}-{skara}.jpg`,
napr. `public/photos/kocka/horcica-biela.jpg`. Ak fotka existuje, konfigurátor ju ukáže
namiesto kreslenej ilustrácie. ID farieb sú v `src/data/colors.ts`.

## Formulár
Kým je `web3formsKey` prázdny, formulár otvorí e-mailový program s predvyplnenou správou.
Kľúč zadarmo: https://web3forms.com → zadaj e-mail, kľúč príde e-mailom → vlož do `src/config.ts`.

## Ďalej
- Fáza 2: platby cez Stripe (Checkout / Payment Links).
- Nasadenie: Vercel alebo Netlify (import priečinka / Git repozitára), doména nakocky.sk.

## Prefarbovanie fotiek
Fotky označené `recolor: true` v `src/data/products.ts` sa v konfigurátore prefarbujú podľa
zvolenej kachličky a škáry. Potrebujú masku `{foto}.mask.png`, ktorú vyrobí skript:

```bash
python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy
.venv/bin/python tools/make_masks.py            # pridaj --debug priecinok pre kontrolné obrázky
```

Pre novú fotku pridaj do `tools/masks.json` obrys kúska (`poly`, v pixeloch), predmety,
ktoré sa nemajú prefarbiť (`exclude`), a pôvodnú farbu kachličky a škáry (`tile`, `grout`).
