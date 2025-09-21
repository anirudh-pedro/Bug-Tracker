const mongoose = require('mongoose');

async function checkConnection() {
  try {
    const mongoUri = process.env.mongo_uri || 'mongodb://localhost:27017/bug-tracker';
    console.log('🔗 MongoDB URI:', mongoUri);
    console.log('🔧 Environment variables:');
    console.log('  MONGO_URI:', process.env.MONGO_URI);
    console.log('  mongo_uri:', process.env.mongo_uri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const dbName = mongoose.connection.db.databaseName;
    console.log('📋 Connected to database:', dbName);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}
checkConnection();