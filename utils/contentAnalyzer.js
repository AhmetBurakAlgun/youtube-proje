/**
 * İçerik Analizi Modülü
 * YouTube kanalları ve videolarının içerik kategorilerini belirlemek için kullanılır
 */

// Kategoriler ve ilgili anahtar kelimeler (hem Türkçe hem İngilizce)
const categoryKeywords = {
  News: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'haber', weight: 2.0 },
    { word: 'gündem', weight: 1.8 },
    { word: 'son dakika', weight: 1.8 },
    { word: 'gazete', weight: 1.5 },
    { word: 'basın', weight: 1.5 },
    { word: 'politika', weight: 1.7 },
    { word: 'siyaset', weight: 1.7 },
    { word: 'ekonomi', weight: 1.2 },
    { word: 'bülten', weight: 1.5 },
    { word: 'özel haber', weight: 1.5 },
    { word: 'ajans', weight: 1.5 },
    { word: 'röportaj', weight: 1.2 },
    { word: 'haberler', weight: 2.0 },
    { word: 'gazeteci', weight: 2.0 },
    { word: 'muhabir', weight: 1.5 },
    { word: 'köşe yazarı', weight: 1.8 },
    { word: 'basın açıklaması', weight: 1.5 },
    { word: 'meclis', weight: 1.3 },
    { word: 'cumhurbaşkanı', weight: 1.3 },
    { word: 'başbakan', weight: 1.3 },
    { word: 'bakan', weight: 1.2 },
    { word: 'milletvekili', weight: 1.2 },
    { word: 'seçim', weight: 1.3 },
    { word: 'analiz', weight: 1.0 },
    { word: 'yorum', weight: 1.0 },
    { word: 'siyasi', weight: 1.4 },
    { word: 'dünya', weight: 0.9 },
    { word: 'turkey', weight: 0.8 },
    { word: 'türkiye', weight: 0.8 },
    { word: 'siyasi yorum', weight: 1.3 },
    { word: 'tartışma programı', weight: 1.5 },
    { word: 'siyasi yorumcu', weight: 1.8 },
    { word: 'canlı yayın', weight: 0.8 },
    { word: 'güncel', weight: 1.0 },
    { word: 'aktüel', weight: 1.0 },
    { word: 'dış haberler', weight: 1.5 },
    { word: 'iç haberler', weight: 1.5 },
    { word: 'yurt haberleri', weight: 1.5 },
    { word: 'yerel haberler', weight: 1.5 },
    // Türkçe ek medya terimleri
    { word: 'yazar', weight: 2.0 },
    { word: 'yorumcu', weight: 1.8 },
    { word: 'sunucu', weight: 1.7 },
    { word: 'spiker', weight: 1.7 },
    { word: 'yorum yapıyor', weight: 1.8 },
    { word: 'yorumluyor', weight: 1.8 },
    { word: 'analiz ediyor', weight: 1.7 },
    { word: 'futbol yorumu', weight: 1.6 },
    { word: 'spor yorumu', weight: 1.6 },
    { word: 'televizyon', weight: 1.5 },
    { word: 'tv', weight: 1.5 },
    { word: 'medya', weight: 1.7 },
    { word: 'köşe', weight: 1.5 },
    { word: 'makale', weight: 1.6 },
    { word: 'manşet', weight: 1.7 },
    { word: 'yorumları', weight: 1.6 },
    { word: 'gündemi', weight: 1.8 },
    { word: 'canlı', weight: 1.2 },
    { word: 'tartışma', weight: 1.5 },
    { word: 'program', weight: 1.2 },
    { word: 'açık oturum', weight: 1.6 },
    { word: 'kendine özgü', weight: 1.3 },
    { word: 'tarzıyla', weight: 1.3 },
    { word: 'görüşleri', weight: 1.4 },
    { word: 'fikir', weight: 1.3 },
    { word: 'düşünce', weight: 1.3 },
    { word: 'bakış açısı', weight: 1.3 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'news', weight: 2.0 },
    { word: 'breaking', weight: 1.8 },
    { word: 'politics', weight: 1.7 },
    { word: 'economy', weight: 1.2 },
    { word: 'headlines', weight: 1.5 },
    { word: 'press', weight: 1.5 },
    { word: 'report', weight: 1.2 },
    { word: 'journalist', weight: 1.9 },
    { word: 'reporter', weight: 1.5 },
    { word: 'columnist', weight: 1.8 },
    { word: 'analysis', weight: 1.0 },
    { word: 'political', weight: 1.6 },
    { word: 'election', weight: 1.3 },
    { word: 'president', weight: 1.3 },
    { word: 'prime minister', weight: 1.3 },
    { word: 'minister', weight: 1.2 },
    { word: 'government', weight: 1.3 },
    { word: 'parliament', weight: 1.3 },
    // İngilizce ek medya terimleri
    { word: 'anchor', weight: 1.7 },
    { word: 'commentator', weight: 1.8 },
    { word: 'media', weight: 1.7 },
    { word: 'commentary', weight: 1.7 },
    { word: 'discussing', weight: 1.5 },
    { word: 'analyzes', weight: 1.6 },
    { word: 'presenter', weight: 1.6 },
    { word: 'editorial', weight: 1.6 },
    { word: 'opinion', weight: 1.5 },
    { word: 'coverage', weight: 1.5 }
  ],
  Education: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'eğitim', weight: 2.0 },
    { word: 'öğrenci', weight: 1.7 },
    { word: 'ders', weight: 1.8 },
    { word: 'kurs', weight: 1.7 },
    { word: 'öğretim', weight: 1.8 },
    { word: 'akademik', weight: 1.5 },
    { word: 'öğretmen', weight: 1.7 },
    { word: 'üniversite', weight: 1.6 },
    { word: 'okul', weight: 1.6 },
    { word: 'akademi', weight: 1.5 },
    { word: 'öğrenme', weight: 1.7 },
    { word: 'konu anlatımı', weight: 1.9 },
    { word: 'eğitici', weight: 1.7 },
    { word: 'sınav', weight: 1.6 },
    { word: 'yks', weight: 1.8 },
    { word: 'tyt', weight: 1.8 },
    { word: 'ayt', weight: 1.8 },
    { word: 'lgs', weight: 1.8 },
    { word: 'kpss', weight: 1.8 },
    { word: 'matematik', weight: 1.5 },
    { word: 'fizik', weight: 1.5 },
    { word: 'kimya', weight: 1.5 },
    { word: 'biyoloji', weight: 1.5 },
    { word: 'edebiyat', weight: 1.5 },
    { word: 'tarih', weight: 1.4 },
    { word: 'coğrafya', weight: 1.4 },
    { word: 'rehber', weight: 1.2 },
    { word: 'öğrenim', weight: 1.6 },
    { word: 'araştırma', weight: 1.2 },
    { word: 'bilim', weight: 1.4 },
    { word: 'bilimsel', weight: 1.4 },
    { word: 'deney', weight: 1.3 },
    { word: 'ödev', weight: 1.4 },
    { word: 'test', weight: 1.4 },
    { word: 'dershane', weight: 1.6 },
    { word: 'ödev yardımı', weight: 1.5 },
    { word: 'sınava hazırlık', weight: 1.8 },
    { word: 'ders çalışma', weight: 1.7 },
    { word: 'motivasyon', weight: 1.0 },
    { word: 'başarı hikayeleri', weight: 1.1 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'education', weight: 2.0 },
    { word: 'learn', weight: 1.7 },
    { word: 'tutorial', weight: 1.8 },
    { word: 'course', weight: 1.7 },
    { word: 'school', weight: 1.6 },
    { word: 'university', weight: 1.6 },
    { word: 'study', weight: 1.5 },
    { word: 'teacher', weight: 1.7 },
    { word: 'student', weight: 1.7 },
    { word: 'academic', weight: 1.5 },
    { word: 'learning', weight: 1.7 },
    { word: 'science', weight: 1.4 },
    { word: 'scientific', weight: 1.4 },
    { word: 'experiment', weight: 1.3 },
    { word: 'exam', weight: 1.6 },
    { word: 'test', weight: 1.4 },
    { word: 'homework', weight: 1.4 },
    { word: 'lesson', weight: 1.8 },
    { word: 'lecture', weight: 1.7 },
    { word: 'professor', weight: 1.6 },
    { word: 'classroom', weight: 1.5 },
    { word: 'knowledge', weight: 1.3 },
    { word: 'training', weight: 1.5 },
    { word: 'skill', weight: 1.2 },
    { word: 'development', weight: 1.1 }
  ],
  Finance: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'finans', weight: 2.0 },
    { word: 'yatırım', weight: 1.9 },
    { word: 'para', weight: 1.4 },
    { word: 'borsa', weight: 1.8 },
    { word: 'ekonomi', weight: 1.7 },
    { word: 'kripto', weight: 1.7 },
    { word: 'bitcoin', weight: 1.6 },
    { word: 'ethereum', weight: 1.6 },
    { word: 'döviz', weight: 1.7 },
    { word: 'banka', weight: 1.5 },
    { word: 'faiz', weight: 1.6 },
    { word: 'enflasyon', weight: 1.6 },
    { word: 'ticaret', weight: 1.5 },
    { word: 'altın', weight: 1.6 },
    { word: 'gümüş', weight: 1.5 },
    { word: 'forex', weight: 1.8 },
    { word: 'yatırımcı', weight: 1.8 },
    { word: 'hisse', weight: 1.7 },
    { word: 'hisse senedi', weight: 1.8 },
    { word: 'bist', weight: 1.8 },
    { word: 'dolar', weight: 1.4 },
    { word: 'euro', weight: 1.4 },
    { word: 'merkez bankası', weight: 1.6 },
    { word: 'ekonomist', weight: 1.7 },
    { word: 'finansal', weight: 1.8 },
    { word: 'yatırım tavsiyesi', weight: 1.9 },
    { word: 'portföy', weight: 1.7 },
    { word: 'fon', weight: 1.6 },
    { word: 'emeklilik', weight: 1.5 },
    { word: 'sigorta', weight: 1.4 },
    { word: 'girişimci', weight: 1.3 },
    { word: 'girişimcilik', weight: 1.3 },
    { word: 'iş dünyası', weight: 1.4 },
    { word: 'ekonomik', weight: 1.5 },
    { word: 'mali', weight: 1.6 },
    { word: 'vergi', weight: 1.5 },
    { word: 'muhasebe', weight: 1.6 },
    { word: 'kredi', weight: 1.5 },
    { word: 'faizsiz', weight: 1.4 },
    { word: 'mortgage', weight: 1.5 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'finance', weight: 2.0 },
    { word: 'investing', weight: 1.9 },
    { word: 'money', weight: 1.4 },
    { word: 'stock', weight: 1.8 },
    { word: 'market', weight: 1.2 },
    { word: 'crypto', weight: 1.7 },
    { word: 'bitcoin', weight: 1.6 },
    { word: 'ethereum', weight: 1.6 },
    { word: 'trade', weight: 1.5 },
    { word: 'bank', weight: 1.5 },
    { word: 'interest', weight: 1.6 },
    { word: 'inflation', weight: 1.6 },
    { word: 'economics', weight: 1.7 },
    { word: 'gold', weight: 1.6 },
    { word: 'silver', weight: 1.5 },
    { word: 'forex', weight: 1.8 },
    { word: 'investor', weight: 1.8 },
    { word: 'stock market', weight: 1.9 },
    { word: 'trader', weight: 1.8 },
    { word: 'financial', weight: 1.8 },
    { word: 'investment', weight: 1.9 },
    { word: 'portfolio', weight: 1.7 },
    { word: 'fund', weight: 1.6 },
    { word: 'retirement', weight: 1.5 },
    { word: 'insurance', weight: 1.4 },
    { word: 'entrepreneur', weight: 1.3 }
  ],
  Gaming: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'oyun', weight: 2.0 },
    { word: 'gaming', weight: 2.0 },
    { word: 'gameplay', weight: 1.9 },
    { word: 'oyuncu', weight: 1.7 },
    { word: 'gamer', weight: 1.8 },
    { word: 'playthrough', weight: 1.7 },
    { word: 'fortnite', weight: 1.6 },
    { word: 'minecraft', weight: 1.6 },
    { word: 'valorant', weight: 1.6 },
    { word: 'lol', weight: 1.5 },
    { word: 'csgo', weight: 1.5 },
    { word: 'battle royale', weight: 1.7 },
    { word: 'fps', weight: 1.6 },
    { word: 'rpg', weight: 1.6 },
    { word: 'moba', weight: 1.6 },
    { word: 'pubg', weight: 1.6 },
    { word: 'roblox', weight: 1.6 },
    { word: 'zula', weight: 1.6 },
    { word: 'mobil oyun', weight: 1.7 },
    { word: 'pc oyun', weight: 1.7 },
    { word: 'konsol', weight: 1.5 },
    { word: 'playstation', weight: 1.6 },
    { word: 'xbox', weight: 1.6 },
    { word: 'nintendo', weight: 1.6 },
    { word: 'steam', weight: 1.6 },
    { word: 'epic games', weight: 1.5 },
    { word: 'twitch', weight: 1.7 },
    { word: 'canlı yayın', weight: 1.3 },
    { word: 'yayın', weight: 1.1 },
    { word: 'yayıncı', weight: 1.6 },
    { word: 'streamer', weight: 1.7 },
    { word: 'online', weight: 1.0 },
    { word: 'bilgisayar oyunu', weight: 1.8 },
    { word: 'video oyunu', weight: 1.8 },
    { word: 'oyun inceleme', weight: 1.7 },
    { word: 'walkthrough', weight: 1.6 },
    { word: 'gaming setup', weight: 1.5 },
    { word: 'rekabetçi', weight: 1.4 },
    { word: 'turnuva', weight: 1.5 },
    { word: 'espor', weight: 1.7 },
    { word: 'gta', weight: 1.6 },
    { word: 'counter strike', weight: 1.6 },
    { word: 'call of duty', weight: 1.6 },
    { word: 'cs', weight: 1.4 },
    { word: 'league of legends', weight: 1.6 },
    { word: 'eft', weight: 1.5 },
    { word: 'survival', weight: 1.5 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'game', weight: 2.0 },
    { word: 'gaming', weight: 2.0 },
    { word: 'play', weight: 1.5 },
    { word: 'player', weight: 1.7 },
    { word: 'playthrough', weight: 1.7 },
    { word: 'fortnite', weight: 1.6 },
    { word: 'minecraft', weight: 1.6 },
    { word: 'valorant', weight: 1.6 },
    { word: 'steam', weight: 1.6 },
    { word: 'xbox', weight: 1.6 },
    { word: 'playstation', weight: 1.6 },
    { word: 'nintendo', weight: 1.6 },
    { word: 'twitch', weight: 1.7 },
    { word: 'streamer', weight: 1.7 },
    { word: 'stream', weight: 1.4 },
    { word: 'esports', weight: 1.7 },
    { word: 'tournament', weight: 1.5 },
    { word: 'competitive', weight: 1.4 },
    { word: 'gaming pc', weight: 1.6 },
    { word: 'gaming laptop', weight: 1.6 },
    { word: 'gameplay review', weight: 1.7 },
    { word: 'first look', weight: 1.5 },
    { word: 'lets play', weight: 1.8 },
    { word: 'walkthrough', weight: 1.6 },
    { word: 'gaming setup', weight: 1.5 }
  ],
  Tech: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'teknoloji', weight: 2.0 },
    { word: 'bilgisayar', weight: 1.5 },
    { word: 'yazılım', weight: 1.7 },
    { word: 'donanım', weight: 1.7 },
    { word: 'programlama', weight: 1.7 },
    { word: 'mobil', weight: 1.4 },
    { word: 'uygulama', weight: 1.5 },
    { word: 'inceleme', weight: 1.6 },
    { word: 'android', weight: 1.5 },
    { word: 'ios', weight: 1.5 },
    { word: 'akıllı telefon', weight: 1.7 },
    { word: 'telefon', weight: 1.4 },
    { word: 'cihaz', weight: 1.3 },
    { word: 'gadget', weight: 1.6 },
    { word: 'laptop', weight: 1.6 },
    { word: 'bilgisayar', weight: 1.5 },
    { word: 'pc', weight: 1.5 },
    { word: 'monitör', weight: 1.5 },
    { word: 'klavye', weight: 1.5 },
    { word: 'mouse', weight: 1.5 },
    { word: 'kulaklık', weight: 1.5 },
    { word: 'kutu açılımı', weight: 1.7 },
    { word: 'unboxing', weight: 1.7 },
    { word: 'akıllı saat', weight: 1.6 },
    { word: 'tablet', weight: 1.6 },
    { word: 'notebook', weight: 1.6 },
    { word: 'masaüstü', weight: 1.5 },
    { word: 'web', weight: 1.2 },
    { word: 'internet', weight: 1.0 },
    { word: 'site', weight: 0.9 },
    { word: 'web sitesi', weight: 1.1 },
    { word: 'windows', weight: 1.4 },
    { word: 'mac', weight: 1.4 },
    { word: 'apple', weight: 1.5 },
    { word: 'samsung', weight: 1.5 },
    { word: 'xiaomi', weight: 1.5 },
    { word: 'huawei', weight: 1.5 },
    { word: 'oppo', weight: 1.5 },
    { word: 'vivo', weight: 1.5 },
    { word: 'realme', weight: 1.5 },
    { word: 'asus', weight: 1.5 },
    { word: 'msi', weight: 1.5 },
    { word: 'karşılaştırma', weight: 1.6 },
    { word: 'vs', weight: 1.4 },
    { word: 'güncelleme', weight: 1.3 },
    { word: 'sürüm', weight: 1.2 },
    { word: 'inceleme', weight: 1.6 },
    { word: 'review', weight: 1.6 },
    { word: 'test', weight: 1.5 },
    { word: 'karşılaştırma', weight: 1.6 },
    { word: 'yazılım', weight: 1.7 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'tech', weight: 2.0 },
    { word: 'technology', weight: 2.0 },
    { word: 'computer', weight: 1.5 },
    { word: 'software', weight: 1.7 },
    { word: 'hardware', weight: 1.7 },
    { word: 'programming', weight: 1.7 },
    { word: 'application', weight: 1.5 },
    { word: 'review', weight: 1.6 },
    { word: 'android', weight: 1.5 },
    { word: 'ios', weight: 1.5 },
    { word: 'smartphone', weight: 1.7 },
    { word: 'unboxing', weight: 1.7 },
    { word: 'coding', weight: 1.7 },
    { word: 'gadget', weight: 1.6 },
    { word: 'laptop', weight: 1.6 },
    { word: 'pc', weight: 1.5 },
    { word: 'monitor', weight: 1.5 },
    { word: 'keyboard', weight: 1.5 },
    { word: 'mouse', weight: 1.5 },
    { word: 'headphones', weight: 1.5 },
    { word: 'smartwatch', weight: 1.6 },
    { word: 'tablet', weight: 1.6 },
    { word: 'desktop', weight: 1.5 },
    { word: 'web', weight: 1.2 },
    { word: 'internet', weight: 1.0 },
    { word: 'website', weight: 1.1 },
    { word: 'windows', weight: 1.4 }
  ],
  Entertainment: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'eğlence', weight: 2.0 },
    { word: 'komik', weight: 1.8 },
    { word: 'mizah', weight: 1.8 },
    { word: 'şaka', weight: 1.6 },
    { word: 'komedi', weight: 1.8 },
    { word: 'stand up', weight: 1.7 },
    { word: 'film', weight: 1.5 },
    { word: 'dizi', weight: 1.5 },
    { word: 'react', weight: 1.6 },
    { word: 'reaksiyon', weight: 1.6 },
    { word: 'challenge', weight: 1.5 },
    { word: 'trend', weight: 1.0 },
    { word: 'viral', weight: 1.2 },
    { word: 'meme', weight: 1.4 },
    { word: 'eğlenceli', weight: 1.8 },
    { word: 'gülmek', weight: 1.6 },
    { word: 'şakalar', weight: 1.6 },
    { word: 'pranks', weight: 1.5 },
    { word: 'sketch', weight: 1.6 },
    { word: 'skeç', weight: 1.6 },
    { word: 'çekiliş', weight: 1.3 },
    { word: 'hediye', weight: 1.2 },
    { word: 'komedi', weight: 1.8 },
    { word: 'dizi tavsiyeleri', weight: 1.4 },
    { word: 'film önerileri', weight: 1.4 },
    { word: 'film inceleme', weight: 1.4 },
    { word: 'dizi inceleme', weight: 1.4 },
    { word: 'eğlence', weight: 2.0 },
    { word: 'eğlendirici', weight: 1.7 },
    { word: 'magazin', weight: 1.5 },
    { word: 'ünlüler', weight: 1.4 },
    { word: 'yarışma', weight: 1.5 },
    { word: 'show', weight: 1.6 },
    { word: 'podcast', weight: 1.4 },
    { word: 'sohbet', weight: 1.2 },
    { word: 'sesli kitap', weight: 1.2 },
    { word: 'kitap yorumları', weight: 1.2 },
    { word: 'kitap', weight: 1.0 },
    { word: 'talk show', weight: 1.5 },
    { word: 'arkadaşlar', weight: 1.0 },
    { word: 'aile', weight: 0.9 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'entertainment', weight: 2.0 },
    { word: 'funny', weight: 1.8 },
    { word: 'comedy', weight: 1.8 },
    { word: 'prank', weight: 1.5 },
    { word: 'movie', weight: 1.5 },
    { word: 'series', weight: 1.5 },
    { word: 'tv', weight: 1.4 },
    { word: 'show', weight: 1.6 },
    { word: 'react', weight: 1.6 },
    { word: 'reaction', weight: 1.6 },
    { word: 'challenge', weight: 1.5 },
    { word: 'trending', weight: 1.0 },
    { word: 'viral', weight: 1.2 },
    { word: 'fun', weight: 1.7 },
    { word: 'laughter', weight: 1.6 },
    { word: 'jokes', weight: 1.6 },
    { word: 'pranks', weight: 1.5 },
    { word: 'sketch', weight: 1.6 },
    { word: 'giveaway', weight: 1.3 },
    { word: 'gift', weight: 1.2 },
    { word: 'comedy', weight: 1.8 },
    { word: 'show', weight: 1.6 },
    { word: 'celebrities', weight: 1.4 },
    { word: 'magazine', weight: 1.5 },
    { word: 'competition', weight: 1.5 },
    { word: 'podcast', weight: 1.4 },
    { word: 'audiobook', weight: 1.2 },
    { word: 'book reviews', weight: 1.2 },
    { word: 'talk show', weight: 1.5 }
  ],
  Vlog: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'vlog', weight: 2.0 },
    { word: 'günlük', weight: 1.8 },
    { word: 'yaşam', weight: 1.7 },
    { word: 'gün', weight: 1.4 },
    { word: 'hayat', weight: 1.6 },
    { word: 'lifestyle', weight: 1.8 },
    { word: 'rutin', weight: 1.7 },
    { word: 'ev', weight: 1.2 },
    { word: 'aile', weight: 1.3 },
    { word: 'seyahat', weight: 1.6 },
    { word: 'gezi', weight: 1.6 },
    { word: 'tatil', weight: 1.5 },
    { word: 'alışveriş', weight: 1.5 },
    { word: 'vlogger', weight: 1.9 },
    { word: 'günlük vlog', weight: 1.9 },
    { word: 'hayatım', weight: 1.7 },
    { word: 'bir günüm', weight: 1.8 },
    { word: '24 saat', weight: 1.6 },
    { word: 'benimle', weight: 1.5 },
    { word: 'benimle hazırlanın', weight: 1.7 },
    { word: 'rutin', weight: 1.7 },
    { word: 'sabah rutini', weight: 1.7 },
    { word: 'akşam rutini', weight: 1.7 },
    { word: 'gün içinde', weight: 1.5 },
    { word: 'alışveriş turu', weight: 1.6 },
    { word: 'alışveriş', weight: 1.5 },
    { word: 'mağaza turu', weight: 1.5 },
    { word: 'ev turu', weight: 1.7 },
    { word: 'oda turu', weight: 1.7 },
    { word: 'dekorasyon', weight: 1.5 },
    { word: 'düzenleme', weight: 1.4 },
    { word: 'temizlik', weight: 1.4 },
    { word: 'temizlik rutini', weight: 1.5 },
    { word: 'tatil vlogu', weight: 1.7 },
    { word: 'seyahat vlogu', weight: 1.7 },
    { word: 'okul vlogu', weight: 1.6 },
    { word: 'kampüs', weight: 1.4 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'vlog', weight: 2.0 },
    { word: 'daily', weight: 1.8 },
    { word: 'life', weight: 1.7 },
    { word: 'day', weight: 1.4 },
    { word: 'lifestyle', weight: 1.8 },
    { word: 'routine', weight: 1.7 },
    { word: 'home', weight: 1.2 },
    { word: 'family', weight: 1.3 },
    { word: 'travel', weight: 1.6 },
    { word: 'trip', weight: 1.6 },
    { word: 'vacation', weight: 1.5 },
    { word: 'shopping', weight: 1.5 },
    { word: 'vlogger', weight: 1.9 },
    { word: 'blogger', weight: 1.8 },
    { word: 'daily vlog', weight: 1.9 },
    { word: 'my life', weight: 1.7 },
    { word: 'my day', weight: 1.8 },
    { word: '24 hours', weight: 1.6 },
    { word: 'with me', weight: 1.5 },
    { word: 'get ready with me', weight: 1.7 },
    { word: 'routine', weight: 1.7 },
    { word: 'morning routine', weight: 1.7 },
    { word: 'evening routine', weight: 1.7 },
    { word: 'shopping haul', weight: 1.6 },
    { word: 'store tour', weight: 1.5 },
    { word: 'home tour', weight: 1.7 },
    { word: 'room tour', weight: 1.7 },
    { word: 'decoration', weight: 1.5 },
    { word: 'organization', weight: 1.4 },
    { word: 'cleaning', weight: 1.4 },
    { word: 'cleaning routine', weight: 1.5 }
  ],
  Sports: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'spor', weight: 2.0 },
    { word: 'futbol', weight: 1.9 },
    { word: 'basketbol', weight: 1.8 },
    { word: 'maç', weight: 1.8 },
    { word: 'fitness', weight: 1.7 },
    { word: 'antrenman', weight: 1.7 },
    { word: 'egzersiz', weight: 1.7 },
    { word: 'galatasaray', weight: 1.8 },
    { word: 'fenerbahçe', weight: 1.8 },
    { word: 'beşiktaş', weight: 1.8 },
    { word: 'lig', weight: 1.7 },
    { word: 'şampiyona', weight: 1.7 },
    { word: 'kupa', weight: 1.6 },
    { word: 'transfer', weight: 1.6 },
    { word: 'takım', weight: 1.6 },
    { word: 'oyuncu', weight: 1.5 },
    { word: 'süper lig', weight: 1.8 },
    { word: 'premier lig', weight: 1.7 },
    { word: 'la liga', weight: 1.7 },
    { word: 'serie a', weight: 1.7 },
    { word: 'bundesliga', weight: 1.7 },
    { word: 'spor haberleri', weight: 1.8 },
    { word: 'spor yorumları', weight: 1.7 },
    { word: 'maç önü', weight: 1.6 },
    { word: 'maç sonu', weight: 1.6 },
    { word: 'futbol yorumları', weight: 1.7 },
    { word: 'spor spikeri', weight: 1.6 },
    { word: 'spor yorumcusu', weight: 1.6 },
    { word: 'hakem', weight: 1.5 },
    { word: 'canlı skor', weight: 1.6 },
    { word: 'canlı maç', weight: 1.7 },
    { word: 'maç özeti', weight: 1.7 },
    { word: 'gol', weight: 1.6 },
    { word: 'gol özeti', weight: 1.6 },
    { word: 'en iyi goller', weight: 1.6 },
    { word: 'futbolcu', weight: 1.7 },
    { word: 'transfer haberleri', weight: 1.6 },
    { word: 'f1', weight: 1.7 },
    { word: 'formula', weight: 1.7 },
    { word: 'koşu', weight: 1.5 },
    { word: 'yüzme', weight: 1.5 },
    { word: 'tenis', weight: 1.6 },
    { word: 'voleybol', weight: 1.6 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'sports', weight: 2.0 },
    { word: 'football', weight: 1.9 },
    { word: 'soccer', weight: 1.9 },
    { word: 'basketball', weight: 1.8 },
    { word: 'match', weight: 1.8 },
    { word: 'fitness', weight: 1.7 },
    { word: 'training', weight: 1.7 },
    { word: 'exercise', weight: 1.7 },
    { word: 'league', weight: 1.7 },
    { word: 'championship', weight: 1.7 },
    { word: 'tournament', weight: 1.7 },
    { word: 'workout', weight: 1.7 },
    { word: 'gym', weight: 1.7 },
    { word: 'transfer', weight: 1.6 },
    { word: 'team', weight: 1.6 },
    { word: 'player', weight: 1.5 },
    { word: 'premier league', weight: 1.8 },
    { word: 'la liga', weight: 1.7 },
    { word: 'serie a', weight: 1.7 },
    { word: 'bundesliga', weight: 1.7 },
    { word: 'sports news', weight: 1.8 },
    { word: 'sports commentary', weight: 1.7 },
    { word: 'pre-match', weight: 1.6 },
    { word: 'post-match', weight: 1.6 },
    { word: 'referee', weight: 1.5 },
    { word: 'live score', weight: 1.6 },
    { word: 'match highlights', weight: 1.7 },
    { word: 'goal', weight: 1.6 },
    { word: 'goal highlights', weight: 1.6 }
  ],
  Beauty: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'güzellik', weight: 2.0 },
    { word: 'makyaj', weight: 1.9 },
    { word: 'kozmetik', weight: 1.8 },
    { word: 'cilt bakımı', weight: 1.8 },
    { word: 'saç', weight: 1.7 },
    { word: 'makyaj', weight: 1.9 },
    { word: 'oje', weight: 1.6 },
    { word: 'ruj', weight: 1.7 },
    { word: 'fondöten', weight: 1.7 },
    { word: 'rimel', weight: 1.7 },
    { word: 'bakım', weight: 1.6 },
    { word: 'ürün', weight: 1.2 },
    { word: 'inceleme', weight: 1.5 },
    { word: 'makyaj rutinim', weight: 1.8 },
    { word: 'cilt bakım rutinim', weight: 1.8 },
    { word: 'skincare', weight: 1.8 },
    { word: 'makyaj temizleme', weight: 1.7 },
    { word: 'ürün inceleme', weight: 1.7 },
    { word: 'alışveriş', weight: 1.4 },
    { word: 'favoriler', weight: 1.5 },
    { word: 'ayın favorileri', weight: 1.6 },
    { word: 'saç bakımı', weight: 1.7 },
    { word: 'saç boyama', weight: 1.7 },
    { word: 'saç stili', weight: 1.7 },
    { word: 'kuaför', weight: 1.6 },
    { word: 'kalıcı makyaj', weight: 1.7 },
    { word: 'göz makyajı', weight: 1.8 },
    { word: 'dudak makyajı', weight: 1.8 },
    { word: 'kaş', weight: 1.6 },
    { word: 'kirpik', weight: 1.6 },
    { word: 'tırnak', weight: 1.6 },
    { word: 'tırnak bakımı', weight: 1.7 },
    { word: 'tırnak sanatı', weight: 1.7 },
    { word: 'cilt maskesi', weight: 1.7 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'beauty', weight: 2.0 },
    { word: 'makeup', weight: 1.9 },
    { word: 'cosmetics', weight: 1.8 },
    { word: 'skincare', weight: 1.8 },
    { word: 'hair', weight: 1.7 },
    { word: 'makeup', weight: 1.9 },
    { word: 'nail', weight: 1.6 },
    { word: 'lipstick', weight: 1.7 },
    { word: 'foundation', weight: 1.7 },
    { word: 'mascara', weight: 1.7 },
    { word: 'care', weight: 1.6 },
    { word: 'product', weight: 1.2 },
    { word: 'review', weight: 1.5 },
    { word: 'makeup routine', weight: 1.8 },
    { word: 'skincare routine', weight: 1.8 },
    { word: 'cleansing', weight: 1.7 },
    { word: 'product review', weight: 1.7 },
    { word: 'shopping', weight: 1.4 },
    { word: 'favorites', weight: 1.5 },
    { word: 'monthly favorites', weight: 1.6 },
    { word: 'hair care', weight: 1.7 },
    { word: 'hair dye', weight: 1.7 },
    { word: 'hair style', weight: 1.7 },
    { word: 'hairdresser', weight: 1.6 },
    { word: 'permanent makeup', weight: 1.7 },
    { word: 'eye makeup', weight: 1.8 },
    { word: 'lip makeup', weight: 1.8 }
  ],
  Cooking: [
    // Türkçe - Ağırlıklı anahtar kelimeler
    { word: 'yemek', weight: 2.0 },
    { word: 'tarif', weight: 1.9 },
    { word: 'mutfak', weight: 1.8 },
    { word: 'pişirme', weight: 1.8 },
    { word: 'chef', weight: 1.7 },
    { word: 'şef', weight: 1.7 },
    { word: 'pasta', weight: 1.7 },
    { word: 'tatlı', weight: 1.7 },
    { word: 'çorba', weight: 1.7 },
    { word: 'et', weight: 1.6 },
    { word: 'tavuk', weight: 1.6 },
    { word: 'vejeteryan', weight: 1.6 },
    { word: 'vegan', weight: 1.6 },
    { word: 'gurme', weight: 1.7 },
    { word: 'yemek tarifi', weight: 1.9 },
    { word: 'nasıl yapılır', weight: 1.8 },
    { word: 'kolay tarifler', weight: 1.8 },
    { word: 'pratik yemekler', weight: 1.8 },
    { word: 'ev yemekleri', weight: 1.7 },
    { word: 'lezzetli', weight: 1.6 },
    { word: 'nefis', weight: 1.6 },
    { word: 'iftar', weight: 1.5 },
    { word: 'sahur', weight: 1.5 },
    { word: 'ramazan', weight: 1.5 },
    { word: 'kahvaltı', weight: 1.7 },
    { word: 'öğle yemeği', weight: 1.6 },
    { word: 'akşam yemeği', weight: 1.6 },
    { word: 'aperatif', weight: 1.6 },
    { word: 'atıştırmalık', weight: 1.6 },
    { word: 'hamur işi', weight: 1.7 },
    { word: 'börek', weight: 1.7 },
    { word: 'çörek', weight: 1.7 },
    { word: 'kurabiye', weight: 1.7 },
    { word: 'kek', weight: 1.7 },
    { word: 'tatlı tarifleri', weight: 1.8 },
    { word: 'tarifler', weight: 1.9 },
    { word: 'püf noktaları', weight: 1.7 },
    { word: 'aşçı', weight: 1.7 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'food', weight: 2.0 },
    { word: 'recipe', weight: 1.9 },
    { word: 'kitchen', weight: 1.8 },
    { word: 'cooking', weight: 1.8 },
    { word: 'chef', weight: 1.7 },
    { word: 'baking', weight: 1.8 },
    { word: 'cake', weight: 1.7 },
    { word: 'dessert', weight: 1.7 },
    { word: 'soup', weight: 1.7 },
    { word: 'meat', weight: 1.6 },
    { word: 'chicken', weight: 1.6 },
    { word: 'vegetarian', weight: 1.6 },
    { word: 'vegan', weight: 1.6 },
    { word: 'gourmet', weight: 1.7 },
    { word: 'recipe', weight: 1.9 },
    { word: 'how to make', weight: 1.8 },
    { word: 'easy recipes', weight: 1.8 },
    { word: 'practical meals', weight: 1.8 },
    { word: 'home cooking', weight: 1.7 },
    { word: 'delicious', weight: 1.6 },
    { word: 'tasty', weight: 1.6 },
    { word: 'breakfast', weight: 1.7 },
    { word: 'lunch', weight: 1.6 },
    { word: 'dinner', weight: 1.6 },
    { word: 'snack', weight: 1.6 },
    { word: 'pastry', weight: 1.7 },
    { word: 'cookie', weight: 1.7 },
    { word: 'pie', weight: 1.7 },
    { word: 'sweet recipes', weight: 1.8 },
    { word: 'chef tips', weight: 1.7 },
    { word: 'cook', weight: 1.8 }
  ]
};

// Kategori bazlı CPM çarpanları
const categoryCpmMultipliers = {
  Finance: 2.2,     // Finans içeriği genelde daha yüksek CPM alır
  Tech: 1.8,        // Teknoloji içerikleri iyi CPM alır
  Education: 1.6,   // Eğitim içerikleri değerlidir
  Beauty: 1.5,      // Güzellik/Kozmetik reklamları iyi öder
  Sports: 1.4,      // Spor içeriği
  News: 1.3,        // Haber içeriği
  Cooking: 1.3,     // Yemek içeriği
  Entertainment: 1.2, // Eğlence içeriği
  Vlog: 1.1,        // Vlog içeriği
  Gaming: 1.0,      // Oyun içeriği
  Uncategorized: 1.0 // Belirlenemeyen içerik
};

// Tanınmış gazeteciler ve yorumcular (otomatik News kategorisine atanması için)
const knownJournalists = [
  { name: 'fatih altaylı', category: 'News', confidence: 90 },
  { name: 'cüneyt özdemir', category: 'News', confidence: 90 },
  { name: 'nevşin mengü', category: 'News', confidence: 90 },
  { name: 'ece üner', category: 'News', confidence: 90 },
  { name: 'fatih portakal', category: 'News', confidence: 90 },
  { name: 'mirgün cabas', category: 'News', confidence: 90 },
  { name: 'uğur dündar', category: 'News', confidence: 90 },
  { name: 'ruşen çakır', category: 'News', confidence: 90 },
  { name: 'oğuz haksever', category: 'News', confidence: 90 },
  { name: 'deniz bayramoğlu', category: 'News', confidence: 90 },
  { name: 'ahmet hakan', category: 'News', confidence: 90 },
  { name: 'sedef kabaş', category: 'News', confidence: 90 },
  { name: 'sözcü', category: 'News', confidence: 90 },
  { name: 'cumhuriyet', category: 'News', confidence: 90 },
  { name: 'habertürk', category: 'News', confidence: 90 },
  { name: 'ntv', category: 'News', confidence: 90 },
  { name: 'cnn türk', category: 'News', confidence: 90 },
  { name: 'fox haber', category: 'News', confidence: 90 },
  { name: 'halk tv', category: 'News', confidence: 90 },
  { name: 'tele1', category: 'News', confidence: 90 },
  { name: 'murat yetkin', category: 'News', confidence: 90 },
  { name: 'levent gültekin', category: 'News', confidence: 90 },
  { name: 'fikri sağlar', category: 'News', confidence: 90 }
];

/**
 * Metin normalizasyonu - özel karakterleri kaldırır ve küçük harfe çevirir
 * @param {string} text - Normalize edilecek metin
 * @returns {string} Normalize edilmiş metin
 */
function normalizeText(text) {
  if (!text) return '';
  
  // Türkçe karakterleri koruyarak küçültme ve özel karakterleri temizleme
  return text.toLowerCase()
    .replace(/[^\w\s\u00c0-\u00ff\u0100-\u017f\u0180-\u024fçğıöşü]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kanal bilgileri ve videolara göre içerik kategorisini belirler
 * @param {Object} channelInfo - Kanal bilgileri (başlık, açıklama vb.)
 * @param {Array} videos - Kanal videoları listesi (isteğe bağlı)
 * @returns {Object} Analiz sonuçları ve en olası kategori
 */
function categoryExtractor(channelInfo, videos = []) {
  // Debug: Ne tür bir nesne aldığımızı görelim
  console.log("🔍 KATEGORİ ANALİZİ BAŞLIYOR:", channelInfo.channelTitle || 'İsimsiz Kanal');
  
  // Kanal alanlarını kontrol et ve uyumlu hale getir
  const title = normalizeText(channelInfo.channelTitle || channelInfo.title || '');
  const description = normalizeText(channelInfo.channelDescription || channelInfo.description || '');
  
  console.log(`🔍 Başlık: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`);
  console.log(`🔍 Açıklama (ilk 50 karakter): "${description.substring(0, 50)}${description.length > 50 ? '...' : ''}"`);
  
  // İlk adım: Tanınmış gazeteci/kanal kontrolü
  // Başlıkta tanınmış bir gazeteci/kanal ismi var mı kontrol et
  for (const journalist of knownJournalists) {
    if (title.includes(journalist.name)) {
      console.log(`✅ TANINMIŞ GAZETECİ/KANAL TESPİT EDİLDİ: ${journalist.name}`);
      return {
        categoryType: journalist.category,
        confidence: journalist.confidence,
        cpmMultiplier: categoryCpmMultipliers[journalist.category] || categoryCpmMultipliers['Uncategorized'],
        detectionMethod: 'known_journalist',
        debug: {
          matchedJournalist: journalist.name,
          analyzedContent: {
            title: title,
            descriptionLength: description.length
          }
        }
      };
    }
  }
  
  // Videolardan kullanılacak metinleri al - ilk 5 videoyu analiz et
  const videoLimit = Math.min(videos.length, 5);
  const videoTexts = videos.slice(0, videoLimit).map(video => {
    const videoTitle = normalizeText(video.title || '');
    const videoDescription = normalizeText(video.description || '');
    const videoTags = Array.isArray(video.tags) 
      ? normalizeText(video.tags.join(' ')) 
      : '';
    
    return `${videoTitle} ${videoTitle} ${videoDescription} ${videoTags}`; // Video başlığına daha fazla ağırlık ver
  }).join(' ');
  
  // Video metinlerini kontrol et
  if (videos.length > 0) {
    console.log(`🔍 ${videoLimit} video metni analiz ediliyor (toplam ${videos.length} videodan)`);
  } else {
    console.log("⚠️ Video bulunamadı, sadece kanal bilgileri kullanılıyor");
  }
  
  // Kanal açıklamasından ilk 500 karakteri kullan - en önemli bilgiler genelde başta olur
  const truncatedDescription = description.substring(0, 500);
  
  // Tüm metinleri birleştir - içerik türlerine farklı ağırlıklar ver
  const combinedText = `${title} ${title} ${title} ${truncatedDescription} ${truncatedDescription} ${videoTexts}`;
  
  // Toplam metin uzunluğunu logla
  console.log(`🔍 Toplam analiz metni: ${combinedText.length} karakter`);
  
  // Haber özelliği kontrol - Açıklamanın ilk 100 karakterinde "gazeteci", "yazar", "sunucu" kelimeleri geçiyor mu?
  const firstPartOfDescription = description.substring(0, 100).toLowerCase();
  if (firstPartOfDescription.includes('gazeteci') || 
      firstPartOfDescription.includes('yazar') || 
      firstPartOfDescription.includes('sunucu') ||
      firstPartOfDescription.includes('spiker') ||
      firstPartOfDescription.includes('yorumcu')) {
    console.log("✅ HABER/MEDYA İÇERİĞİ BELİRTECİ TESPİT EDİLDİ: Açıklamanın başında medya terimi var");
    // Bu bir ipucu olacak, skora ekstra katkı sağlayacak
  }
  
  // Her kategori için skor hesapla
  const scores = {};
  const rawScores = {}; // Ağırlıksız ham skorlar
  let totalWeightedMatches = 0;
  let totalRawMatches = 0;
  let matchDetails = {}; // Hangi anahtar kelimelerin eşleştiğini tutacak
  
  // Eski kategoriler için geriye dönük uyumluluk
  for (const category in categoryKeywords) {
    scores[category] = 0;
    rawScores[category] = 0;
    matchDetails[category] = [];
    
    // Kategori için anahtar kelimeleri kontrol et
    const keywords = categoryKeywords[category];
    
    // Anahtar kelimeler array formatında mı yoksa obje formatında mı kontrol et
    if (Array.isArray(keywords)) {
      // Eski format - basit string dizisi
      for (const keyword of keywords) {
        if (typeof keyword === 'string') {
          // Regex olarak anahtar kelime ile eşleşme ara (tam kelime)
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = (combinedText.match(regex) || []).length;
          
          if (matches > 0) {
            // Her eşleşme için skoru artır (varsayılan ağırlık: 1.0)
            scores[category] += matches;
            rawScores[category] += matches;
            totalWeightedMatches += matches;
            totalRawMatches += matches;
            matchDetails[category].push(`${keyword} (${matches})`);
          }
        }
      }
    } else {
      // Yeni format - obje dizisi {word, weight}
      for (const keywordObj of keywords) {
        if (typeof keywordObj === 'object' && keywordObj.word && keywordObj.weight) {
          const keyword = keywordObj.word;
          const weight = keywordObj.weight || 1.0;
          
          // Regex olarak anahtar kelime ile eşleşme ara (tam kelime)
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = (combinedText.match(regex) || []).length;
          
          if (matches > 0) {
            // Her eşleşme için ağırlıklı skoru artır
            const weightedMatches = matches * weight;
            scores[category] += weightedMatches;
            rawScores[category] += matches; // Ham eşleşme sayısı
            totalWeightedMatches += weightedMatches;
            totalRawMatches += matches;
            matchDetails[category].push(`${keyword} (${matches}x${weight.toFixed(1)}=${weightedMatches.toFixed(1)})`);
          }
        }
      }
    }
  }
  
  // Açıklamanın başlangıcında haber içeriği ipuçları varsa News skoruna ekstra katkı sağla
  if (firstPartOfDescription.includes('gazeteci') || 
      firstPartOfDescription.includes('yazar') || 
      firstPartOfDescription.includes('sunucu') ||
      firstPartOfDescription.includes('spiker') ||
      firstPartOfDescription.includes('yorumcu')) {
    scores['News'] += 10.0; // Önemli bir bonus ekle
    console.log("🔍 News kategorisine medya terimi bonusu: +10.0 puan");
  }
  
  // Eşleşme sayılarını logla
  console.log(`🔍 Toplam eşleşme sayısı: ${totalRawMatches} (ağırlıklı: ${totalWeightedMatches.toFixed(1)})`);
  
  // Skoru yüksek olan kategorileri logla (en fazla 3 tane)
  const topCategories = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (topCategories.length > 0) {
    console.log("🔍 En yüksek skorlu kategoriler:");
    topCategories.forEach(([category, score]) => {
      console.log(`   - ${category}: ${score.toFixed(1)} puan, Eşleşen kelimeler: ${matchDetails[category].join(', ')}`);
    });
  } else {
    console.log("⚠️ Hiçbir kategoriyle eşleşme bulunamadı!");
  }
  
  // En yüksek skora sahip kategoriyi bul
  let maxScore = 0;
  let maxCategory = 'Uncategorized';
  let secondCategory = null; // İkinci en yüksek kategori
  let confidence = 0;
  
  // En yüksek ve ikinci en yüksek kategorileri bul
  const sortedCategories = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0) {
    maxCategory = sortedCategories[0][0];
    maxScore = sortedCategories[0][1];
    
    if (sortedCategories.length > 1) {
      secondCategory = sortedCategories[1][0];
    }
  }
  
  // Eğer hiçbir anahtar kelime eşleşmezse veya çok düşük bir skor varsa, özel işlem yap
  if (totalRawMatches === 0) {
    console.log("⚠️ Hiçbir anahtar kelime eşleşmedi, kanal başlığında manuel kontrol yapılıyor...");
    
    // Başlıktaki kelime sayısı az olabileceğinden, daha esnek bir eşleştirme yap
    // Kanal başlığını tek tek kelimelerine ayır
    const titleWords = title.split(/\s+/).filter(word => word.length > 3); // 3 karakterden uzun kelimeler
    const descriptionWords = truncatedDescription.split(/\s+/).filter(word => word.length > 3);
    
    console.log(`🔍 Başlıktaki anahtar kelimeler: ${titleWords.join(', ')}`);
    console.log(`🔍 Açıklamadaki kelime sayısı: ${descriptionWords.length}`);
    
    // Gazeteci kontrolü - yeniden kontrol et 
    for (const journalist of knownJournalists) {
      const journalistParts = journalist.name.split(/\s+/);
      // Bir kişinin adı ve soyadı ayrı ayrı başlıkta geçebilir
      if (journalistParts.every(part => titleWords.some(word => word.includes(part) || part.includes(word)))) {
        console.log(`✅ TANINMIŞ GAZETECİ TESPİT EDİLDİ (kelime eşleşmesiyle): ${journalist.name}`);
        maxCategory = journalist.category;
        confidence = journalist.confidence;
        scores[maxCategory] = 10.0; // Önemli bir bonus ekle
        totalWeightedMatches += 10.0;
        totalRawMatches += 1;
        break;
      }
    }
    
    // Her bir kategorideki anahtar kelimeleri kontrol et
    for (const category in categoryKeywords) {
      const keywords = categoryKeywords[category];
      
      // Başlıktaki ve açıklamadaki her kelime için kontrol et
      const allWords = [...titleWords, ...descriptionWords.slice(0, 50)]; // Açıklama kelimelerinden ilk 50'sini al
      
      for (const word of allWords) {
        // Her anahtar kelime için kısmi eşleşme ara (içinde var mı diye)
        if (Array.isArray(keywords)) {
          // Eski format
          for (const keyword of keywords) {
            if (typeof keyword === 'string' && 
                (keyword.includes(word) || word.includes(keyword)) && 
                word.length > 3 && keyword.length > 3) {
              console.log(`🔍 Kısmi eşleşme bulundu: "${word}" -> "${keyword}" (${category})`);
              scores[category] += 0.5; // Kısmi eşleşmelerde daha düşük puan ver
              rawScores[category] += 1;
              totalWeightedMatches += 0.5;
              totalRawMatches += 1;
            }
          }
        } else {
          // Yeni format
          for (const keywordObj of keywords) {
            if (typeof keywordObj === 'object' && keywordObj.word && keywordObj.weight) {
              const keyword = keywordObj.word;
              const weight = keywordObj.weight * 0.5; // Kısmi eşleşmelerde ağırlığı yarıya düşür
              
              if ((keyword.includes(word) || word.includes(keyword)) && 
                  word.length > 3 && keyword.length > 3) {
                console.log(`🔍 Kısmi eşleşme bulundu: "${word}" -> "${keyword}" (${category})`);
                scores[category] += weight;
                rawScores[category] += 1;
                totalWeightedMatches += weight;
                totalRawMatches += 1;
              }
            }
          }
        }
      }
    }
    
    // Tekrar en yüksek skora sahip kategoriyi bul
    const resortedCategories = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
      
    if (resortedCategories.length > 0) {
      maxCategory = resortedCategories[0][0];
      maxScore = resortedCategories[0][1];
      
      if (resortedCategories.length > 1) {
        secondCategory = resortedCategories[1][0];
      }
    }
    
    // Hala eşleşme yoksa, son çare olarak kanal başlığında içerik türünü ara
    if (totalRawMatches === 0) {
      console.log("⚠️ Hala eşleşme bulunamadı, kanal adı içerik ipuçlarına bakılıyor...");
      
      // Kanal açıklamasında genişletilmiş medya/haber kontrolü
      if (description.includes('gazeteci') || 
          description.includes('yazar') || 
          description.includes('yorumcu') || 
          description.includes('sunucu') || 
          description.includes('haber') || 
          description.includes('gündem') || 
          description.includes('siyaset') || 
          description.includes('yorumluyor') || 
          description.includes('yorumları')) {
        console.log("✅ Açıklamada HABER/MEDYA terimleri tespit edildi");
        maxCategory = 'News';
        confidence = 70; // Daha yüksek bir güven skoru ver
      }
      // Eğer hala bir kategori belirlenemezse, yaygın içerik türleri için basit kontrol yap
      else {
        // Yaygın içerik türleri için basit kontrol - daha hassas kontroller ekle
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        const combinedLower = titleLower + " " + descLower.substring(0, 200); // Başlık ve açıklamanın ilk kısmı
        
        if (combinedLower.includes('game') || combinedLower.includes('oyun') || 
            combinedLower.includes('play') || combinedLower.includes('gaming')) {
          maxCategory = 'Gaming';
        } else if (combinedLower.includes('vlog') || combinedLower.includes('daily') || 
                  combinedLower.includes('hayat') || combinedLower.includes('günlük')) {
          maxCategory = 'Vlog';
        } else if (combinedLower.includes('tech') || combinedLower.includes('teknoloji') || 
                  combinedLower.includes('review') || combinedLower.includes('inceleme')) {
          maxCategory = 'Tech';
        } else if (combinedLower.includes('news') || combinedLower.includes('haber') || 
                  combinedLower.includes('gündem') || combinedLower.includes('son dakika')) {
          maxCategory = 'News';
        } else if (combinedLower.includes('education') || combinedLower.includes('eğitim') || 
                  combinedLower.includes('lesson') || combinedLower.includes('ders')) {
          maxCategory = 'Education';
        } else if (combinedLower.includes('cook') || combinedLower.includes('yemek') || 
                  combinedLower.includes('recipe') || combinedLower.includes('tarif')) {
          maxCategory = 'Cooking';
        } else if (combinedLower.includes('beauty') || combinedLower.includes('güzellik') || 
                  combinedLower.includes('makeup') || combinedLower.includes('makyaj')) {
          maxCategory = 'Beauty';
        } else if (combinedLower.includes('finance') || combinedLower.includes('finans') || 
                  combinedLower.includes('money') || combinedLower.includes('para')) {
          maxCategory = 'Finance';
        } else if (combinedLower.includes('sport') || combinedLower.includes('spor') || 
                  combinedLower.includes('football') || combinedLower.includes('futbol')) {
          maxCategory = 'Sports';
        } else {
          // İçerik bulunamazsa, Uncategorized kategorisini kullan
          maxCategory = 'Uncategorized';
          console.log("⚠️ Hiçbir kategori belirlenemedi, 'Uncategorized' olarak işaretleniyor");
        }
      }
    }
  }
  
  // Güven skoru hesapla (en yüksek kategori skoru / toplam eşleşme sayısı)
  if (confidence === 0) { // Daha önce bir güven skoru atanmadıysa hesapla
    if (totalWeightedMatches > 0) {
      confidence = Math.round((maxScore / totalWeightedMatches) * 100);
    } else {
      // Hiç eşleşme yoksa, düşük bir güven skoru ver
      confidence = 20; // %20 güven
    }
  }
  
  console.log(`✅ KATEGORİ BELİRLENDİ: ${maxCategory} (Güven: %${confidence})`);
  
  // Alternatif kategori önerisi (düşük güven skoru durumunda)
  let alternativeCategory = null;
  let alternativeConfidence = 0;
  
  if (confidence < 60 && secondCategory) {
    alternativeCategory = secondCategory;
    const secondScore = scores[secondCategory];
    alternativeConfidence = Math.round((secondScore / totalWeightedMatches) * 100);
    console.log(`ℹ️ ALTERNATİF KATEGORİ ÖNERİSİ: ${alternativeCategory} (Güven: %${alternativeConfidence})`);
  }
  
  // Sonuçları döndür
  return {
    categoryType: maxCategory,
    scores: scores,
    rawScores: rawScores, 
    confidence: confidence,
    cpmMultiplier: categoryCpmMultipliers[maxCategory] || categoryCpmMultipliers['Uncategorized'],
    // Alternatif kategori bilgileri
    alternativeCategory: alternativeCategory,
    alternativeConfidence: alternativeConfidence,
    // Eşleşmeyen arama sırasında detayları da sağla (frontend'de kullanılabilir)
    debug: {
      totalMatches: totalRawMatches,
      totalWeightedMatches: totalWeightedMatches,
      analyzedContent: {
        title: title,
        descriptionLength: description.length,
        analyzedDescription: truncatedDescription.length,
        videosCount: videos.length,
        analyzedVideos: videoLimit
      },
      matchDetails: matchDetails
    }
  };
}

/**
 * Kategori analiz sonuçlarından okunabilir bir rapor oluşturur
 * @param {Object} analysisResult - categoryExtractor fonksiyonundan dönen sonuç
 * @returns {string} Okunabilir analiz raporu
 */
function generateCategoryReport(analysisResult) {
  if (!analysisResult || !analysisResult.scores) {
    return 'Analiz sonucu bulunamadı.';
  }
  
  const { categoryType, scores, confidence } = analysisResult;
  
  // Skorları sırala
  const sortedScores = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  
  let report = `📊 Kategori Analizi: ${categoryType} (${confidence}% emin)\n\n`;
  
  if (sortedScores.length === 0) {
    report += 'Hiçbir kategori ile eşleşme bulunamadı.';
    return report;
  }
  
  report += 'Kategori dağılımı:\n';
  
  // En yüksek 3 kategoriyi raporla
  sortedScores.slice(0, 3).forEach(([category, score]) => {
    const percentage = Math.round((score / sortedScores.reduce((sum, [_, s]) => sum + s, 0)) * 100);
    report += `- ${category}: ${score} puan (${percentage}%)\n`;
  });
  
  return report;
}

module.exports = {
  categoryExtractor,
  generateCategoryReport,
  categoryCpmMultipliers
}; 