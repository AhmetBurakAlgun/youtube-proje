const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const https = require('https'); // Node.js'nin yerleşik HTTPS modülünü kullan
const axios = require('axios');
const dotenv = require('dotenv');

// Kanal işlemleri rotaları
router.post('/channels', channelController.addChannel);
router.get('/channels', channelController.searchChannel);
router.get('/channels/:channelId', channelController.getChannelById);
router.put('/channels/:channelId', channelController.updateChannel);
router.delete('/channels/:channelId', channelController.deleteChannel);
router.post('/channels/:channelId/sync', channelController.syncChannelVideos);

// YouTube API anahtarı route'u
router.get('/youtube-api-key', (req, res) => {
  // YouTube API anahtarını çevre değişkenlerinden (API_KEY_1) al
  const apiKey = process.env.API_KEY_1 || '';
  
  // API anahtarını JSON olarak döndür
  res.json({ apiKey });
});

// YouTube Kanal Banner URL'sini Getirme Route'u - CORS sorunlarını önlemek için
router.get('/channel-banner/:channelId', (req, res) => {
  try {
    const channelId = req.params.channelId;
    if (!channelId) {
      return res.status(400).json({ error: 'Kanal ID parametresi gereklidir' });
    }
    
    // Ayrıntılı debug bilgisi ekleyelim
    console.log(`[Banner API] Kanal ID için banner talep ediliyor: ${channelId}`);
    
    // Tüm API anahtarlarını alalım ve geçerli olanları filtreleyelim
    const apiKeys = [
      process.env.API_KEY_1,
      process.env.API_KEY_2,
      process.env.API_KEY_3,
      process.env.API_KEY_4,
      process.env.API_KEY_5
    ].filter(key => key && key.trim().length > 10);
    
    if (apiKeys.length === 0) {
      console.error('[Banner API] Geçerli API anahtarı bulunamadı');
      return res.status(500).json({ error: 'API anahtarı bulunamadı' });
    }
    
    // Çok daha basit bir API anahtarı yönetim sistemi oluşturalım
    if (!global.simpleApiKeyManager) {
      console.log('[Banner API] Yeni API Anahtarı Yöneticisi oluşturuluyor...');
      
      global.simpleApiKeyManager = {
        // Hangi anahtarların kullanılabilir olduğunu takip et (0-4 arası indeks numaraları)
        availableKeys: [...Array(apiKeys.length).keys()],
        
        // Hangi anahtarların engellendiğini takip et
        blockedKeys: {},
        
        // Debug için anahtar kullanım sayısını takip et
        keyUsage: Array(apiKeys.length).fill(0),
        
        // Bir anahtarı engelle
        blockKey: function(keyIndex, durationMinutes = 30) {
          console.log(`[Banner API] ${keyIndex + 1} numaralı API anahtarı ${durationMinutes} dakika boyunca engellendi`);
          
          const now = Date.now();
          const blockUntil = now + (durationMinutes * 60 * 1000);
          this.blockedKeys[keyIndex] = blockUntil;
          
          // Engellenen anahtarı kullanılabilir listesinden çıkar
          this.availableKeys = this.availableKeys.filter(idx => idx !== keyIndex);
          
          console.log(`[Banner API] Kullanılabilir anahtarlar şunlar: ${this.availableKeys.map(i => i+1).join(', ')}`);
        },
        
        // Engellenmiş anahtarların durumunu kontrol et ve süresi dolanları serbest bırak
        checkBlockedKeys: function() {
          const now = Date.now();
          let keysUnblocked = false;
          
          for (const [keyIndex, blockUntil] of Object.entries(this.blockedKeys)) {
            if (now > blockUntil) {
              // Engelleme süresi dolmuş, anahtarı serbest bırak
              console.log(`[Banner API] ${Number(keyIndex) + 1} numaralı API anahtarının engeli kaldırıldı`);
              delete this.blockedKeys[keyIndex];
              
              // Anahtarı tekrar kullanılabilir listesine ekle (eğer yoksa)
              if (!this.availableKeys.includes(Number(keyIndex))) {
                this.availableKeys.push(Number(keyIndex));
                keysUnblocked = true;
              }
            }
          }
          
          if (keysUnblocked) {
            console.log(`[Banner API] Kullanılabilir anahtarlar şunlar: ${this.availableKeys.map(i => i+1).join(', ')}`);
          }
        },
        
        // Rastgele bir kullanılabilir anahtar seç
        getRandomKey: function() {
          // Önce engelleme süresi dolan anahtarları kontrol et
          this.checkBlockedKeys();
          
          // Hiç kullanılabilir anahtar yoksa, en eski engellenen anahtarı serbest bırak
          if (this.availableKeys.length === 0) {
            console.warn('[Banner API] Hiç kullanılabilir anahtar kalmadı!');
            
            // Engellenen bir anahtar var mı?
            const blockedKeyIndices = Object.keys(this.blockedKeys);
            if (blockedKeyIndices.length > 0) {
              // En eski engellenen anahtarı bul
              const oldestBlockedKey = blockedKeyIndices.reduce((oldest, current) => {
                return this.blockedKeys[current] < this.blockedKeys[oldest] ? current : oldest;
              }, blockedKeyIndices[0]);
              
              // Bu anahtarı zorla serbest bırak
              console.log(`[Banner API] ${Number(oldestBlockedKey) + 1} numaralı anahtarın engeli zorla kaldırıldı`);
              delete this.blockedKeys[oldestBlockedKey];
              this.availableKeys.push(Number(oldestBlockedKey));
            } else {
              // Tüm anahtarları yeniden kullanılabilir yap
              console.warn('[Banner API] Tüm anahtarlar yeniden etkinleştiriliyor!');
              this.availableKeys = [...Array(apiKeys.length).keys()];
              this.blockedKeys = {};
            }
          }
          
          // Kullanılabilir anahtarlardan rastgele bir tane seç
          const randomIndex = Math.floor(Math.random() * this.availableKeys.length);
          const selectedKeyIndex = this.availableKeys[randomIndex];
          
          // Seçilen anahtarın kullanım sayısını artır
          this.keyUsage[selectedKeyIndex] = (this.keyUsage[selectedKeyIndex] || 0) + 1;
          
          console.log(`[Banner API] Seçilen API anahtarı: ${selectedKeyIndex + 1} (${this.keyUsage[selectedKeyIndex]}. kullanım)`);
          console.log(`[Banner API] Anahtar kullanım durumu: ${this.keyUsage.map((count, i) => `Key${i+1}:${count}`).join(', ')}`);
          
          return selectedKeyIndex;
        }
      };
    }
    
    // Kullanılabilir bir anahtar seç
    const currentApiKeyIndex = global.simpleApiKeyManager.getRandomKey();
    const apiKey = apiKeys[currentApiKeyIndex];
    
    console.log(`[Banner API] Kullanılan API anahtarı: ${currentApiKeyIndex + 1} (toplam: ${apiKeys.length})`);
    
    // YouTube API URL'si - Ham banner URL'sini almak için
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings,snippet&id=${channelId}&key=${apiKey}`;
    console.log(`[Banner API] YouTube API isteği: ${apiUrl.replace(apiKey, 'API_KEY')}`);
    
    // Node.js'nin yerleşik https modülü ile istek gönder
    https.get(apiUrl, (response) => {
      console.log(`[Banner API] YouTube API yanıt kodu: ${response.statusCode}`);
      
      // 403 hatası durumunda (kota aşımı), API anahtarını engelle ve farklı bir anahtar dene
      if (response.statusCode === 403) {
        console.log(`[Banner API] 403 hatası, ${currentApiKeyIndex + 1} numaralı API anahtarı engelleniyor`);
        
        // Bu anahtarı 30 dakika boyunca engelle
        global.simpleApiKeyManager.blockKey(currentApiKeyIndex, 30);
        
        // Başka bir anahtar varsa tekrar dene
        if (apiKeys.length > 1 && global.simpleApiKeyManager.availableKeys.length > 0) {
          // Yeni bir anahtar seç - engelliyi dikkate alarak
          const newApiKeyIndex = global.simpleApiKeyManager.getRandomKey();
          
          // Aynı anahtarı tekrar seçmeyi önle (bu durumda mümkün değil, ama güvenlik için)
          if (newApiKeyIndex === currentApiKeyIndex) {
            console.warn('[Banner API] Aynı API anahtarı tekrar seçildi, bu beklenmeyen bir durum!');
            return res.status(429).json({
              error: 'API anahtarı yönetiminde bir hata oluştu, lütfen daha sonra tekrar deneyin'
            });
          }
          
          const newApiKey = apiKeys[newApiKeyIndex];
          console.log(`[Banner API] Yeni API anahtarı seçildi: ${newApiKeyIndex + 1}`);
          
          // Yeni API anahtarı ile tekrar deneme yap
          const newApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings,snippet&id=${channelId}&key=${newApiKey}`;
          
          https.get(newApiUrl, (newResponse) => {
            // Yeni yanıtı işle
            handleApiResponse(newResponse, newApiKey, channelId, res);
          }).on('error', (error) => {
            console.error('[Banner API] Yeniden deneme sırasında hata:', error.message);
            return res.status(500).json({ 
              error: 'Banner bilgileri alınırken bir hata oluştu',
              details: error.message 
            });
          });
          
          return; // İlk isteği sonlandır
        }
      }
      
      // Normal yanıt işleme
      handleApiResponse(response, apiKey, channelId, res);
    }).on('error', (error) => {
      console.error('[Banner API] YouTube Banner API HTTPS Hatası:', error.message);
      return res.status(500).json({ 
        error: 'Banner bilgileri alınırken bir hata oluştu',
        details: error.message 
      });
    });
    
  } catch (error) {
    console.error('[Banner API] YouTube Banner API Genel Hatası:', error.message);
    return res.status(500).json({ 
      error: 'Banner bilgileri alınırken bir hata oluştu',
      details: error.message 
    });
  }
});

// YouTube API yanıtını işleme yardımcı fonksiyonu
function handleApiResponse(response, apiKey, channelId, res) {
  if (response.statusCode !== 200) {
    return res.status(response.statusCode).json({ 
      error: `YouTube API hata kodu: ${response.statusCode}` 
    });
  }
  
  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    try {
      const youtubeData = JSON.parse(data);
      
      // API yanıtını kontrol et
      if (!youtubeData || !youtubeData.items || youtubeData.items.length === 0) {
        console.error('[Banner API] Kanal bulunamadı veya API yanıtı boş');
        return res.status(404).json({ error: 'Kanal bulunamadı veya banner bilgisi yok' });
      }
      
      // Log olarak tüm YouTube API yanıtını yazdır - debug için
      console.log('[Banner API] YouTube API yanıtı:', JSON.stringify(youtubeData, null, 2));
      
      // Banner URL'sini bul - birden fazla yerde olabilir
      let bannerUrl = null;
      const channelData = youtubeData.items[0];
      
      // Olası tüm banner URL'lerini kontrol edelim
      const possibleBannerFields = findAllBannerFields(channelData);
      console.log('[Banner API] Bulunan tüm olası banner alanları:', possibleBannerFields);
      
      // Banner External URL (brandingSettings.image.bannerExternalUrl) - Öncelikli kaynak
      if (channelData.brandingSettings?.image?.bannerExternalUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerExternalUrl;
        console.log('[Banner API] bannerExternalUrl bulundu:', bannerUrl);
      }
      // Banner Mobil URL (brandingSettings.image.bannerMobileExtraHdImageUrl) - İkincil
      else if (channelData.brandingSettings?.image?.bannerMobileExtraHdImageUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerMobileExtraHdImageUrl;
        console.log('[Banner API] bannerMobileExtraHdImageUrl bulundu:', bannerUrl);
      }
      // Banner Tablet URL (brandingSettings.image.bannerTabletExtraHdImageUrl) - Üçüncül
      else if (channelData.brandingSettings?.image?.bannerTabletExtraHdImageUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerTabletExtraHdImageUrl;
        console.log('[Banner API] bannerTabletExtraHdImageUrl bulundu:', bannerUrl);
      }
      // Banner TV URL (brandingSettings.image.bannerTvImageUrl) - Alternatif
      else if (channelData.brandingSettings?.image?.bannerTvImageUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerTvImageUrl;
        console.log('[Banner API] bannerTvImageUrl bulundu:', bannerUrl);
      }
      // Özel kanal banner'ı bulunamadıysa snippet'teki thumbnails deneyebiliriz
      else if (channelData.snippet?.thumbnails?.high?.url) {
        bannerUrl = channelData.snippet.thumbnails.high.url;
        console.log('[Banner API] Kanal thumbnail yüksek kalite bulundu (banner yerine):', bannerUrl);
      }
      // Son çare: medium veya default thumbnail
      else if (channelData.snippet?.thumbnails?.medium?.url) {
        bannerUrl = channelData.snippet.thumbnails.medium.url;
        console.log('[Banner API] Kanal thumbnail orta kalite bulundu (banner yerine):', bannerUrl);
      }
      
      // URL temizleme ve uyarlama
      if (bannerUrl) {
        console.log('[Banner API] Ham banner URL:', bannerUrl);
        
        // Şimdi URL'ye parametre ekleyerek optimize edelim
        // YouTube URL'leri değişebilir, bu yüzden genel bir yaklaşım kullanalım
        if (bannerUrl.includes('yt3.googleusercontent.com')) {
          // Yeni format (yt3.googleusercontent.com)
          if (!bannerUrl.includes('=w')) {
            bannerUrl = `${bannerUrl}=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj`;
            console.log('[Banner API] Yeni URL formatı için parametre eklendi');
          } else if (bannerUrl.includes('=w2560')) {
            bannerUrl = bannerUrl.replace(/=w2560/, '=w1280');
            console.log('[Banner API] Yeni URL formatında genişlik 2560px→1280px optimize edildi');
          }
          
          // Yanıt olarak banner URL'sini gönder
          console.log('[Banner API] Döndürülen banner URL:', bannerUrl);
          return res.json({ bannerUrl });
        } 
        else if (bannerUrl.includes('yt3.ggpht.com')) {
          // Eski format (yt3.ggpht.com) - Genellikle kanal thumbnail'ları için
          // Parametre yoksa ekleme yapılır (öncelikle geniş resim olup olmadığını kontrol edelim)
          if (bannerUrl.includes('/c/')) {
            // Kanal banneri olabilir
            if (!bannerUrl.includes('=w')) {
              bannerUrl = `${bannerUrl}=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj`;
              console.log('[Banner API] Eski banner URL formatına parametre eklendi');
            } else if (bannerUrl.includes('=w2560')) {
              bannerUrl = bannerUrl.replace(/=w2560/, '=w1280');
              console.log('[Banner API] Eski URL formatında genişlik 2560px→1280px optimize edildi');
            }
          }
          // Yanıt olarak banner URL'sini gönder
          console.log('[Banner API] Döndürülen banner URL:', bannerUrl);
          return res.json({ bannerUrl });
        } 
        else {
          // Diğer formatlar (örn. i.ytimg.com) - olduğu gibi bırak
          console.log('[Banner API] Bilinmeyen URL formatı, olduğu gibi döndürülüyor:', bannerUrl);
          return res.json({ bannerUrl });
        }
      }
      
      // Banner URL bulunamadıysa, tüm alanları tarayarak olası banner URL'sini arayalım
      const allPossibleBanners = findAllBannerFields(youtubeData);
      if (allPossibleBanners.length > 0) {
        bannerUrl = allPossibleBanners[0].value;
        console.log('[Banner API] Alternatif banner URL bulundu:', bannerUrl);
        return res.json({ bannerUrl });
      }
      
      // Banner URL bulunamadıysa, hata döndür
      console.error('[Banner API] Banner URL bulunamadı');
      return res.status(404).json({ error: 'Kanal banner URL\'si bulunamadı' });
    } catch (parseError) {
      console.error('[Banner API] YouTube API yanıtı JSON olarak ayrıştırılamadı:', parseError);
      return res.status(500).json({ error: 'API yanıtını ayrıştırma hatası', details: parseError.message });
    }
  });
}

// API proxy (kanal bannerleri ve thumbnaillar için) - CORS sorunlarını önleme amaçlı
router.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Görsel URL parametresi gereklidir' });
    }
    
    // URL'nin güvenlik kontrolü (sadece belirli domainlere izin ver)
    const allowedDomains = [
      'yt3.ggpht.com',
      'yt3.googleusercontent.com',
      'i.ytimg.com',
      'youtube.com',
      'youtu.be',
      'ytimg.com',
      'googleapis.com',
      'google.com'
    ];
    
    // URL'nin güvenli olup olmadığını kontrol et
    const urlObj = new URL(imageUrl);
    const host = urlObj.hostname;
    const isAllowed = allowedDomains.some(domain => host.includes(domain));
    
    if (!isAllowed) {
      console.error(`[Proxy] Güvenilmeyen domain: ${host}`);
      return res.status(403).json({ error: 'Bu domain için proxy erişimi engellendi' });
    }
    
    console.log(`[Proxy] Görsel URL: ${imageUrl}`);
    
    // Axios ile görsel verisini al
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer'
    });
    
    // Content-Type başlığını belirle
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Başlıkları ayarla
    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400' // 24 saat önbellek
    });
    
    // Görsel verilerini gönder
    res.send(response.data);
  } catch (error) {
    console.error('[Proxy] Görsel proxy hatası:', error.message);
    
    // Hata durumunda 1x1 şeffaf piksel döndür
    if (!res.headersSent) {
      res.set('Content-Type', 'image/png');
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      res.send(transparentPixel);
    }
  }
});

// Banner içinse ayrı bir proxy endpoint, ileride özelleştirmeler yapabiliriz
router.get('/proxy-banner', async (req, res) => {
  // URL'yi alıp /proxy-image'a yönlendir
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Banner URL parametresi gereklidir' });
  }
  
  // Aynı proxy mantığını kullan ama sadece banner olduğunu logla
  console.log(`[Proxy] Banner URL: ${imageUrl}`);
  
  // proxy-image endpoint'ini yeniden kullanıyoruz
  req.query.url = imageUrl;
  router.handle(req, res, router.stack.find(layer => layer.route?.path === '/proxy-image'));
});

// API anahtarlarının kotalarını takip etmek için endpoint
router.get('/api-quotas', async (req, res) => {
  try {
    // Tüm API anahtarlarını al
    const apiKeys = [
      process.env.API_KEY_1,
      process.env.API_KEY_2,
      process.env.API_KEY_3,
      process.env.API_KEY_4,
      process.env.API_KEY_5
    ].filter(key => key && key.trim().length > 10);
    
    // Her API anahtarı için kota kullanımını kontrol et
    const quotaResults = await Promise.all(apiKeys.map(async (key, index) => {
      try {
        // Google Cloud API'den kota kullanımını al
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
          params: {
            part: 'id',
            mine: true,
            key: key
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        // Başarılı yanıt durumunda, kota bilgilerini döndür
        return {
          keyId: `API_KEY_${index + 1}`,
          key: key.substring(0, 8) + '...' + key.substring(key.length - 4),
          status: 'active',
          quotaUsed: 1, // API yanıtından alınabilir olmadığı için sabit değer
          quotaLimit: 10000, // YouTube API günlük limit
          remainingQuota: 9999, // Örnek değer (gerçek verilerle hesaplanmalı)
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        // Hata durumunda, nedeni belirle ve durum bilgisini döndür
        console.error(`API Key ${index + 1} sorgulanırken hata:`, error.message);
        
        let status = 'error';
        let errorDetails = 'Bilinmeyen hata';
        
        if (error.response) {
          const { status: statusCode, data } = error.response;
          
          if (statusCode === 403) {
            status = 'quota_exceeded';
            errorDetails = 'Günlük kota limiti aşıldı';
          } else if (statusCode === 400) {
            status = 'invalid_request';
            errorDetails = 'Geçersiz istek';
          } else if (statusCode === 401) {
            status = 'invalid_key';
            errorDetails = 'Geçersiz API anahtarı';
          }
          
          if (data && data.error && data.error.message) {
            errorDetails = data.error.message;
          }
        }
        
        return {
          keyId: `API_KEY_${index + 1}`,
          key: key.substring(0, 8) + '...' + key.substring(key.length - 4),
          status,
          errorDetails,
          lastChecked: new Date().toISOString()
        };
      }
    }));
    
    // Sonuçları döndür
    res.json({
      totalKeys: apiKeys.length,
      activeKeys: quotaResults.filter(result => result.status === 'active').length,
      results: quotaResults
    });
  } catch (error) {
    console.error('API kotaları alınırken hata:', error.message);
    res.status(500).json({ 
      error: 'API kota bilgileri alınamadı',
      message: error.message
    });
  }
});

// Nesne içindeki tüm olası banner URL'lerini bul
function findAllBannerFields(obj, results = [], path = '') {
  if (!obj || typeof obj !== 'object') return results;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newPath = path ? `${path}.${key}` : key;
      
      // URL olabilecek string değerlerini kontrol et
      if (typeof value === 'string' && 
          (key.toLowerCase().includes('banner') || 
           key.toLowerCase().includes('image') || 
           key.toLowerCase().includes('thumbnail')) && 
          value.startsWith('http')) {
        console.log(`Olası banner URL'si bulundu: ${newPath} = ${value}`);
        results.push({
          path: newPath,
          value: value
        });
      }
      
      // Alt nesneleri rekürsif olarak kontrol et
      if (value !== null && typeof value === 'object') {
        findAllBannerFields(value, results, newPath);
      }
    }
  }
  
  return results;
}

module.exports = router; 