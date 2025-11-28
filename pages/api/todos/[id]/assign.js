import connect from '../../../../../lib/mongodb'
import Todo from '../../../../../models/Todo'
import User from '../../../../../models/User'

export default async function handler(req,res){
  await connect()
  const token = req.cookies && req.cookies.token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  const jwt = require('jsonwebtoken')
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message:'Unauthorized' })

    if (req.method !== 'POST') return res.status(405).end()
    const { memberEmail } = req.body
    if (!memberEmail) return res.status(400).json({ message:'memberEmail required' })
    const member = await User.findOne({ email: memberEmail })
    if (!member) return res.status(404).json({ message:'Member not found' })

    const todo = await Todo.findById(req.query.id)
    if (!todo) return res.status(404).json({ message:'Todo not found' })
    // Only creator can assign
    if (String(todo.createdBy) !== String(user._id)) return res.status(403).json({ message:'Forbidden' })

    todo.assignedTo = member._id
    await todo.save()
    res.status(200).json({ todo })
  }catch(e){
    res.status(401).json({ message:'Unauthorized' })
  }
}
const { connect } = require('../../../../lib/mongodb')
const Todo = require('../../../../models/Todo')
const User = require('../../../../models/User')
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

  const todoId = req.query.id
  if (req.method !== 'PUT') return res.status(405).end()

  // only MANAGER or ADMIN can assign members
  const requester = await User.findById(payload.id).exec()
  if (!requester) return res.status(401).json({ message: 'Unauthorized' })
  if (!['MANAGER','ADMIN'].includes(requester.role)) return res.status(403).json({ message: 'Forbidden' })

  const { memberEmail } = req.body || {}
  if (!memberEmail) return res.status(400).json({ message: 'memberEmail required' })
  const member = await User.findOne({ email: memberEmail.toLowerCase() }).exec()
  if (!member) return res.status(404).json({ message: 'Member not found' })

  const todo = await Todo.findById(todoId).exec()
  if (!todo) return res.status(404).json({ message: 'Todo not found' })

  // add if not exists
  const exists = todo.assignedTo.some(id => id.toString() === member._id.toString())
  if (!exists) {
    todo.assignedTo.push(member._id)
    await todo.save()
  }

  return res.json({ ok: true })
}
const { connect } = require('../../../../lib/mongodb')
const Todo = require('../../../../models/Todo')
const User = require('../../../../models/User')
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

  const todoId = req.query.id
  if (req.method !== 'PUT') return res.status(405).end()

  // only MANAGER or ADMIN can assign members
  const requester = await User.findById(payload.id).exec()
  if (!requester) return res.status(401).json({ message: 'Unauthorized' })
  if (!['MANAGER','ADMIN'].includes(requester.role)) return res.status(403).json({ message: 'Forbidden' })

  const { memberEmail } = req.body || {}
  if (!memberEmail) return res.status(400).json({ message: 'memberEmail required' })
  const member = await User.findOne({ email: memberEmail.toLowerCase() }).exec()
  if (!member) return res.status(404).json({ message: 'Member not found' })

  const todo = await Todo.findById(todoId).exec()
  if (!todo) return res.status(404).json({ message: 'Todo not found' })

  // add if not exists
  const exists = todo.assignedTo.some(id => id.toString() === member._id.toString())
  if (!exists) {
    todo.assignedTo.push(member._id)
    await todo.save()
  }

  return res.json({ ok: true })
}
