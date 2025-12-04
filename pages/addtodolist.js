import { useState } from 'react'
import { useRouter } from 'next/router'
import { requireManagerOrAdminSSR } from '../lib/auth'

export default function AddTodoList({ user, authError }){
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [managerEmail,setManagerEmail] = useState('')
  const [memberEmails,setMemberEmails] = useState('')
  const [error,setError] = useState(null)
  const router = useRouter()

  if (authError){
    return (
      <main style={{padding:20}}>
        <h1>Erreur d'authentification</h1>
        <p style={{color:'red'}}>{authError}</p>
      </main>
    )
  }

  async function submit(e){
    e.preventDefault()
    setError(null)
    const members = memberEmails.split(',').map(s=>s.trim()).filter(Boolean)
    const payload = { title, description, memberEmails: members }
    if (user && user.role === 'ADMIN' && managerEmail) payload.managerEmail = managerEmail
    try{
      const res = await fetch('/api/todolists', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) setError(data.message || 'Erreur')
      else router.push('/todos')
    }catch(err){ setError('Erreur réseau') }
  }

  return (
    <main style={{padding:20}}>
      <h1>Créer une liste de TODO</h1>
      <form onSubmit={submit}>
        <div><label>Titre <input value={title} onChange={e=>setTitle(e.target.value)} required/></label></div>
        <div><label>Description <textarea value={description} onChange={e=>setDescription(e.target.value)} /></label></div>
        {user && user.role === 'ADMIN' && (
          <div><label>Manager (email) <input value={managerEmail} onChange={e=>setManagerEmail(e.target.value)} /></label></div>
        )}
        <div><label>Membres (emails, séparés par virgule) <input value={memberEmails} onChange={e=>setMemberEmails(e.target.value)} /></label></div>
        {error && <p style={{color:'red'}}>{error}</p>}
        <button>Créer</button>
      </form>
    </main>
  )
}

export async function getServerSideProps(context){
  // This will either return { props: { user } } for allowed users,
  // redirect to /login, or return { props: { authError: '...' } } with HTTP 400
  return await requireManagerOrAdminSSR(context)
}
