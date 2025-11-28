const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not set in environment')
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {})
      .then((mongoose) => {
        return mongoose
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}

module.exports = { connect }
