const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',

      default: null,
    },
    doctorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },

      required: true,
      unique: true,
      index: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    hospital: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,

    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    hospital: {
      type: String,
      required: true,

      trim: true,
      default: '',
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },


    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    availability: {
      type: [String],
      default: ['Monday - Friday: 09:00 - 17:00'],
    },

    profileImage: {
      type: String,
      default: '',
    },


    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search text index for flexible doctor discovery
doctorSchema.index({

  fullName: 'text',
  specialization: 'text',
  hospital: 'text',

  specialization: 'text',
  hospital: 'text',
  qualification: 'text',

});

module.exports = mongoose.model('Doctor', doctorSchema);
