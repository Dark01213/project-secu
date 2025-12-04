import connect from '../../../lib/mongodb'
import Todo from '../../../models/Todo'
import User from '../../../models/User'
import escapeHtml from '../../../utils/escapeHtml'

export default async function handler(req,res){
  await connect()
  const token = req.cookies && req.cookies.token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
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
      const { title, description, deadline } = req.body || {}
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
