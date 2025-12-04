const connect = require('../lib/mongodb')
const User = require('../models/User')
const Todo = require('../models/Todo')
const bcrypt = require('bcryptjs')

async function run(){
  try{
    await connect()
    const email = process.env.SEED_EMAIL || 'seeduser@example.com'
    const password = process.env.SEED_PASSWORD || 'SeedPass123!'

    let user = await User.findOne({ email })
    if (!user){
      const hash = await bcrypt.hash(password, 10)
      user = await User.create({ email, name: 'Seed User', passwordHash: hash, consentGiven: true, consentDate: new Date() })
      console.log('Created user:', email, 'password:', password)
    } else {
      console.log('User already exists:', email)
    }

    const todo = await Todo.create({ title: 'Seeded TODO', description: 'Created by seed script', createdBy: user._id })
    console.log('Created todo with id:', todo._id.toString())
    process.exit(0)
  }catch(err){
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

run()
#!/usr/bin/env node
const connect = require('../lib/mongodb')
const User = require('../models/User')
const Todo = require('../models/Todo')
const bcrypt = require('bcryptjs')

async function run(){
  try{
    await connect()
    console.log('Connected to MongoDB')

    const email = 'seed-user@example.com'
    let user = await User.findOne({ email })
    if (!user){
      const passwordHash = await bcrypt.hash('SeedPass123!', 10)
      user = await User.create({ email, name: 'Seed User', passwordHash })
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
