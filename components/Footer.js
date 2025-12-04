import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Footer(){
  const [user, setUser] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetch('/api/users/me', { credentials: 'include' })
      .then(r=>{
        if (r.status === 401) return null
        return r.json()
      })
      .then(data=>{ if (!mounted) return; if (data && data.user) setUser(data.user) })
      .catch(()=>{})
    return ()=>{ mounted = false }
  },[])

  async function handleLogout(){
    try{
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    }catch(e){ /* ignore */ }
    window.location.href = '/login'
  }

  return (
    <footer style={{padding:20, textAlign:'center', borderTop:'1px solid #eee', marginTop:40}}>
      <div style={{display:'flex', gap:12, justifyContent:'center', alignItems:'center'}}>
        <Link href="/legal">Mentions Légales</Link>
        {user && (
          <button onClick={handleLogout} style={{background:'transparent', border:'1px solid #ddd', padding:'6px 10px', borderRadius:6, cursor:'pointer'}}>Se déconnecter</button>
        )}
      </div>
    </footer>
  )
}
