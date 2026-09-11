const mongoose = require('mongoose');

const careTeamThreadSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    patientName: {
      type: String,
      default: 'General Ward Patient',
    },
    caseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: [
        'Cardiology',
        'Emergency Medicine',
        'Intensive Care (ICU)',
        'Neurology',
        'Oncology',
        'Pediatrics',
        'General Surgery',
        'Pulmonology',
      ],
      default: 'Emergency Medicine',
      index: true,
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'archived'],
      default: 'active',
      index: true,
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        role: { type: String, default: 'doctor' },
        department: { type: String, default: 'Clinical Staff' },
      },
    ],
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String, required: true },
        senderRole: { type: String, default: 'doctor' },
        content: { type: String, required: true },
        urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

module.exports = mongoose.model('CareTeamThread', careTeamThreadSchema);
