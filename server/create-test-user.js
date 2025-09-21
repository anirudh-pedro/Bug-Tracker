const express = require('express');
const User = require('./models/User');
const { generateToken } = require('./middleware/auth');

// Create a test user and token for debugging
async function createTestUser() {
  try {
    // Delete any existing test user
    await User.deleteOne({ email: 'test@example.com' });
    
    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      googleId: 'test123',
      role: 'developer',
      hasCompletedOnboarding: true,
      username: 'testuser'
    });
    
    console.log('✅ Test user created:', testUser._id);
    
    // Generate token
    const token = generateToken(testUser._id);
    console.log('🎫 Test token generated:', token);
    
    return { user: testUser, token };
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();