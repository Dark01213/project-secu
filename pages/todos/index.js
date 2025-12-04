import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import escapeHtml from '../../utils/escapeHtml'

export default function Todos(){
  const [todos, setTodos] = useState([])
  const [emailToAdd, setEmailToAdd] = useState('')
  const [error, setError] = useState(null)

  useEffect(()=>{ fetchTodos() },[])

  async function fetchTodos(){
    try{
      const r = await fetch('/api/todos', { credentials: 'include' })
      if (r.ok){ const data = await r.json(); setTodos(data.todos || []) }
    }catch(e){ /* ignore */ }
  }

  async function addMember(todoId){
    setError(null)
    try{
      const res = await fetch(`/api/todos/${todoId}/assign`, { method: 'PUT', credentials: 'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ memberEmail: emailToAdd }) })
      const d = await res.json()
      if (!res.ok) setError(d.message || 'Erreur')
      else { setEmailToAdd(''); fetchTodos() }
    }catch(e){ setError('Erreur réseau') }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">Secure TODO</div>
        <div>
          <Link href="/todos/create"><button className="button">New Todo</button></Link>
        </div>
      </div>

      <div className="card">
        <h2>Mes TODOs</h2>
        <div className="todo-list">
          {todos.length===0 && <p className="small">Aucun TODO — créez-en un.</p>}
          {todos.map(t=> (
            <div className="todo-item" key={t._id}>
              <div className="todo-left">
                <div>
                  <div className="todo-title">{escapeHtml(t.title)}</div>
                  <div className="todo-meta">{t.status} • créé {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
              <div>
                <span className="small">{t.assignedTo && Array.isArray(t.assignedTo) && t.assignedTo.length ? `${t.assignedTo.length} membre(s)` : 'non assigné'}</span>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}

