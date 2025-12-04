import connect from '../../../lib/mongodb'
import { requireRoleHandler } from '../../../lib/auth'
import User from '../../../models/User'
import AuditLog from '../../../models/AuditLog'

async function handler(req, res, adminUser){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, userId } = req.body || {}
  if (!email && !userId) return res.status(400).json({ error: 'email or userId required' })
  await connect()
  try{
    const q = email ? { email } : { _id: userId }
    const target = await User.findOne(q).exec()
    if (!target) return res.status(404).json({ error: 'User not found' })

    await User.updateOne({ _id: target._id }, { $inc: { tokenVersion: 1 } })
    await AuditLog.create({ user: adminUser._id, action: 'admin_force_logout', ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, userAgent: req.headers['user-agent'] || '', meta: { target: String(target._id) } })
    return res.json({ ok:true })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
}

export default requireRoleHandler(['ADMIN'], handler)
