import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { escapeHtml } from '../../utils/escapeHtml'

export default function Profile(){
  const [me,setMe]=useState(null)
  const [bio,setBio]=useState('')
  const [error,setError]=useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(()=>{
    fetch('/api/users/me', { credentials: 'include' }).then(r=>{
      if (r.status === 401) { router.push('/login'); return null }
      return r.json()
    }).then(data=>{
      if (data && data.user) setMe(data.user)
    }).catch(()=>{})
  },[router])

  if (!me) return <p>Chargement...</p>
  if (me._id !== id) return <p style={{color:'red'}}>403 - Accès refusé</p>

  function saveBio(e){
    e.preventDefault()
    // send raw bio to server (server will escape/store safely)
    fetch('/api/users/me', { method: 'PUT', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({bio}) })
      .then(r=>r.json()).then(d=>{
        if (d.ok) alert('Profil mis à jour')
        else setError(d.message)
      })
  }

  return (
    <main style={{padding:20}}>
      <h1>Profil de {me.name}</h1>
      <p>Email: {me.email}</p>
      <p>Rôle: {me.role}</p>
      <form onSubmit={saveBio}>
        <div>
          <label>Bio (texte brut, les balises sont échappées)</label>
          <br />
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={6} cols={60} />
        </div>
        {error && <p style={{color:'red'}}>{error}</p>}
        <button>Enregistrer</button>
      </form>
    </main>
  )
}
