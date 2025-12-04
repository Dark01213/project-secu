import connect from '../../../lib/mongodb'
import { getUserFromReq } from '../../../lib/auth'
import User from '../../../models/User'
import Todo from '../../../models/Todo'
import TodoList from '../../../models/TodoList'

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end()
  try{
    await connect()
  }catch(e){
    console.error('MongoDB connection error:', e)
    return res.status(503).json({ error: 'Database unavailable' })
  }
  try{
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // soft-delete: anonymize user data, mark deleted
    const anonEmail = `deleted+${user._id}@example.invalid`
    await User.updateOne({_id:user._id}, { $set: { email: anonEmail, name: 'deleted user', bio: '', passwordHash: '', deleted: true, deletedAt: new Date(), role: 'USER' } })

    // Optionally remove or anonymize todos and lists. We'll mark todos as cancelled and remove personal refs.
    await Todo.updateMany({ createdBy: user._id }, { $set: { createdBy: null, status: 'CANCELLED' } })
    await Todo.updateMany({ assignedTo: user._id }, { $pull: { assignedTo: user._id } })
    await TodoList.updateMany({ manager: user._id }, { $set: { manager: null } })
    await TodoList.updateMany({ members: user._id }, { $pull: { members: user._id } })

    return res.json({ ok:true })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error:'Server error' })
  }
}
