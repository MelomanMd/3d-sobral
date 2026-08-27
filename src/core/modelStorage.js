// IndexedDB Persistent Storage for 3D Models (.glb) & AI Assets

const DB_NAME = 'Sobral3DStore';
const DB_VERSION = 1;
const STORE_MODELS = 'models_glb';
const STORE_IMAGES = 'images_cache';

class ModelStorageManager {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MODELS)) {
          db.createObjectStore(STORE_MODELS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB init error:', e);
        reject(e);
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  /**
   * Save a binary 3D model (Blob or ArrayBuffer) permanently
   */
  async saveModel(id, blobOrBuffer, metadata = {}) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_MODELS], 'readwrite');
      const store = tx.objectStore(STORE_MODELS);

      const record = {
        id,
        data: blobOrBuffer,
        timestamp: Date.now(),
        metadata
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  /**
   * Get a saved 3D model Blob and generate a persistent Object URL
   */
  async getModelBlobUrl(id) {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_MODELS], 'readonly');
      const store = tx.objectStore(STORE_MODELS);
      const req = store.get(id);

      req.onsuccess = (e) => {
        const record = e.target.result;
        if (record && record.data) {
          const blob = record.data instanceof Blob ? record.data : new Blob([record.data], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  }

  /**
   * Save image/texture asset
   */
  async saveImage(id, dataUrlOrBlob) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_IMAGES], 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);

      const record = {
        id,
        data: dataUrlOrBlob,
        timestamp: Date.now()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }

  /**
   * Get saved image
   */
  async getImage(id) {
    const db = await this.ensureDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_IMAGES], 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.get(id);

      req.onsuccess = (e) => {
        const record = e.target.result;
        resolve(record ? record.data : null);
      };

      req.onerror = () => resolve(null);
    });
  }
}

export const ModelStorage = new ModelStorageManager();
