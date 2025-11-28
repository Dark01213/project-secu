import { useEffect, useState } from 'react'

export default function Todos(){
  const [todos,setTodos]=useState([])

  useEffect(()=>{
    fetch('/api/todos', { credentials:'include' }).then(r=>r.json()).then(d=>{ if (d.todos) setTodos(d.todos) })
  },[])

  return (
    <main style={{padding:20}}>
      <h1>Mes TODOs</h1>
      <a href="/todos/create">Créer une TODO</a>
      <ul>
        {todos.map(t=> (
          <li key={t._id}><strong>{t.title}</strong> - {t.status} - {t.deadline ? new Date(t.deadline).toLocaleString() : 'Aucune'}</li>
        ))}
      </ul>
    </main>
  )
}
import { useEffect, useState } from 'react'

export default function TodosPage(){
  const [todos,setTodos]=useState([])
  const [emailToAdd,setEmailToAdd]=useState('')
  const [error,setError]=useState(null)

  useEffect(()=>{ fetchTodos() },[])

  async function fetchTodos(){
    const r = await fetch('/api/todos', { credentials: 'include' })
    if (r.ok){ const data = await r.json(); setTodos(data.todos || []) }
  }

  async function addMember(todoId){
    setError(null)
    const res = await fetch(`/api/todos/${todoId}/assign`, { method: 'PUT', credentials: 'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ memberEmail: emailToAdd }) })
    const d = await res.json()
    if (!res.ok) setError(d.message || 'Erreur')
    else { setEmailToAdd(''); fetchTodos() }
  }

  return (
    <main style={{padding:20}}>
      <h1>Mes TODOs</h1>
      {todos.map(t=> (
        <div key={t._id} style={{border:'1px solid #ddd', padding:10, marginBottom:10}}>
          <h3>{t.title}</h3>
          <p>{t.description}</p>
          <p><strong>Deadline:</strong> {new Date(t.deadline).toLocaleString()}</p>
          <p><strong>Assignés:</strong> {t.assignedTo && t.assignedTo.map(a=>a.name).join(', ')}</p>
          <div>
            <input placeholder="email membre" value={emailToAdd} onChange={e=>setEmailToAdd(e.target.value)} />
            <button onClick={()=>addMember(t._id)}>Ajouter membre (Manager seulement)</button>
          </div>
        </div>
      ))}
      {error && <p style={{color:'red'}}>{error}</p>}
    </main>
  )
}
