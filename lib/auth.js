/*
  Secure auth helpers

  - getUserFromReq(req): returns the authenticated user object (without password) or null
  - requireAuth(req,res): verifies auth and returns user or sends 401
  - requireRole(user, roles): boolean check if user has one of the roles
  - requireRoleHandler(roles, handler): wrapper for API routes that enforces roles
  - withAuth(handler): wrapper that injects `user` into handler after auth
  - canManageOrAdmin(user, managerId): helper to check manager/admin rights

  Security notes: follow the project's Checklist-Audit-Securite and Kit-Mission-Securite
  - don't leak error details to clients
  - use HttpOnly cookies (the app issues JWT in `token` cookie)
  - use `process.env.JWT_SECRET` in production and rotate secrets appropriately
*/

import connect from './mongodb'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export async function getUserFromReq(req){
  // Support both `req.cookies` (Next) and raw header parsing for compatibility
  const cookie = require('cookie')
  let token = null
  if (req.cookies && req.cookies.token) token = req.cookies.token
  else {
    const raw = req.headers && req.headers.cookie
    const cookies = raw ? cookie.parse(raw) : {}
    token = cookies.token
  }
  if (!token) return null
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    // connect lazily to DB (cached in lib/mongodb)
    await connect()
    const user = await User.findById(payload.id).select('-passwordHash tokenVersion').lean()
    if (!user) return null
    // tokenVersion check: allow invalidation of older tokens
    if (typeof payload.tokenVersion !== 'undefined' && Number(payload.tokenVersion) !== Number(user.tokenVersion)) {
      return null
    }
    return user
  }catch(e){
    return null
  }
}

// Server-side cookie parsing for Next.js getServerSideProps
export async function getUserFromServerReq(req){
  // parse cookie header manually (works on server-side)
  const cookie = require('cookie')
  const raw = req.headers && req.headers.cookie
  const cookies = raw ? cookie.parse(raw) : {}
  const token = cookies.token
  if (!token) return { user: null, error: 'no_token' }
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    await connect()
    const user = await User.findById(payload.id).select('-passwordHash tokenVersion').lean()
    if (!user) return { user: null, error: 'not_found' }
    if (typeof payload.tokenVersion !== 'undefined' && Number(payload.tokenVersion) !== Number(user.tokenVersion)) {
      return { user: null, error: 'invalid_token' }
    }
    return { user, error: null }
  }catch(err){
    return { user: null, error: 'invalid_token' }
  }
}

// Helper for getServerSideProps to enforce manager/admin access
export async function requireManagerOrAdminSSR(context){
  const { req, res } = context
  const result = await getUserFromServerReq(req)
  if (!result.user){
    // no token or invalid token: if invalid token -> 400 with message, else redirect to login
    if (result.error === 'invalid_token'){
      if (res) res.statusCode = 400
      return { props: { authError: 'Invalid or expired cookie' } }
    }
    return { redirect: { destination: '/login', permanent: false } }
  }
  const user = result.user
  if (user.role === 'ADMIN' || user.role === 'MANAGER'){
    return { props: { user } }
  }
  // authenticated but not allowed: redirect to login
  return { redirect: { destination: '/login', permanent: false } }
}

export async function requireAuth(req,res){
  const user = await getUserFromReq(req)
  if (!user){
    if (res) res.status(401).json({ message: 'Unauthorized' })
    return null
  }
  return user
}

export function requireRole(user, roles){
  if (!user) return false
  const allowed = Array.isArray(roles) ? roles : [roles]
  return allowed.includes(user.role)
}

export function canManageOrAdmin(user, managerId){
  if (!user) return false
  if (user.role === 'ADMIN') return true
  return String(user._id) === String(managerId)
}

export function withAuth(handler){
  return async function(req,res){
    const user = await requireAuth(req,res)
    if (!user) return
    return handler(req,res,user)
  }
}

export function requireRoleHandler(roles, handler){
  return async function(req,res){
    const user = await requireAuth(req,res)
    if (!user) return
    if (!requireRole(user, roles)) return res.status(403).json({ message: 'Forbidden' })
    return handler(req,res,user)
  }
}

export default {
  getUserFromReq,
  requireAuth,
  requireRole,
  withAuth,
  requireRoleHandler,
  canManageOrAdmin
}

// Provide CommonJS compatibility for API routes that use `require()`
if (typeof module !== 'undefined') {
  module.exports = {
    getUserFromReq,
    getUserFromServerReq,
    requireManagerOrAdminSSR,
    requireAuth,
    requireRole,
    canManageOrAdmin,
    withAuth,
    requireRoleHandler
  }
}
