const { IncomingForm } = require('formidable')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

export const config = {
  api: {
    bodyParser: false
  }
}

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const form = new IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ message: 'Invalid form data' })
    const file = files.file
    if (!file) return res.status(400).json({ message: 'No file uploaded' })
    const ext = path.extname(file.originalFilename || file.name || '') .toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) return res.status(400).json({ message: 'Extension non autorisée' })
    // Move file to uploads/ with UUID name
    const uploadsDir = path.resolve(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    const destName = `upload_${uuidv4()}${ext}`
    const destPath = path.join(uploadsDir, destName)
    try {
      await fs.promises.copyFile(file.filepath, destPath)
      // remove temp
      try { await fs.promises.unlink(file.filepath) } catch(e){}
      return res.status(201).json({ ok: true, filename: destName })
    } catch (e) {
      const { handleError } = require('../../../lib/handleError')
      return handleError(res, e, { meta: { route: '/api/upload' } })
    }
  })
}
