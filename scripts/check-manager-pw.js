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

  const user = await User.findOne({ email }).lean()
  if (!user) return console.log('manager not found')
  console.log('found manager id', user._id)
  const match = await bcrypt.compare(password, user.passwordHash)
  console.log('password match:', match)
}

main().catch(e=>{ console.error(e) })
