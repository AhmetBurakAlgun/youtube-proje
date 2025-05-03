# DEVNOTE: Proje Geliştirme Kılavuzu

## PROJE AMACI
- YouTube kanallarının kazanç ve istatistiklerini şeffaf ve gerçekçi şekilde göstermek
- Kullanıcılara basit, hızlı ve anlaşılır bir arayüz sunmak
- Farklı içerik türlerine göre (normal video, shorts, live stream) özelleştirilmiş kazanç tahminleri sağlamak
- Trend analizleri ve karşılaştırmalı istatistikler sunmak

## TEMEL PRENSİPLER
1. Basitlik Önceliği
   - Karmaşık özellikler yerine işlevsel basitlik
   - Kullanıcı dostu arayüz
   - Hızlı sonuç gösterimi
   - Anlaşılır veri sunumu

2. Gerçekçi Yaklaşım
   - Abartılı kazanç tahminlerinden kaçınma
   - Şeffaf hesaplama yöntemleri
   - Güncel CPM oranları kullanımı
   - İçerik türüne özel hesaplamalar

3. Performans Odaklılık
   - Hızlı yüklenme süreleri
   - Minimum API çağrısı
   - Optimize edilmiş kod yapısı
   - Verimli veri önbelleği

## GELİŞTİRME KURALLARI
1. Kod Yapısı
   - Overengineering'den kaçınılacak
   - Basit ve okunabilir kod
   - Gerekmedikçe yeni kütüphane eklenmeyecek
   - Modüler yapı korunacak

2. Hata Yönetimi
   - Basit try-catch yapısı yeterli
   - Kullanıcı dostu hata mesajları
   - API hatalarına özel kontroller
   - Yükleme durumları gösterimi

3. Tasarım İlkeleri
   - Mobil öncelikli tasarım
   - Sade renk paleti
   - Kolay okunabilir yazı tipleri
   - Tutarlı UI elementleri

## PLATFORM GELİŞTİRME PLANI
1. Web Uygulaması (Mevcut)
   - Responsive tasarım
   - Tüm tarayıcı desteği
   - PWA özellikleri

2. Mobil Uygulama (Planlanan)
   - Native app geliştirmesi
   - iOS ve Android platformları
   - Offline çalışma desteği
   - Push bildirim sistemi
   - App Store ve Play Store yayını

## YAPILACAKLAR LİSTESİ

### İçerik Analizi Geliştirmeleri
- [ ] Top Video Analizleri
  - En çok izlenen videolar (Top 5)
  - En çok kazandıran videolar (Top 5)
  - En çok etkileşim alan videolar (Top 5)
  - Video türüne göre performans karşılaştırması

- [ ] Shorts Özel Analizi
  - Shorts içeriklerinin ayrı kazanç hesaplaması
  - Shorts CPM farklılaştırması
  - Shorts/Normal video oranı analizi
  - Shorts performans metrikleri

### Bölgesel ve Kategori Analizleri
- [ ] Ülke Bazlı Analizler
  - Ülkelere göre en çok kazanan kanallar
  - Dil bazlı kanal sıralamaları
  - Bölgesel CPM farklılıkları
  - Yerel trend analizleri

### Aylık Değişim Analizi
- [ ] Performans Değişimleri
  - Abone sayısı değişim yüzdesi
  - Görüntülenme değişim yüzdesi
  - Kazanç değişim yüzdesi
  - Artış/düşüş trendlerinin görsel gösterimi

### Etkileşim ve Topluluk Analizi
- [ ] Kullanıcı Etkileşimleri
  - En çok yorum yapan kullanıcıların listesi
  - Top 10 aktif kullanıcı istatistikleri
  - Yorum yapma sıklığı analizi

### Gelişmiş Kazanç Hesaplaması
- [ ] Özelleştirilmiş CPM Hesaplamaları
  - Live Stream CPM farklılaştırması
  - Shorts CPM hesaplaması
  - Stream uzunluğuna göre özel çarpanlar
  - Canlı yayın Super Chat gelirlerinin ayrı hesaplanması

### UI/UX İyileştirmeleri
- [ ] Görsel Geliştirmeler
  - İstatistik kartlarının yeniden tasarlanması
  - Trend göstergeleri için renkli ikonlar
  - Yüzdesel değişimlerin görsel sunumu
  - Mobil görünümün optimize edilmesi
  - Yükleme animasyonlarının eklenmesi

### Yeni Önerilen Geliştirmeler
- [ ] Video Kategori Analizi
  - İçerik türüne göre performans karşılaştırması
  - Kategori bazlı kazanç analizi
  - En başarılı içerik türü önerileri

- [ ] Sezonsal Analiz
  - Yıllık performans grafikleri
  - Mevsimsel trend analizi
  - En verimli yayın zamanları analizi

## TEKNİK ALTYAPI PLANI
1. Deployment Stratejisi
   - Vercel üzerinde hosting
   - Hızlı ve ölçeklenebilir yapı
   - Otomatik deployment

2. Backend Yapılandırması
   - Express.js tabanlı API proxy
   - API Key rotasyonu sistemi
   - Cache mekanizması (NodeCache/Redis)
   - JWT ile kullanıcı yönetimi

## BUG TAKİBİ
### Bilinen Hatalar
1. [Düşük] Bazı kanallarda banner yüklenmiyor
2. [Orta] Türkçe karakterlerde arama sorunu
3. [Yüksek] Çok uzun kanal isimlerinde tasarım bozulması

## GELİŞTİRME PLANI
### Kısa Vadeli (1-2 Hafta)
- Mevcut hataların düzeltilmesi
- Temel SEO optimizasyonu
- Performans iyileştirmeleri

### Orta Vadeli (1-2 Ay)
- Yeni istatistik grafikleri
- Detaylı kazanç analizi
- Kanal karşılaştırma özelliği

### Uzun Vadeli (3+ Ay)
- Trend analizi
- Gelişmiş tahmin algoritmaları
- Kategori bazlı analizler

## KISITLAMALAR VE ŞARTLAR
1. Proje Kapsamı
   - Sadece YouTube istatistikleri
   - Sadece public veriler kullanılacak
   - Gereksiz özellikler eklenmeyecek

2. Teknik Sınırlar
   - YouTube API limitleri gözetilecek
   - Basit ve hafif altyapı korunacak
   - Minimum dış bağımlılık

3. İş Kuralları
   - Ücretsiz kullanım öncelikli
   - Reklam entegrasyonu düşünülüyor
   - Kullanıcı verisi toplanmayacak

## ÇOK UZUN VADELİ PLANLAR (Düşünülüyor)
1. Premium Özellikler
   - Plus üyelik sistemi potansiyeli
   - Detaylı analiz araçları
   - Reklamsız deneyim imkanı
   - 30 günlük analiz geçmişi