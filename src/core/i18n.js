// Internationalization (i18n) Module
// Supported: 'de' (German, default), 'en' (English)

export const translations = {
  de: {
    // Header
    prototype_badge: 'PROTOTYP',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    theme_dark: 'Dunkel',
    theme_light: 'Hell',
    random_design: 'Zufälliges Design',
    load_project: 'Laden',
    download_mockup: '3D-Mockup',
    add_product_btn: '+ Neues Produkt',
    select_product: 'Produkt wählen',
    product_catalog: 'Produktkatalog',

    // Viewport Hint
    viewport_hint: 'Linksklick: 360° Drehen • Elemente mit Maus ziehen • Mausrad: Zoom',

    // View Controls
    view_front: 'Vorne',
    view_back: 'Hinten',
    view_left: 'Links',
    view_right: 'Rechts',
    view_3d: '3D-Ansicht',
    view_spin: '360° Drehung',
    fullscreen_enter: 'Vollbildmodus',
    fullscreen_exit: 'Vollbild beenden',

    // Floating Gizmo
    gizmo_selected_hint: 'Ausgewählt zum Verschieben & Skalieren',
    gizmo_size: 'Größe:',
    gizmo_decrease: 'Verkleinern',
    gizmo_increase: 'Vergrößern',
    gizmo_rot_ccw: 'Gegen Uhrzeigersinn drehen (-15°)',
    gizmo_rot_cw: 'Im Uhrzeigersinn drehen (+15°)',
    gizmo_delete: 'Ebene löschen',
    gizmo_deselect: 'Auswahl aufheben',

    // Tabs
    tab_colors: 'Farben & Stil',
    tab_text: 'Text & Nummer',
    tab_logos: 'Logos',

    // Colors Panel
    section_pattern: 'Sportstil (Muster)',
    section_color_zone: 'Farbzonen',
    zone_primary: 'Hauptteil (Körper)',
    zone_accent: 'Akzente (Einsätze)',
    zone_collar: 'Kragen',
    zone_secondary: 'Kanten / Linien',
    section_palette: 'Sport-Farbpalette',

    // Patterns
    pattern_vexa: 'Vexa Sport (Jakroo)',
    pattern_racing: 'Speed Racing',
    pattern_cyber_hex: 'Cyber Waben / Hex',
    pattern_gradient: 'Farbverlauf Flow',
    pattern_solid: 'Klassisch Einfarbig',
    pattern_raglan_shoulder: 'Kontrast-Schultern / Raglan (Blåkläder)',

    // Text Panel
    text_drag_hint_de: 'Maus über den Text auf dem 3D-Trikot bewegen und <b>mit der Maus verschieben</b>!',
    section_texts_title: 'Beschriftungen & Nummern',
    btn_add_text: '+ Hinzufügen',
    no_text: 'Kein Text',
    label_text_val: 'Textinhalt',
    label_text_zone: 'Platzierungsbereich',
    label_font: 'Schriftart',
    label_text_color: 'Textfarbe',
    label_stroke_color: 'Konturfarbe',
    label_stroke_width: 'Konturstärke (Outline)',
    label_font_size: 'Schriftgröße',
    label_arc_curve: 'Bogenwölbung (Arc / Curve)',
    label_rotation: 'Drehwinkel',
    label_offset_x: 'Versatz X',
    label_offset_y: 'Versatz Y',

    // Placement Zones
    zone_chest_center: 'Brustmitte',
    zone_chest_left: 'Linke Brust (Wappen)',
    zone_chest_right: 'Rechte Brust',
    zone_back_top: 'Rücken: Name',
    zone_back_number: 'Rücken: Nummer',
    zone_back_center: 'Rücken: Sponsor / Mitte',
    zone_sleeve_left: 'Linker Ärmel',
    zone_sleeve_right: 'Rechter Ärmel',

    // Logo Panel
    logo_drag_hint_de: 'Maus über das Logo auf dem 3D-Trikot bewegen und <b>mit der Maus verschieben</b>!',
    section_upload_logo: 'Eigenes Logo hochladen',
    drop_text: 'PNG / SVG hierher ziehen oder klicken',
    drop_hint: 'Empfohlen: PNG mit transparentem Hintergrund',
    section_logo_library: 'Sportembleme-Bibliothek',
    section_logo_layers: 'Logo-Ebenen',
    section_selected_logo: 'Einstellungen des ausgewählten Logos',
    label_color_filter: 'Farbfilter (Monochrom / Tönung)',
    tint_original: 'Original',
    tint_white: 'Weiß',
    tint_black: 'Schwarz',
    tint_gold: 'Gold',
    tint_red: 'Rot',
    tint_neon: 'Neon',
    label_scale: 'Maßstab (Größe)',
    label_opacity: 'Deckkraft',

    // Export Modal
    modal_badge: '3D Multi-Angle Spezifikation & Mockup',
    modal_title: 'Spezifikation und Produktions-Mockup',
    front_view: 'Vorderseite (Front)',
    back_view: 'Rückseite (Back)',
    download_front: 'Vorderseite (PNG)',
    download_back: 'Rückseite (PNG)',
    download_composite: 'Komplettes Mockup herunterladen (Vorne + Hinten HD)',
    download_project_json: 'Projektdatei (.json) herunterladen',
    copy_spec: 'Spezifikation kopieren',
    copied_success: 'In die Zwischenablage kopiert!',
    generating_mockup: '2K-Mockup wird generiert...',
    spec_color_scheme: 'Farbschema',
    spec_texts_numbers: 'Texte & Nummern',
    spec_logos_graphics: 'Logos & Grafiken',
    no_texts: 'Keine Texte vorhanden',
    no_logos: 'Keine Logos vorhanden',
    mockup_header: 'SOBRAL 3D TRIKOT-MOCKUP',
    mockup_subheader: 'Spezifikation und Produktionsmuster',
    spec_summary_header: '--- SOBRAL 3D TRIKOT SPEZIFIKATION ---',

    // Import Modal
    import_modal_badge: 'Design & Daten Import',
    import_modal_title: 'Projekt laden oder Vorlage wählen',
    import_file_tab: 'Datei (.json)',
    import_presets_tab: 'Design-Vorlagen',
    import_paste_tab: 'JSON einfügen',
    import_drop_title: 'Projektdatei (.json) hier ablegen',
    import_drop_hint: 'oder klicken, um eine .json Datei auszuwählen',
    import_paste_placeholder: 'Fügen Sie hier den exportierten JSON-Code ein...',
    import_apply_btn: 'Design anwenden',
    import_success: 'Design erfolgreich geladen!',
    import_error_invalid: 'Ungültige Projektdatei! Bitte überprüfen Sie das JSON-Format.',

    // Add Product Modal
    add_product_badge: 'Neues Produkt',
    add_product_title: 'Neues Produkt aus Fotos / Bildern erstellen',
    add_product_subtitle: 'Laden Sie Produktfotos hoch und konfigurieren Sie die 3D-Anpassungsbereiche',
    label_product_name: 'Produktname',
    label_product_cat: 'Kategorie',
    label_product_price: 'Basispreis (€)',
    label_product_sku: 'Artikelnummer (SKU)',
    label_product_silhouette: '3D-Passform & Schnitt',
    cat_tops: 'T-Shirts, Trikots & Tops',
    cat_bottoms: 'Hosen, Leggings & Shorts',
    cat_outerwear: 'Hoodies, Jacken & Pullover',
    cat_accessories: 'Caps & Zubehör',
    sil_tshirt: 'T-Shirt / Sporttrikot',
    sil_shorts: 'Sportshorts / Kurze Hose',
    sil_hoodie: 'Hoodie / Kapuzenpullover',
    slot_front_title: '1. Vorderansicht (Front-Bild)',
    slot_front_desc: 'Foto des Produkts von vorne. Wird für das Hauptmodell & Brustplatzierungen genutzt.',
    slot_back_title: '2. Rückansicht (Back-Bild)',
    slot_back_desc: 'Foto des Produkts von hinten für Rückennummern, Spielernamen und Sponsoren.',
    slot_texture_title: '3. Stoffmuster / Textur (Optional)',
    slot_texture_desc: 'Nahtloses Muster oder Stofftextur, die auf die 3D-Oberfläche gemappt wird.',
    slot_preview_title: '4. Shop-Katalogbild (Optional)',
    slot_preview_desc: 'Foto für die Produktkarte und Galerie im Shop-Katalog.',
    btn_choose_file: 'Bild auswählen oder ablegen',
    btn_create_product: 'Produkt erstellen & im 3D-Studio öffnen',
    product_created_success: 'Produkt erfolgreich zum Katalog hinzugefügt!'
  },
  en: {
    // Header
    prototype_badge: 'PROTOTYPE',
    undo: 'Undo',
    redo: 'Redo',
    theme_dark: 'Dark',
    theme_light: 'Light',
    random_design: 'Random Design',
    load_project: 'Load',
    download_mockup: '3D Mockup',
    add_product_btn: '+ Add Product',
    select_product: 'Select Product',
    product_catalog: 'Product Catalog',

    // Viewport Hint
    viewport_hint: 'Left click: 360° Rotate • Drag elements with mouse • Scroll: Zoom',

    // View Controls
    view_front: 'Front',
    view_back: 'Back',
    view_left: 'Left',
    view_right: 'Right',
    view_3d: '3D View',
    view_spin: '360° Spin',
    fullscreen_enter: 'Fullscreen',
    fullscreen_exit: 'Exit Fullscreen',

    // Floating Gizmo
    gizmo_selected_hint: 'Selected for moving & scaling',
    gizmo_size: 'Size:',
    gizmo_decrease: 'Decrease',
    gizmo_increase: 'Increase',
    gizmo_rot_ccw: 'Rotate Counter-Clockwise (-15°)',
    gizmo_rot_cw: 'Rotate Clockwise (+15°)',
    gizmo_delete: 'Delete layer',
    gizmo_deselect: 'Deselect',

    // Tabs
    tab_colors: 'Colors & Style',
    tab_text: 'Text & Number',
    tab_logos: 'Logos',

    // Colors Panel
    section_pattern: 'Sport Style (Pattern)',
    section_color_zone: 'Color Zones',
    zone_primary: 'Main Body',
    zone_accent: 'Accents (Panels)',
    zone_collar: 'Collar',
    zone_secondary: 'Trim / Lines',
    section_palette: 'Sports Palette',

    // Patterns
    pattern_vexa: 'Vexa Sport (Jakroo)',
    pattern_racing: 'Speed Racing',
    pattern_cyber_hex: 'Cyber Mesh / Hex',
    pattern_gradient: 'Gradient Flow',
    pattern_solid: 'Clean Solid',
    pattern_raglan_shoulder: 'Contrast Shoulders / Raglan (Blåkläder)',

    // Text Panel
    text_drag_hint_de: 'Hover over text on the 3D jersey and <b>drag with mouse</b>!',
    section_texts_title: 'Texts & Numbers',
    btn_add_text: '+ Add Text',
    no_text: 'No Text',
    label_text_val: 'Text Content',
    label_text_zone: 'Placement Zone',
    label_font: 'Font Family',
    label_text_color: 'Text Color',
    label_stroke_color: 'Outline Color',
    label_stroke_width: 'Outline Width (Stroke)',
    label_font_size: 'Font Size',
    label_arc_curve: 'Arc Curve',
    label_rotation: 'Rotation Angle',
    label_offset_x: 'Offset X',
    label_offset_y: 'Offset Y',

    // Placement Zones
    zone_chest_center: 'Chest Center',
    zone_chest_left: 'Left Chest (Badge)',
    zone_chest_right: 'Right Chest',
    zone_back_top: 'Back: Name',
    zone_back_number: 'Back: Number',
    zone_back_center: 'Back: Sponsor / Center',
    zone_sleeve_left: 'Left Sleeve',
    zone_sleeve_right: 'Right Sleeve',

    // Logo Panel
    logo_drag_hint_de: 'Hover over the logo on the 3D jersey and <b>drag with mouse</b>!',
    section_upload_logo: 'Upload Your Logo',
    drop_text: 'Drag PNG / SVG here or click to browse',
    drop_hint: 'Recommended: PNG with transparent background',
    section_logo_library: 'Sports Emblem Library',
    section_logo_layers: 'Logo Layers',
    section_selected_logo: 'Selected Logo Settings',
    label_color_filter: 'Color Filter (Monochrome / Tint)',
    tint_original: 'Original',
    tint_white: 'White',
    tint_black: 'Black',
    tint_gold: 'Gold',
    tint_red: 'Red',
    tint_neon: 'Neon',
    label_scale: 'Scale (Size)',
    label_opacity: 'Opacity',

    // Export Modal
    modal_badge: '3D Multi-Angle Spec & Mockup',
    modal_title: 'Specification & Production Mockup',
    front_view: 'Front View',
    back_view: 'Back View',
    download_front: 'Front View (PNG)',
    download_back: 'Back View (PNG)',
    download_composite: 'Download Full Mockup (Front + Back HD)',
    download_project_json: 'Download Project File (.json)',
    copy_spec: 'Copy Specification',
    copied_success: 'Copied to clipboard!',
    generating_mockup: 'Generating 2K Mockup...',
    spec_color_scheme: 'Color Scheme',
    spec_texts_numbers: 'Texts & Numbers',
    spec_logos_graphics: 'Logos & Graphics',
    no_texts: 'No texts added',
    no_logos: 'No logos added',
    mockup_header: 'SOBRAL 3D JERSEY MOCKUP',
    mockup_subheader: 'Specification and Production Sample',
    spec_summary_header: '--- SOBRAL 3D JERSEY SPECIFICATION ---',

    // Import Modal
    import_modal_badge: 'Design & Data Import',
    import_modal_title: 'Load Project or Choose Template',
    import_file_tab: 'File (.json)',
    import_presets_tab: 'Design Templates',
    import_paste_tab: 'Paste JSON',
    import_drop_title: 'Drop project file (.json) here',
    import_drop_hint: 'or click to browse a .json file',
    import_paste_placeholder: 'Paste exported JSON configuration here...',
    import_apply_btn: 'Apply Design',
    import_success: 'Design loaded successfully!',
    import_error_invalid: 'Invalid project file! Please check the JSON format.',

    // Add Product Modal
    add_product_badge: 'New Product',
    add_product_title: 'Create New Product from Photos / Images',
    add_product_subtitle: 'Upload product photos and configure 3D customizer zones',
    label_product_name: 'Product Name',
    label_product_cat: 'Category',
    label_product_price: 'Base Price (€)',
    label_product_sku: 'SKU / Article',
    label_product_silhouette: '3D Fit & Silhouette',
    cat_tops: 'T-Shirts, Jerseys & Tops',
    cat_bottoms: 'Pants, Leggings & Shorts',
    cat_outerwear: 'Hoodies, Jackets & Sweatshirts',
    cat_accessories: 'Caps & Accessories',
    sil_tshirt: 'T-Shirt / Sport Jersey',
    sil_shorts: 'Athletic Shorts / Trunks',
    sil_hoodie: 'Hoodie / Pullover',
    slot_front_title: '1. Front View (Photo)',
    slot_front_desc: 'Photo of the item from the front. Used for main model & chest graphics.',
    slot_back_title: '2. Back View (Photo)',
    slot_back_desc: 'Photo of the item from the back for player numbers, names, and sponsor logos.',
    slot_texture_title: '3. Fabric Texture / Pattern (Optional)',
    slot_texture_desc: 'Seamless fabric texture or pattern mapped onto the 3D surface.',
    slot_preview_title: '4. Shop Catalog Card (Optional)',
    slot_preview_desc: 'Display picture for the product card in the store catalog.',
    btn_choose_file: 'Choose or drop image',
    btn_create_product: 'Create Product & Open in 3D Studio',
    product_created_success: 'Product successfully added to catalog!'
  }
};

let currentLang = localStorage.getItem('sobral_lang') || 'de';
const listeners = [];

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('sobral_lang', lang);
    listeners.forEach(cb => cb(lang));
  }
}

export function t(key) {
  const dict = translations[currentLang] || translations.de;
  return dict[key] || translations.en[key] || key;
}

export function onLangChange(callback) {
  listeners.push(callback);
}
