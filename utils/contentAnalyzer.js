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
    { word: 'komedi', weight: 1.8 },
    { word: 'mizah', weight: 1.8 },
    { word: 'şaka', weight: 1.6 },
    { word: 'gülmek', weight: 1.6 },
    { word: 'eğlenceli', weight: 1.7 },
    { word: 'komik', weight: 1.7 },
    { word: 'show', weight: 1.5 },
    { word: 'şov', weight: 1.5 },
    { word: 'talk show', weight: 1.6 },
    { word: 'magazin', weight: 1.5 },
    { word: 'yarışma', weight: 1.4 },
    // İngilizce
    { word: 'entertainment', weight: 2.0 },
    { word: 'comedy', weight: 1.8 },
    { word: 'funny', weight: 1.7 },
    { word: 'humor', weight: 1.8 },
    { word: 'show', weight: 1.5 },
    { word: 'talk show', weight: 1.6 },
    { word: 'celebrity', weight: 1.5 },
    { word: 'gossip', weight: 1.4 }
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
    { word: 'futbol', weight: 2.0 },
    { word: 'basketbol', weight: 1.9 },
    { word: 'voleybol', weight: 1.9 },
    { word: 'takım', weight: 1.8 },
    { word: 'maç', weight: 1.8 },
    { word: 'lig', weight: 1.8 },
    { word: 'şampiyonluk', weight: 1.7 },
    { word: 'kupa', weight: 1.7 },
    { word: 'turnuva', weight: 1.7 },
    { word: 'antrenman', weight: 1.6 },
    { word: 'idman', weight: 1.6 },
    { word: 'saha', weight: 1.5 },
    { word: 'stadyum', weight: 1.5 },
    { word: 'tribün', weight: 1.5 },
    { word: 'taraftar', weight: 1.6 },
    { word: 'federasyon', weight: 1.4 },
    { word: 'kulüp', weight: 1.8 },
    { word: 'sporcu', weight: 1.7 },
    { word: 'atlet', weight: 1.6 },
    { word: 'koç', weight: 1.6 },
    { word: 'teknik direktör', weight: 1.7 },
    { word: 'transfer', weight: 1.7 },
    { word: 'kadro', weight: 1.6 },
    { word: 'süper lig', weight: 1.8 },
    { word: 'premier lig', weight: 1.8 },
    { word: 'la liga', weight: 1.8 },
    { word: 'serie a', weight: 1.8 },
    { word: 'bundesliga', weight: 1.8 },
    { word: 'champions league', weight: 1.8 },
    { word: 'europa league', weight: 1.8 },
    { word: 'milli takım', weight: 1.8 },
    { word: 'milli', weight: 1.6 },
    { word: 'fenerbahçe', weight: 1.9 },
    { word: 'galatasaray', weight: 1.9 },
    { word: 'beşiktaş', weight: 1.9 },
    { word: 'trabzonspor', weight: 1.9 },
    { word: 'resmi', weight: 1.5 },
    { word: 'resmi kanal', weight: 1.8 },
    { word: 'spor kulübü', weight: 1.9 },
    // İngilizce - Ağırlıklı anahtar kelimeler
    { word: 'sports', weight: 2.0 },
    { word: 'football', weight: 2.0 },
    { word: 'soccer', weight: 2.0 },
    { word: 'basketball', weight: 1.9 },
    { word: 'volleyball', weight: 1.9 },
    { word: 'team', weight: 1.8 },
    { word: 'match', weight: 1.8 },
    { word: 'league', weight: 1.8 },
    { word: 'championship', weight: 1.7 },
    { word: 'cup', weight: 1.7 },
    { word: 'tournament', weight: 1.7 },
    { word: 'training', weight: 1.6 },
    { word: 'stadium', weight: 1.5 },
    { word: 'fan', weight: 1.6 },
    { word: 'federation', weight: 1.4 },
    { word: 'club', weight: 1.8 },
    { word: 'athlete', weight: 1.7 },
    { word: 'coach', weight: 1.6 },
    { word: 'transfer', weight: 1.7 },
    { word: 'squad', weight: 1.6 },
    { word: 'national team', weight: 1.8 },
    { word: 'official', weight: 1.5 },
    { word: 'official channel', weight: 1.8 },
    { word: 'sports club', weight: 1.9 }
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

// Kategori eşik değerleri
const categoryThresholds = {
    Sports: 0.2,    // Spor için daha düşük eşik
    News: 0.25,     // Haber için orta eşik
    Gaming: 0.3,    // Oyun için yüksek eşik
    Finance: 0.3,   // Finans için yüksek eşik
    Tech: 0.3,      // Teknoloji için yüksek eşik
    Education: 0.25, // Eğitim için orta eşik
    Beauty: 0.25,   // Güzellik için orta eşik
    Cooking: 0.25,  // Yemek için orta eşik
    Entertainment: 0.2, // Eğlence için düşük eşik
    Vlog: 0.2       // Vlog için düşük eşik
};

/**
 * Metin normalizasyonu - özel karakterleri kaldırır ve küçük harfe çevirir
 * @param {string} text - Normalize edilecek metin
 * @returns {string} Normalize edilmiş metin
 */
function normalizeText(text) {
  if (!text) return '';
  
  // Türkçe karakterleri koruyarak küçültme ve özel karakterleri temizleme
  return text.toLowerCase()
    .replace(/[^a-zğüşıöç\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keyword-based analiz için yardımcı fonksiyon
function keywordBasedAnalysis(text) {
    if (!text) return { type: 'Uncategorized', confidence: 0, scores: {} };
    
    const normalizedText = normalizeText(text);
    const scores = {};
    let maxScore = 0;
    let maxCategory = 'Uncategorized';

    // Her kategori için puan hesapla
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        let categoryScore = 0;
        
        keywords.forEach(({ word, weight }) => {
            try {
                // Kelime sınırlarını kontrol ederek eşleştirme yap
                const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                const matches = (normalizedText.match(regex) || []).length;
                categoryScore += matches * weight;
            } catch (error) {
                console.error(`Regex hatası (${word}):`, error);
            }
        });

        scores[category] = categoryScore;
        
        if (categoryScore > maxScore) {
            maxScore = categoryScore;
            maxCategory = category;
        }
    }

    // Güven skorunu hesapla (0-100 arası)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 
        ? Math.min(100, Math.round((maxScore / totalScore) * 100))
        : 0;

    // Kategori bazlı eşik değerlerini kontrol et
    if (totalScore < (categoryThresholds[maxCategory] || 0.3) || confidence < 3) {
        return {
            type: 'Uncategorized',
            confidence: 0,
            scores: scores
        };
    }

    // Sonuçları logla
    console.log('📊 Kategori skorları:', {
        maxCategory,
        maxScore,
        totalScore,
        confidence,
        scores
    });

    return {
        type: maxCategory,
        confidence: confidence,
        scores: scores
    };
}

/**
 * Kanal bilgileri ve videolara göre içerik kategorisini belirler
 * @param {Object} channelInfo - Kanal bilgileri (açıklama ve etiketler)
 * @returns {Object} Analiz sonuçları ve en olası kategori
 */
function categoryExtractor(channelInfo) {
    try {
        if (!channelInfo) {
            console.warn('Kanal bilgisi bulunamadı');
            return { type: 'Uncategorized', confidence: 0, scores: {} };
        }

        // Sadece açıklama ve etiketleri kullan
        const channelText = [
            channelInfo.channelDescription || '',     // Açıklama
            Array.isArray(channelInfo.tags) ? channelInfo.tags.join(' ').repeat(2) : ''  // Etiketler (2 kez tekrarlanarak ağırlığı artırılıyor)
        ].join(' ');

        const result = keywordBasedAnalysis(channelText);
        
        console.log('📊 Kategori analizi:', {
            channelDescription: channelInfo.channelDescription?.substring(0, 50) + '...',
            tags: channelInfo.tags,
            result: result
        });

        return result;
    } catch (error) {
        console.error('Kategori analizi hatası:', error);
        return {
            type: 'Uncategorized',
            confidence: 0,
            scores: {}
        };
    }
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
  
  const { type, scores, confidence } = analysisResult;
  
  // Skorları sırala
  const sortedScores = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  
  let report = `📊 Kategori Analizi: ${type} (${confidence}% emin)\n\n`;
  
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