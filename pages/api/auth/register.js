const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const validator = require('validator')
const crypto = require('crypto')

// Simple in-memory rate limiter (per-process). Matches login limits.
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5
const rateLimitStore = new Map()
function checkRateLimit(key) {
  const now = Date.now()
  const entry = rateLimitStore.get(key) || { count: 0, first: now }
  if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1
    entry.first = now
    rateLimitStore.set(key, entry)
    return { ok: true }
  }
  entry.count++
  rateLimitStore.set(key, entry)
  if (entry.count > RATE_LIMIT_MAX) return { ok: false, retryAfter: Math.ceil((entry.first + RATE_LIMIT_WINDOW_MS - now) / 1000) }
  return { ok: true }
}

async function validatePassword(pwd){
  const result = { ok: true, reasons: [] }
  if (typeof pwd !== 'string') {
    result.ok = false
    result.reasons.push('Mot de passe requis')
    return result
  }
  if (pwd.length < 12) {
    result.ok = false
    result.reasons.push('Au moins 12 caractères')
  }
  let categories = 0
  if (/[A-Z]/.test(pwd)) categories++
  if (/[a-z]/.test(pwd)) categories++
  if (/[0-9]/.test(pwd)) categories++
  if (/[^A-Za-z0-9]/.test(pwd)) categories++
  if (categories < 3) {
    result.ok = false
    result.reasons.push('Au moins 3 des 4 catégories : majuscules, minuscules, chiffres, symboles')
  }
  return result
}

module.exports = async (req, res) => {
  await connect()
  if (req.method !== 'POST') return res.status(405).end()
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const rl = checkRateLimit(`register:${ip}`)
  if (!rl.ok) return res.status(429).setHeader('Retry-After', String(rl.retryAfter)).json({ message: 'Trop de requêtes, réessayer plus tard' })

  const { email, name, password, consent } = req.body || {}
  if (!consent) return res.status(400).json({ message: 'Consentement requis' })
  if (!email || !validator.isEmail(String(email))) return res.status(400).json({ message: 'Email invalide' })
  if (!name || typeof name !== 'string') return res.status(400).json({ message: 'Nom requis' })
  const pwdCheck = await validatePassword(password)
  if (!pwdCheck.ok) {
    // Provide a clear, user-friendly error message and list missing criteria for audit proof
    return res.status(400).json({ message: 'Mot de passe non conforme', details: pwdCheck.reasons })
  }

  try {
    const existing = await User.findOne({ email }).exec()
    if (existing) return res.status(400).json({ message: 'Opération refusée' })

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const safeName = validator.escape(String(name))
    const user = new User({ email, name: safeName, passwordHash })
    await user.save()

    // issue JWT cookie
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
      console.error('JWT_SECRET not set in production')
      return res.status(500).json({ message: 'Configuration serveur manquante' })
    }
    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion }, JWT_SECRET || 'devsecret', { expiresIn: '15m' })
    const isProd = process.env.NODE_ENV === 'production'
    const isSecure = isProd || req.headers['x-forwarded-proto'] === 'https' || (req.socket && req.socket.encrypted)
    const csrfToken = crypto.randomBytes(24).toString('hex')
    const cookieToken = cookie.serialize('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60
    })
    const csrfCookie = cookie.serialize('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60
    })
    res.setHeader('Set-Cookie', [cookieToken, csrfCookie])

    return res.status(201).json({ ok: true, csrfToken })
  } catch (err) {
    const { handleError } = require('../../../../lib/handleError')
    return handleError(res, err, { meta: { route: '/api/auth/register' } })
  }
}
