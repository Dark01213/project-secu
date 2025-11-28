const { connect } = require('../../../lib/mongodb')
const jwt = require('jsonwebtoken')
const User = require('../../../models/User')

function getTokenFromReq(req){
  const cookieHeader = req.headers.cookie || ''
  const parts = cookieHeader.split(';').map(s=>s.trim())
  const tokenPart = parts.find(p=>p.startsWith('token='))
  if (!tokenPart) return null
  return tokenPart.split('=')[1]
}

module.exports = async (req, res) => {
  await connect()
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') } catch (e) { return res.status(401).json({ message: 'Unauthorized' }) }

  const user = await User.findById(payload.id).exec()
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })

  return res.json({ ok: true })
}
