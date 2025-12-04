const { connect } = require('../lib/mongodb')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

async function main(){
  await connect()
  const user = await User.findOne({ email: 'manager@example.com' }).lean()
  if (!user) return console.log('manager not found')
  console.log('found manager id', user._id)
  const match = await bcrypt.compare('StrongPassw0rd!', user.passwordHash)
  console.log('password match:', match)
}

main().catch(e=>{ console.error(e) })
