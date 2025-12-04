import connect from '../../../lib/mongodb'
import TodoList from '../../../models/TodoList'
import User from '../../../models/User'

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
      let query = {}
      if (user.role === 'ADMIN'){
        query = {}
      } else {
        query = { $or: [{ manager: user._id }, { members: user._id }, { createdBy: user._id }] }
      }
      const lists = await TodoList.find(query).populate('manager','email name').lean()
      return res.status(200).json({ lists })
    }

    if (req.method === 'POST'){
      const { title, description, managerEmail, memberEmails } = req.body
      if (!(user.role === 'MANAGER' || user.role === 'ADMIN')) return res.status(403).json({ message:'Forbidden' })

      let managerUser = user
      if (user.role === 'ADMIN' && managerEmail){
        managerUser = await User.findOne({ email: managerEmail })
        if (!managerUser) return res.status(404).json({ message:'Manager not found' })
      }

      if (user.role === 'MANAGER' && String(managerUser._id) !== String(user._id)) return res.status(403).json({ message:'Manager must be self' })

      const members = []
      if (Array.isArray(memberEmails)){
        for (const e of memberEmails){
          const u = await User.findOne({ email: e })
          if (u) members.push(u._id)
        }
      }

      const list = new TodoList({ title: title, description: description || '', manager: managerUser._id, members, createdBy: user._id })
      await list.save()
      return res.status(201).json({ list })
    }

    res.setHeader('Allow','GET,POST')
    res.status(405).end()
  }catch(e){
    return res.status(401).json({ message:'Unauthorized' })
  }
}
