const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main(){
  const url = process.env.MONGO_URI || 'mongodb://mongo:27017';
  const client = new MongoClient(url);
  try{
    await client.connect();
    const db = client.db('project-secu');
    const users = db.collection('users');

    const exists = await users.findOne({ email: 'admin@example.test' });
    if(exists){
      console.log('Seed skipped: admin exists');
      return;
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync('P@ssw0rdExample12', salt);

    await users.insertOne({
      email: 'admin@example.test',
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date()
    });

    console.log('Seeded admin@example.test');
  }finally{
    await client.close();
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });
