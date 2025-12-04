import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home(){
  const [user,setUser]=useState(null)
  useEffect(()=>{
    fetch('/api/users/me', { credentials: 'include' }).then(r=>{
      if (r.status === 401) return setUser(null)
      return r.json()
    }).then(data=>{
      if (data && data.user) setUser(data.user)
    }).catch(()=>{})
  },[])

  return (
    <main style={{padding:20}}>
      <h1>Secure TODO - Accueil</h1>
      {user ? (
        <div>
          <p>Connecté en tant que {user.name} ({user.role})</p>
          <p><Link href={`/profile/${user._id}`}>Mon profil</Link></p>
          <p><Link href="/todos/create"><button className="button">Créer un TODO</button></Link></p>
          {user.role === 'ADMIN' && <p><Link href="/admin/dashboard">Admin dashboard</Link></p>}
        </div>
      ) : (
        <div>
          <p><Link href="/login">Se connecter</Link> | <Link href="/register">S'inscrire</Link></p>
        </div>
      )}
    </main>
  )
}
