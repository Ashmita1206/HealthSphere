const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    // User who owns this session
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Used to group tokens belonging to the same login session (refresh token family)
    tokenFamily: {
      type: String,
      required: true,
      index: true,
    },

    // Refresh token SHA-256 hash (never raw token)
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },

    // Canonical structured device metadata
    device: {
      browser: {
        type: String,
        default: 'Unknown Browser',
      },
      os: {
        type: String,
        default: 'Unknown OS',
      },
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
        default: 'unknown',
      },
      ipAddress: {
        type: String,
        default: '127.0.0.1',
      },
      userAgent: {
        type: String,
        default: 'Unknown Client',
      },
      location: {
        type: String,
        default: 'Local Network',
      },
    },

    // Direct access helper fields with synchronous fallback to device subdocument
    userAgent: {
      type: String,
      default: function () {
        return this.device?.userAgent || 'Unknown Client';
      },
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: function () {
        return this.device?.deviceType || 'unknown';
      },
    },
    browser: {
      type: String,
      default: function () {
        return this.device?.browser || 'Unknown Browser';
      },
    },
    os: {
      type: String,
      default: function () {
        return this.device?.os || 'Unknown OS';
      },
    },
    ipAddress: {
      type: String,
      default: function () {
        return this.device?.ipAddress || '127.0.0.1';
      },
    },

    // Active & Revocation flags
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedReason: {
      type: String,
      default: null,
    },

    // Last time this session was used
    lastActive: {
      type: Date,
      default: Date.now,
    },

    // MongoDB TTL automatically removes expired sessions
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

// Virtual for tokenHash backward-compatibility mapping to refreshTokenHash
sessionSchema.virtual('tokenHash')
  .get(function () {
    return this.refreshTokenHash;
  })
  .set(function (val) {
    this.refreshTokenHash = val;
  });

module.exports =
  mongoose.models.Session ||
  mongoose.model('Session', sessionSchema);