import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const c = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('consent='))
      if (!c) setShow(true)
    } catch (e) {
      setShow(true)
    }
  }, [])

  function giveConsent() {
    const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString()
    document.cookie = `consent=true; Path=/; Expires=${expires}; SameSite=Strict`;
    // notify server if authenticated
    fetch('/api/legal/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: true }) }).catch(()=>{})
    setShow(false)
  }

  if (!show) return null
  return (
    <div style={{position:'fixed',left:0,right:0,bottom:0,background:'#111',color:'#fff',padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:9999}}>
      <div>
        This site uses cookies for essential functionality and analytics. By continuing you consent to their use. See our <a href="/legal/privacy" style={{color:'#9cf'}}>privacy policy</a>.
      </div>
      <div>
        <button onClick={giveConsent} style={{background:'#0a84ff',color:'#fff',border:'none',padding:'8px 12px',borderRadius:4}}>I agree</button>
      </div>
    </div>
  )
}
