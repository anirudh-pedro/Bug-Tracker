const mongoose = require('mongoose');
const Project = require('./models/Project');

async function checkProjects() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bug-tracker');
    const projects = await Project.find({}).populate('owner', 'email name');
    console.log('📋 Total projects in database:', projects.length);
    projects.forEach((proj, idx) => {
      console.log(`Project ${idx + 1}:`);
      console.log(`  Name: ${proj.name}`);
      console.log(`  Owner ID: ${proj.owner._id}`);
      console.log(`  Owner Email: ${proj.owner.email}`);
      console.log(`  Created: ${proj.createdAt}`);
      console.log('---');
    });
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}
checkProjects();