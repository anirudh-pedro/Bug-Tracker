const http = require('http');

// Test Android emulator connectivity (10.0.2.2 maps to host machine's localhost)
const testAndroidEmulator = () => {
  const options = {
    hostname: '10.0.2.2',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Android emulator connection successful (10.0.2.2:5000)');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ Android emulator connection failed:', err.message);
    console.log('💡 This is expected on host machine - will work from Android emulator');
  });

  req.end();
};

console.log('🔍 Testing Android emulator connectivity...');
testAndroidEmulator();
