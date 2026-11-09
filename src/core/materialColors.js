// One source of truth for editable material roles and the matching UI controls.
// Do not invent independently editable parts for single-material scans.
const DEFINITIONS = [
  { id: 'primary', name: 'Hauptstoff', sub: 'Grundfarbe', icon: 'shirt', roles: ['fabric_primary', 'thread_primary', 'shell_primary', 'knit_shell', 'trousers_mainshell', 'shirt'] },
  { id: 'accent', name: 'Kontraste & Einsätze', sub: 'Separate Kontrastmaterialien', icon: 'layers', roles: ['fabric_secondary', 'shell_secondary', 'hood_lining', 'stretch_panels', 'reinforcement', 'hardware_orange', 'emboss_white', 'label'] },
  { id: 'collar', name: 'Bündchen & Details', sub: 'Separate Rand- und Innenmaterialien', icon: 'sparkles', roles: ['rib_trim', 'collar', 'lining', 'shirt_trim', 'strap_webbing', 'headband', 'hardware_black'] }
];

export function getMaterialColorControls(product, availableRoles) {
  const available = new Set(availableRoles);
  if (product?.colorMaterials) {
    return Object.entries(product.colorMaterials)
      .map(([id, roles]) => ({ id, roles: roles.filter(role => available.has(role)), name: 'Grundfarbe', sub: 'Ein zusammenhängendes Material', icon: 'palette' }))
      .filter(control => control.roles.length);
  }
  if (product?.silhouette === 'worker') {
    return [
      { id: 'helmet', name: 'Schutzhelm', sub: 'Helmschale', icon: 'shield', roles: ['helmet'] },
      { id: 'primary', name: 'Arbeitsjacke', sub: 'Jacke & Ärmel', icon: 'shirt', roles: ['fabric_primary'] },
      { id: 'trousers', name: 'Arbeitshose', sub: 'Hose & Beine', icon: 'scissors', roles: ['trousers'] },
      { id: 'boots', name: 'Arbeitsschuhe', sub: 'Sicherheitsschuhe', icon: 'footprints', roles: ['boots'] }
    ].map(control => ({ ...control, roles: control.roles.filter(role => available.has(role)) }))
      .filter(control => control.roles.length);
  }
  if (product?.silhouette === 'helmet') {
    return [
      { id: 'primary', name: 'Helmschale', sub: 'Hauptfarbe der Schale', icon: 'shield', roles: ['shell_primary'] },
      { id: 'accent', name: 'Akzente & Beschläge', sub: 'Orange Beschläge & Prägung', icon: 'layers', roles: ['hardware_orange', 'emboss_white'] },
      { id: 'collar', name: 'Kinnriemen & Kopfband', sub: 'Riemen, Kopfband & dunkle Beschläge', icon: 'sparkles', roles: ['strap_webbing', 'headband', 'hardware_black'] }
    ].map(control => ({ ...control, roles: control.roles.filter(role => available.has(role)) }))
      .filter(control => control.roles.length);
  }
  return DEFINITIONS.map(control => ({ ...control, roles: control.roles.filter(role => available.has(role)) }))
    .filter(control => control.roles.length);
}
