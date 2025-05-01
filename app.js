const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Routes
const channelRoutes = require('./routes/channelRoutes');

// Environment değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Önbelleği devre dışı bırakma middleware'i
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// API rotaları
app.use('/api', channelRoutes);

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// YouTube API proxy (geliştirme amaçlı)
app.get('/api/youtube/search', (req, res) => {
  const query = req.query.q || '';
  
  console.log(`YouTube arama isteği: ${query}`);
  
  // Örnek yanıt
  res.json({
    kind: 'youtube#searchResult',
    items: [
      {
        kind: 'youtube#searchResult',
        id: {
          kind: 'youtube#channel',
          channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA'
        },
        snippet: {
          title: 'MrBeast',
          description: 'Örnek kanal açıklaması',
          thumbnails: {
            default: {
              url: 'https://via.placeholder.com/88'
            },
            medium: {
              url: 'https://via.placeholder.com/240'
            },
            high: {
              url: 'https://via.placeholder.com/800'
            }
          }
        }
      }
    ]
  });
});

app.get('/api/youtube/channels', (req, res) => {
  const channelId = req.query.id || '';
  
  console.log(`YouTube kanal bilgisi isteği: ${channelId}`);
  
  // Örnek yanıt
  res.json({
    kind: 'youtube#channelListResponse',
    items: [
      {
        kind: 'youtube#channel',
        id: channelId || 'UCX6OQ3DkcsbYNE6H8uQQuVA',
        snippet: {
          title: 'MrBeast',
          description: 'Örnek kanal açıklaması',
          thumbnails: {
            default: {
              url: 'https://via.placeholder.com/88'
            },
            medium: {
              url: 'https://via.placeholder.com/240'
            },
            high: {
              url: 'https://via.placeholder.com/800'
            }
          }
        },
        statistics: {
          viewCount: '10000000000',
          subscriberCount: '100000000',
          videoCount: '700'
        }
      }
    ]
  });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.send('YouTube Analytics API - Geliştirme Aşamasında');
});

// YouTube API anahtarı endpoint'i
app.get('/api/youtube-api-key', (req, res) => {
  // YouTube API anahtarını çevre değişkenlerinden (API_KEY_1) al
  const apiKey = process.env.API_KEY_1 || '';
  
  // API anahtarını JSON olarak döndür
  res.json({ apiKey });
});

mongoose.connect(process.env.MONGODB_URI)
 .then(() => console.log('MongoDB bağlantısı başarılı'))
 .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu port ${PORT} üzerinde çalışıyor`);
});
