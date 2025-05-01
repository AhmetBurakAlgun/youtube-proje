import ErrorHandler from './errorHandler.js';

// Önbellek yapısı
const cache = {
  channels: new Map(),
  banners: new Map(),
  thumbnails: new Map(),
  maxAge: 24 * 60 * 60 * 1000, // 24 saat
  db: null,
  dbName: 'youtuberCache',
  dbVersion: 1
};

// Cache hataları için hata yönetimi
const handleCacheError = (error, context = {}) => {
  return ErrorHandler.handleError(error, ErrorHandler.CATEGORIES.CACHE, ErrorHandler.LEVELS.ERROR, context);
};

// IndexedDB başlatma
async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(cache.dbName, cache.dbVersion);

    request.onerror = () => {
      console.error('IndexedDB başlatılamadı:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      cache.db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Kanal verileri için store
      if (!db.objectStoreNames.contains('channels')) {
        db.createObjectStore('channels', { keyPath: 'id' });
      }
      
      // Banner URL'leri için store
      if (!db.objectStoreNames.contains('banners')) {
        db.createObjectStore('banners', { keyPath: 'id' });
      }
      
      // Thumbnail URL'leri için store
      if (!db.objectStoreNames.contains('thumbnails')) {
        db.createObjectStore('thumbnails', { keyPath: 'id' });
      }
    };
  });
}

// IndexedDB'den veri okuma
async function getFromIndexedDB(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = cache.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      const data = request.result;
      if (data && Date.now() - data.timestamp < cache.maxAge) {
        resolve(data.value);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error('IndexedDB okuma hatası:', request.error);
      resolve(null);
    };
  });
}

// IndexedDB'ye veri yazma
async function setToIndexedDB(storeName, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = cache.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({
      id: key,
      value,
      timestamp: Date.now()
    });

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('IndexedDB yazma hatası:', request.error);
      resolve();
    };
  });
}

// Bellek önbelleğini temizle
function clearMemoryCache() {
  const now = Date.now();
  
  // Channels önbelleğini temizle
  for (const [key, value] of cache.channels.entries()) {
    if (now - value.timestamp > cache.maxAge) {
      cache.channels.delete(key);
    }
  }
  
  // Banners önbelleğini temizle
  for (const [key, value] of cache.banners.entries()) {
    if (now - value.timestamp > cache.maxAge) {
      cache.banners.delete(key);
    }
  }
  
  // Thumbnails önbelleğini temizle
  for (const [key, value] of cache.thumbnails.entries()) {
    if (now - value.timestamp > cache.maxAge) {
      cache.thumbnails.delete(key);
    }
  }
}

// Kanal verilerini önbelleğe al
async function cacheChannelData(channelId, data) {
  try {
    cache.channels.set(channelId, {
      data,
      timestamp: Date.now()
    });

    // IndexedDB'ye ekle
    if (cache.db) {
      await setToIndexedDB('channels', channelId, data);
    }
  } catch (error) {
    handleCacheError(error, { action: 'cacheChannelData', channelId });
  }
}

// Banner URL'ini önbelleğe al
async function cacheBannerUrl(channelId, bannerUrl) {
  try {
    cache.banners.set(channelId, {
      url: bannerUrl,
      timestamp: Date.now()
    });

    // IndexedDB'ye ekle
    if (cache.db) {
      await setToIndexedDB('banners', channelId, bannerUrl);
    }
  } catch (error) {
    handleCacheError(error, { action: 'cacheBannerUrl', channelId });
  }
}

// Thumbnail URL'ini önbelleğe al
async function cacheThumbnailUrl(channelId, thumbnailUrl) {
  try {
    cache.thumbnails.set(channelId, {
      url: thumbnailUrl,
      timestamp: Date.now()
    });

    // IndexedDB'ye ekle
    if (cache.db) {
      await setToIndexedDB('thumbnails', channelId, thumbnailUrl);
    }
  } catch (error) {
    handleCacheError(error, { action: 'cacheThumbnailUrl', channelId });
  }
}

// Önbellekten kanal verilerini al
async function getCachedChannelData(channelId) {
  try {
    const memoryCached = cache.channels.get(channelId);
    if (memoryCached && Date.now() - memoryCached.timestamp < cache.maxAge) {
      return memoryCached.data;
    }

    // Bellekte yoksa IndexedDB'yi kontrol et
    if (cache.db) {
      const dbCached = await getFromIndexedDB('channels', channelId);
      if (dbCached) {
        // Belleğe de ekle
        cache.channels.set(channelId, {
          data: dbCached,
          timestamp: Date.now()
        });
        return dbCached;
      }
    }

    return null;
  } catch (error) {
    handleCacheError(error, { action: 'getCachedChannelData', channelId });
    return null;
  }
}

// Önbellekten banner URL'ini al
async function getCachedBannerUrl(channelId) {
  try {
    const memoryCached = cache.banners.get(channelId);
    if (memoryCached && Date.now() - memoryCached.timestamp < cache.maxAge) {
      return memoryCached.url;
    }

    // Bellekte yoksa IndexedDB'yi kontrol et
    if (cache.db) {
      const dbCached = await getFromIndexedDB('banners', channelId);
      if (dbCached) {
        // Belleğe de ekle
        cache.banners.set(channelId, {
          url: dbCached,
          timestamp: Date.now()
        });
        return dbCached;
      }
    }

    return null;
  } catch (error) {
    handleCacheError(error, { action: 'getCachedBannerUrl', channelId });
    return null;
  }
}

// Önbellekten thumbnail URL'ini al
async function getCachedThumbnailUrl(channelId) {
  try {
    const memoryCached = cache.thumbnails.get(channelId);
    if (memoryCached && Date.now() - memoryCached.timestamp < cache.maxAge) {
      return memoryCached.url;
    }

    // Bellekte yoksa IndexedDB'yi kontrol et
    if (cache.db) {
      const dbCached = await getFromIndexedDB('thumbnails', channelId);
      if (dbCached) {
        // Belleğe de ekle
        cache.thumbnails.set(channelId, {
          url: dbCached,
          timestamp: Date.now()
        });
        return dbCached;
      }
    }

    return null;
  } catch (error) {
    handleCacheError(error, { action: 'getCachedThumbnailUrl', channelId });
    return null;
  }
}

// Görsel yükleme zaman aşımı kontrolü
function createImageLoadPromise(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = ''; // Yüklemeyi durdur
      reject(new Error('Görsel yükleme zaman aşımı'));
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };

    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Görsel yüklenemedi'));
    };

    img.src = url;
  });
}

// IndexedDB'yi başlat
initIndexedDB().catch(console.error);

// Düzenli olarak bellek önbelleğini temizle
setInterval(clearMemoryCache, 5 * 60 * 1000); // Her 5 dakikada bir

export {
  cacheChannelData,
  cacheBannerUrl,
  cacheThumbnailUrl,
  getCachedChannelData,
  getCachedBannerUrl,
  getCachedThumbnailUrl,
  createImageLoadPromise
}; 