const http = require('http');

// Test local connectivity
const testLocalhost = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Localhost connection successful');
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
    console.log('❌ Localhost connection failed:', err.message);
  });

  req.end();
};

// Test network IP connectivity
const testNetworkIP = () => {
  const options = {
    hostname: '192.168.212.115',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Network IP connection successful');
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
    console.log('❌ Network IP connection failed:', err.message);
  });

  req.end();
};

console.log('🔍 Testing server connectivity...');
setTimeout(() => {
  testLocalhost();
  setTimeout(() => {
    testNetworkIP();
  }, 1000);
}, 2000);
