const fs = require('fs')
const path = require('path')

const logDir = path.resolve(process.cwd(), 'logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
const errFile = path.join(logDir, 'errors.log')

function logError(err, meta) {
  try {
    const line = `[${new Date().toISOString()}] ${meta?.route || '-'} ${meta?.user || '-'} ${String(err && err.stack ? err.stack : err)}\n`;
    fs.appendFileSync(errFile, line, { encoding: 'utf8' })
  } catch (e) {
    // ignore logging errors
  }
}

function handleError(res, err, opts = {}) {
  logError(err, opts.meta || {})
  if (process.env.NODE_ENV === 'production') {
    if (res && typeof res.status === 'function') return res.status(500).json({ message: 'Erreur serveur' })
  }
  if (res && typeof res.status === 'function') return res.status(500).json({ message: 'Erreur serveur', details: String(err && err.message ? err.message : err) })
}

module.exports = { handleError, logError }
