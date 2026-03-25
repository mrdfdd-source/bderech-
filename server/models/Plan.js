const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  action: { type: String, required: true },
  instruction: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
});

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  motivation: {
    type: String,
    default: ''
  },
  priorExperience: {
    type: String,
    default: ''
  },
  totalDays: {
    type: Number,
    required: true
  },
  currentDay: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  shape: {
    type: String,
    enum: ['shoe', 'book', 'harmonica', 'star', 'heart', 'rocket'],
    default: 'star'
  },
  movements: [movementSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for completion percentage
planSchema.virtual('completionPercent').get(function () {
  const completed = this.movements.filter((m) => m.completed).length;
  return Math.round((completed / this.totalDays) * 100);
});

planSchema.set('toJSON', { virtuals: true });
planSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plan', planSchema);
