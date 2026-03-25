const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'אימייל הוא שדה חובה'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'אנא הכנס כתובת אימייל תקינה']
  },
  password: {
    type: String,
    required: [true, 'סיסמה היא שדה חובה'],
    minlength: [6, 'סיסמה חייבת להכיל לפחות 6 תווים']
  },
  name: {
    type: String,
    required: [true, 'שם הוא שדה חובה'],
    trim: true
  },
  notificationTime: {
    type: String,
    default: '08:00'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
