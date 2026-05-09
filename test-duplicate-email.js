const http = require('http');

const registrationData = {
  name: 'Duplicate User',
  email: 'recalcitrant91.geoffrey@gmail.com', // Same email as before
  password: 'differentpass123'
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
  console.log(`\n✗ Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 409) {
        console.log('\n✅ CORRECT: Got 409 Conflict for duplicate email');
        console.log('✅ Error message is helpful:', parsed.message);
      } else {
        console.log('\n❌ WRONG: Expected 409 but got', res.statusCode);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

console.log('Test 1: Duplicate Email Registration');
console.log('=====================================');
console.log('Email: recalcitrant91.geoffrey@gmail.com (already registered)');
console.log('Expected: 409 Conflict with specific error message\n');

req.write(JSON.stringify(registrationData));
req.end();
