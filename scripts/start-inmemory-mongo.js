const fs = require('fs')
const path = require('path')
const { MongoMemoryServer } = require('mongodb-memory-server')

;(async function() {
  try {
    const mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    const outDir = path.resolve(process.cwd(), 'audits')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'mem-mongo-uri.txt'), uri, 'utf8')
    console.log('In-memory MongoDB started at', uri)
    // keep process alive while dev server uses it
    process.stdin.resume()
  } catch (err) {
    console.error('Failed to start in-memory MongoDB', err)
    process.exit(1)
  }
})()
