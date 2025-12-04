const fetch = global.fetch || require('node-fetch')

const BASE = process.env.BASE || 'http://localhost:3000'

function getCookieHeader(setCookieHeader){
  if (!setCookieHeader) return ''
  if (Array.isArray(setCookieHeader)) setCookieHeader = setCookieHeader.join('; ')
  // extract cookie name=value pairs
  return setCookieHeader.split(/, /).map(s => s.split(';')[0]).join('; ')
}

async function post(path, body, cookie){
  const headers = { 'Content-Type': 'application/json' }
  if (cookie) headers['Cookie'] = cookie
  const r = await fetch(BASE + path, { method: 'POST', headers, body: JSON.stringify(body) })
  const setCookie = r.headers.get('set-cookie') || r.headers.get('Set-Cookie')
  const text = await r.text()
  let json = null
  try{ json = JSON.parse(text) }catch(e){ json = text }
  return { status: r.status, ok: r.ok, body: json, setCookie }
}

async function get(path, cookie){
  const headers = {}
  if (cookie) headers['Cookie'] = cookie
  const r = await fetch(BASE + path, { method: 'GET', headers })
  const text = await r.text()
  let json = null
  try{ json = JSON.parse(text) }catch(e){ json = text }
  return { status: r.status, ok: r.ok, body: json }
}

async function run(){
  console.log('Server base:', BASE)

  // Manager login
  console.log('Logging in manager...')
  let resp = await post('/api/auth/login', { email: 'manager@example.com', password: 'StrongPassw0rd!' })
  console.log('Login status', resp.status)
  if (!resp.setCookie) { console.warn('No set-cookie returned for manager login') }
  let cookie = getCookieHeader(resp.setCookie)
  console.log('Cookie header:', cookie)

  // Create todolist
  console.log('Creating todolist...')
  resp = await post('/api/todolists', { title: 'Equipe Beta', description: 'Créée par smoke-flow', memberEmails: ['seeduser@example.com'] }, cookie)
  console.log('Create list status', resp.status)
  console.log('Body:', resp.body)

  // Logout manager
  console.log('Logging out manager...')
  resp = await post('/api/auth/logout', {}, cookie)
  console.log('Logout status', resp.status)

  // Login as seed user
  console.log('Logging in seed user...')
  resp = await post('/api/auth/login', { email: 'seeduser@example.com', password: 'SeedPass123!' })
  console.log('Login status', resp.status)
  let userCookie = getCookieHeader(resp.setCookie)
  console.log('User cookie:', userCookie)

  // Fetch lists as user
  console.log('Fetching lists as user...')
  resp = await get('/api/todolists', userCookie)
  console.log('Fetch status', resp.status)
  console.log('Lists body:', JSON.stringify(resp.body, null, 2))

  // Logout user
  console.log('Logging out user...')
  resp = await post('/api/auth/logout', {}, userCookie)
  console.log('User logout status', resp.status)
}

run().catch(err=>{ console.error(err); process.exit(1) })
