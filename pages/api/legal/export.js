import connect from '../../../lib/mongodb'
import { getUserFromReq } from '../../../lib/auth'
import User from '../../../models/User'
import Todo from '../../../models/Todo'
import TodoList from '../../../models/TodoList'

export default async function handler(req,res){
  if (req.method !== 'GET') return res.status(405).end()
  try{
    await connect()
  }catch(e){
    console.error('MongoDB connection error:', e)
    return res.status(503).json({ error: 'Database unavailable' })
  }
  try{
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    const fullUser = await User.findById(user._id).select('-passwordHash').lean()
    const todos = await Todo.find({ $or: [{ createdBy: user._id }, { assignedTo: user._id }] }).lean()
    const lists = await TodoList.find({ $or: [{ manager: user._id }, { members: user._id }] }).lean()
    return res.json({ user: fullUser, todos, lists })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error:'Server error' })
  }
}
