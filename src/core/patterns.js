import { t } from './i18n.js';

export const PATTERNS = [
  {
    id: 'raglan_shoulder',
    getName: () => t('pattern_raglan_shoulder') || 'Kontrast-Schultern (Blåkläder)',
    name: 'Kontrast-Schultern (Blåkläder)',
    render: renderRaglanShoulderPattern
  },
  {
    id: 'solid',
    getName: () => t('pattern_solid'),
    name: 'Klassisch Einfarbig',
    render: renderSolidPattern
  },
  {
    id: 'vexa',
    getName: () => t('pattern_vexa'),
    name: 'Vexa Sport',
    render: renderVexaPattern
  },
  {
    id: 'racing',
    getName: () => t('pattern_racing'),
    name: 'Speed Racing',
    render: renderRacingPattern
  },
  {
    id: 'cyber_hex',
    getName: () => t('pattern_cyber_hex'),
    name: 'Cyber Mesh / Hex',
    render: renderHexPattern
  },
  {
    id: 'gradient',
    getName: () => t('pattern_gradient'),
    name: 'Gradient Flow',
    render: renderGradientPattern
  }
];

function renderRaglanShoulderPattern(ctx, width, height, colors) {
  // 1. Base primary color (Body & Sleeves)
  ctx.fillStyle = colors.primary || '#1b2034';
  ctx.fillRect(0, 0, width, height);

  // 2. Accent color for contrast shoulder inserts
  ctx.fillStyle = colors.accent || '#5b6c84';

  // Front Left Shoulder Wedge (Raglan cut from collar to armhole)
  ctx.beginPath();
  ctx.moveTo(width * 0.19, height * 0.085);
  ctx.lineTo(width * 0.12, height * 0.085);
  ctx.lineTo(width * 0.035, height * 0.19);
  ctx.lineTo(width * 0.09, height * 0.23);
  ctx.lineTo(width * 0.17, height * 0.16);
  ctx.closePath();
  ctx.fill();

  // Front Right Shoulder Wedge (Raglan cut from collar to armhole)
  ctx.beginPath();
  ctx.moveTo(width * 0.31, height * 0.085);
  ctx.lineTo(width * 0.38, height * 0.085);
  ctx.lineTo(width * 0.465, height * 0.19);
  ctx.lineTo(width * 0.41, height * 0.23);
  ctx.lineTo(width * 0.33, height * 0.16);
  ctx.closePath();
  ctx.fill();

  // Back Left Shoulder Wedge
  ctx.beginPath();
  ctx.moveTo(width * 0.69, height * 0.085);
  ctx.lineTo(width * 0.62, height * 0.085);
  ctx.lineTo(width * 0.535, height * 0.19);
  ctx.lineTo(width * 0.59, height * 0.23);
  ctx.lineTo(width * 0.67, height * 0.16);
  ctx.closePath();
  ctx.fill();

  // Back Right Shoulder Wedge
  ctx.beginPath();
  ctx.moveTo(width * 0.81, height * 0.085);
  ctx.lineTo(width * 0.88, height * 0.085);
  ctx.lineTo(width * 0.965, height * 0.19);
  ctx.lineTo(width * 0.91, height * 0.23);
  ctx.lineTo(width * 0.83, height * 0.16);
  ctx.closePath();
  ctx.fill();

  // 3. Subtle realistic seam stitching lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 3;
  // Front left seam
  ctx.beginPath();
  ctx.moveTo(width * 0.19, height * 0.085);
  ctx.lineTo(width * 0.09, height * 0.23);
  ctx.stroke();
  // Front right seam
  ctx.beginPath();
  ctx.moveTo(width * 0.31, height * 0.085);
  ctx.lineTo(width * 0.41, height * 0.23);
  ctx.stroke();

  // 4. Collar rib
  ctx.fillStyle = colors.collar || colors.primary || '#1b2034';
  ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);
}

function renderSolidPattern(ctx, width, height, colors) {
  // 1. Base solid primary fills entire canvas cleanly
  ctx.fillStyle = colors.primary || '#1b2034';
  ctx.fillRect(0, 0, width, height);

  // 2. Collar band (if explicitly set)
  if (colors.collar && colors.collar !== colors.primary) {
    ctx.fillStyle = colors.collar;
    ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);
  }
}

function renderVexaPattern(ctx, width, height, colors) {
  // 1. Base primary color
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, width, height);

  // 2. Vexa Angular Geometric Chevrons & Slashes (Jakroo signature style)
  // Front Body is roughly x: 0.05*w to 0.45*w, y: 0.08*h to 0.5*h
  // Back Body is roughly x: 0.55*w to 0.95*w, y: 0.08*h to 0.5*h

  // Front Vexa Slashes
  ctx.save();
  ctx.fillStyle = colors.accent;

  // Upper Front Dynamic Slash
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.18);
  ctx.lineTo(width * 0.42, height * 0.28);
  ctx.lineTo(width * 0.42, height * 0.33);
  ctx.lineTo(width * 0.08, height * 0.23);
  ctx.closePath();
  ctx.fill();

  // Lower Front Sharp Angular Wing
  ctx.fillStyle = colors.secondary || '#ffffff';
  ctx.beginPath();
  ctx.moveTo(width * 0.12, height * 0.24);
  ctx.lineTo(width * 0.38, height * 0.32);
  ctx.lineTo(width * 0.38, height * 0.34);
  ctx.lineTo(width * 0.12, height * 0.26);
  ctx.closePath();
  ctx.fill();

  // Dynamic side panel flanks (Front)
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.30);
  ctx.lineTo(width * 0.18, height * 0.44);
  ctx.lineTo(width * 0.14, height * 0.45);
  ctx.lineTo(width * 0.06, height * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width * 0.42, height * 0.30);
  ctx.lineTo(width * 0.32, height * 0.44);
  ctx.lineTo(width * 0.36, height * 0.45);
  ctx.lineTo(width * 0.44, height * 0.32);
  ctx.closePath();
  ctx.fill();

  // BACK Vexa Slashes
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(width * 0.58, height * 0.28);
  ctx.lineTo(width * 0.92, height * 0.18);
  ctx.lineTo(width * 0.92, height * 0.23);
  ctx.lineTo(width * 0.58, height * 0.33);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.secondary || '#ffffff';
  ctx.beginPath();
  ctx.moveTo(width * 0.62, height * 0.32);
  ctx.lineTo(width * 0.88, height * 0.24);
  ctx.lineTo(width * 0.88, height * 0.26);
  ctx.lineTo(width * 0.62, height * 0.34);
  ctx.closePath();
  ctx.fill();

  // Sleeves accents
  ctx.fillStyle = colors.accent;
  ctx.fillRect(width * 0.46, height * 0.68, width * 0.22, height * 0.08);
  ctx.fillRect(width * 0.03, height * 0.68, width * 0.22, height * 0.08);

  ctx.fillStyle = colors.secondary || '#ffffff';
  ctx.fillRect(width * 0.46, height * 0.77, width * 0.22, height * 0.03);
  ctx.fillRect(width * 0.03, height * 0.77, width * 0.22, height * 0.03);

  // Collar
  ctx.fillStyle = colors.collar;
  ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);

  ctx.restore();
}

function renderRacingPattern(ctx, width, height, colors) {
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  // Dual center racing stripes on Front (center at u=0.26)
  const frontCenter = width * 0.26;
  const stripeWidth = width * 0.022;
  const gap = width * 0.012;

  ctx.fillStyle = colors.accent;
  ctx.fillRect(frontCenter - stripeWidth - gap / 2, height * 0.05, stripeWidth, height * 0.45);
  ctx.fillRect(frontCenter + gap / 2, height * 0.05, stripeWidth, height * 0.45);

  // Thin outer pin-stripes
  ctx.fillStyle = colors.secondary || '#ffffff';
  ctx.fillRect(frontCenter - stripeWidth * 2 - gap, height * 0.05, width * 0.005, height * 0.45);
  ctx.fillRect(frontCenter + stripeWidth * 2 + gap, height * 0.05, width * 0.005, height * 0.45);

  // Speed angle dashes on side
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 5; i++) {
    const y = height * (0.28 + i * 0.03);
    ctx.beginPath();
    ctx.moveTo(width * 0.10, y);
    ctx.lineTo(width * 0.16, y - height * 0.015);
    ctx.lineTo(width * 0.15, y - height * 0.022);
    ctx.lineTo(width * 0.09, y - height * 0.007);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.42, y);
    ctx.lineTo(width * 0.36, y - height * 0.015);
    ctx.lineTo(width * 0.37, y - height * 0.022);
    ctx.lineTo(width * 0.43, y - height * 0.007);
    ctx.closePath();
    ctx.fill();
  }

  // Dual center stripes on Back (center at u=0.75)
  const backCenter = width * 0.75;
  ctx.fillStyle = colors.accent;
  ctx.fillRect(backCenter - stripeWidth - gap / 2, height * 0.05, stripeWidth, height * 0.45);
  ctx.fillRect(backCenter + gap / 2, height * 0.05, stripeWidth, height * 0.45);

  ctx.fillStyle = colors.secondary || '#ffffff';
  ctx.fillRect(backCenter - stripeWidth * 2 - gap, height * 0.05, width * 0.005, height * 0.45);
  ctx.fillRect(backCenter + stripeWidth * 2 + gap, height * 0.05, width * 0.005, height * 0.45);

  // Sleeve cuffs
  ctx.fillStyle = colors.accent;
  ctx.fillRect(width * 0.46, height * 0.82, width * 0.22, height * 0.06);
  ctx.fillRect(width * 0.03, height * 0.82, width * 0.22, height * 0.06);

  // Collar
  ctx.fillStyle = colors.collar;
  ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);

  ctx.restore();
}

function renderHexPattern(ctx, width, height, colors) {
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  // Draw subtle hexagonal mesh overlay
  const hexRadius = 18;
  const hexHeight = hexRadius * Math.sqrt(3);
  const hexWidth = hexRadius * 2;

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.25;

  function drawHex(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + r * Math.cos(angle);
      const hy = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Draw hexes in front area and back area
  for (let x = width * 0.08; x < width * 0.44; x += hexWidth * 0.75) {
    for (let y = height * 0.12; y < height * 0.44; y += hexHeight) {
      const offsetY = ((Math.floor(x / (hexWidth * 0.75)) % 2) * hexHeight) / 2;
      drawHex(x, y + offsetY, hexRadius);
    }
  }

  for (let x = width * 0.57; x < width * 0.93; x += hexWidth * 0.75) {
    for (let y = height * 0.12; y < height * 0.44; y += hexHeight) {
      const offsetY = ((Math.floor(x / (hexWidth * 0.75)) % 2) * hexHeight) / 2;
      drawHex(x, y + offsetY, hexRadius);
    }
  }

  ctx.globalAlpha = 1.0;

  // Solid accent shoulders & side panels
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  // Front shoulder accents
  ctx.moveTo(width * 0.10, height * 0.08);
  ctx.lineTo(width * 0.22, height * 0.14);
  ctx.lineTo(width * 0.16, height * 0.18);
  ctx.lineTo(width * 0.06, height * 0.12);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width * 0.42, height * 0.08);
  ctx.lineTo(width * 0.30, height * 0.14);
  ctx.lineTo(width * 0.36, height * 0.18);
  ctx.lineTo(width * 0.46, height * 0.12);
  ctx.closePath();
  ctx.fill();

  // Collar & sleeves
  ctx.fillStyle = colors.collar;
  ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);

  ctx.fillStyle = colors.accent;
  ctx.fillRect(width * 0.46, height * 0.70, width * 0.22, height * 0.08);
  ctx.fillRect(width * 0.03, height * 0.70, width * 0.22, height * 0.08);

  ctx.restore();
}

function renderGradientPattern(ctx, width, height, colors) {
  // Front gradient
  const frontGrad = ctx.createLinearGradient(width * 0.26, height * 0.05, width * 0.26, height * 0.48);
  frontGrad.addColorStop(0, colors.primary);
  frontGrad.addColorStop(0.5, colors.accent);
  frontGrad.addColorStop(1, colors.secondary || colors.primary);

  ctx.fillStyle = frontGrad;
  ctx.fillRect(0, 0, width * 0.5, height * 0.52);

  // Back gradient
  const backGrad = ctx.createLinearGradient(width * 0.75, height * 0.05, width * 0.75, height * 0.48);
  backGrad.addColorStop(0, colors.primary);
  backGrad.addColorStop(0.5, colors.accent);
  backGrad.addColorStop(1, colors.secondary || colors.primary);

  ctx.fillStyle = backGrad;
  ctx.fillRect(width * 0.5, 0, width * 0.5, height * 0.52);

  // Sleeves & other zones
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);

  ctx.fillStyle = colors.accent;
  ctx.fillRect(width * 0.46, height * 0.65, width * 0.22, height * 0.2);
  ctx.fillRect(width * 0.03, height * 0.65, width * 0.22, height * 0.2);

  ctx.fillStyle = colors.collar;
  ctx.fillRect(0, height * 0.94, width * 0.5, height * 0.05);
}
