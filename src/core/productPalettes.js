/**
 * Sobral Workwear Product Color Palettes
 *
 * Central place to adjust available colors per model (no extra UI configurator needed).
 * Per-product lists below are sourced from existing products on sobral-stage.break-prime.cc
 * (excluding any colors not carried by Sobral).
 *
 * How to adjust colors later in code:
 * - Edit the product's entry in `PRODUCT_PALETTES` keyed by product `id` (see `src/core/products.js`).
 * - Add/remove `{ name, hex }` items in the zone array (`primary`, `accent`, `collar`,
 *   or `helmet` / `trousers` / `boots` for the Komplett-Outfit).
 */

export const BASE_PALETTES = {
  helmet: [
    { name: 'Gelb', hex: '#FFCF24' },
    { name: 'Blau', hex: '#1E63B8' },
    { name: 'Weiss', hex: '#F5F6F7' },
    { name: 'Orange', hex: '#FF6B00' },
    { name: 'Rot', hex: '#B82934' },
    { name: 'Grün', hex: '#1E5E1E' },
    { name: 'Schwarz', hex: '#1D1D1B' }
  ],
  beanie: [
    { name: 'Marineblau', hex: '#121624' },
    { name: 'Grau', hex: '#5A6069' },
    { name: 'Schwarz', hex: '#1D1D1B' }
  ],
  tops: [
    { name: 'Marineblau', hex: '#242935' },
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Dunkelgrau', hex: '#4A5058' },
    { name: 'Kornblumenblau', hex: '#284282' },
    { name: 'Rot', hex: '#B82934' },
    { name: 'Weiss', hex: '#F5F6F7' },
    { name: 'Grau', hex: '#6E747C' }
  ],
  jacket: [
    { name: 'Schwarz', hex: '#15171A' },
    { name: 'Dunkel Marineblau', hex: '#1F2A3C' },
    { name: 'Dunkelgrau', hex: '#3F454E' },
    { name: 'Grau', hex: '#5C626B' },
    { name: 'Olivegrün', hex: '#3E4B3C' }
  ],
  trousers: [
    { name: 'Marineblau', hex: '#1A2232' },
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Grau', hex: '#5A6069' },
    { name: 'Waldgrün', hex: '#2D4436' },
    { name: 'Kornblumenblau', hex: '#284282' },
    { name: 'Nougat', hex: '#7D6246' }
  ],
  boots: [
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Grau', hex: '#5A6069' },
    { name: 'Dunkelbraun', hex: '#5C3D24' }
  ],
  accent: [
    { name: 'Sobral Orange', hex: '#FF4400' },
    { name: 'Warn-Gelb', hex: '#FFCF24' },
    { name: 'Rot', hex: '#B82934' },
    { name: 'Weiss', hex: '#F5F6F7' },
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Grau', hex: '#5C626B' }
  ],
  collar: [
    { name: 'Marineblau', hex: '#242935' },
    { name: 'Schwarz', hex: '#1D1D1B' },
    { name: 'Grau', hex: '#5A6069' },
    { name: 'Weiss', hex: '#F5F6F7' }
  ]
};

/**
 * Per-product colorways collected from sobral-stage.break-prime.cc catalog data.
 */
export const PRODUCT_PALETTES = {
  // Komplett-Look: KASK Helm + Blåkläder 3379 Oberteil + Blåkläder 1750 Hose + Boots
  sobral_worker: {
    helmet: [
      { name: 'Gelb', hex: '#FFCF24' },
      { name: 'Blau', hex: '#1E63B8' },
      { name: 'Royal', hex: '#21409A' },
      { name: 'Weiss', hex: '#F5F6F7' },
      { name: 'Orange', hex: '#FF6B00' },
      { name: 'Rot', hex: '#B82934' },
      { name: 'Grün', hex: '#1E5E1E' },
      { name: 'Anthrazit', hex: '#3B4048' },
      { name: 'Schwarz', hex: '#1D1D1B' }
    ],
    primary: [
      { name: 'Marineblau / Grau', hex: '#242935' },
      { name: 'Dunkel Marineblau / Schwarz', hex: '#1B2034' },
      { name: 'Kornblumenblau / Schwarz', hex: '#284282' },
      { name: 'Rot / Schwarz', hex: '#B82934' },
      { name: 'Dunkelgrau / Schwarz', hex: '#4B515A' },
      { name: 'Schwarz / Dunkelgrau', hex: '#1D1D1B' },
      { name: 'Weiss / Dunkelgrau', hex: '#F5F6F7' }
    ],
    trousers: BASE_PALETTES.trousers,
    boots: BASE_PALETTES.boots
  },

  // Blåkläder 3379 (3379-203379)
  sobral_workwear_tshirt: {
    primary: [
      { name: 'Schwarz / Dunkelgrau', hex: '#121316' },
      { name: 'Marineblau / Grau', hex: '#242935' },
      { name: 'Dunkel Marineblau / Schwarz', hex: '#1B2034' },
      { name: 'Kornblumenblau / Schwarz', hex: '#284282' },
      { name: 'Rot / Schwarz', hex: '#B82934' },
      { name: 'Dunkelgrau / Schwarz', hex: '#4B515A' },
      { name: 'Weiss / Dunkelgrau', hex: '#F5F6F7' }
    ],
    accent: BASE_PALETTES.accent,
    collar: BASE_PALETTES.collar,
    secondary: BASE_PALETTES.accent
  },

  // Blåkläder 3300 - T-Shirt (3300-203300)
  sobral_3300: {
    primary: [
      { name: 'Marineblau', hex: '#243249' },
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Dunkelgrau', hex: '#4A5058' },
      { name: 'Grau', hex: '#6E747C' },
      { name: 'Mittelgrau', hex: '#9CA3AF' },
      { name: 'Kornblumenblau', hex: '#284282' },
      { name: 'Rot', hex: '#B82934' },
      { name: 'Weiss', hex: '#F5F6F7' }
    ],
    collar: BASE_PALETTES.collar
  },

  // Blåkläder 3340 - Sweatshirt Pro (3340-203340)
  sobral_3340: {
    primary: [
      { name: 'Mittelgrau', hex: '#C4C7C9' },
      { name: 'Marineblau', hex: '#242935' },
      { name: 'Dunkel Marineblau', hex: '#181F30' },
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Dunkelgrau', hex: '#525760' },
      { name: 'Grau', hex: '#6E747C' },
      { name: 'Kornblumenblau', hex: '#284282' },
      { name: 'Rot', hex: '#B82934' },
      { name: 'Waldgrün', hex: '#2D4436' },
      { name: 'Weiss', hex: '#F5F6F7' }
    ],
    collar: [
      { name: 'Grau', hex: '#ADAFB1' },
      ...BASE_PALETTES.collar.filter(c => c.name !== 'Grau')
    ]
  },

  // Blåkläder 3362 - Sweatjacke mit Reissverschluss (3362-203362)
  sobral_3362: {
    primary: [
      { name: 'Dunkel Marineblau / Schwarz', hex: '#1C2430' },
      { name: 'Schwarz / Dunkelgrau', hex: '#1D1D1B' },
      { name: 'Grau / Schwarz', hex: '#5C626B' },
      { name: 'Olivegrün / Schwarz', hex: '#3E4B3C' },
      { name: 'Schwarz / Rot', hex: '#B82934' },
      { name: 'Weiss / Dunkelgrau', hex: '#F5F6F7' }
    ],
    collar: BASE_PALETTES.collar
  },

  // Blåkläder 3366 - Sweatshirt mit Kapuze (3366-203366)
  sobral_3366: {
    primary: [
      { name: 'Dunkel Marineblau', hex: '#181E28' },
      { name: 'Marineblau', hex: '#243249' },
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Grau', hex: '#5C626B' },
      { name: 'Mittelgrau', hex: '#9CA3AF' }
    ],
    accent: BASE_PALETTES.accent,
    collar: BASE_PALETTES.collar
  },

  // Blåkläder 4890 - Leichte gefütterte Funktionsjacke (4890-204890)
  sobral_4890: {
    primary: [
      { name: 'Schwarz', hex: '#15171A' },
      { name: 'Dunkel Marineblau / Schwarz', hex: '#1F2A3C' },
      { name: 'Dunkelgrau / Schwarz', hex: '#3F454E' },
      { name: 'Grau / Schwarz', hex: '#5C626B' },
      { name: 'Olivegrün / Schwarz', hex: '#3E4B3C' },
      { name: 'Schwarz / Kornblumenblau', hex: '#284282' },
      { name: 'Weiss / Dunkelgrau', hex: '#F5F6F7' }
    ],
    accent: BASE_PALETTES.accent
  },

  // Blåkläder 1750 - Handwerker Arbeitshose (1750-201750)
  sobral_1750: {
    primary: BASE_PALETTES.trousers
  },

  // Blåkläder 1751 - Handwerker Arbeitshose (1751-201751)
  sobral_1751: {
    primary: [
      { name: 'Schwarz', hex: '#1D1D1B' },
      ...BASE_PALETTES.trousers.filter(c => c.name !== 'Schwarz')
    ]
  },

  // Blåkläder 2003 - Wintermütze (2003-202003)
  sobral_2003: {
    primary: BASE_PALETTES.beanie,
    accent: BASE_PALETTES.accent,
    collar: BASE_PALETTES.beanie
  },

  // KASK Schutzhelm PRIMERO AIR EN 397 (Sobral variants)
  sobral_whe00113: {
    primary: [
      { name: 'Weiss', hex: '#E2E5E8' },
      { name: 'Gelb', hex: '#FFCF24' },
      { name: 'Blau', hex: '#1E63B8' },
      { name: 'Royal', hex: '#21409A' },
      { name: 'Orange', hex: '#FF6B00' },
      { name: 'Rot', hex: '#B82934' },
      { name: 'Grün', hex: '#1E5E1E' },
      { name: 'Britisch-Grün', hex: '#1D3B2A' },
      { name: 'Anthrazit', hex: '#3B4048' },
      { name: 'Light-Grey', hex: '#B8BDC4' },
      { name: 'Schwarz', hex: '#1D1D1B' }
    ],
    accent: BASE_PALETTES.accent,
    collar: [
      { name: 'Schwarz', hex: '#1E2024' },
      { name: 'Grau', hex: '#5A6069' },
      { name: 'Weiss', hex: '#F5F6F7' }
    ]
  },

  // HAKRO Poloshirt Classic (0810-200810)
  sobral_hakro_polo: {
    primary: [
      { name: 'Royalblau', hex: '#284282' },
      { name: 'Marine', hex: '#1D2942' },
      { name: 'Schwarz', hex: '#1D1D1B' },
      { name: 'Anthrazit', hex: '#4B515A' },
      { name: 'Grau Meliert', hex: '#9CA3AF' },
      { name: 'Rot', hex: '#B82934' },
      { name: 'Weinrot', hex: '#6D1D2E' },
      { name: 'Tanne', hex: '#1E4231' },
      { name: 'Orange', hex: '#FF5E14' },
      { name: 'Sonne', hex: '#F5B700' },
      { name: 'Weiss', hex: '#F5F6F7' }
    ],
    collar: BASE_PALETTES.collar
  }
};

/**
 * Resolves the color palette for a product and zone, checking in order:
 * 1. Explicit `product.palettes[zoneId]` override
 * 2. `PRODUCT_PALETTES[product.id][zoneId]`
 * 3. Category / silhouette / zone fallback in `BASE_PALETTES`
 */
export function getProductZonePalette(product, zoneId = 'primary') {
  if (product?.palettes?.[zoneId]?.length) {
    return product.palettes[zoneId];
  }

  const perProduct = product?.id ? PRODUCT_PALETTES[product.id] : null;
  if (perProduct?.[zoneId]?.length) {
    return perProduct[zoneId];
  }

  if (zoneId === 'helmet') return BASE_PALETTES.helmet;
  if (zoneId === 'trousers') return BASE_PALETTES.trousers;
  if (zoneId === 'boots') return BASE_PALETTES.boots;
  if (zoneId === 'accent') return BASE_PALETTES.accent;
  if (zoneId === 'collar') return BASE_PALETTES.collar;

  if (product?.silhouette === 'beanie') return BASE_PALETTES.beanie;
  if (product?.silhouette === 'helmet' || product?.category === 'headwear') return BASE_PALETTES.helmet;
  if (product?.silhouette === 'trousers' || product?.category === 'bottoms') return BASE_PALETTES.trousers;
  if (product?.silhouette === 'shoes' || product?.category === 'shoes') return BASE_PALETTES.boots;
  if (product?.silhouette === 'jacket') return BASE_PALETTES.jacket;

  return BASE_PALETTES.tops;
}

/**
 * Looks up a readable German color name for a HEX color within a product/zone palette.
 */
export function findColorName(hex, product = null, zoneId = 'primary') {
  if (!hex) return '';
  const target = hex.toLowerCase();
  const palette = getProductZonePalette(product, zoneId);
  const directMatch = palette.find(item => item.hex.toLowerCase() === target);
  if (directMatch) return directMatch.name;

  for (const list of Object.values(BASE_PALETTES)) {
    const fallbackMatch = list.find(item => item.hex.toLowerCase() === target);
    if (fallbackMatch) return fallbackMatch.name;
  }

  return 'Individueller Farbton';
}
