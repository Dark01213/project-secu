import { useState } from 'react'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)

  async function submit(e){
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),credentials:'include'})
    const data = await res.json()
    if (!res.ok) setError(data.message || 'Erreur')
    else window.location.href = '/'
  }

  return (
    <main style={{padding:20}}>
      <h1>Connexion</h1>
      <form onSubmit={submit}>
        <div><label>Email <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label></div>
        <div><label>Mot de passe <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label></div>
        {error && <p style={{color:'red'}}>{error}</p>}
        <button type="submit">Se connecter</button>
      </form>
    </main>
  )
}
