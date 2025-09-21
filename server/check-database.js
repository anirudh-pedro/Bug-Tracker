const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bug-tracker');
    console.log('✅ Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections in database:', collections.map(c => c.name));
    
    // Check each collection count
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}
checkDatabase();