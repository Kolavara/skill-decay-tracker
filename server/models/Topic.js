const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
    min: 1.3,
  },
  interval: {
    type: Number,
    default: 0,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  nextReviewDate: {
    type: Date,
    required: true,
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

topicSchema.index({ userId: 1, nextReviewDate: 1 });
topicSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Topic', topicSchema);
