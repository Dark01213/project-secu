import connect from '../../../lib/mongodb'
import { getUserFromReq } from '../../../lib/auth'
import User from '../../../models/User'

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end()
  try{
    await connect()
  }catch(e){
    console.error('MongoDB connection error:', e)
    return res.status(503).json({ error: 'Database unavailable' })
  }
  try{
    const { consent } = req.body || {}
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    await User.updateOne({_id: user._id}, { $set: { consentGiven: !!consent, consentDate: consent ? new Date() : null } })
    return res.json({ ok:true })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error:'Server error' })
  }
}
