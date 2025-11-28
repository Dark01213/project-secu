const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const validator = require('validator')

async function validatePassword(pwd){
  if (typeof pwd !== 'string') return false
  if (pwd.length < 12) return false
  let categories = 0
  if (/[A-Z]/.test(pwd)) categories++
  if (/[a-z]/.test(pwd)) categories++
  if (/[0-9]/.test(pwd)) categories++
  if (/[^A-Za-z0-9]/.test(pwd)) categories++
  return categories >= 3
}

module.exports = async (req, res) => {
  await connect()
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name, password, consent } = req.body || {}
  if (!consent) return res.status(400).json({ message: 'Consentement requis' })
  if (!email || !validator.isEmail(email)) return res.status(400).json({ message: 'Email invalide' })
  if (!name || typeof name !== 'string') return res.status(400).json({ message: 'Nom requis' })
  if (!validatePassword(password)) return res.status(400).json({ message: 'Mot de passe non conforme (>=12 chars et 3 catégories)' })

  try {
    const existing = await User.findOne({ email }).exec()
    if (existing) return res.status(400).json({ message: 'Opération refusée' })

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ email, name, passwordHash })
    await user.save()

    // issue JWT cookie
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30m' })
    const isProd = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 60
    }))

    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
