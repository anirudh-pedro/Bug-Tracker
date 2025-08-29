import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG, AUTH_STATES } from '../config/authConfig';

class AuthManager {
  constructor() {
    this.currentState = AUTH_STATES.SIGNED_OUT;
    this.authListeners = [];
    this.isProcessing = false;
  }

  // Initialize Google Sign-In
  initializeGoogle() {
    GoogleSignin.configure({
      webClientId: AUTH_CONFIG.GOOGLE_WEB_CLIENT_ID,
      forceCodeForRefreshToken: true,
      accountName: '',
    });
  }

  // Add auth state listener
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  // Remove auth state listener
  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of state change
  notifyListeners(state, data = null) {
    this.currentState = state;
    this.authListeners.forEach(listener => {
      try {
        listener(state, data);
      } catch (error) {
        console.error('❌ AuthManager: Listener error:', error);
      }
    });
  }

  // Robust sign-in with retry mechanism
  async signInWithGoogle(retryCount = 0) {
    if (this.isProcessing) {
      console.log('⚠️ AuthManager: Sign-in already in progress');
      return { success: false, error: 'Sign-in already in progress' };
    }

    this.isProcessing = true;
    this.notifyListeners(AUTH_STATES.SIGNING_IN);

    try {
      console.log('🔄 AuthManager: Starting Google sign-in process...');

      // Step 1: Clear any existing session
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log('ℹ️ No existing Google session to clear');
      }

      // Step 2: Check Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Step 3: Google Sign-In
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      // Step 4: Firebase Authentication
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('✅ AuthManager: Firebase auth successful');

      // Step 5: Backend Authentication
      const backendResult = await this.authenticateWithBackend(idToken, userCredential.user);

      if (backendResult.success) {
        this.notifyListeners(AUTH_STATES.SIGNED_IN, {
          user: userCredential.user,
          backendData: backendResult.data,
          requiresOnboarding: backendResult.data.requiresOnboarding
        });

        return {
          success: true,
          user: userCredential.user,
          backendData: backendResult.data,
          requiresOnboarding: backendResult.data.requiresOnboarding
        };
      } else {
        throw new Error(backendResult.error || 'Backend authentication failed');
      }

    } catch (error) {
      console.error('❌ AuthManager: Sign-in error:', error);

      // Retry logic for network errors
      if (retryCount < AUTH_CONFIG.MAX_RETRIES && this.isNetworkError(error)) {
        console.log(`🔄 AuthManager: Retrying sign-in (${retryCount + 1}/${AUTH_CONFIG.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.signInWithGoogle(retryCount + 1);
      }

      this.notifyListeners(AUTH_STATES.ERROR, { error: error.message });
      return { success: false, error: error.message };

    } finally {
      this.isProcessing = false;
    }
  }

  // Backend authentication
  async authenticateWithBackend(idToken, firebaseUser) {
    try {
      console.log('📡 AuthManager: Authenticating with backend...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.AUTH_TIMEOUT);

      const response = await fetch(`${AUTH_CONFIG.BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        // Store authentication data
        await this.storeAuthData(firebaseUser, data);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Backend authentication failed' };
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Authentication timeout' };
      }
      return { success: false, error: error.message };
    }
  }

  // Store authentication data securely
  async storeAuthData(firebaseUser, backendData) {
    try {
      // Store token
      if (backendData.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_TOKEN, backendData.token);
      }

      // Store user data
      if (backendData.user) {
        const userData = {
          uid: firebaseUser.uid,
          id: backendData.user.id,
          username: backendData.user.username,
          name: backendData.user.name,
          email: backendData.user.email,
          avatar: backendData.user.avatar,
          industry: backendData.user.industry,
          phoneNumber: backendData.user.phoneNumber,
          role: backendData.user.role,
          onboardingCompleted: backendData.user.onboardingCompleted
        };

        await AsyncStorage.setItem(
          AUTH_CONFIG.STORAGE_KEYS.USER_DATA(firebaseUser.uid),
          JSON.stringify(userData)
        );
      }

      console.log('✅ AuthManager: Auth data stored successfully');
    } catch (error) {
      console.error('❌ AuthManager: Error storing auth data:', error);
      throw error;
    }
  }

  // Robust sign-out with cleanup
  async signOut(force = false) {
    if (this.isProcessing && !force) {
      console.log('⚠️ AuthManager: Sign-out already in progress');
      return { success: false, error: 'Sign-out already in progress' };
    }

    this.isProcessing = true;
    this.notifyListeners(AUTH_STATES.SIGNING_OUT);

    try {
      console.log('🔄 AuthManager: Starting sign-out process...');

      // Step 1: Clear local storage first (immediate cleanup)
      await this.clearLocalData();

      // Step 2: Sign out from Firebase (triggers auth state change)
      await auth().signOut();
      console.log('✅ AuthManager: Firebase sign-out complete');

      // Step 3: Google sign-out (non-blocking)
      GoogleSignin.signOut().catch(e => {
        console.log('⚠️ AuthManager: Google sign-out error (ignoring):', e.message);
      });

      this.notifyListeners(AUTH_STATES.SIGNED_OUT);
      return { success: true };

    } catch (error) {
      console.error('❌ AuthManager: Sign-out error:', error);

      if (force) {
        // Force cleanup everything
        await this.forceCleanup();
        this.notifyListeners(AUTH_STATES.SIGNED_OUT);
        return { success: true, forced: true };
      }

      this.notifyListeners(AUTH_STATES.ERROR, { error: error.message });
      return { success: false, error: error.message };

    } finally {
      this.isProcessing = false;
    }
  }

  // Clear all local authentication data
  async clearLocalData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('user_data_') || 
        key.includes('user_onboarding_') || 
        key === AUTH_CONFIG.STORAGE_KEYS.USER_TOKEN
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log('✅ AuthManager: Local data cleared');
      }
    } catch (error) {
      console.error('❌ AuthManager: Error clearing local data:', error);
      throw error;
    }
  }

  // Force cleanup for when normal sign-out fails
  async forceCleanup() {
    console.log('⚡ AuthManager: Force cleanup initiated...');

    try {
      await Promise.allSettled([
        auth().signOut(),
        GoogleSignin.signOut(),
        AsyncStorage.clear()
      ]);
      console.log('✅ AuthManager: Force cleanup completed');
    } catch (error) {
      console.error('❌ AuthManager: Force cleanup error:', error);
    }
  }

  // Check if error is network-related (for retry logic)
  isNetworkError(error) {
    const networkErrorCodes = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_FAILED'];
    return networkErrorCodes.some(code => 
      error.message?.includes(code) || error.code?.includes(code)
    );
  }

  // Get current auth state
  getCurrentState() {
    return this.currentState;
  }

  // Check if currently processing
  isCurrentlyProcessing() {
    return this.isProcessing;
  }
}

// Export singleton instance
export const authManager = new AuthManager();
export default authManager;

// Re-export AUTH_STATES for convenience
export { AUTH_STATES } from '../config/authConfig';
