import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

/**
 * Comprehensive sign-out function that clears all authentication data
 * and ensures proper navigation back to login screen
 */
export const performSignOut = async () => {
  try {
    console.log('🔄 authUtils: performSignOut() called - starting process...');
    
    // Step 1: Clean up Google and AsyncStorage FIRST (to prevent any conflicts)
    console.log('🔄 authUtils: Starting pre-cleanup...');
    try {
      await Promise.all([
        GoogleSignin.signOut().catch(e => {
          console.log('⚠️ authUtils: Google cleanup error (ignoring):', e.message);
        }),
        AsyncStorage.clear().catch(e => {
          console.log('⚠️ authUtils: Storage cleanup error (ignoring):', e.message);
        })
      ]);
      console.log('✅ authUtils: Pre-cleanup completed');
    } catch (e) {
      console.log('⚠️ authUtils: Pre-cleanup error (continuing):', e.message);
    }
    
    // Step 2: Sign out from Firebase LAST (this triggers navigation)
    console.log('🔄 authUtils: Attempting Firebase signOut...');
    await auth().signOut();
    console.log('✅ authUtils: Firebase sign out complete - navigation should trigger');
    
    // Step 3: Small delay to ensure auth state change is processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ authUtils: Sign out process completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ authUtils: Sign-out error:', error);
    
    // Force sign out if normal sign out fails
    try {
      console.log('🔄 authUtils: Attempting force cleanup after error...');
      await auth().signOut();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('✅ authUtils: Force sign out completed');
      return { success: true };
    } catch (forceError) {
      console.error('❌ authUtils: Force sign-out also failed:', forceError);
      return { 
        success: false, 
        error: forceError.message || error.message || 'Failed to sign out completely' 
      };
    }
  }
};

/**
 * Force sign-out function for when normal sign-out fails
 */
export const performForceSignOut = async () => {
  try {
    console.log('🔄 Starting FAST FORCE sign out process...');
    
    // Immediately sign out from Firebase (triggers navigation)
    await auth().signOut();
    console.log('✅ Firebase force sign out completed');
    
    // Clean up everything else in the background (non-blocking)
    setTimeout(() => {
      GoogleSignin.signOut().catch(e => 
        console.log('⚠️ Force Google cleanup error (ignoring):', e.message)
      );
      AsyncStorage.clear().catch(e => 
        console.log('⚠️ Force storage cleanup error (ignoring):', e.message)
      );
    }, 0);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Force sign-out error:', error);
    return { 
      success: false, 
      error: error.message || 'Force sign out failed' 
    };
  }
};

/**
 * Check if user is properly signed in across all platforms
 */
export const checkSignInStatus = async () => {
  try {
    const firebaseUser = auth().currentUser;
    
    // Try to check Google sign-in status, but handle errors gracefully
    let isGoogleSignedIn = false;
    try {
      // Some versions of GoogleSignin might not have isSignedIn method
      // Use getCurrentUser instead which is more reliable
      const googleUser = await GoogleSignin.getCurrentUser();
      isGoogleSignedIn = !!googleUser;
    } catch (e) {
      console.log('ℹ️ Could not check Google sign-in status (this is normal):', e.message);
      isGoogleSignedIn = false;
    }
    
    console.log('📊 Sign-in status check:', {
      firebaseUser: !!firebaseUser,
      googleSignedIn: isGoogleSignedIn,
      userEmail: firebaseUser?.email
    });
    
    return {
      isSignedIn: !!firebaseUser,
      isGoogleSignedIn,
      user: firebaseUser
    };
  } catch (error) {
    console.error('❌ Error checking sign-in status:', error);
    return {
      isSignedIn: false,
      isGoogleSignedIn: false,
      user: null
    };
  }
};
