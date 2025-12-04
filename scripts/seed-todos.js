const connect = require('../lib/mongodb')
const User = require('../models/User')
const Todo = require('../models/Todo')
const bcrypt = require('bcryptjs')

async function run(){
  try{
    await connect()
    console.log('Connected to MongoDB')

    const email = process.env.SEED_EMAIL || 'seeduser@example.com'
    const password = process.env.SEED_PASSWORD
    if (!password){
      console.error('Missing SEED_PASSWORD environment variable. Set it or create a `.env` file from `.env.example`.')
      process.exit(2)
    }

    let user = await User.findOne({ email })
    if (!user){
      const passwordHash = await bcrypt.hash(password, 10)
      user = await User.create({ email, name: 'Seed User', passwordHash, consentGiven: true, consentDate: new Date() })
      console.log('Created user:', email)
    } else {
      console.log('User already exists:', email)
    }

    const todo = await Todo.create({
      title: 'Seeded TODO',
      description: 'This todo was created by scripts/seed-todos.js',
      createdBy: user._id
    })
    console.log('Created todo id:', todo._id.toString())
    process.exit(0)
  }catch(err){
    console.error('Seeding failed:', err)
    process.exit(2)
  }
}

run()
