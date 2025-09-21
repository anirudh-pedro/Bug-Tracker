const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bug-tracker');
    const users = await User.find({});
    console.log('👥 Total users in database:', users.length);
    users.forEach((user, idx) => {
      console.log(`User ${idx + 1}:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Firebase UID: ${user.firebaseUid}`);
      console.log(`  MongoDB ID: ${user._id}`);
      console.log('---');
    });
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}
checkUsers();