import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

// Development utility to clear all authentication data
export const clearAllAuthData = async () => {
  try {
    console.log('🧹 Clearing all authentication data...');
    
    // Sign out from Firebase
    await auth().signOut();
    
    // Clear all relevant AsyncStorage keys
    await AsyncStorage.multiRemove([
      'userToken',
      'user_data',
      'user_onboarding'
    ]);
    
    // Clear all user-specific data
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter(key => 
      key.startsWith('user_data_') || 
      key.startsWith('user_onboarding_')
    );
    
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
    }
    
    console.log('✅ All authentication data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

// Development utility to check what's stored
export const debugStoredData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 All stored keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📝 ${key}:`, value);
    }
  } catch (error) {
    console.error('❌ Error debugging stored data:', error);
  }
};
