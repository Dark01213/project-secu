const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');

const CERT = './localhost.pem';
const KEY = './localhost-key.pem';
const LISTEN_PORT = 3443;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 3000;

if (!fs.existsSync(CERT) || !fs.existsSync(KEY)) {
  console.error('Cert or key not found.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(KEY),
  cert: fs.readFileSync(CERT),
};

const server = https.createServer(options, (req, res) => {
  const targetPath = url.format({ pathname: req.url });
  const proxyOptions = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: targetPath,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(proxyOptions, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(LISTEN_PORT, () => {
  console.log(`HTTPS proxy listening on https://localhost:${LISTEN_PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
