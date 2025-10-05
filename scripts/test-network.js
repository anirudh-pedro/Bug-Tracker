/**
 * Network Configuration Tester
 * Tests connectivity to your configured backend URLs
 * 
 * Usage: node scripts/test-network.js
 */

const http = require('http');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Test configuration - update these to match your networkConfig.js
const URLS_TO_TEST = [
  'http://10.113.191.115:5000',  // Current WiFi IP
  'http://172.16.8.229:5000',    // Ethernet IP
  'http://10.178.105.115:5000',  // Alternative WiFi
  'http://192.168.43.1:5000',    // Mobile hotspot
  'http://localhost:5000'        // Localhost
];

const ENDPOINTS_TO_TEST = [
  '/api/health',
  '/api/test/health',
  '/api/users/debug-public'
];

console.log('\n🧪 Network Configuration Tester\n');
console.log('━'.repeat(60));

async function testUrl(baseUrl, endpoint, timeout = 3000) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, baseUrl);
    const startTime = Date.now();
    
    const req = http.get(url, { timeout }, (res) => {
      const latency = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          latency,
          data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        latency: Date.now() - startTime
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        latency: timeout
      });
    });
  });
}

async function testConfiguration() {
  const results = [];
  
  for (const baseUrl of URLS_TO_TEST) {
    console.log(`\n${colors.cyan}Testing: ${baseUrl}${colors.reset}`);
    
    let bestEndpoint = null;
    let bestLatency = Infinity;
    
    for (const endpoint of ENDPOINTS_TO_TEST) {
      process.stdout.write(`  ${colors.gray}${endpoint}...${colors.reset} `);
      
      const result = await testUrl(baseUrl, endpoint);
      
      if (result.success) {
        const quality = result.latency < 1000 ? 'good' : result.latency < 3000 ? 'fair' : 'poor';
        const color = quality === 'good' ? colors.green : quality === 'fair' ? colors.yellow : colors.red;
        
        console.log(`${colors.green}✓${colors.reset} ${result.statusCode} ${color}(${result.latency}ms - ${quality})${colors.reset}`);
        
        if (result.latency < bestLatency) {
          bestLatency = result.latency;
          bestEndpoint = endpoint;
        }
      } else {
        console.log(`${colors.red}✗ ${result.error}${colors.reset}`);
      }
    }
    
    if (bestEndpoint) {
      results.push({
        url: baseUrl,
        endpoint: bestEndpoint,
        latency: bestLatency,
        available: true
      });
    } else {
      results.push({
        url: baseUrl,
        available: false
      });
    }
  }
  
  return results;
}

async function main() {
  try {
    const results = await testConfiguration();
    
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 Test Results Summary\n');
    
    const available = results.filter(r => r.available);
    const unavailable = results.filter(r => !r.available);
    
    if (available.length > 0) {
      console.log(`${colors.green}✅ Available Servers (${available.length}):${colors.reset}\n`);
      
      available.sort((a, b) => a.latency - b.latency);
      
      available.forEach((result, index) => {
        const quality = result.latency < 1000 ? 'good' : result.latency < 3000 ? 'fair' : 'poor';
        const color = quality === 'good' ? colors.green : quality === 'fair' ? colors.yellow : colors.red;
        const star = index === 0 ? ' ⭐ (recommended)' : '';
        
        console.log(`  ${index + 1}. ${result.url}`);
        console.log(`     Endpoint: ${result.endpoint}`);
        console.log(`     Latency: ${color}${result.latency}ms (${quality})${colors.reset}${star}`);
        console.log('');
      });
    }
    
    if (unavailable.length > 0) {
      console.log(`${colors.red}❌ Unavailable Servers (${unavailable.length}):${colors.reset}\n`);
      unavailable.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.url}`);
      });
      console.log('');
    }
    
    console.log('━'.repeat(60));
    
    if (available.length > 0) {
      const recommended = available[0];
      console.log('\n📝 Recommended Configuration:\n');
      console.log(`${colors.cyan}BACKEND_URL:${colors.reset} '${recommended.url}'`);
      console.log(`${colors.cyan}Health Endpoint:${colors.reset} '${recommended.endpoint}'`);
      console.log(`${colors.cyan}Expected Latency:${colors.reset} ~${recommended.latency}ms\n`);
      
      console.log('Update frontend/src/config/networkConfig.js:');
      console.log(`${colors.gray}BACKEND_URL: isDevelopment`);
      console.log(`  ? '${recommended.url}'  ${colors.green}// ← Use this${colors.reset}`);
      console.log(`  : 'https://your-production-api.com',${colors.reset}\n`);
      
      console.log(`${colors.green}✅ Configuration test complete!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}❌ No servers are reachable!${colors.reset}\n`);
      console.log('Troubleshooting steps:');
      console.log('  1. Make sure the server is running (npm start)');
      console.log('  2. Check firewall settings');
      console.log('  3. Verify you are on the correct network');
      console.log('  4. Update URLS_TO_TEST in this script with your IPs\n');
    }
    
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
