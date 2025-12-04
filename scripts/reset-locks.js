#!/usr/bin/env node
try { require('dotenv').config() } catch (e) { /* dotenv optional */ }
const { connect } = require('../lib/mongodb')
const User = require('../models/User')

async function main() {
  await connect()
  const argEmail = process.argv[2]
  try {
    if (argEmail) {
      const res = await User.updateOne({ email: argEmail }, { $set: { failedLoginAttempts: 0, lockUntil: null } })
      console.log('Updated user:', argEmail, JSON.stringify(res))
    } else {
      const res = await User.updateMany({}, { $set: { failedLoginAttempts: 0, lockUntil: null } })
      console.log('Updated all users:', JSON.stringify(res))
    }
    process.exit(0)
  } catch (err) {
    console.error('Error resetting locks', err)
    process.exit(2)
  }
}

main()
