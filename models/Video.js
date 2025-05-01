const mongoose = require('mongoose');

// Video şeması
const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  channelId: {
    type: String,
    required: true,
    ref: 'Channel',
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  thumbnailUrl: String,
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  dislikeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  duration: String,
  tags: [String],
  category: String,
  estimatedEarnings: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Video son güncelleme tarihi güncelleme işlevi
videoSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Kazanç hesaplama metodu
videoSchema.methods.calculateEarnings = function() {
  // Basit hesaplama: Görüntüleme başına $0.001 - $0.003 arası kazanç (tipik YouTube oranları)
  // Video kalitesi, uzunluğu, izleyici kitlesi gibi faktörlere göre değişebilir
  const minRate = 0.001;
  const maxRate = 0.003;
  
  this.estimatedEarnings = {
    min: Math.round(this.viewCount * minRate * 100) / 100,
    max: Math.round(this.viewCount * maxRate * 100) / 100,
    currency: 'USD'
  };
  
  return this.estimatedEarnings;
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 