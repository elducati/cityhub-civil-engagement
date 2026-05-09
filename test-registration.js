const http = require('http');

const registrationData = {
  name: 'Geoffrey Omondi',
  email: 'recalcitrant91.geoffrey@gmail.com',
  password: '0007jeff'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  console.log(`\nStatus: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  console.log('\n--- Response Body ---');
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
    console.log('\n--- End Response ---');
    try {
      const parsed = JSON.parse(data);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('(Not valid JSON)');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

console.log('Sending registration request...');
console.log('URL: http://localhost:3000/api/auth/register');
console.log('Body:', JSON.stringify(registrationData, null, 2));

req.write(JSON.stringify(registrationData));
req.end();
