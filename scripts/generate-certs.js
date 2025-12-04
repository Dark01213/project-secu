const fs = require('fs');
const s = require('selfsigned');
(async () => {
	const attrs = [{ name: 'commonName', value: 'localhost' }];
	const p = await s.generate(attrs, { days: 365 });
	if (!p || !p.cert || !p.private) {
		throw new Error('certificate generation failed')
	}
	fs.writeFileSync('localhost.pem', p.cert);
	fs.writeFileSync('localhost-key.pem', p.private);
	console.log('wrote certs: localhost.pem, localhost-key.pem');
})();
