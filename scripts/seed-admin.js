const { connect } = require('../lib/mongodb')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

function validatePassword(pwd){
  if (typeof pwd !== 'string') return false
  if (pwd.length < 12) return false
  let categories = 0
  if (/[A-Z]/.test(pwd)) categories++
  if (/[a-z]/.test(pwd)) categories++
  if (/[0-9]/.test(pwd)) categories++
  if (/[^A-Za-z0-9]/.test(pwd)) categories++
  return categories >= 3
}

async function run(){
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Administrator'

  if (!email || !password) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables')
    process.exit(1)
  }

  if (!validatePassword(password)){
    console.error('ADMIN_PASSWORD does not satisfy the password policy (>=12 chars, 3 categories)')
    process.exit(1)
  }

  await connect()

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const update = {
    email: email.toLowerCase(),
    name,
    passwordHash,
    role: 'ADMIN'
  }

  const opts = { upsert: true, new: true, setDefaultsOnInsert: true }
  const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, update, opts).exec()

  console.log('Admin user created/updated:')
  console.log({ id: user._id.toString(), email: user.email, role: user.role })
  process.exit(0)
}

run().catch(err=>{ console.error(err); process.exit(1) })
