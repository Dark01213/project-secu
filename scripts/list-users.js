const { connect } = require('../lib/mongodb')
const User = require('../models/User')

async function main(){
  await connect()
  const users = await User.find({}).lean()
  console.log('Users:', users.map(u=>({email:u.email,role:u.role,_id:u._id})))
  process.exit(0)
}

main().catch(err=>{ console.error(err); process.exit(1) })
