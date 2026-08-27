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
    id: 'sobral_tshirt_male',
    name: 'SOBRAL Pro Jersey',
    category: 'tops',
    categoryName: 'T-Shirts & Trikots',
    price: '49.00 €',
    sku: 'SOB-TS-01',
    silhouette: 'tshirt',
    modelUrl: '/shirt_baked.glb',
    patternId: 'vexa',
    baseColor: '#1e3a8a',
    accentColor: '#f59e0b',
    colors: {
      primary: '#1e3a8a',
      accent: '#f59e0b',
      collar: '#1e3a8a',
      secondary: '#ffffff'
    },
    frontPreview: null,
    backPreview: null,
    textureUrl: null,
    zones: {
      chest_center: { name: 'Brustmitte', u: 0.26, v: 0.23, defaultScale: 1.0, isFront: true },
      chest_left: { name: 'Linke Brust (Wappen)', u: 0.33, v: 0.19, defaultScale: 0.5, isFront: true },
      chest_right: { name: 'Rechte Brust', u: 0.18, v: 0.19, defaultScale: 0.5, isFront: true },
      back_top: { name: 'Rücken: Name', u: 0.75, v: 0.14, defaultScale: 0.8, isFront: false },
      back_number: { name: 'Rücken: Nummer', u: 0.75, v: 0.27, defaultScale: 1.3, isFront: false },
      back_center: { name: 'Rücken: Sponsor / Mitte', u: 0.75, v: 0.22, defaultScale: 1.0, isFront: false },
      sleeve_left: { name: 'Linker Ärmel', u: 0.57, v: 0.75, defaultScale: 0.6, isFront: false },
      sleeve_right: { name: 'Rechter Ärmel', u: 0.14, v: 0.75, defaultScale: 0.6, isFront: true }
    }
  },
  {
    id: 'sobral_shorts_sport',
    name: 'SOBRAL Match Shorts',
    category: 'bottoms',
    categoryName: 'Hosen & Shorts',
    price: '39.00 €',
    sku: 'SOB-SH-02',
    silhouette: 'shorts',
    modelUrl: '/shirt_baked.glb',
    frontPreview: null,
    backPreview: null,
    textureUrl: null,
    zones: {
      leg_left: { name: 'Linkes Hosenbein (Logo)', u: 0.28, v: 0.40, defaultScale: 0.6, isFront: true },
      leg_right: { name: 'Rechtes Hosenbein (Nummer)', u: 0.18, v: 0.40, defaultScale: 0.7, isFront: true },
      waist_back: { name: 'Rückseite Bund', u: 0.75, v: 0.15, defaultScale: 0.8, isFront: false }
    }
  },
  {
    id: 'sobral_hoodie_training',
    name: 'SOBRAL Club Hoodie',
    category: 'outerwear',
    categoryName: 'Sweatshirts & Hoodies',
    price: '69.00 €',
    sku: 'SOB-HD-03',
    silhouette: 'hoodie',
    modelUrl: '/shirt_baked.glb',
    frontPreview: null,
    backPreview: null,
    textureUrl: null,
    zones: {
      chest_center: { name: 'Brustmitte (Groß)', u: 0.26, v: 0.22, defaultScale: 1.1, isFront: true },
      chest_left: { name: 'Linke Brust (Logo)', u: 0.33, v: 0.18, defaultScale: 0.5, isFront: true },
      pocket: { name: 'Kängurutasche', u: 0.26, v: 0.35, defaultScale: 0.8, isFront: true },
      back_large: { name: 'Rückenprint', u: 0.75, v: 0.22, defaultScale: 1.2, isFront: false }
    }
  }
];

export class ProductCatalog {
  constructor() {
    this.storageKey = 'sobral_custom_products';
    this.activeProductIdKey = 'sobral_active_product_id';
    this.products = this.loadProducts();
    this.activeProductId = localStorage.getItem(this.activeProductIdKey) || this.products[0].id;
    this.listeners = [];
  }

  loadProducts() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge defaults with custom products
          const customOnly = parsed.filter(p => !DEFAULT_PRODUCTS.some(d => d.id === p.id));
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
