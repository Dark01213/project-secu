const { connect } = require('../lib/mongodb')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

async function main(){
  await connect()
  const email = process.env.MANAGER_EMAIL || 'manager@example.com'
  const name = process.env.MANAGER_NAME || 'Manager'
  const password = process.env.MANAGER_PASSWORD
  if (!password){
    console.error('Missing MANAGER_PASSWORD environment variable. Set it or create a `.env` file from `.env.example`.')
    process.exit(2)
  }

  const existing = await User.findOne({ email })
  if (existing){
    console.log('User already exists:', existing.email, 'role=', existing.role)
    if (existing.role !== 'MANAGER'){
      existing.role = 'MANAGER'
      await existing.save()
      console.log('Updated role to MANAGER')
    }
    process.exit(0)
  }

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)
  const user = new User({ email, name, passwordHash, role: 'MANAGER', consentGiven: true, consentDate: new Date() })
  await user.save()
  console.log('Manager created:', email)
  console.log('Manager account created. Set a secure password via environment variables or password-reset.')
  process.exit(0)
}

main().catch(err=>{ console.error(err); process.exit(1) })
