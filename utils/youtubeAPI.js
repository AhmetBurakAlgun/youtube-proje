const axios = require('axios');
const dotenv = require('dotenv');
const { categoryExtractor, categoryCpmMultipliers } = require('./contentAnalyzer');
const { formatters } = require('./formatters.js');

dotenv.config();

// API anahtarları
const API_KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2,
  process.env.API_KEY_3,
  process.env.API_KEY_4,
  process.env.API_KEY_5
].filter(key => key && key.trim().length > 10);

// API anahtarlarının doğruluğunu kontrol et
const hasValidApiKeys = API_KEYS && API_KEYS.length > 0 && API_KEYS[0] && API_KEYS[0].length > 10;

// Kullanılacak mevcut API anahtarının indeksi
let currentKeyIndex = 0;

// API kota kullanımını hesaplama
// YouTube API v3'te farklı operasyonlar farklı kota kullanır
// https://developers.google.com/youtube/v3/determine_quota_cost
const calculateQuotaCost = (endpoint, parts) => {
  let quotaCost = 0;
  
  switch (endpoint) {
    case 'search':
      // Search operasyonları 100 birim tüketir
      quotaCost = 100;
      break;
    case 'channels':
      // Her channels part'ı 1 birim tüketir
      quotaCost = parts ? parts.split(',').length : 1;
      break;
    case 'videos':
      // Her videos part'ı 1 birim tüketir
      quotaCost = parts ? parts.split(',').length : 1;
      break;
    case 'playlistItems':
      // Her playlistItems part'ı 1 birim tüketir
      quotaCost = parts ? parts.split(',').length : 1;
      break;
    default:
      quotaCost = 1;
  }
  
  return quotaCost;
};

// API çağrısının kota kullanımını loglama
const logQuotaUsage = (endpoint, parts, keyIndex) => {
  const cost = calculateQuotaCost(endpoint, parts);
  console.log(`📊 API KOTASI: ${endpoint} çağrısı ${cost} birim kota kullandı. Anahtar #${keyIndex + 1}`);
  return cost;
};

// Bir sonraki API anahtarına geçmek için fonksiyon
const rotateApiKey = () => {
  if (!hasValidApiKeys) {
    console.log('Geçerli API anahtarı bulunamadı.');
    return null;
  }
  
  // Rastgele bir anahtar seç - daha dengeli kullanım için
  const prevKeyIndex = currentKeyIndex;
  
  // Aynı anahtarı seçmemek için, en az bir kez döngü yap
  do {
    currentKeyIndex = Math.floor(Math.random() * API_KEYS.length);
  } while (API_KEYS.length > 1 && currentKeyIndex === prevKeyIndex);
  
  console.log(`API anahtarı değiştirildi. Şimdi kullanılan: ${currentKeyIndex + 1}`);
  return API_KEYS[currentKeyIndex];
};

// Mevcut API anahtarını al
const getCurrentApiKey = () => {
  if (!hasValidApiKeys) return null;
  return API_KEYS[currentKeyIndex];
};

// Kanal bilgisini çek
const getChannelInfo = async (channelId) => {
  // API anahtarı yoksa hata fırlat
  if (!hasValidApiKeys) {
    console.log('API anahtarı bulunamadı');
    throw new Error('API anahtarı bulunamadı. YouTube API için bir anahtar gereklidir.');
  }
  
  try {
    const parts = 'snippet,statistics,contentDetails,brandingSettings';
    
    // Tek API çağrısında tüm gerekli bilgileri alıyoruz: 
    // - snippet: Kanal başlığı, açıklaması, küçük resimleri
    // - statistics: Abone, izlenme ve video sayıları
    // - contentDetails: Playlist ID'leri
    // - brandingSettings: Banner ve diğer marka bilgileri
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: parts,
        id: channelId,
        key: getCurrentApiKey()
      }
    });
    
    // Kota kullanımını logla
    logQuotaUsage('channels', parts, currentKeyIndex);

    if (!response.data.items || response.data.items.length === 0) {
      console.log('Kanal bulunamadı');
      throw new Error('Kanal bulunamadı. Geçerli bir kanal ID veya URL olduğundan emin olun.');
    }

    const channelInfo = response.data.items[0];
    
    // Banner URL'sini tespit et
    let bannerUrl = null;
    if (channelInfo.brandingSettings && 
        channelInfo.brandingSettings.image && 
        channelInfo.brandingSettings.image.bannerExternalUrl) {
      bannerUrl = channelInfo.brandingSettings.image.bannerExternalUrl;
      console.log('Banner URL bulundu:', bannerUrl);
    } else {
      console.log('Kanal için banner URL bulunamadı');
    }
    
    // Ek olarak, yapılandırılabilir kanallar (custom URL) için değerleri al
    const customUrl = channelInfo.snippet.customUrl || null;
    
    // Uploads playlist ID'sini kaydet - getChannelVideos için kullanılabilir
    const uploadsPlaylistId = channelInfo.contentDetails?.relatedPlaylists?.uploads || null;

    // Kanal kategorisini belirle
    const categoryInfo = categoryExtractor({
      channelDescription: channelInfo.snippet.description || '',
      tags: channelInfo.snippet.tags || []
    });
    
    console.log('📊 Kategori analizi:', {
      channelDescription: channelInfo.snippet.description?.substring(0, 50) + '...',
      tags: channelInfo.snippet.tags,
      result: categoryInfo
    });
    
    return {
      channelId: channelInfo.id,
      channelTitle: channelInfo.snippet.title,
      channelDescription: channelInfo.snippet.description,
      subscriberCount: parseInt(channelInfo.statistics.subscriberCount || '0', 10),
      viewCount: parseInt(channelInfo.statistics.viewCount || '0', 10),
      videoCount: parseInt(channelInfo.statistics.videoCount || '0', 10),
      thumbnailUrl: channelInfo.snippet.thumbnails.high?.url || channelInfo.snippet.thumbnails.medium?.url || channelInfo.snippet.thumbnails.default?.url || 'https://via.placeholder.com/800',
      country: channelInfo.snippet.country || 'TR',
      publishedAt: channelInfo.snippet.publishedAt,
      bannerUrl: bannerUrl,
      customUrl: customUrl,
      uploadsPlaylistId: uploadsPlaylistId,
      categoryInfo: categoryInfo
    };
  } catch (error) {
    console.error('Kanal bilgisi çekilirken hata oluştu:', error.message);
    
    if (error.response && error.response.status === 403) {
      // API anahtarı kota limitini aştıysa, yeni anahtara geç ve yeniden dene
      if (API_KEYS.length > 1) {
        console.log('API kota limiti aşıldı. Yeni anahtar deneniyor...');
        rotateApiKey();
        return getChannelInfo(channelId);
      }
    }
    
    // Hata durumunda orijinal hatayı yeniden fırlat
    throw error;
  }
};

// Kanalın videolarını çek
const getChannelVideos = async (channelId, maxResults = 50, pageToken = '', playlistId = null) => {
  // API anahtarı yoksa hata fırlat
  if (!hasValidApiKeys) {
    console.log('API anahtarı bulunamadı');
    throw new Error('API anahtarı bulunamadı. YouTube API için bir anahtar gereklidir.');
  }
  
  let totalQuotaCost = 0;
  
  try {
    let uploadsPlaylistId = playlistId;
    
    // PlaylistId belirtilmemişse, kanaldan alınacak
    if (!uploadsPlaylistId) {
      console.log('PlaylistId belirtilmediği için API çağrısı yapılacak');
      const channelParts = 'contentDetails';
      
    // Önce kanal ID'sine ait playlistId (uploads)'ı bul
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
          part: channelParts,
        id: channelId,
        key: getCurrentApiKey()
      }
    });
      
      // Kota kullanımını logla
      totalQuotaCost += logQuotaUsage('channels', channelParts, currentKeyIndex);

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('Kanal bulunamadı');
    }

      uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
    } else {
      console.log('Belirtilen playlistId kullanılıyor:', uploadsPlaylistId);
    }

    // Playlist elemanlarını (videoları) çek
    const playlistParts = 'snippet,contentDetails';
    const params = {
      part: playlistParts,
      playlistId: uploadsPlaylistId,
      maxResults,
      key: getCurrentApiKey()
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', { params });
    
    // Kota kullanımını logla
    totalQuotaCost += logQuotaUsage('playlistItems', playlistParts, currentKeyIndex);
    
    // Video ID'lerini topla
    const videoIds = videosResponse.data.items.map(item => item.contentDetails.videoId).join(',');
    
    if (!videoIds) {
      console.log(`📊 Toplam Kota Kullanımı: ${totalQuotaCost} birim`);
      return {
        videos: [],
        nextPageToken: videosResponse.data.nextPageToken,
        totalResults: 0
      };
    }
    
    // Detaylı video bilgilerini çek
    const videoParts = 'snippet,contentDetails,statistics';
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: videoParts,
        id: videoIds,
        key: getCurrentApiKey()
      }
    });
    
    // Kota kullanımını logla
    totalQuotaCost += logQuotaUsage('videos', videoParts, currentKeyIndex);
    
    const videos = videoDetailsResponse.data.items.map(video => ({
      videoId: video.id,
      channelId,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url || 'https://via.placeholder.com/480',
      viewCount: parseInt(video.statistics.viewCount || 0, 10),
      likeCount: parseInt(video.statistics.likeCount || 0, 10),
      dislikeCount: parseInt(video.statistics.dislikeCount || 0, 10),
      commentCount: parseInt(video.statistics.commentCount || 0, 10),
      duration: video.contentDetails.duration,
      tags: video.snippet.tags || []
    }));
    
    const result = {
      videos,
      nextPageToken: videosResponse.data.nextPageToken,
      totalResults: videosResponse.data.pageInfo.totalResults
    };
    
    console.log(`📊 Toplam Kota Kullanımı: ${totalQuotaCost} birim`);
    return result;
  } catch (error) {
    console.error('Kanal videoları çekilirken hata oluştu:', error.message);
    
    if (error.response && error.response.status === 403) {
      // API anahtarı kota limitini aştıysa, yeni anahtara geç ve yeniden dene
      if (API_KEYS.length > 1) {
        console.log('API kota limiti aşıldı. Yeni anahtar deneniyor...');
        rotateApiKey();
        return getChannelVideos(channelId, maxResults, pageToken, playlistId);
      }
    }
    
    console.log(`📊 Başarısız işlem. Harcanan Kota: ${totalQuotaCost} birim`);
    // Hata durumunda boş video listesi döndür
    return {
      videos: [],
      nextPageToken: null,
      totalResults: 0
    };
  }
};

// Kanal ID'yi kanal adı veya URL'den bul
const findChannelId = async (channelNameOrUrl) => {
  // API anahtarı yoksa hata fırlat
  if (!hasValidApiKeys) {
    console.log('API anahtarı bulunamadı');
    throw new Error('API anahtarı bulunamadı. YouTube API için bir anahtar gereklidir.');
  }
  
  try {
    // Değeri temizle
    const cleanValue = channelNameOrUrl.trim();
    
    // Eğer tam URL verilmişse, ID'yi çıkar
    if (cleanValue.includes('youtube.com/channel/')) {
      const match = cleanValue.match(/youtube\.com\/channel\/([^\/\?]+)/);
      if (match && match[1]) {
        console.log('URL\'den kanal ID çıkarıldı, API kullanılmadı (0 kota)');
        return match[1];
      }
    }
    
    // Eğer kullanıcı adı URL'si verilmişse
    if (cleanValue.includes('youtube.com/user/') || 
        cleanValue.includes('youtube.com/c/') || 
        cleanValue.includes('youtube.com/@')) {
      const username = cleanValue.split('/').pop().replace('@', '');
      
      const searchParts = 'snippet';
      // Arama yoluyla kanal ID'yi bul
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: searchParts,
          q: username,
          type: 'channel',
          maxResults: 1,
          key: getCurrentApiKey()
        }
      });
      
      // Kota kullanımını logla
      logQuotaUsage('search', searchParts, currentKeyIndex);
      
      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id.channelId;
      } else {
        // Kanal bulunamadı
        console.log('Kanal bulunamadı:', username);
        throw new Error(`Kanal bulunamadı: ${username}`);
      }
    }
    
    // Eğer sadece kanal adı verilmişse, arama yapmayı dene
    const searchParts = 'snippet';
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: searchParts,
        q: cleanValue,
        type: 'channel',
        maxResults: 1,
        key: getCurrentApiKey()
      }
    });
    
    // Kota kullanımını logla
    logQuotaUsage('search', searchParts, currentKeyIndex);
    
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.channelId;
    } else {
      // Kanal bulunamadı
      console.log('Kanal bulunamadı:', cleanValue);
      throw new Error(`Kanal bulunamadı: ${cleanValue}`);
    }
  } catch (error) {
    console.error('Kanal ID bulunamadı:', error.message);
    
    if (error.response && error.response.status === 403) {
      // API anahtarı kota limitini aştıysa, yeni anahtara geç ve yeniden dene
      if (API_KEYS.length > 1) {
        console.log('API kota limiti aşıldı. Yeni anahtar deneniyor...');
        rotateApiKey();
        return findChannelId(channelNameOrUrl);
      }
    }
    
    // Hata durumunda orijinal hatayı yeniden fırlat
    throw error;
  }
};

/**
 * Kanalın video yükleme sıklığına göre aktivite çarpanı hesaplar
 * @param {number} videoCount - Kanal video sayısı
 * @param {number} channelAgeMonths - Kanalın yaşı (ay olarak)
 * @returns {number} Aktivite çarpanı (0.8 - 1.2 arasında)
 */
function calculateActivityMultiplier(videoCount, channelAgeMonths) {
  if (!videoCount || !channelAgeMonths) return 1.0;
  
  // Aylık ortalama video yükleme
  const monthlyVideoRate = videoCount / channelAgeMonths;
  
  // Ayda 4'ten fazla video = maksimum aktivite çarpanı
  if (monthlyVideoRate >= 4) return 1.2;
  
  // Ayda 1'den az video = minimum aktivite çarpanı
  if (monthlyVideoRate < 1) return 0.8;
  
  // Orantılı çarpan hesaplama (1-4 arası için 0.8-1.2 arası değer)
  return 0.8 + (monthlyVideoRate / 10);
}

/**
 * Kanalın abone sayısına göre büyüklük çarpanı hesaplar
 * @param {number} subscriberCount - Abone sayısı
 * @returns {number} Kanal büyüklük çarpanı (0.9 - 1.5 arası)
 */
function calculateChannelSizeMultiplier(subscriberCount) {
  if (!subscriberCount) return 1.0;
  
  // Abone sayısı arttıkça CPM genellikle artar
  if (subscriberCount >= 10000000) return 1.5;  // 10M+ abone
  if (subscriberCount >= 1000000) return 1.4;   // 1M+ abone
  if (subscriberCount >= 500000) return 1.3;    // 500K+ abone
  if (subscriberCount >= 100000) return 1.2;    // 100K+ abone
  if (subscriberCount >= 10000) return 1.1;     // 10K+ abone
  if (subscriberCount < 1000) return 0.9;       // 1K'dan az abone
  
  return 1.0; // 1K-10K arası abone
}

/**
 * Kanalın ülkesine göre coğrafi çarpan hesaplar
 * @param {string} country - Ülke kodu (ISO 3166-1)
 * @returns {number} Coğrafi çarpan (0.5 - 2.0 arası)
 */
function calculateGeographicMultiplier(country) {
  if (!country) return 1.0;
  
  // Ülkeye göre CPM çarpanları (reklamverenlerin ödediği miktarlar ülkeye göre değişir)
  const geoMultipliers = {
    'US': 2.0,   // ABD
    'CA': 1.8,   // Kanada
    'GB': 1.8,   // Birleşik Krallık
    'AU': 1.7,   // Avustralya
    'DE': 1.6,   // Almanya
    'FR': 1.5,   // Fransa
    'JP': 1.5,   // Japonya
    'NL': 1.4,   // Hollanda
    'SE': 1.4,   // İsveç
    'IT': 1.3,   // İtalya
    'ES': 1.2,   // İspanya
    'TR': 1.0,   // Türkiye
    'RU': 0.9,   // Rusya
    'BR': 0.8,   // Brezilya
    'MX': 0.8,   // Meksika
    'IN': 0.6,   // Hindistan
    'ID': 0.6,   // Endonezya
    'PH': 0.5    // Filipinler
  };
  
  return geoMultipliers[country] || 1.0;
}

module.exports = {
  getChannelInfo,
  getChannelVideos,
  findChannelId,
  rotateApiKey,
  getCurrentApiKey,
  calculateActivityMultiplier,
  calculateChannelSizeMultiplier,
  calculateGeographicMultiplier
}; 