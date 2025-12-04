const { connect } = require('../../../lib/mongodb')
const User = require('../../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const validator = require('validator')
const crypto = require('crypto')

// Simple in-memory rate limiter (per-process). Suitable for dev/testing.
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

module.exports = async (req, res) => {
  await connect()
  if (req.method !== 'POST') return res.status(405).end()
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const rl = checkRateLimit(`login:${ip}`)
  if (!rl.ok) return res.status(429).setHeader('Retry-After', String(rl.retryAfter)).json({ message: 'Trop de requêtes, réessayer plus tard' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Données manquantes' })
  if (!validator.isEmail(String(email))) return res.status(400).json({ message: 'Email invalide' })

  try {
    const user = await User.findOne({ email }).exec()
    // generic error message to avoid user enumeration
    if (!user) return res.status(401).json({ message: 'Authentification échouée' })

    // Check for account lockout
    if (user.lockUntil && user.lockUntil instanceof Date && user.lockUntil.getTime() > Date.now()) {
      return res.status(423).json({ message: 'Compte temporairement verrouillé. Réessayer plus tard.' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      try {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1
        // lock after 5 failed attempts for 15 minutes
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
          user.failedLoginAttempts = 0
        }
        await user.save()
      } catch (e) {
        console.error('Failed to update failedLoginAttempts', e)
      }
      return res.status(401).json({ message: 'Authentification échouée' })
    }

    // Successful login: reset failed attempts and lock
    try {
      user.failedLoginAttempts = 0
      user.lockUntil = null
      await user.save()
    } catch (e) {
      console.error('Failed to reset login counters', e)
    }

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
      console.error('JWT_SECRET not set in production')
      return res.status(500).json({ message: 'Configuration serveur manquante' })
    }

    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion }, JWT_SECRET || 'devsecret', { expiresIn: '15m' })
    const isProd = process.env.NODE_ENV === 'production'
    // generate CSRF token and set a non-HttpOnly cookie for client-side usage
    const csrfToken = crypto.randomBytes(24).toString('hex')
    const cookieToken = cookie.serialize('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60
    })
    const csrfCookie = cookie.serialize('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60
    })
    res.setHeader('Set-Cookie', [cookieToken, csrfCookie])

    return res.json({ ok: true, csrfToken })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
