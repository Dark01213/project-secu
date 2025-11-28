import Link from 'next/link'

export default function Footer(){
  return (
    <footer style={{padding:20, textAlign:'center', borderTop:'1px solid #eee', marginTop:40}}>
      <Link href="/legal">Mentions Légales</Link>
    </footer>
  )
}
