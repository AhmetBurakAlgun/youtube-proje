import { showLoading, hideLoading, showError, displayChannelInfo } from './ui.js';
import { calculateChannelAge } from './utils.js';
import {
  cacheChannelData,
  cacheBannerUrl,
  cacheThumbnailUrl,
  getCachedChannelData,
  getCachedBannerUrl,
  getCachedThumbnailUrl,
  createImageLoadPromise
} from './cache.js';
import ErrorHandler from './errorHandler.js';

// YouTube API endpoint'leri
const API_ENDPOINTS = {
  CHANNEL: '/api/channel',
  BANNER: '/api/proxy-banner',
  THUMBNAIL: '/api/proxy-thumbnail'
};

// Request Queue sınıfı
class RequestQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.rateLimit = options.rateLimit || 1000; // 1 saniyede maksimum istek
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 saniye
    this.lastRequestTime = 0;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject,
        retries: 0
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }

  async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Rate limiting kontrolü
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimit - timeSinceLastRequest));
    }

    const { request, resolve, reject, retries } = this.queue.shift();
    
    try {
      const result = await this.executeRequest(request, retries);
      this.lastRequestTime = Date.now();
      resolve(result);
    } catch (error) {
      if (retries < this.maxRetries) {
        // Retry mekanizması
        this.queue.unshift({
          request,
          resolve,
          reject,
          retries: retries + 1
        });
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      } else {
        reject(error);
      }
    }

    // Sonraki isteği işle
    setTimeout(() => this.process(), 0);
  }

  async executeRequest(request, retries) {
    try {
      return await request();
    } catch (error) {
      if (this.shouldRetry(error, retries)) {
        throw error; // Retry için hatayı fırlat
      }
      throw error; // Fatal hata
    }
  }

  shouldRetry(error, retries) {
    // 429: Too Many Requests, 503: Service Unavailable gibi geçici hatalar için retry
    return (error.status === 429 || error.status === 503) && retries < this.maxRetries;
  }
}

// Request Queue instance'ı
const requestQueue = new RequestQueue({
  rateLimit: 1000, // 1 saniyede 1 istek
  maxRetries: 3,
  retryDelay: 1000
});

// API istekleri için hata yönetimi
const handleApiError = (error, context = {}) => {
    return ErrorHandler.handleError(error, ErrorHandler.CATEGORIES.API, ErrorHandler.LEVELS.ERROR, context);
};

// Kanal bilgilerini getir
export const fetchChannelInfo = async (channelId) => {
  try {
    // Önbellekten kontrol et
    const cachedData = getCachedChannelData(channelId);
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(`/api/channel/${channelId}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    
    // Veriyi önbelleğe al
    cacheChannelData(channelId, data);
    
    return data;
  } catch (error) {
    handleApiError(error, { channelId });
    throw error;
  }
};

// Banner görüntüsünü getir
export const fetchBannerImage = async (channelId, bannerUrl) => {
  try {
    // Önbellekten kontrol et
    const cachedBannerUrl = getCachedBannerUrl(channelId);
    if (cachedBannerUrl) {
      return cachedBannerUrl;
    }

    const response = await fetch(`/api/channel-banner/${channelId}`);
    if (!response.ok) {
      throw new Error(`Banner API Error: ${response.status}`);
    }
    const data = await response.json();
    
    // Banner URL'ini önbelleğe al
    cacheBannerUrl(channelId, data.bannerUrl);
    
    return data.bannerUrl;
  } catch (error) {
    handleApiError(error, { channelId, bannerUrl });
    throw error;
  }
};

// Thumbnail görüntüsünü getir
export const fetchThumbnailImage = async (channelId, thumbnailUrl) => {
  try {
    // Önbellekten kontrol et
    const cachedThumbnailUrl = getCachedThumbnailUrl(channelId);
    if (cachedThumbnailUrl) {
      return cachedThumbnailUrl;
    }

    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(thumbnailUrl)}`);
    if (!response.ok) {
      throw new Error(`Thumbnail API Error: ${response.status}`);
    }
    const data = await response.json();
    
    // Thumbnail URL'ini önbelleğe al
    cacheThumbnailUrl(channelId, data.proxyUrl);
    
    return data.proxyUrl;
  } catch (error) {
    handleApiError(error, { channelId, thumbnailUrl });
    throw error;
  }
};

// Kanal bilgilerini işle ve göster
async function processChannelInfo(channelData) {
  if (!channelData) return;

  try {
    // Banner ve thumbnail görüntülerini al
    const bannerUrl = await fetchBannerImage(channelData.channelId, channelData.bannerUrl);
    const thumbnailUrl = await fetchThumbnailImage(channelData.channelId, channelData.thumbnailUrl);

    // Kanal yaşını hesapla
    const channelAge = calculateChannelAge(channelData.publishedAt);

    // Görüntüleme için veriyi hazırla
    const displayData = {
      ...channelData,
      bannerUrl: bannerUrl || channelData.bannerUrl, // Fallback to original URL
      thumbnailUrl: thumbnailUrl || channelData.thumbnailUrl, // Fallback to original URL
      channelAge
    };

    // Kanal bilgilerini göster
    displayChannelInfo(displayData);
  } catch (error) {
    console.error('Kanal bilgileri işlenirken hata:', error);
    showError('Kanal bilgileri işlenirken bir hata oluştu');
  }
}

// Arama işlemini başlat
async function searchChannel(query) {
  try {
    const channelData = await fetchChannelInfo(query);
    if (channelData) {
      await processChannelInfo(channelData);
    }
  } catch (error) {
    showError('Kanal bilgileri alınırken bir hata oluştu');
  }
}

export {
  searchChannel,
  fetchChannelInfo,
  fetchBannerImage,
  fetchThumbnailImage,
  processChannelInfo
}; 