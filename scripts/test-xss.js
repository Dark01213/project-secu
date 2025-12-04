#!/usr/bin/env node
// Controlled stored XSS test: logs in as SEED_USER and creates a todolist with a payload
const fetch = global.fetch || require('node-fetch')

const BASE = process.env.BASE || 'http://localhost:3001'

function joinCookies(store) {
  return Object.entries(store).map(([k,v])=>`${k}=${v}`).join('; ')
}

async function doRequest(method, path, {cookies={}, headers={}, body} = {}){
  const url = BASE + path
  const opts = { method, headers: Object.assign({'Accept':'application/json'}, headers)}
  if (body) { opts.body = JSON.stringify(body); opts.headers['Content-Type']='application/json' }
  if (Object.keys(cookies).length) opts.headers['Cookie'] = joinCookies(cookies)
  const res = await fetch(url, opts)
  const text = await res.text()
  return { status: res.status, headers: res.headers, body: text }
}

function parseSetCookie(headers){
  const out = {}
  if (!headers) return out
  const raw = (typeof headers.raw === 'function') ? headers.raw() : null
  const sc = raw && raw['set-cookie'] ? raw['set-cookie'] : (headers.get ? headers.get('set-cookie') : null)
  if (!sc) return out
  const arr = Array.isArray(sc) ? sc : String(sc).split(/,(?=[^ ]+?=)/)
  for (const cookie of arr){
    const kv = cookie.split(';')[0].trim().split('=')
    out[kv[0]] = kv.slice(1).join('=')
  }
  return out
}

async function login(email,password){
  const r = await doRequest('POST','/api/auth/login',{ body: { email,password } })
  const cookies = parseSetCookie(r.headers)
  let csrf = null
  try { const j = JSON.parse(r.body); csrf = j.csrfToken } catch(e){}
  return { status: r.status, body: r.body, cookies, csrf }
}

async function run(){
  if (!process.env.SEED_USER_EMAIL || !process.env.SEED_USER_PASSWORD) {
    console.error('Missing SEED_USER_EMAIL / SEED_USER_PASSWORD in env')
    process.exit(2)
  }
  const payload = `"><script>console.log('xss-test')</script>`
  const user = await login(process.env.SEED_USER_EMAIL, process.env.SEED_USER_PASSWORD)
  console.log('login status', user.status)
  if (user.status !== 200) { console.error('Login failed, abort'); process.exit(3) }

  // create a todolist (requires x-csrf-token header)
  const headers = {}
  if (user.csrf) headers['x-csrf-token'] = user.csrf
  const create = await doRequest('POST','/api/todolists',{ cookies: user.cookies, headers, body: { title: payload } })
  console.log('create status', create.status)
  console.log('create body', create.body)

  // fetch lists and inspect for raw payload
  const lists = await doRequest('GET','/api/todolists',{ cookies: user.cookies })
  console.log('fetch lists status', lists.status)
  console.log('fetch body (snippet):', lists.body ? lists.body.slice(0,2000) : '')
}

run().catch(err=>{ console.error(err); process.exit(2) })
