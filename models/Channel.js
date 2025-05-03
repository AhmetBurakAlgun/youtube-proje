const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { formatters } = require('../utils/formatters.js');

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

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel; 