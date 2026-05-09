const http = require('http');

const registrationData = {
  name: 'Test User',
  email: 'invalid-email-format', // Invalid email
  password: 'password123'
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
  console.log(`✗ Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 400) {
        console.log('\n✅ CORRECT: Got 400 Bad Request for invalid email');
        if (parsed.details) {
          console.log('✅ Validation details provided:', parsed.details.length, 'error(s)');
          parsed.details.forEach(d => console.log(`  - ${d.path}: ${d.message}`));
        }
      } else {
        console.log('\n❌ WRONG: Expected 400 but got', res.statusCode);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

console.log('Test 2: Invalid Email Format');
console.log('=============================');
console.log('Email: invalid-email-format');
console.log('Expected: 400 Bad Request with validation details\n');

req.write(JSON.stringify(registrationData));
req.end();
