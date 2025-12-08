#!/usr/bin/env node
// Usage: set env BASE, MANAGER_EMAIL, MANAGER_PASSWORD, SEED_USER_EMAIL, SEED_USER_PASSWORD
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
  try { const j = JSON.parse(r.body); csrf = j.csrfToken } catch(e){ console.warn('login parse JSON failed') }
  return { status: r.status, body: r.body, cookies, csrf }
}

async function run() {
  const out = []
  out.push('BASE: '+BASE)

  out.push('\n== Anonymous requests ==')
  const anonPaths = ['/api/admin/dashboard','/api/admin/audit']
  for (const p of anonPaths){
    const r = await doRequest('GET',p)
    out.push(`${p} -> ${r.status}\n${r.body}`)
  }

  // login as normal user
  if (!process.env.SEED_USER_EMAIL || !process.env.SEED_USER_PASSWORD) {
    out.push('\nMissing SEED_USER_EMAIL / SEED_USER_PASSWORD in env - skipping normal user tests')
  } else {
    out.push('\n== Normal user requests ==')
    const user = await login(process.env.SEED_USER_EMAIL, process.env.SEED_USER_PASSWORD)
    out.push('login status: '+user.status)
    for (const p of anonPaths){
      const r = await doRequest('GET',p,{ cookies: user.cookies })
      out.push(`${p} -> ${r.status}\n${r.body}`)
    }
  }

  // manager
  if (!process.env.MANAGER_EMAIL || !process.env.MANAGER_PASSWORD) {
    out.push('\nMissing MANAGER_EMAIL / MANAGER_PASSWORD in env - skipping manager tests')
  } else {
    out.push('\n== Manager requests ==')
    const mgr = await login(process.env.MANAGER_EMAIL, process.env.MANAGER_PASSWORD)
    out.push('login status: '+mgr.status)
    for (const p of anonPaths){
      const r = await doRequest('GET',p,{ cookies: mgr.cookies })
      out.push(`${p} -> ${r.status}\n${r.body}`)
    }
  }

  console.log(out.join('\n\n'))
}

run().catch(err=>{ console.error(err); process.exit(2) })
