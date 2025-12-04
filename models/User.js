const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['USER', 'MANAGER', 'ADMIN'], default: 'USER' },
  consentGiven: { type: Boolean, default: false },
  consentDate: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  // Security fields for lockout / session invalidation
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)
