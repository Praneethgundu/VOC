const http = require('http');

http.get('http://localhost:3000/api/images/print-logo.png', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log('Body length:', buffer.length);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
