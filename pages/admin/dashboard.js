import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { escapeHtml } from '../../utils/escapeHtml'

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
      <section style={{marginTop:20}}>
        <h2>Actions</h2>
        <ForceLogoutForm />
      </section>
      <section style={{marginTop:20}}>
        <h2>Audit logs (recent)</h2>
        <AuditList />
      </section>
    </main>
  )
}

function ForceLogoutForm(){
  const [email,setEmail]=useState('')
  const [status,setStatus]=useState(null)
  async function submit(e){
    e.preventDefault()
    setStatus('loading')
    try{
      const res = await fetch('/api/admin/logout-user',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      if (!res.ok) { setStatus('error'); return }
      setStatus('ok')
    }catch(e){ setStatus('error') }
  }
  return (
    <form onSubmit={submit} style={{marginTop:10}}>
      <input placeholder="user email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button style={{marginLeft:8}}>Force logout</button>
      {status && <span style={{marginLeft:8}}>{status}</span>}
    </form>
  )
}

function AuditList(){
  const [items,setItems]=useState([])
  useEffect(()=>{
    fetch('/api/admin/audit?limit=10',{credentials:'include'}).then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>{})
  },[])
  return (
    <div style={{marginTop:10}}>
      {items.length===0 && <p>No logs</p>}
      {items.map(i=> (
        <div key={i._id} style={{padding:8,borderBottom:'1px solid #eee'}}>
          <div><strong>{escapeHtml(i.action)}</strong> — {new Date(i.createdAt).toLocaleString()}</div>
          <div>user:{i.user||'n/a'} ip:{i.ip||'n/a'} ua:{escapeHtml((i.userAgent||'').slice(0,80))}</div>
        </div>
      ))}
    </div>
  )
}
