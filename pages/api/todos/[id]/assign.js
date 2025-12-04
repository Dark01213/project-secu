import { getUserFromReq } from '../../../../lib/auth'
import connect from '../../../../lib/mongodb'
import Todo from '../../../../models/Todo'
import User from '../../../../models/User'

export default async function handler(req, res) {
  await connect()
  const {
    query: { id },
    method,
  } = req

  if (method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const todo = await Todo.findById(id)
    if (!todo) return res.status(404).json({ error: 'Todo not found' })

    // only creator can assign
    if (String(todo.createdBy) !== String(user._id)) return res.status(403).json({ error: 'Forbidden' })

    const { assignTo } = req.body
    if (!assignTo) return res.status(400).json({ error: 'assignTo required' })

    const member = await User.findOne({ email: assignTo })
    if (!member) return res.status(404).json({ error: 'Member not found' })

    todo.assignedTo = todo.assignedTo || []
    if (!todo.assignedTo.find((m) => String(m) === String(member._id))) {
      todo.assignedTo.push(member._id)
      await todo.save()
    }

    return res.json({ success: true, todo })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
