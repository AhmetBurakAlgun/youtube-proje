const Channel = require('../models/Channel');
const Video = require('../models/Video');
const { 
  getChannelInfo, 
  getChannelVideos, 
  findChannelId, 
} = require('../utils/youtubeAPI');
const { formatters } = require('../utils/formatters.js');
const { kazancHesapla } = require('../utils/kazancService');

// Yeni kanal ekle
exports.addChannel = async (req, res) => {
  try {
    const { channelUrl } = req.body;
    
    if (!channelUrl) {
      return res.status(400).json({ message: 'Kanal URL veya ID\'si gereklidir' });
    }
    
    // Kanal ID'yi bul
    const channelId = await findChannelId(channelUrl);
    
    // Kanal zaten var mı kontrol et
    const existingChannel = await Channel.findOne({ channelId });
    if (existingChannel) {
      return res.status(400).json({ 
        message: 'Bu kanal zaten eklenmiş', 
        channel: existingChannel 
      });
    }
    
    // YouTube API'den kanal bilgilerini al
    const channelData = await getChannelInfo(channelId);
    
    // Yeni kanal oluştur
    const newChannel = new Channel(channelData);
    
    // Kazançları hesapla
    const earnings = await kazancHesapla(channelData);
    channelData.estimatedEarnings = earnings;
    
    // Kanalı kaydet
    await newChannel.save();
    
    res.status(201).json({
      message: 'Kanal başarıyla eklendi',
      channel: newChannel
    });
  } catch (error) {
    console.error('Kanal eklenirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Kanal eklenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Tüm kanalları listele
exports.getAllChannels = async (req, res) => {
  try {
    const { url } = req.query;
    
    console.log(`Channel isteği alındı. URL: ${url}, Zaman: ${new Date().toISOString()}`);
    
    // URL parametresi varsa, kanal arama işlemi yap
    if (url) {
      try {
        console.log(`Channel arama isteği: ${url}`);
        
        // YouTube API'den kanal bilgilerini al
        const channelId = await findChannelId(url);
        console.log(`Bulunan Channel ID: ${channelId}`);
        
        const channelData = await getChannelInfo(channelId);
        console.log(`Channel verisi alındı: ${channelData.channelTitle}`);
        
        // Kazançları hesapla - GELİŞMİŞ KAZANÇ HESAPLAYICISINI KULLANALIM
        // İlk olarak basit hesaplayıcıyı kullanıyoruz
        const earnings = await kazancHesapla(channelData);
        
        // Sonra gelişmiş hesaplayıcı ile üzerine yazıyoruz
        try {
          const advancedEarnings = await kazancHesapla(channelData);
          channelData.estimatedEarnings = advancedEarnings;
          
          // Kategori bilgilerini doğrudan ekle
          channelData.categoryInfo = advancedEarnings.categoryInfo;
          channelData.multipliers = advancedEarnings.multipliers;
          
          // Earnings nesnesine de ekle
          channelData.earnings = {
            estimatedEarnings: advancedEarnings,
            categoryInfo: advancedEarnings.categoryInfo,
            multipliers: advancedEarnings.multipliers
          };
          
          console.log('Kategori bilgisi:', advancedEarnings.categoryInfo);
        } catch (error) {
          console.error('Gelişmiş kazanç hesaplama hatası:', error);
          channelData.estimatedEarnings = earnings;
          channelData.categoryInfo = { type: 'Uncategorized', confidence: 0 };
          channelData.multipliers = { category: 1.0, geographic: 1.0, channelSize: 1.0, activity: 1.0 };
        }
        
        // ÖNEMLİ: Kanalı otomatik olarak veritabanına kaydet veya güncelle
        // Kanal zaten var mı kontrol et
        let existingChannel = await Channel.findOne({ channelId: channelData.channelId });
        
        if (existingChannel) {
          console.log(`Kanal zaten veritabanında mevcut. Güncelleniyor: ${channelData.channelTitle}`);
          
          // Mevcut kanal verilerini tarihçe koleksiyonuna ekle (günlük büyüme hesaplaması için)
          // Bu kısım tarihçe özelliği eklendiğinde aktif edilebilir
          /*
          const channelHistory = new ChannelHistory({
            channelId: existingChannel.channelId,
            date: new Date(),
            subscriberCount: existingChannel.subscriberCount,
            viewCount: existingChannel.viewCount,
            videoCount: existingChannel.videoCount
          });
          await channelHistory.save();
          */
          
          // Kanalı güncelle
          existingChannel.subscriberCount = channelData.subscriberCount;
          existingChannel.viewCount = channelData.viewCount;
          existingChannel.videoCount = channelData.videoCount;
          existingChannel.thumbnailUrl = channelData.thumbnailUrl;
          existingChannel.lastUpdated = new Date();
          
          // Kazançları güncelle
          existingChannel.estimatedEarnings = channelData.estimatedEarnings;
          
          await existingChannel.save();
          console.log(`Kanal güncellendi: ${channelData.channelTitle}`);
        } else {
          console.log(`Yeni kanal ekleniyor: ${channelData.channelTitle}`);
          
          // Yeni kanal oluştur ve kaydet
          const newChannel = new Channel({
            channelId: channelData.channelId,
            channelTitle: channelData.channelTitle,
            channelDescription: channelData.channelDescription,
            thumbnailUrl: channelData.thumbnailUrl,
            subscriberCount: channelData.subscriberCount,
            viewCount: channelData.viewCount,
            videoCount: channelData.videoCount,
            country: channelData.country,
            publishedAt: channelData.publishedAt,
            estimatedEarnings: channelData.estimatedEarnings,
            lastUpdated: new Date()
          });
          
          await newChannel.save();
          console.log(`Yeni kanal eklendi: ${channelData.channelTitle}`);
        }
        
        return res.status(200).json({
          count: 1,
          channels: [channelData]
        });
      } catch (error) {
        console.error(`Channel arama hatası: ${error.message}`);
        return res.status(400).json({ 
          message: 'Kanal bilgileri alınamadı', 
          error: error.message 
        });
      }
    }
    
    // MongoDB bağlantısını kullanarak veritabanından kanalları çek
    const channels = await Channel.find().sort({ subscriberCount: -1 });
    
    // Kanal verilerini formatla
    const formattedChannels = channels.map(channel => ({
      ...channel.toObject(),
      formattedSubscribers: formatters.number(channel.subscriberCount),
      formattedViews: formatters.number(channel.viewCount),
      formattedDate: formatters.date(channel.publishedAt),
      channelAge: formatters.channelAge(channel.publishedAt)
    }));
    
    res.status(200).json({
      count: formattedChannels.length,
      channels: formattedChannels
    });
  } catch (error) {
    console.error('Kanallar listelenirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Kanallar listelenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kanal detaylarını getir
exports.getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    const channel = await Channel.findOne({ channelId });
    
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }
    
    // İlgili kanalın son 10 videosu
    const videos = await Video.find({ channelId })
                             .sort({ publishedAt: -1 })
                             .limit(10);
    
    res.status(200).json({
      channel,
      recentVideos: videos
    });
  } catch (error) {
    console.error('Kanal detayları getirilirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Kanal detayları getirilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kanal verilerini güncelle
exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    let channel = await Channel.findOne({ channelId });
    
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }
    
    // YouTube API'den en güncel kanal bilgilerini al
    const channelData = await getChannelInfo(channelId);
    
    // Kazançları hesapla
    const earnings = await kazancHesapla(channelData);
    channelData.estimatedEarnings = earnings;
    
    // Kanal bilgilerini güncelle
    channel.subscriberCount = channelData.subscriberCount;
    channel.viewCount = channelData.viewCount;
    channel.videoCount = channelData.videoCount;
    channel.thumbnailUrl = channelData.thumbnailUrl;
    channel.lastUpdated = Date.now();
    
    // Kanalı kaydet
    await channel.save();
    
    res.status(200).json({
      message: 'Kanal başarıyla güncellendi',
      channel
    });
  } catch (error) {
    console.error('Kanal güncellenirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Kanal güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kanal sil
exports.deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    const channel = await Channel.findOne({ channelId });
    
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }
    
    // Kanalı sil
    await Channel.deleteOne({ channelId });
    
    // İlgili kanal videolarını sil
    await Video.deleteMany({ channelId });
    
    res.status(200).json({
      message: 'Kanal ve ilgili tüm videolar başarıyla silindi'
    });
  } catch (error) {
    console.error('Kanal silinirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Kanal silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kanalın videolarını sync et
exports.syncChannelVideos = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    const channel = await Channel.findOne({ channelId });
    
    if (!channel) {
      return res.status(404).json({ message: 'Kanal bulunamadı' });
    }
    
    // Önce güncel kanal bilgilerini çek (uploadsPlaylistId için)
    const channelInfo = await getChannelInfo(channelId);
    
    // YouTube API'den videoları çek - uploadsPlaylistId parametresini geçirerek fazladan API çağrısını engelle
    const response = await getChannelVideos(
      channelId, 
      50, // maxResults
      '', // pageToken yok
      channelInfo.uploadsPlaylistId // Önceden alınan playlist ID'yi kullan
    );
    
    const videos = response.videos;
    let addedCount = 0;
    let updatedCount = 0;
    
    // Her video için DB işlemleri
    for (const videoData of videos) {
      // Video zaten var mı kontrol et
      let video = await Video.findOne({ videoId: videoData.videoId });
      
      if (video) {
        // Var olan videoyu güncelle
        video.viewCount = videoData.viewCount;
        video.likeCount = videoData.likeCount;
        video.dislikeCount = videoData.dislikeCount;
        video.commentCount = videoData.commentCount;
        video.lastUpdated = Date.now();
        
        await video.save();
        updatedCount++;
      } else {
        // Yeni video oluştur
        const newVideo = new Video(videoData);
        
        await newVideo.save();
        addedCount++;
      }
    }
    
    // Kanal bilgilerini güncelle
    // channelInfo'dan alınan yeni verilerle kanal veritabanını da güncelleyelim
    channel.subscriberCount = channelInfo.subscriberCount;
    channel.viewCount = channelInfo.viewCount;
    channel.videoCount = channelInfo.videoCount;
    channel.thumbnailUrl = channelInfo.thumbnailUrl;
    channel.bannerUrl = channelInfo.bannerUrl;
    channel.lastUpdated = Date.now();
    await channel.save();
    
    res.status(200).json({
      message: 'Kanal videoları başarıyla senkronize edildi',
      stats: {
        totalVideos: videos.length,
        addedVideos: addedCount,
        updatedVideos: updatedCount
      }
    });
  } catch (error) {
    console.error('Videolar senkronize edilirken hata oluştu:', error.message);
    res.status(500).json({ 
      message: 'Videolar senkronize edilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// searchChannel fonksiyonunda verileri gelişmiş hesaplama ile doldur
exports.searchChannel = async (req, res) => {
  try {
    const { url } = req.query;
    
    // API kota kullanımını takip etmek için
    let apiQuotaUsage = {
      total: 0,
      details: []
    };
    
    if (!url) {
      return res.status(400).json({ error: 'Kanal URL veya adı gereklidir' });
    }
    
    // YouTube'dan kanal ID'si al
    let channelId;
    try {
      const startTime = Date.now();
      channelId = await findChannelId(url);
      
      // URL youtube.com/channel/ID formatında ise 0 kota, değilse Search API için 100 birim
      if (url.includes('youtube.com/channel/')) {
        apiQuotaUsage.details.push({
          operation: 'findChannelId',
          endpoint: 'channelId from URL',
          cost: 0,
          time: Date.now() - startTime
        });
      } else {
        apiQuotaUsage.total += 100;
        apiQuotaUsage.details.push({
          operation: 'findChannelId',
          endpoint: 'search',
          cost: 100,
          time: Date.now() - startTime
        });
      }
      
    } catch (error) {
      console.error('Kanal ID alınamadı:', error.message);
      return res.status(404).json({ error: `Kanal bulunamadı: ${error.message}` });
    }
    
    if (!channelId) {
      return res.status(404).json({ error: 'Kanal bulunamadı' });
    }
    
    // Önce veritabanında kanalı ara
    let channel = await Channel.findOne({ channelId });
    
    // YouTube API'den güncel bilgileri al
    let channelInfo;
    try {
      const startTime = Date.now();
      channelInfo = await getChannelInfo(channelId);
      
      // channels API 'snippet,statistics,contentDetails,brandingSettings' = 4 birim kota
      apiQuotaUsage.total += 4;
      apiQuotaUsage.details.push({
        operation: 'getChannelInfo',
        endpoint: 'channels',
        cost: 4,
        time: Date.now() - startTime
      });
      
    } catch (error) {
      console.error('Kanal bilgileri alınamadı:', error.message);
      
      // Veritabanında varsa o bilgileri kullan
      if (channel) {
        return res.json({ 
          count: 1, 
          channels: [channel],
          apiQuotaUsage
        });
      }
      
      return res.status(404).json({ error: `Kanal bilgileri alınamadı: ${error.message}` });
    }
    
    if (!channelInfo) {
      return res.status(404).json({ error: 'Kanal bilgileri alınamadı' });
    }
    
    // Gelişmiş kazanç hesaplama
    const startTimeEarnings = Date.now();
    const estimatedEarnings = await kazancHesapla(channelInfo);
    channelInfo.estimatedEarnings = estimatedEarnings;
    
    // ÖNEMLİ: KATEGORI VE ÇARPAN BİLGİLERİNİ KANAL NESNESINE DOĞRUDAN DA EKLE
    // Böylece frontend'de her iki formatta da erişilebilir
    channelInfo.categoryInfo = estimatedEarnings.categoryInfo;
    channelInfo.multipliers = estimatedEarnings.multipliers;
    
    apiQuotaUsage.details.push({
      operation: 'kazancHesapla',
      endpoint: 'local',
      cost: 0,
      time: Date.now() - startTimeEarnings
    });
    
    // Veritabanında varsa güncelle, yoksa yeni kayıt oluştur
    if (channel) {
      // Var olan kanalı güncelle
      channel.subscriberCount = channelInfo.subscriberCount;
      channel.viewCount = channelInfo.viewCount;
      channel.videoCount = channelInfo.videoCount;
      channel.thumbnailUrl = channelInfo.thumbnailUrl;
      channel.bannerUrl = channelInfo.bannerUrl; // Yeni banner URL ekle
      channel.lastUpdated = Date.now();
      
      // Kanal açıklamasını güncelle (içeriği değişmiş olabilir)
      channel.channelDescription = channelInfo.channelDescription;
      
      // Özel URL bilgisini güncelle
      if (channelInfo.customUrl) {
        channel.customUrl = channelInfo.customUrl;
      }
      
      // Kazanç tahminlerini güncelle
      channel.estimatedEarnings = estimatedEarnings;
      
      // Kategori bilgilerini de doğrudan ekle
      channel.categoryInfo = estimatedEarnings.categoryInfo;
      channel.multipliers = estimatedEarnings.multipliers;
      
      await channel.save();
      
      // API YANITI OLUŞTURMA
      // Verileri iç içe nesne yapısıyla gönder, hem doğrudan hem earnings içinde kategori bilgilerini tut
      const responseChannel = channel.toObject(); // MongoDB nesnesini JS nesnesine dönüştür
      responseChannel.earnings = {
        estimatedEarnings: estimatedEarnings,
        categoryInfo: estimatedEarnings.categoryInfo,
        multipliers: estimatedEarnings.multipliers
      };
      
      return res.json({ 
        count: 1, 
        channels: [responseChannel],
        apiQuotaUsage // Kota kullanımı bilgisini yanıta ekle
      });
    } else {
      // Yeni kanal oluştur
      const newChannel = new Channel({
        channelId: channelInfo.channelId,
        channelTitle: channelInfo.channelTitle,
        channelDescription: channelInfo.channelDescription,
        subscriberCount: channelInfo.subscriberCount,
        viewCount: channelInfo.viewCount,
        videoCount: channelInfo.videoCount,
        thumbnailUrl: channelInfo.thumbnailUrl,
        bannerUrl: channelInfo.bannerUrl, // Yeni banner URL ekle
        customUrl: channelInfo.customUrl, // Özel URL bilgisi
        country: channelInfo.country,
        publishedAt: channelInfo.publishedAt,
        estimatedEarnings: estimatedEarnings,
        categoryInfo: estimatedEarnings.categoryInfo, // Kategori bilgilerini doğrudan ekle
        multipliers: estimatedEarnings.multipliers, // Çarpanları doğrudan ekle
        lastUpdated: Date.now()
      });
      
      // Veritabanına kaydedip sonucu döndür
      const savedChannel = await newChannel.save();
      
      // API YANITI OLUŞTURMA
      const responseChannel = savedChannel.toObject();
      responseChannel.earnings = {
        estimatedEarnings: estimatedEarnings,
        categoryInfo: estimatedEarnings.categoryInfo,
        multipliers: estimatedEarnings.multipliers
      };
      
      return res.json({ 
        count: 1, 
        channels: [responseChannel],
        apiQuotaUsage // Kota kullanımı bilgisini yanıta ekle
      });
    }
  } catch (error) {
    console.error('Kanal arama hatası:', error.message);
    return res.status(500).json({ error: `Kanal arama hatası: ${error.message}` });
  }
}; 