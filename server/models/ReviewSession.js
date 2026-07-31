const mongoose = require('mongoose');

const reviewSessionSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true,
  },
  confidenceRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ReviewSession', reviewSessionSchema);
