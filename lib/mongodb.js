const mongoose = require('mongoose')

let MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    console.error('MONGODB_URI is not set in production environment')
  } else {
    // convenient default for local development
    MONGODB_URI = 'mongodb://127.0.0.1:27017/secure-todo'
    console.info('MONGODB_URI not set — falling back to local MongoDB:', MONGODB_URI)
  }
}

// Validate scheme early to provide a clear error message
if (typeof MONGODB_URI === 'string' && MONGODB_URI.length > 0) {
  const schemeOk = /^mongodb(\+srv)?:\/\//i.test(MONGODB_URI)
  if (!schemeOk) {
    throw new Error('Invalid MONGODB_URI: expected connection string to start with "mongodb://" or "mongodb+srv://"')
  }
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { maxPoolSize: 10 })
      .then((mongooseInstance) => mongooseInstance)
      .catch(async (err) => {
        // If connection fails in development, try an in-memory MongoDB (mongodb-memory-server)
        console.error('Initial MongoDB connection failed:', err.message)
        if (process.env.NODE_ENV === 'production') {
          console.error('Running in production — will not start in-memory MongoDB')
          throw err
        }
        try {
          console.info('Starting in-memory MongoDB (mongodb-memory-server) for development...')
          const { MongoMemoryServer } = require('mongodb-memory-server')
          const mongod = await MongoMemoryServer.create()
          const memUri = mongod.getUri()
          console.info('In-memory MongoDB started at', memUri)
          // update the connection promise to use the in-memory URI
          return mongoose.connect(memUri, { maxPoolSize: 10 })
        } catch (merr) {
          console.error('Failed to start in-memory MongoDB:', merr)
          throw err
        }
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}

// Export both the function as default and a named property for compatibility
module.exports = connect
module.exports.connect = connect
