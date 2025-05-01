const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// YouTube kanalı şeması
const channelSchema = new Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  channelTitle: {
    type: String,
    required: true,
    trim: true
  },
  channelDescription: {
    type: String,
    trim: true
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  videoCount: {
    type: Number,
    default: 0
  },
  thumbnailUrl: String,
  bannerUrl: {
    type: String
  },
  customUrl: {
    type: String
  },
  uploadsPlaylistId: {
    type: String
  },
  country: {
    type: String,
    default: 'TR'
  },
  publishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  estimatedEarnings: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    breakdown: {
      ads: {
        type: Number,
        default: 0
      },
      sponsorships: {
        type: Number,
        default: 0
      },
      memberships: {
        type: Number,
        default: 0
      },
      merchandise: {
        type: Number,
        default: 0
      }
    },
    factors: {
      categoryType: {
        type: String,
        default: 'Entertainment'
      },
      engagementBonus: {
        type: Number,
        default: 1.0
      },
      durationMultiplier: {
        type: Number,
        default: 1.0
      },
      channelSizeMultiplier: {
        type: Number,
        default: 1.0
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: String,
  tags: [String],
  lastChecked: {
    type: Date,
    default: Date.now
  }
});

// Kanal son güncelleme tarihi güncelleme işlevi
channelSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Kazanç hesaplama metodu
channelSchema.methods.calculateEarnings = function() {
  // Basit hesaplama: Görüntüleme başına $0.001 - $0.003 arası kazanç (tipik YouTube oranları)
  const minRate = 0.001;
  const maxRate = 0.003;
  
  this.estimatedEarnings = {
    min: Math.round(this.viewCount * minRate * 100) / 100,
    max: Math.round(this.viewCount * maxRate * 100) / 100,
    breakdown: {
      ads: Math.round(this.viewCount * 0.001 * 100) / 100,
      sponsorships: Math.round(this.viewCount * 0.002 * 100) / 100,
      memberships: Math.round(this.viewCount * 0.001 * 100) / 100,
      merchandise: Math.round(this.viewCount * 0.002 * 100) / 100
    },
    factors: {
      categoryType: 'Entertainment',
      engagementBonus: 1.0,
      durationMultiplier: 1.0,
      channelSizeMultiplier: 1.0
    }
  };
  
  return this.estimatedEarnings;
};

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel; 