const crypto = require('crypto')

function generateToken(len = 32){
  return crypto.randomBytes(len).toString('base64')
}

function verifyToken(headerToken, cookieToken){
  if (!headerToken || !cookieToken) return false
  try {
    const a = Buffer.from(headerToken)
    const b = Buffer.from(cookieToken)
    if (a.length !== b.length) {
      // compare different lengths in constant time by hashing
      const ah = crypto.createHash('sha256').update(a).digest()
      const bh = crypto.createHash('sha256').update(b).digest()
      return crypto.timingSafeEqual(ah, bh)
    }
    return crypto.timingSafeEqual(a,b)
  } catch(e){
    return false
  }
}

function setCsrfCookie(res, token, opts = {}){
  const { maxAge = 60 * 60, path = '/', sameSite = 'Strict' } = opts
  const cookie = `csrfToken=${token}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`
  res.setHeader('Set-Cookie', cookie)
}

module.exports = { generateToken, verifyToken, setCsrfCookie }
