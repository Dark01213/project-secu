const fetch = global.fetch || require('node-fetch')

async function main(){
  const email = process.env.MANAGER_EMAIL
  const password = process.env.MANAGER_PASSWORD
  if (!email || !password){
    console.error('Missing MANAGER_EMAIL or MANAGER_PASSWORD environment variables.\nSet them or create a `.env` file from `.env.example`.')
    process.exit(2)
  }

  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  console.log('status', res.status)
  console.log('headers', Object.fromEntries(res.headers.entries()))
  const text = await res.text()
  console.log('body:', text)
}

main().catch(e=>{ console.error(e) })
