const fetch = global.fetch || require('node-fetch')

async function main(){
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@example.com', password: 'StrongPassw0rd!' })
  })
  console.log('status', res.status)
  console.log('headers', Object.fromEntries(res.headers.entries()))
  const text = await res.text()
  console.log('body:', text)
}

main().catch(e=>{ console.error(e) })
