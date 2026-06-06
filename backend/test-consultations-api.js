const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/consultations',
  method: 'GET'
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nBody preview: ${body.substring(0, 200)}`));
});

req.on('error', error => console.error(error));
req.end();
