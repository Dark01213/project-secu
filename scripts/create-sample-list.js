const connect = require('../lib/mongodb')
const User = require('../models/User')
const TodoList = require('../models/TodoList')

async function run(){
  await connect()
  const managerEmail = process.env.MANAGER_EMAIL || 'manager@example.com'
  const manager = await User.findOne({ email: managerEmail })
  if (!manager) {
    console.error('Manager not found:', managerEmail)
    process.exit(2)
  }
  const list = await TodoList.create({ title: 'Equipe Alpha', description: 'Liste créée par script', manager: manager._id })
  console.log('Created list id:', list._id.toString())
  process.exit(0)
}

run().catch(err=>{ console.error(err); process.exit(1) })
