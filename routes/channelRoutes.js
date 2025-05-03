const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const https = require('https'); // Node.js'nin yerleşik HTTPS modülünü kullan
const axios = require('axios');
const dotenv = require('dotenv');
const bannerServisi = require('../utils/bannerService');
const kazancServisi = require('../utils/kazancService');

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

// Tek birleştirilmiş proxy endpoint
router.get('/proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Görsel URL parametresi gereklidir' });
    }
  
    // URL'nin güvenlik kontrolü
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

// Banner endpoint'i - yeni banner servisini kullan
router.get('/channel-banner/:channelId', async (req, res) => {
  try {
    const channelId = req.params.channelId;
    if (!channelId) {
      return res.status(400).json({ error: 'Kanal ID parametresi gereklidir' });
    }
    
    const bannerUrl = await bannerServisi.bannerGetir(channelId);
    
    if (bannerUrl) {
      return res.json({ bannerUrl });
    } else {
      return res.status(404).json({ error: 'Banner URL bulunamadı' });
    }
  } catch (error) {
    console.error('[Banner API] Hata:', error);
    return res.status(500).json({ error: 'Banner bilgileri alınırken bir hata oluştu' });
  }
});

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
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Banner URL parametresi gereklidir' });
    }
    
    console.log(`[Proxy] Banner URL: ${imageUrl}`);
    
    // URL'nin güvenlik kontrolü
    const allowedDomains = [
      'yt3.ggpht.com',
      'yt3.googleusercontent.com',
      'i.ytimg.com'
    ];
    
    const urlObj = new URL(imageUrl);
    const host = urlObj.hostname;
    const isAllowed = allowedDomains.some(domain => host.includes(domain));
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Bu domain için proxy erişimi engellendi' });
    }
    
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
    console.error('[Proxy] Banner proxy hatası:', error.message);
    
    // Hata durumunda 1x1 şeffaf piksel döndür
    if (!res.headersSent) {
      res.set('Content-Type', 'image/png');
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      res.send(transparentPixel);
    }
  }
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
            id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
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

// handleApiResponse fonksiyonunu tanımlayalım
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
      
      if (!youtubeData || !youtubeData.items || youtubeData.items.length === 0) {
        console.error('[Banner API] Kanal bulunamadı veya API yanıtı boş');
        return res.status(404).json({ error: 'Kanal bulunamadı veya banner bilgisi yok' });
      }
      
      const channelData = youtubeData.items[0];
      let bannerUrl = null;
      
      // Banner URL'sini bul
      if (channelData.brandingSettings?.image?.bannerExternalUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerExternalUrl;
      } else if (channelData.snippet?.thumbnails?.high?.url) {
        bannerUrl = channelData.snippet.thumbnails.high.url;
      }
      
      if (bannerUrl) {
        // URL'yi optimize et
        if (!bannerUrl.includes('w1280')) {
          bannerUrl += "=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj";
        }
        return res.json({ bannerUrl });
      } else {
        return res.status(404).json({ error: 'Banner URL bulunamadı' });
      }
      
    } catch (error) {
      console.error('[Banner API] YouTube API yanıtı işlenirken hata:', error);
      return res.status(500).json({ error: 'API yanıtı işlenirken hata oluştu' });
    }
  });
}

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