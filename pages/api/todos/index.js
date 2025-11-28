import connect from '../../../../lib/mongodb'
import Todo from '../../../../models/Todo'
import User from '../../../../models/User'
import escapeHtml from '../../../../utils/escapeHtml'

export default async function handler(req,res){
  await connect()
  const token = req.cookies && req.cookies.token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  // Decode token minimally (reuse same secret as auth)
  const jwt = require('jsonwebtoken')
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message:'Unauthorized' })

    if (req.method === 'GET'){
      const todos = await Todo.find({ $or: [{ createdBy: user._id }, { assignedTo: user._id }] }).sort({ createdAt: -1 }).lean()
      return res.status(200).json({ todos })
    }

    if (req.method === 'POST'){
      const { title, description, deadline } = req.body
      if (!title) return res.status(400).json({ message: 'Title required' })
      const todo = new Todo({ title: escapeHtml(title), description: escapeHtml(description||''), deadline: deadline ? new Date(deadline) : null, createdBy: user._id })
      await todo.save()
      return res.status(201).json({ todo })
    }

    res.setHeader('Allow','GET,POST')
    res.status(405).end()
  }catch(e){
    return res.status(401).json({ message:'Unauthorized' })
  }
}
const { connect } = require('../../../lib/mongodb')
const Todo = require('../../../models/Todo')
const User = require('../../../models/User')
const jwt = require('jsonwebtoken')

function getToken(req){
  const cookieHeader = req.headers.cookie || ''
  const parts = cookieHeader.split(';').map(s=>s.trim())
  const tokenPart = parts.find(p=>p.startsWith('token='))
  if (!tokenPart) return null
  return tokenPart.split('=')[1]
}

module.exports = async (req, res) => {
  await connect()
  const token = getToken(req)
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') } catch (e) { return res.status(401).json({ message: 'Unauthorized' }) }

  if (req.method === 'GET'){
    // list todos where user is creator or assigned
    const todos = await Todo.find({ $or: [ { createdBy: payload.id }, { assignedTo: payload.id } ] }).populate('createdBy','name email role').populate('assignedTo','name email role').lean().exec()
    return res.json({ todos })
  }

  if (req.method === 'POST'){
    const { title, description, deadline } = req.body || {}
    if (!title || !deadline) return res.status(400).json({ message: 'Title and deadline are required' })
    const d = new Date(deadline)
    if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid deadline' })

    const todo = new Todo({ title, description: description || '', deadline: d, createdBy: payload.id })
    await todo.save()
    return res.status(201).json({ ok: true, todo })
  }

  return res.status(405).end()
}
const { connect } = require('../../../lib/mongodb')
const Todo = require('../../../models/Todo')
const User = require('../../../models/User')
const jwt = require('jsonwebtoken')

function getToken(req){
  const cookieHeader = req.headers.cookie || ''
  const parts = cookieHeader.split(';').map(s=>s.trim())
  const tokenPart = parts.find(p=>p.startsWith('token='))
  if (!tokenPart) return null
  return tokenPart.split('=')[1]
}

module.exports = async (req, res) => {
  await connect()
  const token = getToken(req)
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') } catch (e) { return res.status(401).json({ message: 'Unauthorized' }) }

  if (req.method === 'GET'){
    // list todos where user is creator or assigned
    const todos = await Todo.find({ $or: [ { createdBy: payload.id }, { assignedTo: payload.id } ] }).populate('createdBy','name email role').populate('assignedTo','name email role').lean().exec()
    return res.json({ todos })
  }

  if (req.method === 'POST'){
    const { title, description, deadline } = req.body || {}
    if (!title || !deadline) return res.status(400).json({ message: 'Title and deadline are required' })
    const d = new Date(deadline)
    if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid deadline' })

    const todo = new Todo({ title, description: description || '', deadline: d, createdBy: payload.id })
    await todo.save()
    return res.status(201).json({ ok: true, todo })
  }

  return res.status(405).end()
}
