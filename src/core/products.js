import { ModelStorage } from './modelStorage.js';

export const DEFAULT_PRODUCTS = [
  {
    id: 'sobral_workwear_tshirt',
    name: 'SOBRAL Workwear T-Shirt',
    category: 'tops',
    categoryName: 'T-Shirts & Trikots',
    price: '39.00 CHF',
    sku: 'SOB-TS-101',
    silhouette: 'tshirt',
    modelUrl: '/shirt_baked.glb',
    patternId: 'raglan_shoulder',
    baseColor: '#121316',
    accentColor: '#ff4400',
    colors: {
      primary: '#121316',
      accent: '#ff4400',
      collar: '#121316',
      secondary: '#ffffff'
    },
    frontPreview: '/images/blaklader_front.jpg',
    backPreview: '/images/blaklader_back.jpg',
    leftPreview: '/images/blaklader_left.jpg',
    rightPreview: '/images/blaklader_right.jpg',
    textureUrl: null,
    zones: {
      chest_center: { name: 'Brustmitte', u: 0.26, v: 0.23, defaultScale: 1.0, isFront: true },
      chest_left: { name: 'Linke Brust (Logo)', u: 0.33, v: 0.19, defaultScale: 0.5, isFront: true },
      chest_right: { name: 'Rechte Brust', u: 0.18, v: 0.19, defaultScale: 0.5, isFront: true },
      back_top: { name: 'Rücken: Name / Firma', u: 0.75, v: 0.14, defaultScale: 0.8, isFront: false },
      back_center: { name: 'Rücken: Großes Logo', u: 0.75, v: 0.22, defaultScale: 1.0, isFront: false },
      sleeve_left: { name: 'Linker Ärmel', u: 0.57, v: 0.75, defaultScale: 0.6, isFront: false },
      sleeve_right: { name: 'Rechter Ärmel', u: 0.14, v: 0.75, defaultScale: 0.6, isFront: true }
    }
  },
  {
    id: 'sobral_3300',
    articleNumber: '3300',
    name: 'SOBRAL T-Shirt (3300)',
    category: 'tops',
    categoryName: 'T-Shirts & Trikots',
    price: '34.00 CHF',
    sku: 'SOB-3300',
    silhouette: 'tshirt',
    modelUrl: '/models/sobral-3300.glb',
    isMultiMesh: true,
    baseColor: '#243249',
    accentColor: '#ff4400',
    colors: {
      primary: '#243249',
      accent: '#ff4400',
      collar: '#243249',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/3300-front.png',
    backPreview: '/previews/3300-back.png',
    leftPreview: '/previews/3300-side.png',
    rightPreview: '/previews/3300-side.png',
    materialRoles: ['fabric_primary', 'thread_primary', 'rib_trim'],
    zones: {
      chest_left: { name: 'Linke Brust (Logo)', isFront: true, defaultScale: 0.7, rayOrigin: [0.08, 0.12, 0.5] },
      chest_center: { name: 'Brustmitte', isFront: true, defaultScale: 1.0, rayOrigin: [0.0, 0.10, 0.5] },
      back_top: { name: 'Rücken oben', isFront: false, defaultScale: 0.8, rayOrigin: [0.0, 0.16, -0.5] },
      back_center: { name: 'Rückenmitte', isFront: false, defaultScale: 1.0, rayOrigin: [0.0, 0.06, -0.5] },
      sleeve_left: { name: 'Linker Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [0.28, 0.12, 0.0] },
      sleeve_right: { name: 'Rechter Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [-0.28, 0.12, 0.0] }
    }
  },
  {
    id: 'sobral_3340',
    articleNumber: '3340',
    name: 'SOBRAL Sweatshirt Pro (3340)',
    category: 'tops',
    categoryName: 'Sweatshirts & Pullover',
    price: '48.00 CHF',
    sku: 'SOB-3340',
    silhouette: 'sweatshirt',
    modelUrl: '/models/sobral-3340.glb',
    isMultiMesh: true,
    baseColor: '#c4c7c9',
    accentColor: '#ff4400',
    colors: {
      primary: '#c4c7c9',
      accent: '#ff4400',
      collar: '#adafb1',
      secondary: '#121316'
    },
    frontPreview: '/previews/3340-front.png',
    backPreview: '/previews/3340-back.png',
    leftPreview: '/previews/3340-side.png',
    rightPreview: '/previews/3340-side.png',
    materialRoles: ['fabric_primary', 'rib_trim', 'thread_primary'],
    zones: {
      chest_left: { name: 'Linke Brust (Logo)', isFront: true, defaultScale: 0.7, rayOrigin: [0.08, 0.12, 0.5] },
      chest_center: { name: 'Brustmitte', isFront: true, defaultScale: 1.0, rayOrigin: [0.0, 0.10, 0.5] },
      back_top: { name: 'Rücken oben', isFront: false, defaultScale: 0.8, rayOrigin: [0.0, 0.16, -0.5] },
      back_center: { name: 'Rückenmitte', isFront: false, defaultScale: 1.0, rayOrigin: [0.0, 0.06, -0.5] },
      sleeve_left: { name: 'Linker Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [0.28, 0.10, 0.0] },
      sleeve_right: { name: 'Rechter Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [-0.28, 0.10, 0.0] }
    }
  },
  {
    id: 'sobral_3362',
    articleNumber: '3362',
    name: 'SOBRAL Sweatjacke Reissverschluss (3362)',
    category: 'outerwear',
    categoryName: 'Jacken & Westen',
    price: '64.00 CHF',
    sku: 'SOB-3362',
    silhouette: 'jacket',
    modelUrl: '/models/sobral-3362.glb',
    isMultiMesh: true,
    baseColor: '#1c2430',
    accentColor: '#ff4400',
    colors: {
      primary: '#1c2430',
      accent: '#ff4400',
      collar: '#1c2430',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/3362-front.png',
    backPreview: '/previews/3362-back.png',
    leftPreview: '/previews/3362-side.png',
    rightPreview: '/previews/3362-side.png',
    materialRoles: ['fabric_primary', 'fabric_secondary', 'rib_trim', 'zipper'],
    zones: {
      chest_left: { name: 'Linke Brust (Logo)', isFront: true, defaultScale: 0.7, rayOrigin: [0.09, 0.11, 0.5] },
      chest_right: { name: 'Rechte Brust', isFront: true, defaultScale: 0.7, rayOrigin: [-0.09, 0.11, 0.5] },
      back_top: { name: 'Rücken oben', isFront: false, defaultScale: 0.8, rayOrigin: [0.0, 0.16, -0.5] },
      back_center: { name: 'Rückenmitte', isFront: false, defaultScale: 1.0, rayOrigin: [0.0, 0.06, -0.5] },
      sleeve_left: { name: 'Linker Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [0.28, 0.10, 0.0] }
    }
  },
  {
    id: 'sobral_3366',
    articleNumber: '3366',
    name: 'SOBRAL Sweatjacke Kapuze (3366)',
    category: 'outerwear',
    categoryName: 'Sweatshirts & Hoodies',
    price: '72.00 CHF',
    sku: 'SOB-3366',
    silhouette: 'hoodie',
    modelUrl: '/models/sobral-3366.glb',
    isMultiMesh: true,
    baseColor: '#181e28',
    accentColor: '#ff4400',
    colors: {
      primary: '#181e28',
      accent: '#ff4400',
      collar: '#181e28',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/3366-front.png',
    backPreview: '/previews/3366-back.png',
    leftPreview: '/previews/3366-side.png',
    rightPreview: '/previews/3366-side.png',
    materialRoles: ['fabric_primary', 'fabric_secondary', 'hood_lining', 'rib_trim', 'zipper'],
    zones: {
      chest_left: { name: 'Linke Brust (Logo)', isFront: true, defaultScale: 0.7, rayOrigin: [0.09, 0.10, 0.5] },
      chest_right: { name: 'Rechte Brust', isFront: true, defaultScale: 0.7, rayOrigin: [-0.09, 0.10, 0.5] },
      back_center: { name: 'Rückenmitte', isFront: false, defaultScale: 1.0, rayOrigin: [0.0, 0.04, -0.5] },
      hood: { name: 'Kapuze', isFront: false, defaultScale: 0.8, rayOrigin: [0.0, 0.26, -0.4] }
    }
  },
  {
    id: 'sobral_4890',
    articleNumber: '4890',
    name: 'SOBRAL Funktionsjacke (4890)',
    category: 'outerwear',
    categoryName: 'Arbeitsjacken',
    price: '119.00 CHF',
    sku: 'SOB-4890',
    silhouette: 'jacket',
    modelUrl: '/models/sobral-4890.glb',
    isMultiMesh: true,
    baseColor: '#15171a',
    accentColor: '#ff4400',
    colors: {
      primary: '#15171a',
      accent: '#ff4400',
      collar: '#15171a',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/4890-front.png',
    backPreview: '/previews/4890-back.png',
    leftPreview: '/previews/4890-side.png',
    rightPreview: '/previews/4890-side.png',
    materialRoles: ['fabric_primary', 'fabric_secondary', 'hood_lining', 'zipper'],
    zones: {
      chest_left: { name: 'Linke Brust (Logo)', isFront: true, defaultScale: 0.7, rayOrigin: [0.09, 0.10, 0.5] },
      chest_right: { name: 'Rechte Brust', isFront: true, defaultScale: 0.7, rayOrigin: [-0.09, 0.10, 0.5] },
      back_center: { name: 'Rückenmitte', isFront: false, defaultScale: 1.0, rayOrigin: [0.0, 0.06, -0.5] },
      sleeve_left: { name: 'Linker Ärmel', isFront: true, defaultScale: 0.6, rayOrigin: [0.28, 0.10, 0.0] }
    }
  },
  {
    id: 'sobral_1750',
    articleNumber: '1750',
    name: 'SOBRAL Handwerker-Arbeitshose (1750)',
    category: 'bottoms',
    categoryName: 'Arbeitshosen',
    price: '89.00 CHF',
    sku: 'SOB-1750',
    silhouette: 'trousers',
    modelUrl: '/models/sobral-1750.glb',
    isMultiMesh: true,
    baseColor: '#1a2232',
    accentColor: '#ff4400',
    colors: {
      primary: '#1a2232',
      accent: '#ff4400',
      collar: '#121418',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/1750-front.png',
    backPreview: '/previews/1750-back.png',
    leftPreview: '/previews/1750-side.png',
    rightPreview: '/previews/1750-side.png',
    materialRoles: ['fabric_primary', 'stretch_panels', 'reinforcement'],
    zones: {
      leg_left: { name: 'Linke Schenkeltasche', isFront: true, defaultScale: 0.7, rayOrigin: [0.14, 0.02, 0.4] },
      leg_right: { name: 'Rechte Schenkeltasche', isFront: true, defaultScale: 0.7, rayOrigin: [-0.14, 0.02, 0.4] },
      back_pocket: { name: 'Gesässtasche', isFront: false, defaultScale: 0.7, rayOrigin: [0.12, 0.15, -0.4] }
    }
  },
  {
    id: 'sobral_2003',
    articleNumber: '2003',
    name: 'SOBRAL Wintermütze (2003)',
    category: 'headwear',
    categoryName: 'Mützen & Caps',
    price: '24.00 CHF',
    sku: 'SOB-2003',
    silhouette: 'beanie',
    modelUrl: '/models/sobral-2003.glb',
    isMultiMesh: true,
    baseColor: '#121624',
    accentColor: '#ff4400',
    colors: {
      primary: '#121624',
      accent: '#ff4400',
      collar: '#121624',
      secondary: '#ffffff'
    },
    frontPreview: '/previews/2003-front.png',
    backPreview: '/previews/2003-back.png',
    leftPreview: '/previews/2003-side.png',
    rightPreview: '/previews/2003-side.png',
    materialRoles: ['fabric_primary', 'lining'],
    zones: {
      front: { name: 'Stirn (Logo)', isFront: true, defaultScale: 0.8, rayOrigin: [0.0, 0.04, 0.3] },
      side: { name: 'Seite', isFront: true, defaultScale: 0.6, rayOrigin: [0.15, 0.04, 0.0] }
    }
  },
  {
    id: 'sobral_whe00113',
    articleNumber: 'WHE00113',
    name: 'SOBRAL KASK PRIMERO AIR (WHE00113)',
    category: 'headwear',
    categoryName: 'Kopf- & Gehörschutz',
    price: '145.00 CHF',
    sku: 'SOB-WHE00113',
    silhouette: 'helmet',
    modelUrl: '/models/sobral-whe00113.glb',
    isMultiMesh: true,
    baseColor: '#e2e5e8',
    accentColor: '#ff4400',
    colors: {
      primary: '#e2e5e8',
      accent: '#ff4400',
      collar: '#1e2024',
      secondary: '#121316'
    },
    frontPreview: '/previews/WHE00113-front.png',
    backPreview: '/previews/WHE00113-back.png',
    leftPreview: '/previews/WHE00113-angle.png',
    rightPreview: '/previews/WHE00113-angle.png',
    materialRoles: ['shell_primary', 'emboss_white', 'hardware_black', 'hardware_orange', 'strap_webbing', 'liner_eps', 'clips_nylon'],
    zones: {
      crown: { name: 'Front Stirnplatte', isFront: true, defaultScale: 0.8, rayOrigin: [0.0, 0.05, 0.35] },
      side_left: { name: 'Linke Seite', isFront: true, defaultScale: 0.6, rayOrigin: [0.18, 0.04, 0.0] },
      side_right: { name: 'Rechte Seite', isFront: true, defaultScale: 0.6, rayOrigin: [-0.18, 0.04, 0.0] },
      back: { name: 'Hinterkopf', isFront: false, defaultScale: 0.7, rayOrigin: [0.0, 0.04, -0.35] }
    }
  }
];

export class ProductCatalog {
  constructor() {
    this.storageKey = 'sobral_custom_products';
    this.activeProductIdKey = 'sobral_active_product_id';
    this.products = this.loadProducts();
    const storedActiveId = localStorage.getItem(this.activeProductIdKey);
    this.activeProductId = (storedActiveId && storedActiveId !== 'sobral_person_01') ? storedActiveId : this.products[0].id;
    this.listeners = [];
  }

  loadProducts() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge defaults with custom products, excluding any obsolete person mannequin
          const customOnly = parsed.filter(p => p.id !== 'sobral_person_01' && !DEFAULT_PRODUCTS.some(d => d.id === p.id));
          return [...DEFAULT_PRODUCTS, ...customOnly];
        }
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage:', e);
    }
    return [...DEFAULT_PRODUCTS];
  }

  saveProducts() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Failed to save products:', e);
    }
  }

  async hydrateOfflineModels() {
    for (const p of this.products) {
      try {
        const savedBlobUrl = await ModelStorage.getModelBlobUrl(p.id);
        if (savedBlobUrl) {
          p.modelUrl = savedBlobUrl;
        }
        const savedFront = await ModelStorage.getImage(`${p.id}_front`);
        if (savedFront) {
          p.frontPreview = savedFront;
        }
        const savedBack = await ModelStorage.getImage(`${p.id}_back`);
        if (savedBack) {
          p.backPreview = savedBack;
        }
      } catch (e) {
        console.warn('Hydration error for product:', p.id, e);
      }
    }
  }

  getProducts() {
    return this.products;
  }

  getActiveProduct() {
    return this.products.find(p => p.id === this.activeProductId) || this.products[0];
  }

  setActiveProduct(id) {
    const found = this.products.find(p => p.id === id);
    if (found) {
      this.activeProductId = id;
      localStorage.setItem(this.activeProductIdKey, id);
      this.notifyListeners();
    }
  }

  addProduct(newProductData) {
    const id = 'custom_prod_' + Date.now();
    const product = {
      id,
      name: newProductData.name || 'Neues Produkt',
      category: newProductData.category || 'tops',
      categoryName: newProductData.categoryName || 'T-Shirts & Trikots',
      price: newProductData.price || '49.00 €',
      sku: newProductData.sku || `SOB-CUST-${Math.floor(100 + Math.random() * 900)}`,
      silhouette: newProductData.silhouette || 'tshirt',
      baseColor: newProductData.baseColor || '#741b2c',
      modelUrl: newProductData.modelUrl || '/shirt_baked.glb',
      frontPreview: newProductData.frontPreview || null,
      backPreview: newProductData.backPreview || null,
      textureUrl: newProductData.textureUrl || null,
      zones: newProductData.zones || DEFAULT_PRODUCTS[0].zones,
      createdAt: new Date().toISOString()
    };

    this.products.push(product);
    this.saveProducts();
    this.setActiveProduct(id);
    return product;
  }

  deleteProduct(id) {
    // Only allow deleting custom products
    if (DEFAULT_PRODUCTS.some(d => d.id === id)) return false;
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
    if (this.activeProductId === id) {
      this.setActiveProduct(this.products[0].id);
    } else {
      this.notifyListeners();
    }
    return true;
  }

  onProductChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    const active = this.getActiveProduct();
    this.listeners.forEach(cb => cb(active));
  }
}
