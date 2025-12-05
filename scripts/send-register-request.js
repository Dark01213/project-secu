const fs = require('fs');
(async ()=>{
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'audit@example.com', name: 'Audit', password: 'aa', consent: true }),
    });
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      fs.writeFileSync('audits/register-response.json', JSON.stringify({ status: res.status, body: j }, null, 2));
      console.log('Saved JSON response to audits/register-response.json');
    } catch (e) {
      fs.writeFileSync('audits/register-response.json', JSON.stringify({ status: res.status, bodyText: text }, null, 2));
      console.log('Saved non-JSON response to audits/register-response.json');
    }
  } catch (err) {
    console.error('Request failed:', err.message)
    fs.writeFileSync('audits/register-response.json', JSON.stringify({ error: err.message }, null, 2));
  }
})();
