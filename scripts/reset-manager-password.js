const { connect } = require('../lib/mongodb')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

async function main(){
  await connect()
  const email = process.env.MANAGER_EMAIL || 'manager@example.com'
  const password = process.env.MANAGER_PASSWORD
  if (!password){
    console.error('Missing MANAGER_PASSWORD environment variable. Set it or create a `.env` file from `.env.example`.')
    process.exit(2)
  }
  const user = await User.findOne({ email })
  if (!user){
    console.error('Manager not found')
    process.exit(1)
  }
  const salt = await bcrypt.genSalt(12)
  user.passwordHash = await bcrypt.hash(password, salt)
  await user.save()
  console.log('Password reset for', email)
  process.exit(0)
}

main().catch(err=>{ console.error(err); process.exit(1) })
