const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')

module.exports = async (req, res) => {
  await connect()
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Données manquantes' })

  try {
    const user = await User.findOne({ email }).exec()
    // generic error message to avoid user enumeration
    if (!user) return res.status(401).json({ message: 'Authentification échouée' })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ message: 'Authentification échouée' })

    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30m' })
    const isProd = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 60
    }))

    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
