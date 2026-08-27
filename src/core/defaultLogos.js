// High-quality SVG Sport Logos & Badges as Data URIs for instant preview and selection

export const DEFAULT_LOGOS = [
  {
    id: 'lion-crest',
    name: 'Royal Lion Crest',
    category: 'Crests',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 5 L85 20 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V20 Z" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 15 L77 27 V48 C77 68 50 84 50 84 C50 84 23 68 23 48 V27 Z" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/>
      <path d="M50 30 C45 30 40 34 40 40 C40 45 43 48 45 52 C41 53 36 57 36 63 C36 71 43 75 50 75 C57 75 64 71 64 63 C64 57 59 53 55 52 C57 48 60 45 60 40 C60 34 55 30 50 30 Z" fill="#ffffff"/>
      <circle cx="46" cy="38" r="1.5" fill="#111"/>
      <circle cx="54" cy="38" r="1.5" fill="#111"/>
      <path d="M47 43 Q50 46 53 43" stroke="#111" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M35 24 L50 32 L65 24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'speed-wings',
    name: 'Aero Speed Wings',
    category: 'Racing',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 30 L90 20 L75 50 L95 40 L65 75 L50 55 L35 75 L5 40 L25 50 L10 20 Z" fill="#ffffff" fill-opacity="0.9" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="50,22 55,48 50,70 45,48" fill="#e11d48"/>
      <circle cx="50" cy="50" r="7" fill="#ffffff"/>
    </svg>`
  },
  {
    id: 'cyber-shield',
    name: 'Cyber Shield V',
    category: 'Tech',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <polygon points="50,8 90,25 78,80 50,94 22,80 10,25" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="4"/>
      <polygon points="50,20 78,32 70,72 50,82 30,72 22,32" fill="#ffffff" fill-opacity="0.3"/>
      <path d="M36 38 L50 72 L64 38 L56 38 L50 56 L44 38 Z" fill="#ffffff"/>
      <circle cx="50" cy="30" r="3" fill="#ffffff"/>
    </svg>`
  },
  {
    id: 'apex-lightning',
    name: 'Apex Lightning',
    category: 'Energy',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="42" stroke="#ffffff" stroke-width="5" fill="#ffffff" fill-opacity="0.1"/>
      <polygon points="54,12 28,52 48,52 42,88 74,44 52,44" fill="#fbbf24" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'racing-stripe-logo',
    name: 'Fast Track 77',
    category: 'Racing',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="20" width="70" height="60" rx="8" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-width="3"/>
      <line x1="25" y1="35" x2="75" y2="35" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <text x="50" y="65" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="2">SOBRAL</text>
    </svg>`
  },
  {
    id: 'mountain-peak',
    name: 'Altitude Peak',
    category: 'Outdoor',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 4"/>
      <polygon points="50,22 75,70 25,70" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="3"/>
      <polygon points="50,22 62,45 50,40 38,45" fill="#ffffff"/>
      <polygon points="68,42 85,70 51,70" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="2"/>
    </svg>`
  }
];

// Convert SVG strings to usable Image objects or Data URLs
export function getLogoDataUrl(logoItem) {
  const encoded = encodeURIComponent(logoItem.svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
