const connect = require('../lib/mongodb')
const User = require('../models/User')
const TodoList = require('../models/TodoList')

async function run(){
  await connect()
  const lists = await TodoList.find({}).populate('manager','email name').lean()
  console.log('Found', lists.length, 'todolists')
  for(const l of lists){
    console.log('---')
    console.log('id:', l._id.toString())
    console.log('title:', l.title)
    console.log('manager:', l.manager && l.manager.email)
    console.log('members:', (l.members||[]).length)
  }
  process.exit(0)
}

run().catch(err=>{ console.error(err); process.exit(1) })
