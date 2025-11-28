import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminDashboard(){
  const [ok,setOk]=useState(false)
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/admin/dashboard', { credentials: 'include' }).then(r=>{
      if (r.status === 403) { router.push('/'); return null }
      if (r.status === 401) { router.push('/login'); return null }
      return r.json()
    }).then(data=>{ if (data && data.ok) setOk(true) }).catch(()=>{})
  },[])

  if (!ok) return <p>Vérification en cours...</p>
  return (
    <main style={{padding:20}}>
      <h1>Admin Dashboard</h1>
      <p>Page accessible seulement aux admins.</p>
    </main>
  )
}
