const axios = require('axios');
const https = require('https');

class BannerServisi {
  constructor() {
    this.onbellek = new Map();
    this.onbellekSuresi = 60 * 60 * 1000; // 1 saat
  }

  // Banner URL'sini önbelleğe al
  onbellekleKaydet(kanalId, bannerUrl) {
    if (!kanalId) return;
    
    this.onbellek.set(kanalId, {
      url: bannerUrl,
      timestamp: Date.now()
    });
  }

  // Önbellekten banner URL'sini al
  onbellektenGetir(kanalId) {
    if (!kanalId) return null;
    
    const onbellekli = this.onbellek.get(kanalId);
    if (!onbellekli) return null;
    
    // Önbellek süresi kontrolü
    if (Date.now() - onbellekli.timestamp > this.onbellekSuresi) {
      this.onbellek.delete(kanalId);
      return null;
    }
    
    return onbellekli.url;
  }

  // Banner URL'sini API'den al
  async apidenGetir(kanalId, mevcutBannerUrl = null) {
    try {
      // 1. Eğer doğrudan banner URL'si verilmişse, onu kullan
      if (mevcutBannerUrl) {
        return this.bannerUrlFormatla(mevcutBannerUrl);
      }

      // 2. Önbellekte varsa direkt kullan
      const onbellekliUrl = this.onbellektenGetir(kanalId);
      if (onbellekliUrl) {
        return onbellekliUrl;
      }

      // 3. API'den al
      const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings,snippet&id=${kanalId}&key=${process.env.API_KEY_1}`;
      
      const response = await axios.get(apiUrl);
      const channelData = response.data.items[0];
      
      let bannerUrl = null;
      if (channelData.brandingSettings?.image?.bannerExternalUrl) {
        bannerUrl = channelData.brandingSettings.image.bannerExternalUrl;
      } else if (channelData.snippet?.thumbnails?.high?.url) {
        bannerUrl = channelData.snippet.thumbnails.high.url;
      }

      if (bannerUrl) {
        bannerUrl = this.bannerUrlFormatla(bannerUrl);
        this.onbellekleKaydet(kanalId, bannerUrl);
        return bannerUrl;
      }

      return null;
    } catch (error) {
      console.error('Banner API hatası:', error);
      return null;
    }
  }

  // Banner URL'sini formatla
  bannerUrlFormatla(bannerUrl) {
    if (!bannerUrl.includes('w1280')) {
      bannerUrl += "=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj";
    }
    return bannerUrl;
  }

  // Proxy URL oluştur
  proxyUrlOlustur(bannerUrl) {
    return `/api/proxy?url=${encodeURIComponent(bannerUrl)}`;
  }

  // Banner'ı getir (ana metod)
  async bannerGetir(kanalId, mevcutBannerUrl = null) {
    try {
      // Önce önbellekten kontrol et
      const onbellekliUrl = this.onbellektenGetir(kanalId);
      if (onbellekliUrl) {
        return onbellekliUrl;
      }

      // API'den al
      const bannerUrl = await this.apidenGetir(kanalId, mevcutBannerUrl);
      if (!bannerUrl) {
        return null;
      }

      // Direkt URL'yi dene
      try {
        await axios.head(bannerUrl);
        return bannerUrl;
      } catch (error) {
        // CORS hatası varsa proxy üzerinden dene
        return this.proxyUrlOlustur(bannerUrl);
      }
    } catch (error) {
      console.error('Banner alma hatası:', error);
      return null;
    }
  }
}

module.exports = new BannerServisi(); 