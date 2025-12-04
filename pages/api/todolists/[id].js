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

    const list = await TodoList.findById(req.query.id)
    if (!list) return res.status(404).json({ message:'Not found' })

    // GET: allow admin, manager (if manager === user), members
    if (req.method === 'GET'){
      if (user.role === 'ADMIN' || String(list.manager) === String(user._id) || (list.members || []).map(String).includes(String(user._id)) || String(list.createdBy) === String(user._id)){
        return res.status(200).json({ list })
      }
      return res.status(403).json({ message:'Forbidden' })
    }

    // PUT: update only by manager or admin
    if (req.method === 'PUT'){
      if (!(user.role === 'ADMIN' || String(list.manager) === String(user._id))) return res.status(403).json({ message:'Forbidden' })
      const { title, description, managerEmail, memberEmails } = req.body
      if (title) list.title = title
      if (description) list.description = description
      if (managerEmail && user.role === 'ADMIN'){
        const m = await User.findOne({ email: managerEmail })
        if (m) list.manager = m._id
      }
      if (Array.isArray(memberEmails)){
        const members = []
        for (const e of memberEmails){
          const u = await User.findOne({ email: e })
          if (u) members.push(u._id)
        }
        list.members = members
      }
      await list.save()
      return res.status(200).json({ list })
    }

    // DELETE: only admin or manager
    if (req.method === 'DELETE'){
      if (!(user.role === 'ADMIN' || String(list.manager) === String(user._id))) return res.status(403).json({ message:'Forbidden' })
      await list.remove()
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow','GET,PUT,DELETE')
    res.status(405).end()
  }catch(e){
    return res.status(401).json({ message:'Unauthorized' })
  }
}
