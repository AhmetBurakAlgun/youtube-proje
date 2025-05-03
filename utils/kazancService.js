const { formatters } = require('./formatters.js');
const { categoryCpmMultipliers } = require('./contentAnalyzer');

// Ülke bazlı CPM çarpanları
const ulkeCpmCarpanlari = {
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

class KazancServisi {
  constructor() {
    this.temelCpmMin = 0.25;  // Minimum CPM (USD)
    this.temelCpmMax = 4.00;  // Maximum CPM (USD)
  }

  // Kanal aktivitesine göre çarpan hesapla
  aktiviteCarpaniHesapla(videoSayisi, kanalYasiAy) {
    const aylikVideoOrtalamasi = videoSayisi / kanalYasiAy;
    
    if (aylikVideoOrtalamasi >= 4) return 1.3;  // Çok aktif
    if (aylikVideoOrtalamasi >= 2) return 1.2;  // Aktif
    if (aylikVideoOrtalamasi >= 1) return 1.1;  // Normal
    return 1.0;  // Az aktif
  }

  // Kanal büyüklüğüne göre çarpan hesapla
  kanalBuyuklukCarpaniHesapla(aboneSayisi) {
    if (aboneSayisi >= 1000000) return 1.5;  // 1M+ abone
    if (aboneSayisi >= 500000) return 1.4;   // 500K+ abone
    if (aboneSayisi >= 100000) return 1.3;   // 100K+ abone
    if (aboneSayisi >= 50000) return 1.2;    // 50K+ abone
    if (aboneSayisi >= 10000) return 1.1;    // 10K+ abone
    return 1.0;  // 10K altı abone
  }

  // Kanal verilerine göre kazanç hesapla
  kazancHesapla(kanalVerisi) {
    const {
      viewCount,
      subscriberCount,
      videoCount,
      country,
      publishedAt,
      categoryInfo
    } = kanalVerisi;

    // Kanal yaşını hesapla
    const yayinTarihi = new Date(publishedAt);
    const simdi = new Date();
    const ayFarki = (simdi.getFullYear() - yayinTarihi.getFullYear()) * 12 +
                   (simdi.getMonth() - yayinTarihi.getMonth());
    const kanalYasiAy = Math.max(1, ayFarki);

    // Aylık ortalama görüntülemeyi hesapla
    const aylikGoruntuleme = Math.round(viewCount / kanalYasiAy);

    // Çarpanları hesapla
    const aktiviteCarpani = this.aktiviteCarpaniHesapla(videoCount, kanalYasiAy);
    const buyuklukCarpani = this.kanalBuyuklukCarpaniHesapla(subscriberCount);
    const ulkeCarpani = ulkeCpmCarpanlari[country] || 1.0;
    const kategoriCarpani = categoryCpmMultipliers[categoryInfo?.type] || 1.0;

    // Toplam çarpan
    const toplamCarpan = aktiviteCarpani * buyuklukCarpani * ulkeCarpani * kategoriCarpani;

    // CPM değerlerini ayarla
    const ayarlanmisCpmMin = this.temelCpmMin * toplamCarpan;
    const ayarlanmisCpmMax = this.temelCpmMax * toplamCarpan;

    // Aylık kazanç hesabı
    const aylikMinKazanc = Math.round((ayarlanmisCpmMin * aylikGoruntuleme) / 1000);
    const aylikMaxKazanc = Math.round((ayarlanmisCpmMax * aylikGoruntuleme) / 1000);

    // Sonuç nesnesi
    return {
      min: aylikMinKazanc,
      max: aylikMaxKazanc,
      categoryInfo: categoryInfo || { type: 'Kategorisiz', confidence: 0 },
      carpanlar: {
        aktivite: aktiviteCarpani,
        buyukluk: buyuklukCarpani,
        ulke: ulkeCarpani,
        kategori: kategoriCarpani,
        toplam: toplamCarpan
      },
      metrikler: {
        aylikGoruntuleme,
        toplamGoruntuleme: viewCount,
        aboneSayisi: subscriberCount,
        videoSayisi: videoCount,
        kanalYasiAy
      }
    };
  }

  // Kazanç verilerini HTML formatında döndür
  kazancHtmlOlustur(kazancVerisi) {
    const {
      min,
      max,
      categoryInfo,
      carpanlar
    } = kazancVerisi;

    const ortalamaKazanc = Math.round((min + max) / 2);

    return `
      <div class="earnings-overview">
        <div class="earnings-header">
          <h3>Tahmini Kazanç Hesaplaması</h3>
          <div class="category-badge">
            <span class="category-name">${categoryInfo.type}</span>
            <span class="category-confidence">(%${categoryInfo.confidence.toFixed(1)} emin)</span>
            <span class="category-multiplier">${carpanlar.kategori.toFixed(1)}x CPM</span>
          </div>
        </div>
        
        <div class="earnings-grid">
          <div class="earnings-card">
            <h4>Günlük Kazanç</h4>
            <div class="value min">${formatters.formatMoney(min / 30)} $</div>
            <div class="value avg">${formatters.formatMoney(ortalamaKazanc / 30)} $</div>
            <div class="value max">${formatters.formatMoney(max / 30)} $</div>
          </div>
          <div class="earnings-card">
            <h4>Haftalık Kazanç</h4>
            <div class="value min">${formatters.formatMoney(min / 4)} $</div>
            <div class="value avg">${formatters.formatMoney(ortalamaKazanc / 4)} $</div>
            <div class="value max">${formatters.formatMoney(max / 4)} $</div>
          </div>
          <div class="earnings-card">
            <h4>Aylık Kazanç</h4>
            <div class="value min">${formatters.formatMoney(min)} $</div>
            <div class="value avg">${formatters.formatMoney(ortalamaKazanc)} $</div>
            <div class="value max">${formatters.formatMoney(max)} $</div>
          </div>
          <div class="earnings-card">
            <h4>Yıllık Kazanç</h4>
            <div class="value min">${formatters.formatMoney(min * 12)} $</div>
            <div class="value avg">${formatters.formatMoney(ortalamaKazanc * 12)} $</div>
            <div class="value max">${formatters.formatMoney(max * 12)} $</div>
          </div>
        </div>
        
        <p style="font-size:12px; opacity:0.8; margin-top:15px; text-align:center;">
          Not: Bu kazanç tahminleri, kanal verileri ve içerik türü gibi faktörlere dayalı olarak yapılan istatistiksel hesaplamalardır. 
          Gerçek kazançlar farklılık gösterebilir.
        </p>
      </div>
    `;
  }
}

// KazancServisi örneğini oluştur ve export et
const kazancServisi = new KazancServisi();

// KazancHesapla fonksiyonunu export et
const kazancHesapla = (kanalVerisi) => {
  return kazancServisi.kazancHesapla(kanalVerisi);
};

module.exports = {
  kazancHesapla
}; 