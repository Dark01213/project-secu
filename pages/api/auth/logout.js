const cookie = require('cookie')
const { getUserFromReq } = require('../../../lib/auth')
const AuditLog = require('../../../models/AuditLog')

function getIp(req){
  return (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress || ''
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  try{
    const user = await getUserFromReq(req)
    // record audit even if unauthenticated (note: user may be null)
    try{
      await AuditLog.create({ user: user?._id, action: 'logout', ip: getIp(req), userAgent: req.headers['user-agent'] || '', meta: {} })
    }catch(e){ console.error('Failed to write audit log', e) }
  }catch(e){ /* ignore */ }

  // Clear authentication cookie and consent cookie to fully disconnect and limit tracking
  const isProd = process.env.NODE_ENV === 'production'
  const isSecure = isProd || req.headers['x-forwarded-proto'] === 'https' || (req.socket && req.socket.encrypted)
  const cookies = [
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    }),
    cookie.serialize('consent', '', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    })
  ]

  res.setHeader('Set-Cookie', cookies)
  return res.json({ ok: true })
}
