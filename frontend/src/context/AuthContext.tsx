import React, { createContext, useContext, useReducer, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'tester' | 'manager';
  provider?: 'email' | 'google';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@bugtracker.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'dev@bugtracker.com',
    name: 'Developer',
    role: 'developer',
  },
  {
    id: '3',
    email: 'tester@bugtracker.com',
    name: 'Tester',
    role: 'tester',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        // User is signed in
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          role: 'developer', // Default role, you can enhance this with Firestore
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        // User is signed out
        dispatch({ type: 'LOGOUT' });
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Simulate checking for stored auth token on app start
  useEffect(() => {
    // In a real app, you would check AsyncStorage for stored auth token
    // and validate it with your backend
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - in real app, make API call
      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password123') {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Invalid email or password' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Login failed. Please try again.' 
      });
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;
      
      // Create user object from Firebase user
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Google User',
        role: 'developer', // Default role for Google sign-in users
        provider: 'google',
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Google Sign-In failed';
      
      if (error.message && error.message.includes('DEVELOPER_ERROR')) {
        errorMessage = 'Developer Error: Please ensure SHA-1 fingerprint is added to Firebase Console. Check setup guide for details.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'The credential is invalid or has expired.';
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage
      });
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'User with this email already exists' 
        });
        return;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'developer', // Default role
      };

      mockUsers.push(newUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Registration failed. Please try again.' 
      });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Sign out from Firebase Auth
      await auth().signOut();
      
      // Sign out from Google Sign-In if user was signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Google sign out failed, but that's okay
        console.log('Google signOut failed:', googleError);
      }
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signInWithGoogle,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
