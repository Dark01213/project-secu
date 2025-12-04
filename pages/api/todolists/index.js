import connect from '../../../lib/mongodb'
import TodoList from '../../../models/TodoList'
import User from '../../../models/User'
import escapeHtml from '../../../utils/escapeHtml'

export default async function handler(req, res) {
  await connect()

  const token = req.cookies && req.cookies.token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  const jwt = require('jsonwebtoken')
  let tokenUser
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    tokenUser = await User.findById(payload.id)
    if (!tokenUser) return res.status(401).json({ message: 'Unauthorized' })
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    if (!tokenUser) return res.status(401).json({ error: 'Unauthorized' })

    const query = {}
    if (tokenUser.role === 'MANAGER' || tokenUser.role === 'ADMIN') {
      query.$or = [{ manager: tokenUser._id }, { members: tokenUser._id }]
    } else {
      query.members = tokenUser._id
    }

    const lists = await TodoList.find(query)
      .populate('manager', 'email name')
      .populate('members', 'email name')
      .sort({ createdAt: -1 })

    return res.status(200).json({ lists })
  }

  if (req.method === 'POST') {
    if (!tokenUser) return res.status(401).json({ error: 'Unauthorized' })
    if (!(tokenUser.role === 'MANAGER' || tokenUser.role === 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const { title = '', description = '', memberEmails = [], managerEmail } = req.body || {}

      const safeTitle = escapeHtml(String(title))
      const safeDesc = escapeHtml(String(description))

      let managerId = tokenUser._id
      if (tokenUser.role === 'ADMIN' && managerEmail) {
        const m = await User.findOne({ email: managerEmail })
        if (!m) return res.status(400).json({ error: 'Manager not found' })
        managerId = m._id
      }

      const members = []
      if (Array.isArray(memberEmails)) {
        for (const e of memberEmails) {
          const u = await User.findOne({ email: e })
          if (u) members.push(u._id)
        }
      }

      const list = new TodoList({
        title: safeTitle,
        description: safeDesc,
        manager: managerId,
        members,
        createdBy: tokenUser._id,
      })

      await list.save()

      const out = await TodoList.findById(list._id)
        .populate('manager', 'email name')
        .populate('members', 'email name')

      return res.status(201).json({ list: out })
    } catch (err) {
      console.error('todolists POST error', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
