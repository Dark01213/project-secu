export default function Privacy() {
  return (
    <div style={{padding:24}}>
      <h1>Privacy Policy (RGPD / CNIL)</h1>
      <p>This application is a demo project for a course and implements basic GDPR/CNIL protections.</p>
      <h2>Data Controller</h2>
      <p>Controller: Student project. No personal data is published.</p>
      <h2>Personal Data Collected</h2>
      <ul>
        <li>Account email and name for authentication</li>
        <li>Basic profile (bio)</li>
        <li>Todos and lists created by you</li>
      </ul>
      <h2>Purpose & Legal Basis</h2>
      <p>Data is processed to provide the service and for user authentication. Legal basis: consent and contract (account management).</p>
      <h2>Rights</h2>
      <p>You can request export of your personal data or deletion using the provided endpoints when authenticated:</p>
      <ul>
        <li>Export: <code>/api/legal/export</code> (GET)</li>
        <li>Deletion: <code>/api/legal/delete</code> (POST)</li>
        <li>Consent recording: <code>/api/legal/consent</code> (POST)</li>
      </ul>
      <h2>Retention</h2>
      <p>Data is stored until you request deletion or the account is removed.</p>
      <h2>Contact</h2>
      <p>For questions about privacy contact the project author.</p>
    </div>
  )
}
