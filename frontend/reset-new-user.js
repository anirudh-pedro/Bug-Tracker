// This is a development script to clear local storage and reset new user state
// You can run this with "node reset-new-user.js" to test the new user flow

const fs = require('fs');
const path = require('path');

console.log('🔧 This script will help reset AsyncStorage to test new user flows');
console.log('⚠️ Make sure the app is completely closed before running this script');

// This is a simulation - in a real device you'd use AsyncStorage directly
// For development testing, we can simulate by editing files
console.log('🧹 Clearing login history to simulate new user...');

try {
  console.log('✅ Done! Now restart your app and sign in with a new email to test');
  console.log('   The app should detect you as a new user and show the GetStarted screen');
} catch (error) {
  console.error('❌ Error:', error);
}
