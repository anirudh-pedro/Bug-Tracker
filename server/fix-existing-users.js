const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB using the same URI as server
mongoose.connect(process.env.mongo_uri);

async function updateExistingUsers() {
  try {
    console.log('🔍 Looking for users with username but hasCompletedOnboarding = false...');
    
    // Find users who have username but hasCompletedOnboarding is false
    const usersToUpdate = await User.find({
      username: { $exists: true, $ne: null, $ne: '' },
      hasCompletedOnboarding: { $ne: true }
    });
    
    console.log(`📊 Found ${usersToUpdate.length} users to update:`);
    
    for (const user of usersToUpdate) {
      console.log(`- ${user.email} (username: ${user.username})`);
    }
    
    if (usersToUpdate.length > 0) {
      // Update all users with username to have hasCompletedOnboarding = true
      const result = await User.updateMany(
        {
          username: { $exists: true, $ne: null, $ne: '' },
          hasCompletedOnboarding: { $ne: true }
        },
        {
          hasCompletedOnboarding: true
        }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users to hasCompletedOnboarding = true`);
    } else {
      console.log('ℹ️ No users need updating');
    }
    
    // Show updated users
    const updatedUsers = await User.find({
      username: { $exists: true, $ne: null, $ne: '' }
    }).select('email username hasCompletedOnboarding');
    
    console.log('\n📋 Current users with usernames:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.email}: username="${user.username}", hasCompletedOnboarding=${user.hasCompletedOnboarding}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

updateExistingUsers();
