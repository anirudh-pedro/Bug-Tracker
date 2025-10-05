/**
 * Network IP Detection Helper
 * Run this script to find your computer's IP address for mobile development
 * 
 * Usage: node scripts/find-ip.js
 */

const os = require('os');

console.log('\n🔍 Finding Network IP Addresses...\n');

const interfaces = os.networkInterfaces();
const ipAddresses = [];

// Collect all non-internal IPv4 addresses
for (const interfaceName of Object.keys(interfaces)) {
  const iface = interfaces[interfaceName];
  
  for (const config of iface) {
    // Skip internal and IPv6 addresses
    if (config.family === 'IPv4' && !config.internal) {
      ipAddresses.push({
        name: interfaceName,
        address: config.address,
        mac: config.mac
      });
    }
  }
}

if (ipAddresses.length === 0) {
  console.log('❌ No network interfaces found.');
  console.log('💡 Make sure you are connected to a network (WiFi or Ethernet).\n');
  process.exit(1);
}

console.log('📍 Available Network Interfaces:\n');

ipAddresses.forEach((ip, index) => {
  console.log(`${index + 1}. ${ip.name}`);
  console.log(`   IP Address: ${ip.address}`);
  console.log(`   MAC Address: ${ip.mac}`);
  
  // Suggest which interface to use
  const nameLower = ip.name.toLowerCase();
  if (nameLower.includes('wi-fi') || nameLower.includes('wlan')) {
    console.log('   ✅ WiFi - Use this for mobile hotspot or same WiFi network');
  } else if (nameLower.includes('ethernet') || nameLower.includes('eth')) {
    console.log('   🔌 Ethernet - Use this if on wired network');
  }
  console.log('');
});

console.log('━'.repeat(60));
console.log('\n📝 Next Steps:\n');

const recommendedIP = ipAddresses[0].address;

console.log(`1. Update frontend/src/config/networkConfig.js:`);
console.log(`   BACKEND_URL: 'http://${recommendedIP}:5000'\n`);

console.log(`2. Start your server:`);
console.log(`   cd server`);
console.log(`   npm start\n`);

console.log(`3. Test the connection from your phone's browser:`);
console.log(`   http://${recommendedIP}:5000/api/health\n`);

console.log(`4. If using mobile hotspot:`);
console.log(`   - Enable hotspot on your phone`);
console.log(`   - Connect your computer to the hotspot`);
console.log(`   - Run this script again to get the new IP\n`);

console.log('━'.repeat(60));

// Show sample config
console.log('\n📄 Sample networkConfig.js configuration:\n');
console.log(`BACKEND_URL: isDevelopment`);
console.log(`  ? 'http://${recommendedIP}:5000'  // 👈 Your computer's IP`);
console.log(`  : 'https://your-production-api.com',\n`);

console.log(`FALLBACK_URLS: isDevelopment`);
console.log(`  ? [`);
ipAddresses.forEach(ip => {
  console.log(`      'http://${ip.address}:5000',  // ${ip.name}`);
});
console.log(`      'http://localhost:5000',  // Localhost fallback`);
console.log(`    ]`);
console.log(`  : [],\n`);

console.log('━'.repeat(60));
console.log('\n✅ Configuration help complete!\n');
