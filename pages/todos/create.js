import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CreateTodo(){
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [deadline,setDeadline]=useState('')
  const [error,setError]=useState(null)
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/todos', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ title, description, deadline }) })
    const data = await res.json()
    if (!res.ok) setError(data.message || 'Erreur')
    else router.push('/todos')
  }

  return (
    <main style={{padding:20}}>
      <h1>Créer une TODO</h1>
      <form onSubmit={submit}>
        <div><label>Titre <input value={title} onChange={e=>setTitle(e.target.value)} required/></label></div>
        <div><label>Description <textarea value={description} onChange={e=>setDescription(e.target.value)} /></label></div>
        <div><label>Deadline <input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} required/></label></div>
        {error && <p style={{color:'red'}}>{error}</p>}
        <button>Créer</button>
      </form>
    </main>
  )
}
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CreateTodo(){
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const [deadline,setDeadline]=useState('')
  const [error,setError]=useState(null)
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/todos', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ title, description, deadline }) })
    const data = await res.json()
    if (!res.ok) setError(data.message || 'Erreur')
    else router.push('/todos')
  }

  return (
    <main style={{padding:20}}>
      <h1>Créer une TODO</h1>
      <form onSubmit={submit}>
        <div><label>Titre <input value={title} onChange={e=>setTitle(e.target.value)} required/></label></div>
        <div><label>Description <textarea value={description} onChange={e=>setDescription(e.target.value)} /></label></div>
        <div><label>Deadline <input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} required/></label></div>
        {error && <p style={{color:'red'}}>{error}</p>}
        <button>Créer</button>
      </form>
    </main>
  )
}
