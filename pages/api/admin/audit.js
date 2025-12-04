import connect from '../../../lib/mongodb'
import { requireRoleHandler } from '../../../lib/auth'
import AuditLog from '../../../models/AuditLog'

async function handler(req, res, adminUser){
  if (req.method !== 'GET') return res.status(405).end()
  await connect()
  try{
    const page = Math.max(0, parseInt(req.query.page || '0'))
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit || '25')))
    const query = {}
    const total = await AuditLog.countDocuments(query)
    const items = await AuditLog.find(query).sort({ createdAt: -1 }).skip(page*limit).limit(limit).lean()
    return res.json({ total, page, limit, items })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
}

export default requireRoleHandler(['ADMIN'], handler)
