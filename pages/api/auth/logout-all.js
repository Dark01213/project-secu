const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const { getUserFromReq } = require('../../../lib/auth')
const cookie = require('cookie')
const AuditLog = require('../../../models/AuditLog')

function getIp(req){
  return (req.headers['x-forwarded-for'] || '').split(',').shift() || req.socket.remoteAddress || ''
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  await connect()
  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    // increment tokenVersion to invalidate all existing tokens
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } })

    // record audit
    try{
      await AuditLog.create({ user: user._id, action: 'logout_all', ip: getIp(req), userAgent: req.headers['user-agent'] || '', meta: {} })
    }catch(e){
      const { logError } = require('../../../../lib/handleError')
      logError(e, { route: '/api/auth/logout-all', user: user._id })
    }

    // clear cookie for current session
    const isProd = process.env.NODE_ENV === 'production'
    const isSecure = isProd || req.headers['x-forwarded-proto'] === 'https' || (req.socket && req.socket.encrypted)
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0)
    }))

    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
