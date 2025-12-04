const mongoose = require('mongoose')

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
