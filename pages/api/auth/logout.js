const cookie = require('cookie')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  // Clear cookie
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0)
  }))
  return res.json({ ok: true })
}
