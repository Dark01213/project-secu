const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['OPEN','DONE','CANCELLED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Todo || mongoose.model('Todo', TodoSchema)
const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['OPEN','DONE'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Todo || mongoose.model('Todo', TodoSchema)
const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['OPEN','DONE'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Todo || mongoose.model('Todo', TodoSchema)
