const http = require('http');

const registrationData = {
  name: 'Test',
  email: 'bademail', // Invalid
  password: '12' // Too short
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
      
      if (res.statusCode === 400 && parsed.details && parsed.details.length > 1) {
        console.log('\n✅ CORRECT: Got 400 with multiple validation errors');
        console.log(`✅ Found ${parsed.details.length} validation error(s):`);
        parsed.details.forEach(d => console.log(`  - ${d.path}: ${d.message}`));
      } else {
        console.log('\n❌ Expected multiple validation errors');
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

console.log('Test 4: Multiple Validation Errors');
console.log('===================================');
console.log('Email: bademail (invalid format)');
console.log('Password: "12" (too short)');
console.log('Expected: 400 Bad Request with 2+ validation errors\n');

req.write(JSON.stringify(registrationData));
req.end();
