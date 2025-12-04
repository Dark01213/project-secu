#!/usr/bin/env node
try { require('dotenv').config() } catch(e) {}
const { connect } = require('../lib/mongodb')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

async function main(){
  const email = process.argv[2] || process.env.USER_EMAIL
  const password = process.argv[3] || process.env.USER_PASSWORD
  if (!email || !password){
    console.error('Usage: node reset-user-password.js <email> <newPassword> (or set USER_EMAIL/USER_PASSWORD env)')
    process.exit(2)
  }
  await connect()
  try {
    const hash = await bcrypt.hash(password, 10)
    const res = await User.updateOne({ email }, { $set: { passwordHash: hash, failedLoginAttempts:0, lockUntil:null } })
    console.log('Updated:', email, JSON.stringify(res))
    process.exit(0)
  } catch (err){
    console.error('Error:', err)
    process.exit(3)
  }
}

main()
