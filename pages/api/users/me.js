const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const jwt = require('jsonwebtoken')
const { escapeHtml } = require('../../../utils/escapeHtml')

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

  if (req.method === 'GET'){
    const user = await User.findById(payload.id).select('-passwordHash').lean().exec()
    if (!user) return res.status(404).json({ message: 'Not found' })
    return res.json({ user })
  }

  if (req.method === 'PUT'){
    const { bio } = req.body || {}
    // sanitize/escape before storing to ensure XSS safe when rendered
    const safeBio = escapeHtml(bio || '')
    await User.findByIdAndUpdate(payload.id, { $set: { bio: safeBio } }).exec()
    return res.json({ ok: true })
  }

  return res.status(405).end()
}
