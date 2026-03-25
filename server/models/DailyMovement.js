const mongoose = require('mongoose');

const dailyMovementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for streak tracking
dailyMovementSchema.index({ userId: 1, planId: 1, day: 1 }, { unique: true });
dailyMovementSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('DailyMovement', dailyMovementSchema);
