import '../styles/globals.css'
import Footer from '../components/Footer'
import { useEffect } from 'react'
import CookieBanner from '../components/CookieBanner'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    let timeoutId
    const LOGOUT_MS = 30 * 60 * 1000 // 30 minutes

    function resetTimer() {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
          .then(() => { window.location.href = '/login' })
      }, LOGOUT_MS)
    }

    ['click', 'mousemove', 'keydown', 'scroll'].forEach(ev =>
      window.addEventListener(ev, resetTimer)
    )
    resetTimer()
    return () => {
      ['click', 'mousemove', 'keydown', 'scroll'].forEach(ev =>
        window.removeEventListener(ev, resetTimer)
      )
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      <CookieBanner />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

export default MyApp
