import { useState } from 'react'

export default function Register(){
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [password,setPassword]=useState('')
  const [consent,setConsent]=useState(false)
  const [error,setError]=useState(null)
  const [errorDetails,setErrorDetails]=useState([])

  async function submit(e){
    e.preventDefault()
    setError(null)
    if (!consent) return setError('Vous devez accepter les conditions')
    const res = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name,password,consent}),credentials:'include'})
    const data = await res.json()
    if (!res.ok) {
      setError(data.message || 'Erreur')
      setErrorDetails(Array.isArray(data.details) ? data.details : [])
    }
    else window.location.href = '/'
  }

  return (
    <main style={{padding:20}}>
      <h1>Inscription</h1>
      <form onSubmit={submit}>
        <div><label>Email <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label></div>
        <div><label>Nom <input value={name} onChange={e=>setName(e.target.value)} required/></label></div>
        <div><label>Mot de passe <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label></div>
        <div>
          <label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> J'accepte que mes données soient utilisées pour l'authentification du service</label>
        </div>
        {error && <p style={{color:'red'}}>{error}</p>}
        {errorDetails.length > 0 && (
          <ul style={{color:'red', marginTop:6}}>
            {errorDetails.map((d,i)=>(<li key={i}>{d}</li>))}
          </ul>
        )}
        <button type="submit">S'inscrire</button>
      </form>
    </main>
  )
}
