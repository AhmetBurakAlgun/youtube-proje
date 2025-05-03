// API temel URL'si
const API_URL = '/api';

// Mevcut arama sonuçları - bu değişkeni arama öncesi temizleyeceğiz
let currentSearchResults = null;

// Banner alma işlemini api.js'den yap
import { fetchBannerImage } from './js/api.js';


// Yükleniyor göstergesini göster
function showLoading() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
}

// Yükleniyor göstergesini gizle
function hideLoading() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

// Hata mesajını göster
function showError(message) {
  console.error('HATA:', message);
  
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    // Hata mesajına ikon ekle
    errorElement.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center;">
        <div style="margin-right:10px; color:red;">
          <i class="material-icons">error</i>
        </div>
        <div>${message}</div>
      </div>
    `;
    
    // Hata mesajını göster ve animasyon ekle
    errorElement.style.display = 'block';
    errorElement.style.animation = 'fadeIn 0.3s';
    
    // 5 saniye sonra gizle
    setTimeout(() => {
      errorElement.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
      errorElement.style.display = 'none';
      }, 300);
    }, 5000);
  }
}

// YENİ: Banner önbellekleme için basit bir cache sistemi ekleyelim
const bannerCache = {
  cache: new Map(), // Kanal ID -> Banner URL eşlemesi
  
  // Banner URL'sini cache'e ekle
  set: function(channelId, bannerUrl) {
    if (!channelId) return;
    
    // null, false, veya URL olabilir - hepsini önbelleğe al
    console.log(`Banner bilgisi önbelleğe alınıyor: ${channelId} => ${bannerUrl ? (typeof bannerUrl === 'string' ? bannerUrl.substring(0, 30) + '...' : bannerUrl) : 'null/false'}`);
    
    this.cache.set(channelId, {
      url: bannerUrl,
      timestamp: Date.now()
    });
  },
  
  // Cache'den banner URL'sini getir (varsa)
  get: function(channelId) {
    if (!channelId) return null;
    
    const cached = this.cache.get(channelId);
    if (!cached) return null;
    
    // Önbellek süresi kontrolü (1 saat)
    const cacheTimeMs = 60 * 60 * 1000; // 1 saat
    if (Date.now() - cached.timestamp > cacheTimeMs) {
      console.log(`Önbellekteki banner bilgisi süresi dolmuş: ${channelId}`);
      this.cache.delete(channelId);
      return null;
    }
    
    console.log(`Banner bilgisi önbellekten alındı: ${channelId}`);
    return cached.url; // false, null veya URL string olabilir
  },
  
  // Cache'i temizle
  clear: function() {
    this.cache.clear();
  }
};

// DOM yüklendikten sonra çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
  // Arama formunu ayarla
  setupSearchForm();
  
  // Arama kutusuna odaklandığında içeriği temizleme işlemini ayarla
  setupSearchInput();
  
  // Kategori gösterimi için CSS ekle
  addEarningsCSS();

  // Info butonu için manuel bir dinleyici ekle (CSS hover kuralları yanında)
  const infoButton = document.getElementById('info-button');
  const descriptionContainer = document.querySelector('.channel-description-container');
  
  if (infoButton && descriptionContainer) {
    // Açıklama üzerine hover durumunu izleyen değişken
    let isDescriptionHovered = false;
    
    infoButton.addEventListener('mouseenter', function() {
      console.log('Info butonuna hover olundu');
      descriptionContainer.style.display = 'block';
    });
    
    infoButton.addEventListener('mouseleave', function() {
      // Mouse çıktığında ve açıklama üzerinde değilse kapat
      console.log('Info butonundan çıkıldı');
      
      // Açıklamanın üzerinde değilse gizle
      if (!isDescriptionHovered) {
        setTimeout(() => {
          descriptionContainer.style.display = 'none';
        }, 100); // Geçiş için kısa bir gecikme
      }
    });
    
    // Açıklama kutusu hover olaylarını takip et
    descriptionContainer.addEventListener('mouseenter', function() {
      console.log('Açıklama kutusuna hover olundu');
      isDescriptionHovered = true;
    });
    
    descriptionContainer.addEventListener('mouseleave', function() {
      console.log('Açıklama kutusundan çıkıldı');
      isDescriptionHovered = false;
      // Açıklamadan çıkınca kapat
      setTimeout(() => {
        descriptionContainer.style.display = 'none';
      }, 100); // Geçiş için kısa bir gecikme
    });
  }

  // Sayfa yüklendikten sonra description alanının görünürlüğünü kontrol et
  setTimeout(function() {
    const descriptionArea = document.querySelector('.youtuber-description-alan');
    if (descriptionArea && descriptionArea.style.display !== 'block') {
      console.log("Statlar alanı görünürlüğü kontrol ediliyor");
    }
    
    // title-inline elementini kontrol et
    const titleInline = document.getElementById('title-inline');
    const kanalTitle = document.querySelector('#title')?.innerText || '';
    if (titleInline && kanalTitle && !titleInline.textContent) {
      console.log("Kanal adı gösterimi kontrol ediliyor");
    }
  }, 1000);
});

// Arama formunu ayarla
function setupSearchForm() {
  console.log('Arama formu ayarlanıyor...');
  const searchForm = document.getElementById('deneme');
  if (!searchForm) {
    console.error('deneme ID\'li form bulunamadı!');
    return;
  }
  
  // Input doğrulama için özel bir olay dinleyici
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('invalid', function() {
      showError('Lütfen bir kanal URL\'si veya adı girin.');
    });
  }
  
  // Form submit olayını engelleme
    searchForm.addEventListener('submit', async function(e) {
    // Sayfanın yenilenmesini engelleyen en önemli satır
    e.preventDefault();
    console.log('Form gönderimi engellendi, AJAX isteği başlatılıyor...');
    
    // Sonuçları temizle
    resetResults();
    
    // Arama değerini al
    const channelUrl = searchInput ? searchInput.value.trim() : '';
    if (!channelUrl) {
      showError('Lütfen bir kanal URL\'si veya adı girin.');
      return;
    }
    
    // Logo animasyonu ve yükleniyor göstergesi
    applySearchAnimation();
    showLoading();
    
    try {
      // Kanalı ara ve verileri göster
      const channelData = await searchChannel(channelUrl);
      if (channelData) {
        currentSearchResults = channelData;
        fillChannelData(channelData);
      }
    } catch (error) {
      console.error('Arama işlemi sırasında hata:', error);
      showError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      hideLoading();
    }
  });
  
  // Submit butonuna tıklama için ekstra güvenlik
  const submitButton = document.getElementById('submit');
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Form gönderme olayını manuel tetikle
      const event = new Event('submit', {
        'bubbles': true,
        'cancelable': true
      });
      searchForm.dispatchEvent(event);
    });
  }
}

// Arama kutusunu ayarla
function setupSearchInput() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;
  
  searchInput.addEventListener('focus', function() {
    // Input'a odaklandığında form verilerini sıfırla
    if (this.value) {
      this.value = '';
      resetResults();
    } else {
      // Banner alanını gizle (boş alan gösterilmemeli)
      const bannerArea = document.querySelector('.youtuber-banner-alan');
      if (bannerArea) bannerArea.style.display = 'none';
      
      // Metin alanlarını temizle
      document.querySelectorAll('#title, #subscriber, #totalviews, #totalvideos, #para').forEach(el => {
        if (el) el.innerHTML = '';
      });
    }
  });
}

// Arama sonuçlarını sıfırla
function resetResults() {
  console.log('Arama sonuçları sıfırlanıyor...');
  
  // Banner ve logo alanlarını gizle
  const bannerArea = document.querySelector('.youtuber-banner-alan');
  const logoArea = document.querySelector('.youtuber-logo-alan');
  const descriptionArea = document.querySelector('.youtuber-description-alan');
  
  if (bannerArea) {
    bannerArea.classList.remove('show');
    bannerArea.style.display = 'none';
    bannerArea.style.opacity = '0';
    bannerArea.style.visibility = 'hidden';
  }
  
  if (logoArea) {
    logoArea.classList.remove('show');
    logoArea.style.opacity = '0';
    logoArea.style.visibility = 'hidden';
  }
  
  if (descriptionArea) {
    descriptionArea.classList.remove('show');
    descriptionArea.style.display = 'none';
    descriptionArea.style.opacity = '0';
    descriptionArea.style.visibility = 'hidden';
  }
  
  // Diğer sıfırlama işlemleri...
}

// Arama animasyonları
function applySearchAnimation() {
  // Logo animasyonları
  const asagi = document.getElementById('asagi');
      if (asagi) {
        asagi.style.marginTop = '30px';
        asagi.style.transition = 'all 0.4s ease';
      }
      
  // Sosyal medya ikonlarını gizle
  const idGit = document.getElementById('id-git');
  if (idGit) {
    idGit.style.display = 'none';
  }
}

// Kanalı ara
async function searchChannel(channelUrl) {
  console.log('Kanal aranıyor:', channelUrl);
  
  try {
    // Önce arama alanını kontrol edip, ne olduğunu anlama
    const channelUrlType = determineChannelUrlType(channelUrl);
    
    // AJAX isteği
    const response = await fetch(`${API_URL}/channels?url=${encodeURIComponent(channelUrl)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API isteği başarısız oldu: ${response.status}`);
    }
    
    // Yeni arama sonucunu kontrol edip formatlanmış cevabı döndür
    const data = await response.json();
    
    console.log('API cevap verisi:', data);
    
    // API'den gelen cevabın geçerliliğini kontrol et
    if (!data || data.error) {
      throw new Error(data?.error?.message || 'Kanal aranırken bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('Arama sırasında hata:', error);
    throw error;
  }
}

// Kanal URL/adı tipini belirle
function determineChannelUrlType(channelUrl) {
  // URL ya da ID olup olmadığını belirle
  let type = 'search';  // Varsayılan olarak arama yap
  
  // URL ise parse et
  if (channelUrl.includes('youtube.com/') || channelUrl.includes('youtu.be/')) {
    // Tam URL formatında (@username)
    if (channelUrl.includes('/c/') || channelUrl.includes('/@')) {
      type = 'custom';
    } 
    // Klasik kanal URL'si (channel/ID formatında)
    else if (channelUrl.includes('/channel/')) {
      type = 'id';
    }
    // Kullanıcı URL'si
    else if (channelUrl.includes('/user/')) {
      type = 'username';
    }
  } 
  // ID olabilir mi kontrol et (24 karakter civarı ve belirli formatta)
  else if (/^UC[\w-]{21,23}$/.test(channelUrl)) {
    type = 'id';
  }
  
  console.log(`Kanal tanımlama tipi: ${type} için "${channelUrl}"`);
  return type;
}

// Kanal verilerini doldur
function fillChannelData(channel) {
  console.log('Kanal verileri doldurulacak:', channel);
  
  // Kanal verilerini doğru şekilde al
  const channelData = channel.channels && channel.channels[0] ? channel.channels[0] : channel;
  
  // Kanal ile ilgili HTML öğelerini seç
  const title = document.getElementById('title');
  const subscriber = document.getElementById('subscriber');
  const totalviews = document.getElementById('totalviews');
  const totalvideos = document.getElementById('totalvideos');
  const para = document.getElementById('para');
  const thumbnail = document.getElementById('thumbnail');
  const bannerElement = document.getElementById('banner');
  const bannerArea = document.querySelector('.youtuber-banner-alan');
  const logoArea = document.querySelector('.youtuber-logo-alan');
  const descriptionArea = document.querySelector('.youtuber-description-alan');
  const channelDescriptionContainer = document.querySelector('.channel-description-container');
  
  // Kanal açıklaması konteynerini gizli ancak görünür olarak ayarla
  if (channelDescriptionContainer) {
    console.log('Kanal açıklama konteynerini hazırlıyorum');
    channelDescriptionContainer.style.display = 'none'; // Başlangıçta gizli olsun
    channelDescriptionContainer.style.opacity = '1';
    channelDescriptionContainer.style.visibility = 'visible';
  }
  
  // Kanal ID, adı ve thumbnail URL'yi belirle
  const channelId = channelData.channelId;
  const kanalAdi = channelData.channelTitle;
  const aboneSayisi = channelData.subscriberCount;
  const izlenmeSayisi = channelData.viewCount;
  const videoSayisi = channelData.videoCount;
  const thumbnailUrl = channelData.thumbnailUrl;
  
  // Görsel elemanlara başvuru
  const imageTracker = {
    bannerLoaded: false,
    thumbnailLoaded: false,
    checkAndDisplay: function() {
      if (this.bannerLoaded && this.thumbnailLoaded) {
        // Verileri göster
        displayData();
      }
    }
  };
  
  // Thumbnail yükleme
  if (thumbnail && thumbnailUrl) {
    // Thumbnail URL'sini düzelt (eğer gerekli ise)
    let formattedThumbnailUrl = thumbnailUrl;
    
    // URL parametrelerini koruyarak CORS proxy ekle
    if (thumbnailUrl.startsWith('http')) {
      console.log('Thumbnail için orijinal URL:', thumbnailUrl);
      
      // Orijinal URL'yi kaydet (hata durumunda kullanmak için)
      thumbnail.dataset.originalUrl = thumbnailUrl;
      
      // Doğrudan API üzerinden proxy kullanarak yükle
      // Bu backend'de /api/proxy-image endpoint'i olduğunu varsayar
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(thumbnailUrl)}`;
      console.log('API üzerinden Thumbnail proxy URL:', proxyUrl);
      thumbnail.src = proxyUrl;
    } else {
      // Zaten lokal bir kaynak, direkt kullan
      thumbnail.src = thumbnailUrl;
    }
    
    thumbnail.onload = function() {
      console.log('Thumbnail yüklendi');
      // Yüklendikten sonra görünürlüğünü ayarla
      thumbnail.style.opacity = '1';
      imageTracker.thumbnailLoaded = true;
      imageTracker.checkAndDisplay();
      
      // Başka bir optimizasyon işlemi yapılmasın
      thumbnail.dataset.optimized = 'true';
    };
    
    thumbnail.onerror = function() {
      console.error('Thumbnail yüklenemedi, alternatif yöntemler deneniyor...');
      
      // Hatadan sonra alternatif kaynak dene (eğer originalUrl varsa)
      if (thumbnail.dataset.originalUrl && thumbnail.src !== thumbnail.dataset.originalUrl) {
        console.log('Doğrudan orijinal URL deneniyor:', thumbnail.dataset.originalUrl);
        thumbnail.src = thumbnail.dataset.originalUrl;
        return;
      }
      
      // Otomatik avatar oluştur
      createAutomaticAvatar(channelData, thumbnail, () => {
      imageTracker.thumbnailLoaded = true;
      imageTracker.checkAndDisplay();
      });
    };
  } else {
    console.warn('Thumbnail URL bulunamadı');
    // Otomatik avatar oluştur
    if (thumbnail) {
      createAutomaticAvatar(channelData, thumbnail, () => {
        console.log('Otomatik avatar oluşturuldu');
      });
    }
    imageTracker.thumbnailLoaded = true;
    imageTracker.checkAndDisplay();
  }
  
  // Banner yükleme
  if (bannerElement && channelId) {
    fetchBannerImage(channelId)
      .then(bannerUrl => {
        if (bannerUrl) {
          bannerElement.onload = function() {
            console.log('Banner yüklendi');
            imageTracker.bannerLoaded = true;
            imageTracker.checkAndDisplay();
          };
          
          bannerElement.onerror = function() {
            console.error('Banner yüklenemedi');
            imageTracker.bannerLoaded = true;
            imageTracker.checkAndDisplay();
          };
          
          bannerElement.src = bannerUrl;
        } else {
          console.warn('Banner URL bulunamadı');
          imageTracker.bannerLoaded = true;
          imageTracker.checkAndDisplay();
        }
      })
      .catch(err => {
        console.error('Banner URL alınırken hata:', err);
        imageTracker.bannerLoaded = true;
        imageTracker.checkAndDisplay();
      });
  } else {
    console.warn('Banner elementi veya channelId bulunamadı');
    imageTracker.bannerLoaded = true;
    imageTracker.checkAndDisplay();
  }
  
  // Verileri görüntüle
  function displayData() {
    // Kanal yaşı bilgisini konsola yazdır
    if (channelData.publishedAt || channelData.snippet?.publishedAt) {
      const publishDate = channelData.publishedAt || channelData.snippet?.publishedAt;
      console.log('Kanal kuruluş tarihi:', publishDate, 'Kanal yaşı:', calculateChannelAge(publishDate));
    }
    
    // Yeni eklenen displayChannelData fonksiyonunu kullanarak verileri göster
    displayChannelData(channelData);
  }
  
  // Veriler 3 saniye içinde yüklenmezse otomatik göster
  setTimeout(() => {
    if (!imageTracker.bannerLoaded || !imageTracker.thumbnailLoaded) {
      console.warn('Görsel yükleme zaman aşımı, veriler zorla gösteriliyor');
      imageTracker.bannerLoaded = true;
      imageTracker.thumbnailLoaded = true;
      displayData();
    }
  }, 3000);
}

// YENİ: Görsel optimizasyonu için eklenen fonksiyon
function optimizeImage(imgElement) {
  // İlk aratılan kanalın banner kalitesi sorununu çözmek için
  // Banner görsellerinde, sayfanın her yeniden yüklenmesinde ilk aratılan kanal için
  // optimizasyonu tamamen atlıyoruz - böylece ilk aratmada ham kalitede görünür
  
  // Sadece banner'lar için ve sayfa yüklenmesinden bu yana ilk aratmada optimizasyonu atla
  if (imgElement.id === 'banner' && !window.bannerOptimizationPerformed) {
    console.log('İlk aratılan kanalın banner\'ı için optimizasyon atlanıyor (yüksek kalite için)');
    window.bannerOptimizationPerformed = true;
    return; // İlk seferde optimizasyon yapma
  }
  
  // Görsel zaten yüklendiyse optimize et
  if (imgElement.complete) {
    performOptimization();
  } else {
    // Görsel henüz yüklenmediyse, yüklendikten sonra optimize et
    const originalOnload = imgElement.onload;
    imgElement.onload = function() {
      performOptimization();
      // Orijinal onload fonksiyonunu çağır
      if (originalOnload) originalOnload.call(this);
    };
  }
  
  // Optimizasyon işlemini gerçekleştir
  function performOptimization() {
    try {
      // Görsel zaten optimize edilmişse tekrar işleme
      if (imgElement.dataset.optimized === 'true') return;
      
      // Orijinal görsel boyutları
      const width = imgElement.naturalWidth;
      const height = imgElement.naturalHeight;
      
      // Görsel çok büyükse boyutunu küçült (özellikle banner için)
      let targetWidth = width;
      let targetHeight = height;
      
      // Eğer bir banner ise (250px yükseklikte gösteriliyor)
      if (imgElement.id === 'banner' && height > 250) {
        // Banner'ın oranına göre genişliği hesapla
        const aspectRatio = width / height;
        
        // En-boy oranını koruyarak hedef boyutları hesapla
        // 250px yükseklikte gösterdiğimiz için, buna göre genişlik hesaplanmalı
        targetHeight = Math.min(height, 500); // Maks 2x görüntüleme yüksekliği 
        targetWidth = Math.floor(targetHeight * aspectRatio);
        
        // Genişlik belli bir sınırı aşmasın (çok yüksek çözünürlüklü bannerlarda)
        if (targetWidth > 1440) { // HD+ boyut yeterli
          targetWidth = 1440;
          targetHeight = Math.floor(targetWidth / aspectRatio);
        }
      } 
      // Logo/thumbnail ise (daha küçük olmalı)
      else if (imgElement.id === 'thumbnail') {
        // Thumbnail 80x80 px olarak gösteriliyor, max 160x160 yeterli
        const MAX_THUMBNAIL_SIZE = 160;
        if (width > MAX_THUMBNAIL_SIZE || height > MAX_THUMBNAIL_SIZE) {
          if (width > height) {
            targetWidth = MAX_THUMBNAIL_SIZE;
            targetHeight = Math.floor(height * (MAX_THUMBNAIL_SIZE / width));
          } else {
            targetHeight = MAX_THUMBNAIL_SIZE;
            targetWidth = Math.floor(width * (MAX_THUMBNAIL_SIZE / height));
          }
        }
      }
      
      // Orijinal boyut ve hedef boyut aynıysa optimizasyona gerek yok
      // Sadece yüksek oranda küçültme yapılacaksa gerçekleştir
      const significantResize = 
        width > targetWidth * 1.2 || // En az %20 daha büyükse küçült
        height > targetHeight * 1.2 || 
        width * height > 1000000; // 1 megapiksel üzeriyse mutlaka optimize et
        
      if (!significantResize) {
        console.log(`${imgElement.id} optimizasyona gerek yok: ${width}x${height}`);
        return; // Optimize etmeden çık
      }
      
      // Canvas oluştur
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Yeni boyutları ayarla
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Anti-aliasing etkinleştir (daha kaliteli küçültme için)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Görüntüyü canvas'a çiz (boyutlandırarak)
      ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);
      
      // Optimizasyon yapıldığını işaretle
      imgElement.dataset.optimized = 'true';
      
      // Banner için JPEG, thumbnail için PNG (şeffaflık için)
      const imageFormat = imgElement.id === 'thumbnail' ? 'image/png' : 'image/jpeg';
      
      // Tüm görseller için daha yüksek kalite faktörü kullan (0.85 -> 0.9)
      const qualityFactor = 0.9;
      
      // Optimize edilmiş data URL oluştur
      const dataUrl = canvas.toDataURL(imageFormat, qualityFactor);
      
      // Dosya boyutunu yaklaşık olarak hesapla (bayt cinsinden)
      const aproximateSize = Math.round(dataUrl.length * 0.75); // base64, orjinal boyutun ~%75'i
      const fileSize = (aproximateSize / 1024).toFixed(1); // KB cinsinden
      
      // Orijinal src'yi yedekle
      if (!imgElement.dataset.originalSrc) {
        imgElement.dataset.originalSrc = imgElement.src;
      }
      
      // Optimize edilmiş görüntüyü atama
      imgElement.src = dataUrl;
      console.log(`${imgElement.id} optimize edildi: ${width}x${height} → ${targetWidth}x${targetHeight}, ${fileSize}KB, kalite: ${qualityFactor}`);
    } catch (error) {
      console.error('Görsel optimizasyonu başarısız:', error);
      // Hata durumunda orijinal görüntüyü kullan
    }
  }
}

// Kazanç gösterimi için CSS ekle
function addEarningsCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .earnings-overview {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .earnings-category {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .category-label {
            font-weight: bold;
            margin-right: 10px;
            color: #fff;
        }

        .category-value {
            color: #4CAF50;
            font-weight: 500;
        }

        .earnings-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }

        .earnings-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            transition: transform 0.2s ease;
        }

        .earnings-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.08);
        }

        .earnings-label {
            display: block;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5px;
        }

        .earnings-value {
            display: block;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
        }

        .error {
            color: #ff4444;
            padding: 15px;
            background: rgba(255, 68, 68, 0.1);
            border-radius: 8px;
            text-align: center;
            margin-top: 20px;
        }

        @media (max-width: 768px) {
            .earnings-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .earnings-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// Sayı formatı fonksiyonu
function formatNumber(num) {
  if (!num) return "0";
  
  num = parseInt(num);
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Virgüllü sayı formatı
function formatNumberWithCommas(num) {
  if (!num) return "0";
  
  num = parseInt(num);
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Para miktarını formatlı göster
function formatMoney(amount) {
    // Null, undefined veya NaN değerlere karşı koruma
    if (amount === undefined || amount === null || isNaN(amount)) {
        return "0";
    }
    
    // Number'a çevir
    const num = Number(amount);
    if (isNaN(num)) {
        return "0";
    }
    
    // toLocaleString kullan
    try {
        return num.toLocaleString();
    } catch (error) {
        console.error('Para formatı hatası:', error);
        return "0";
    }
}

// Kategori çevirileri
const CATEGORY_TRANSLATIONS = {
    'News': 'Haber',
    'Education': 'Eğitim',
    'Finance': 'Finans',
    'Gaming': 'Oyun',
    'Tech': 'Teknoloji',
    'Entertainment': 'Eğlence',
    'Vlog': 'Vlog',
    'Sports': 'Spor',
    'Beauty': 'Güzellik',
    'Cooking': 'Yemek',
    'Uncategorized': 'Kategorisiz'
};

// Kazanç verilerinden HTML oluştur
function olusturKazancHTML(kazancVerileri) {
    try {
        // Debug log
        console.log('Kazanç verileri:', kazancVerileri);
        
        // Veri kontrolü
        if (!kazancVerileri || typeof kazancVerileri !== 'object') {
            console.error('Geçersiz kazanç verisi:', kazancVerileri);
            return '<div class="error">Kazanç verisi hesaplanamadı</div>';
        }

        // Kategori bilgisi ve çarpanlar için güvenlik kontrolleri
        const categoryInfo = kazancVerileri.categoryInfo || { type: 'Uncategorized', confidence: 0 };
        const multipliers = kazancVerileri.multipliers || { category: 1.0 };
        
        // Kategori çarpanı için güvenlik kontrolü
        let categoryMultiplier = 1.0;
        if (multipliers && typeof multipliers.category === 'number' && !isNaN(multipliers.category)) {
            categoryMultiplier = multipliers.category;
        }

        // Kategori bilgilerini güvenli şekilde al
        const categoryType = (categoryInfo && categoryInfo.type) || "Uncategorized";
        const confidence = (categoryInfo && categoryInfo.confidence) || 0;
  
        // Kategori adını Türkçe'ye çevir
        const categoryNameTR = CATEGORY_TRANSLATIONS[categoryType] || "Kategorisiz";

        // HTML oluştur
        return `
            <h3>Tahmini Kazanç</h3>
            <div class="earnings-category">
                <span class="category-label">Kategori:</span>
                <span class="category-value">${categoryNameTR} (${confidence.toFixed(1)}% güven)</span>
            </div>
            <div class="earnings-grid">
                <div class="earnings-item">
                    <span class="earnings-label">Günlük</span>
                    <span class="earnings-value">${formatMoney(kazancVerileri.daily?.estimated)}</span>
                </div>
                <div class="earnings-item">
                    <span class="earnings-label">Haftalık</span>
                    <span class="earnings-value">${formatMoney(kazancVerileri.weekly?.estimated)}</span>
                </div>
                <div class="earnings-item">
                    <span class="earnings-label">Aylık</span>
                    <span class="earnings-value">${formatMoney(kazancVerileri.monthly?.estimated)}</span>
                </div>
                <div class="earnings-item">
                    <span class="earnings-label">Yıllık</span>
                    <span class="earnings-value">${formatMoney(kazancVerileri.yearly?.estimated)}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Kazanç HTML oluşturma hatası:', error);
        return '<div class="error">Kazanç verisi işlenirken hata oluştu</div>';
    }
}

// Çarpan açıklaması döndüren yardımcı fonksiyon
function getMultiplierDescription(multiplier) {
  if (multiplier >= 2.0) return "Çok yüksek değerli kategori";
  if (multiplier >= 1.5) return "Yüksek değerli kategori";
  if (multiplier >= 1.2) return "Orta-yüksek değerli kategori";
  if (multiplier >= 1.0) return "Ortalama değerli kategori";
  if (multiplier >= 0.8) return "Orta-düşük değerli kategori";
  return "Düşük değerli kategori";
}

// Kanal adından tutarlı renkler oluştur
function generateChannelColors(channelName) {
  // Kanal adından basit bir hash oluştur
  let hash = 0;
  for (let i = 0; i < channelName.length; i++) {
    hash = channelName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Birincil renk
  const h1 = Math.abs(hash % 360);  // Hue (0-360)
  const s1 = 70 + Math.abs((hash >> 3) % 30);  // Saturation (70-100)
  const l1 = 45 + Math.abs((hash >> 6) % 10);  // Lightness (45-55)
  
  // İkincil renk (komplementer)
  const h2 = (h1 + 40) % 360;  // 40 derece farklı hue
  const s2 = s1 - 10;  // Biraz daha az doygun
  const l2 = l1 + 5;   // Biraz daha açık
  
  return {
    primary: `hsl(${h1}, ${s1}%, ${l1}%)`,
    secondary: `hsl(${h2}, ${s2}%, ${l2}%)`
  };
}

// YouTube API v3 üzerinden banner URL'sini almayı dene
function fetchYouTubeBanner(channelId, existingBannerUrl = null) {
  console.log(`Banner alınıyor (Kanal ID: ${channelId})...`);
  
  return new Promise((resolve, reject) => {
    // 1. Eğer doğrudan banner URL'si verilmişse, onu kullan
    if (existingBannerUrl) {
      console.log('Kanal verisinden banner URL kullanılıyor:', existingBannerUrl);
      
      // Banner formatını optimize et (eğer gerekiyorsa)
      let formattedBannerUrl = existingBannerUrl;
      if (!formattedBannerUrl.includes('w1280')) {
        formattedBannerUrl += "=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj";
        console.log('Banner URL formatlandı:', formattedBannerUrl);
      }
      
      // Önce CORS olmadan doğrudan URL'yi deneyeceğiz
      tryDirectBannerLoading(formattedBannerUrl)
        .then(usableUrl => {
          // Direkt URL çalıştıysa bunu önbelleğe al ve kullan
          bannerCache.set(channelId, usableUrl);
          resolve(usableUrl);
        })
        .catch(() => {
          // CORS hatası varsa proxy üzerinden dene
          const proxyUrl = `/api/proxy-banner?url=${encodeURIComponent(formattedBannerUrl)}`;
          console.log('Direkt URL çalışmadı, proxy URL kullanılıyor:', proxyUrl);
          bannerCache.set(channelId, proxyUrl);
          resolve(proxyUrl);
        });
      
      return; // Erken dönüş - backend çağrısı yapmaya gerek yok
    }
    
    // 2. Önbellekte bu kanal ID için "banner yok" durumu varsa
    const cachedUrl = bannerCache.get(channelId);
    if (cachedUrl === false) {
      console.log('Kanal için banner olmadığı önbellekte kayıtlı, istek yapılmayacak');
      return resolve(null);
    }
    
    // 3. Önbellekte varsa direkt kullan
    if (cachedUrl) {
      console.log('Banner URL önbellekten bulundu:', cachedUrl);
      return resolve(cachedUrl);
    }
    
    // 4. Hiçbir önbellek veya doğrudan URL yoksa, API'ye sor
    console.log('Önbellekte banner yok, API isteği yapılıyor...');
    const timestamp = new Date().getTime();
    const bannerApiUrl = `/api/channel-banner/${channelId}?_t=${timestamp}`;
    
    // Retry değerleri
    let retryCount = 0;
    const maxRetries = 2;
    const retryDelay = 500;
    
    // Yeniden deneme yapabilen fetch fonksiyonu
    const fetchWithRetry = () => {
      fetch(bannerApiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })
        .then(response => {
          console.log(`Banner API yanıt status: ${response.status}`);
          
          if (!response.ok) {
            if (response.status === 403 && retryCount < maxRetries) {
              retryCount++;
              console.log(`Banner API 403 hatası, ${retryDelay}ms sonra tekrar deneniyor... (Deneme: ${retryCount}/${maxRetries})`);
              setTimeout(fetchWithRetry, retryDelay);
              return null;
            }
            
            throw new Error(`Banner alınamadı (HTTP Kod: ${response.status})`);
          }
          return response.json();
        })
        .then(data => {
          if (data === null) return;
          
          console.log('Banner API yanıtı:', data);
          
          if (data.bannerUrl) {
            console.log('Banner URL bulundu:', data.bannerUrl);
            
            if (!data.bannerUrl.startsWith('http')) {
              console.error('Banner URL hatalı format:', data.bannerUrl);
              reject(new Error('Banner URL\'si geçersiz formatta'));
              return;
            }
            
            // Format parametreleri ekle
            let formattedBannerUrl = data.bannerUrl;
            if (!formattedBannerUrl.includes('w1280')) {
              formattedBannerUrl += "=w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj";
            }
            
            // Önce CORS olmadan doğrudan URL'yi deneyeceğiz
            tryDirectBannerLoading(formattedBannerUrl)
              .then(usableUrl => {
                // Direkt URL çalıştıysa bunu önbelleğe al ve kullan
                bannerCache.set(channelId, usableUrl);
                resolve(usableUrl);
              })
              .catch(() => {
                // CORS hatası varsa proxy üzerinden dene
                const proxyUrl = `/api/proxy-banner?url=${encodeURIComponent(formattedBannerUrl)}`;
                console.log('Direkt URL çalışmadı, proxy URL kullanılıyor:', proxyUrl);
                bannerCache.set(channelId, proxyUrl);
                resolve(proxyUrl);
              });
            
            return;
          }
          
          // Banner URL'si bulunamadı - "banner yok" durumunu önbelleğe al
          console.log('API üzerinden banner URL\'si bulunamadı');
          bannerCache.set(channelId, false); // false değerini sakla
          reject(new Error('Banner URL\'si bulunamadı'));
        })
        .catch(error => {
          console.error('Banner alma hatası:', error);
          reject(error);
        });
    };
    
    // İlk isteği başlat
    fetchWithRetry();
  });
}

// CORS problemi olmadan direkt banner URL yüklemeyi dene
function tryDirectBannerLoading(bannerUrl) {
  return new Promise((resolve, reject) => {
    // Timeout - tarayıcı çok uzun süre beklemesin
    const timeoutId = setTimeout(() => {
      console.log('Banner direkt yükleme zaman aşımı');
      reject(new Error('Timeout'));
    }, 3000);
    
    const testImg = new Image();
    
    testImg.onload = function() {
      clearTimeout(timeoutId);
      console.log('Banner URL doğrudan yüklenebiliyor, proxy gerekmez');
      resolve(bannerUrl); // Direkt URL'yi döndür
    };
    
    testImg.onerror = function(err) {
      clearTimeout(timeoutId);
      console.warn('Banner URL doğrudan yüklenemiyor, CORS sorunu olabilir');
      reject(err);
    };
    
    // Tarayıcının önbelleği kullanmaması için random param ekle
    testImg.src = bannerUrl + (bannerUrl.includes('?') ? '&' : '?') + 'nocache=' + Math.random();
  });
}

// Nesne içinde 'banner' içeren URL özelliklerini bul
function findPossibleBannerUrls(obj, results = [], path = '') {
  // Nesne kontrolü
  if (!obj || typeof obj !== 'object') return results;
  
  // Nesnenin tüm özelliklerini dolaş
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newPath = path ? `${path}.${key}` : key;
      
      // URL olabilecek string değerleri kontrol et
      if (typeof value === 'string' && 
          (key.toLowerCase().includes('banner') || key.toLowerCase().includes('image')) && 
          value.startsWith('http')) {
        console.log(`Olası banner URL'si bulundu: ${newPath} = ${value}`);
        results.push(value);
      }
      
      // Alt nesneleri rekürsif olarak kontrol et
      if (value !== null && typeof value === 'object') {
        findPossibleBannerUrls(value, results, newPath);
      }
    }
  }
  
  return results;
}

// Nesne içinde belirli kelimeleri içeren tüm alanları bul (debug için)
function findAllFieldsContaining(obj, keywords, results = [], path = '') {
  if (!obj || typeof obj !== 'object') return results;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newPath = path ? `${path}.${key}` : key;
      
      // Eğer anahtar kelimelerden birini içeriyorsa, alanı kaydet
      if (keywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))) {
        results.push({
          path: newPath,
          value: typeof value === 'object' ? 'Object' : value
        });
      }
      
      // Alt nesneleri rekürsif olarak kontrol et
      if (value !== null && typeof value === 'object') {
        findAllFieldsContaining(value, keywords, results, newPath);
      }
    }
  }
  
  return results;
}

// YENİ: Otomatik banner oluşturma fonksiyonu
function createAutomaticBanner(channel, bannerElement, callback) {
  try {
    // Kanal adını al
    const channelName = channel.channelTitle || channel.snippet?.title || 'YouTube Kanalı';
    
    // Kanal için tutarlı renkler oluştur
    const colors = generateChannelColors(channelName);
    
    // Canvas oluştur - Daha optimize bir çözünürlük kullanıyoruz
    const canvas = document.createElement('canvas');
    canvas.width = 1280; // HD çözünürlük - daha optimize
    canvas.height = 720; // HD çözünürlük - 16:9 oranını koruyoruz
    
    const ctx = canvas.getContext('2d');
    
    // Anti-aliasing'i etkinleştir (daha yumuşak kenarlar)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Önemli içeriği merkeze toplamak için merkez alanını tanımla
    // Banner 250px yükseklikte gösterileceği için, asıl içeriği merkeze topla
    const contentPadding = Math.floor((720 - 250) / 2);
    const safeContentArea = {
      y: contentPadding,      // Üstten kesilecek alan
      height: 720 - contentPadding * 2  // Görünür alan (250px)
    };
    
    // Daha şık arka plan oluştur - çift yönlü ve daha yumuşak gradient
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width*0.7
    );
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(0.7, colors.primary);
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)'); // Kenarlar daha koyu
    
    // Arkaplanı doldur
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Merkezi içerik alanını belirle - görünür/kesilmeyen kısım
    const centerY = canvas.height / 2; // Canvas merkezi
    
    // Şık desenler ekle - sadece görünür alanda yoğunlaştır
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 3; // Daha ince çizgiler
    
    // Görünür alanda yatay çizgiler
    for (let i = 0; i < 6; i++) {
      // Yatay çizgiler - sadece merkez alana
      const y = safeContentArea.y + (safeContentArea.height * (i/6));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Dikey çizgiler - tüm canvas'da
    for (let i = 0; i < 8; i++) {
      const x = canvas.width * (i/8);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Noktalar ekle - görünür alanda yoğunlaştır
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 80; i++) {
      const size = Math.random() * 8 + 2;
      // X pozisyonu tüm genişlikte
      const x = Math.random() * canvas.width;
      // Y pozisyonu görünür alanda yoğunlaştır
      const y = safeContentArea.y + Math.random() * safeContentArea.height;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Merkez alan vurgusu ekle - sadece görünür kısımda
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, safeContentArea.y, canvas.width, safeContentArea.height);
    
    // Kanal adını merkeze yaz
    ctx.font = 'bold 68px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Kanal adına gölge ekleyerek okunabilirliği artır
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Uzun kanal adları için metni sınırla
    let displayName = channelName;
    if (channelName.length > 25) {
      displayName = channelName.substring(0, 22) + '...';
    }
    
    // Kanal adını tam merkeze yaz
    ctx.fillText(displayName, canvas.width / 2, centerY - 10);
    
    // Alt yazı - tam merkez altına
    ctx.font = '30px Arial, sans-serif';
    ctx.shadowBlur = 10;
    ctx.fillText('Youtube Kanalı', canvas.width / 2, centerY + 60);
    
    // Canvas içeriğini data URL olarak al ve banner elemanına ata
    // Otomatik oluşturulan banner için daha yüksek kalite kullanıyoruz (ilk aratmada kalite daha önemli)
    const bannerQuality = 0.85; // 0.5'den 0.85'e yükseltildi
    bannerElement.src = canvas.toDataURL('image/jpeg', bannerQuality);
    
    // CSS sınıflarını ayarla
    bannerElement.classList.remove('error');
    bannerElement.classList.add('auto-banner');
    
    // Banner yüklendiğinde callback'i çağır
    bannerElement.onload = function() {
      console.log('Otomatik banner başarıyla yüklendi - merkez içerik odaklı');
      
      // Banner'ın üst ve alttan kesilmesini, ancak önemli içeriğin tam merkez gösterilmesini sağla
      bannerElement.style.objectPosition = 'center center';
      bannerElement.style.height = '250px'; // 250px yükseklik
      
      // Yüksek kalite ayarları
      bannerElement.style.imageRendering = '-webkit-optimize-contrast';
      bannerElement.style.objectFit = 'cover';
      
      // Otomatik oluşturulan banner için optimizasyon yapma (zaten optimize)
      bannerElement.dataset.optimized = 'true';
      
      callback();
    };
    
    bannerElement.onerror = function() {
      console.error('Otomatik banner yüklenirken hata oluştu');
      bannerElement.classList.add('error');
      callback();
    };
    
    console.log('Merkez odaklı otomatik banner oluşturuldu - üst ve alttan kesilecek şekilde');
  } catch (error) {
    console.error('Otomatik banner oluşturma hatası:', error);
    bannerElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeQI6UgG55AAAAABJRU5ErkJggg==';
    bannerElement.classList.add('error');
    callback();
  }
}

// Yeni kod eklendiği için yeni fillChannelData fonksiyonu
function displayChannelData(channelData) {
  console.log('displayChannelData çalıştırılıyor:', channelData);
  
  if (!channelData) {
    console.error('displayChannelData: Kanal verisi yok!');
    return;
  }
  
  // Kanal bilgilerini al
  const kanalAdi = channelData.channelTitle || channelData.snippet?.title || 'İsimsiz Kanal';
  const aboneSayisi = channelData.subscriberCount || channelData.statistics?.subscriberCount || 0;
  const izlenmeSayisi = channelData.viewCount || channelData.statistics?.viewCount || 0;
  const videoSayisi = channelData.videoCount || channelData.statistics?.videoCount || 0;
  const kanalAciklama = channelData.channelDescription || channelData.snippet?.description || 'Kanal açıklaması bulunmuyor.';
  const publishedAt = channelData.publishedAt || channelData.snippet?.publishedAt || null;
  
  // Kanal adını görüntüle (logonun yanında)
  const titleInline = document.getElementById('title-inline');
  if (titleInline) {
    titleInline.textContent = kanalAdi;
    console.log('Kanal adı gösterildi:', kanalAdi);
  }
  
  // İstatistikleri göster (description alanında)
  const descSubscriber = document.getElementById('description-subscriber');
  const descViews = document.getElementById('description-views');
  const descVideos = document.getElementById('description-videos');
  const descAge = document.getElementById('description-age');
  
  if (descSubscriber) {
    descSubscriber.textContent = formatNumber(aboneSayisi);
    console.log('Abone sayısı gösterildi:', formatNumber(aboneSayisi));
  }
  
  if (descViews) {
    descViews.textContent = formatNumberWithCommas(izlenmeSayisi);
    console.log('İzlenme sayısı gösterildi:', formatNumberWithCommas(izlenmeSayisi));
  }
  
  if (descVideos) {
    descVideos.textContent = formatNumber(videoSayisi);
    console.log('Video sayısı gösterildi:', formatNumber(videoSayisi));
  }
  
  // Kanal yaşını göster
  if (descAge && publishedAt) {
    const channelAge = calculateChannelAge(publishedAt);
    descAge.textContent = channelAge;
    descAge.setAttribute('title', `Kuruluş: ${formatPublishDate(publishedAt)}`);
    console.log('Kanal yaşı gösterildi:', channelAge, 'Kuruluş tarihi:', formatPublishDate(publishedAt));
  } else if (descAge) {
    descAge.textContent = 'Bilinmiyor';
  }
  
  // Kanal açıklamasını dolduralım
  const channelDescriptionElement = document.getElementById('channel-description');
  if (channelDescriptionElement && kanalAciklama) {
    channelDescriptionElement.textContent = kanalAciklama;
    console.log('Kanal açıklaması dolduruldu');
  }
  
  // Description alanını görünür yap
  const descriptionArea = document.querySelector('.youtuber-description-alan');
  if (descriptionArea) {
    descriptionArea.style.display = 'block';
    descriptionArea.style.opacity = '1';
    descriptionArea.style.visibility = 'visible';
    descriptionArea.classList.add('show');
    console.log('İstatistik alanı gösterildi');
  }
  
  // Banner ve logo alanlarını görünür yap
  const bannerArea = document.querySelector('.youtuber-banner-alan');
  if (bannerArea) {
    bannerArea.style.display = 'block';
    bannerArea.style.opacity = '1';
    bannerArea.style.visibility = 'visible';
    bannerArea.classList.add('show');
    console.log('Banner alanı görünür yapıldı');
  }
  
  // Logo alanını görünür yap
  const logoArea = document.querySelector('.youtuber-logo-alan');
  if (logoArea) {
    logoArea.style.display = 'block';
    logoArea.style.opacity = '1';
    logoArea.style.visibility = 'visible';
    logoArea.classList.add('show');
    console.log('Logo alanı görünür yapıldı');
  }
  
  // Kazanç alanını görüntüle
  const paraElement = document.getElementById('para');
  if (paraElement && channelData.earnings) {
    const kazancHTML = olusturKazancHTML({
      ...channelData.earnings.estimatedEarnings,
      categoryInfo: channelData.earnings.categoryInfo,
      multipliers: channelData.earnings.multipliers,
      daily: {
        minimum: channelData.earnings.estimatedEarnings.min / 30,
        estimated: (channelData.earnings.estimatedEarnings.min + channelData.earnings.estimatedEarnings.max) / 60,
        maximum: channelData.earnings.estimatedEarnings.max / 30
      },
      weekly: {
        minimum: channelData.earnings.estimatedEarnings.min / 4,
        estimated: (channelData.earnings.estimatedEarnings.min + channelData.earnings.estimatedEarnings.max) / 8,
        maximum: channelData.earnings.estimatedEarnings.max / 4
      },
      monthly: {
        minimum: channelData.earnings.estimatedEarnings.min,
        estimated: (channelData.earnings.estimatedEarnings.min + channelData.earnings.estimatedEarnings.max) / 2,
        maximum: channelData.earnings.estimatedEarnings.max
      },
      yearly: {
        minimum: channelData.earnings.estimatedEarnings.min * 12,
        estimated: (channelData.earnings.estimatedEarnings.min + channelData.earnings.estimatedEarnings.max) * 6,
        maximum: channelData.earnings.estimatedEarnings.max * 12
      }
    });
    paraElement.innerHTML = kazancHTML;
    console.log('Kazanç alanı gösterildi');
  }
  
  // Eski istatistik alanlarını da doldur (uyumluluk için)
  const title = document.getElementById('title');
  const subscriber = document.getElementById('subscriber');
  const totalviews = document.getElementById('totalviews');
  const totalvideos = document.getElementById('totalvideos');
  
  if (title) title.innerHTML = '<h6>Kanal Adı</h6>' + kanalAdi;
  if (subscriber) subscriber.innerHTML = '<h6>Abone Sayısı</h6>' + formatNumber(aboneSayisi);
  if (totalviews) totalviews.innerHTML = '<h6>Toplam İzlenme</h6>' + formatNumberWithCommas(izlenmeSayisi);
  if (totalvideos) totalvideos.innerHTML = '<h6>Toplam Video</h6>' + formatNumber(videoSayisi);
}

// script.js'deki formatNumberWithCommas fonksiyonunu geçersiz kıl
window.formatNumberWithCommas = function(num) {
  // Bu fonksiyonu formatNumber'a yönlendir
  return formatNumber(num);
};

// Kanal yaşını hesaplayan yardımcı fonksiyon
function calculateChannelAge(publishedAt) {
  if (!publishedAt) return 'Bilinmiyor';
  
  try {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    
    // Geçersiz tarih kontrolü
    if (isNaN(publishDate.getTime())) return 'Bilinmiyor';
    
    const yearDiff = now.getFullYear() - publishDate.getFullYear();
    const monthDiff = now.getMonth() - publishDate.getMonth();
    
    // Ay farkı negatifse, bir önceki yıla düşülmüş demektir
    if (monthDiff < 0) {
      return `${yearDiff - 1} yıl ${monthDiff + 12} ay`;
    } 
    // Ay farkı 0 ise sadece yıl farkını göster
    else if (monthDiff === 0) {
      return `${yearDiff} yıl`;
    }
    // Normal durum: yıl ve ay farkını göster
    else {
      return `${yearDiff} yıl ${monthDiff} ay`;
    }
  } catch (error) {
    console.error('Kanal yaşı hesaplanırken hata:', error);
    return 'Hesaplanamadı';
  }
}

// Alternatif gösterim: Sadece kuruluş tarihini formatlayan fonksiyon
function formatPublishDate(publishedAt) {
  if (!publishedAt) return 'Bilinmiyor';
  
  try {
    const date = new Date(publishedAt);
    
    // Geçersiz tarih kontrolü
    if (isNaN(date.getTime())) return 'Bilinmiyor';
    
    // Türkçe ay isimleri
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    // Tarih formatı: "15 Haziran 2015"
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (error) {
    console.error('Yayın tarihi formatlanırken hata:', error);
    return 'Bilinmiyor';
  }
}

// Otomatik avatar oluşturma fonksiyonu
function createAutomaticAvatar(channelData, thumbnailElement, callback) {
  try {
    // Kanal adını al veya varsayılan değer kullan
    const channelName = channelData.channelTitle || channelData.snippet?.title || 'YT';
    
    // Kanal için tutarlı renkler oluştur
    const colors = generateChannelColors(channelName);
    
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.width = 200; // Yüksek kalitede thumbnail için yeterli
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    
    // Arka plan - radial gradient
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    
    // Dairesel arka plan
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // İlk harfler için metin
    let initials = '';
    
    // Kanalın ilk harflerini al (boşluklarla ayrılmış kelimelerin ilk harfleri)
    const words = channelName.split(' ');
    if (words.length === 1) {
      // Tek kelime ise, ilk iki harfi al
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      // Birden fazla kelime ise, ilk iki kelimenin ilk harflerini al
      initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
    }
    
    // Metni ortaya ekle
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Gölge ekle
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Metni çiz
    ctx.fillText(initials, canvas.width/2, canvas.height/2);
    
    // Gölgeyi kapat
    ctx.shadowColor = 'transparent';
    
    // Kaliteyi artır
    const avatarQuality = 0.95;
    const dataUrl = canvas.toDataURL('image/png', avatarQuality);
    
    // Thumbnail'e ata
    thumbnailElement.src = dataUrl;
    thumbnailElement.classList.add('auto-avatar');
    thumbnailElement.dataset.optimized = 'true'; // Tekrar optimize edilmesin
    
    // Bunu önbelleğe almak istersek sonra düşünelim
    
    // Yükleme olayı
    thumbnailElement.onload = function() {
      console.log('Otomatik avatar başarıyla oluşturuldu');
      if (callback) callback();
    };
    
    thumbnailElement.onerror = function() {
      console.error('Otomatik avatar yüklenirken hata oluştu');
      if (callback) callback();
    };
    
  } catch (error) {
    console.error('Otomatik avatar oluşturma hatası:', error);
    // Basit bir fallback görüntü
    thumbnailElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    thumbnailElement.style.backgroundColor = '#cccccc';
    if (callback) callback();
  }
}


const SEARCH_HISTORY_KEY = 'yt_search_history';
const MAX_HISTORY = 15;
const searchInput = document.getElementById('search');
const dropdown = document.getElementById('search-dropdown');
let dropdownIndex = -1;

// Geçmişi yükle
function getHistory() {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
}
function setHistory(history) {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

// Dropdown’u güncelle
function updateDropdown(filter = '') {
  const history = getHistory();
  let filtered = history;
  if (filter && filter.trim() !== '') {
      filtered = history.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
  }
  dropdown.innerHTML = '';
  if (filtered.length === 0) {
      dropdown.style.display = 'none';
      return;
  }
  filtered.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'dropdown-item';

      // Kanal adı
      const span = document.createElement('span');
      span.textContent = item;
      span.className = 'dropdown-text';
      span.onmousedown = (e) => {
          e.preventDefault();
          searchInput.value = item;
          dropdown.style.display = 'none';
          searchInput.focus();
      };

      // Sil butonu
      const del = document.createElement('button');
      del.className = 'dropdown-delete';
      del.title = 'Geçmişten sil';
      del.innerHTML = '&times;'; // veya bir çöp kutusu ikonu
      del.onmousedown = (e) => {
          e.preventDefault();
          let history = getHistory();
          history = history.filter(h => h !== item);
          setHistory(history);
          updateDropdown(filter);
      };

      div.appendChild(span);
      div.appendChild(del);
      dropdown.appendChild(div);
  });
  dropdown.style.display = 'block';
  dropdownIndex = -1;
}

// Input eventleri
searchInput.addEventListener('focus', () => updateDropdown(''));
searchInput.addEventListener('input', () => updateDropdown(searchInput.value));
searchInput.addEventListener('blur', () => setTimeout(() => dropdown.style.display = 'none', 120));

// Enter veya submit’te geçmişe ekle
searchInput.form?.addEventListener('submit', function(e) {
    const value = searchInput.value.trim();
    if (!value) return;
    let history = getHistory();
    history = history.filter(item => item !== value);
    history.unshift(value);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    setHistory(history);
    updateDropdown(''); // Güncelle
    dropdown.style.display = 'none'; // <-- Bunu ekle!

});

// Ok tuşlarıyla gezinti
searchInput.addEventListener('keydown', function(e) {
    const items = dropdown.querySelectorAll('div');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
        dropdownIndex = (dropdownIndex + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === dropdownIndex));
        e.preventDefault();
    } else if (e.key === 'ArrowUp') {
        dropdownIndex = (dropdownIndex - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle('active', i === dropdownIndex));
        e.preventDefault();
    } else if (e.key === 'Enter' && dropdownIndex >= 0) {
        searchInput.value = items[dropdownIndex].textContent;
        dropdown.style.display = 'none';
        dropdownIndex = -1;
        e.preventDefault();
    } else {
        dropdownIndex = -1;
    }
});