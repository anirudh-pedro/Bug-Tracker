import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, View, Text, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildApiUrl } from './src/config/apiConfig';
import { testBackendConnectivity, testAuthEndpoint } from './src/utils/connectivityTest';

import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import CreateProjectTab from './src/screens/CreateProjectTab';
import BugsScreen from './src/screens/BugsScreen';
import BugDetailScreen from './src/screens/BugDetailScreen';
import PointsScreen from './src/screens/PointsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import NetworkDiagnosticsScreen from './src/screens/NetworkDiagnosticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ route }) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1a1a',
          borderTopWidth: 1,
          borderTopColor: '#333333',
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
          paddingHorizontal: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          borderRadius: 12,
          marginHorizontal: 2,
          flex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarActiveTintColor: '#ff9500',
        tabBarInactiveTintColor: '#888888',
        tabBarAllowFontScaling: false,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            style={[
              props.style,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 4,
                borderRadius: 12,
                marginHorizontal: 2,
                backgroundColor: props.accessibilityState?.selected ? '#ff950020' : 'transparent',
              }
            ]}
            activeOpacity={0.7}
          />
        ),
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let iconSize = focused ? 24 : 20;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Bugs') {
            iconName = 'bug-report';
          } else if (route.name === 'CreateProject') {
            // For CreateProject, show the custom circular button
            return (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                backgroundColor: '#ff9500',
                borderRadius: 20,
                elevation: 4,
                shadowColor: '#ff9500',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                marginBottom: 2,
              }}>
                <Icon 
                  name="add" 
                  size={24} 
                  color="#ffffff"
                />
              </View>
            );
          } else if (route.name === 'Projects') {
            iconName = 'folder';
          }

          // Regular icons for other tabs
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: iconSize + 6,
              height: iconSize + 6,
              marginBottom: 2,
            }}>
              <Icon 
                name={iconName} 
                size={iconSize} 
                color={focused ? '#ff9500' : '#888888'}
                style={{
                  textShadowColor: focused ? '#ff9500' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: focused ? 6 : 0,
                }}
              />
            </View>
          );
        },
        tabBarLabel: ({focused, color}) => {
          let label;
          
          if (route.name === 'Home') {
            label = 'Home';
          } else if (route.name === 'Bugs') {
            label = 'Bugs';
          } else if (route.name === 'CreateProject') {
            return null; // No label for the + button
          } else if (route.name === 'Projects') {
            label = 'Projects';
          }

          return (
            <Text style={{
              fontSize: 10,
              fontWeight: focused ? '700' : '500',
              color: focused ? '#ff9500' : '#888888',
              textAlign: 'center',
              marginTop: 2,
              textShadowColor: focused ? '#ff950040' : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: focused ? 3 : 0,
            }}>
              {label}
            </Text>
          );
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={route?.params}
        options={{
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Bugs" 
        component={BugsScreen}
        options={{
          tabBarBadge: 3, // Example: 3 new bugs
          tabBarBadgeStyle: {
            backgroundColor: '#ff9500',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 2,
            borderColor: '#1a1a1a',
          }
        }}
      />
      <Tab.Screen 
        name="CreateProject" 
        component={CreateProjectTab}
        options={{
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{
          tabBarBadge: null,
        }}
      />
    </Tab.Navigator>
  );
};

// Global function to force a user to complete their profile
global.forceProfileCompletion = async (userId) => {
  try {
    console.log('🔄 Forcing profile completion for user:', userId);
    if (!userId) {
      const currentUser = auth().currentUser;
      userId = currentUser?.uid;
    }
    
    if (userId) {
      // Get existing user data
      const userDataString = await AsyncStorage.getItem(`user_data_${userId}`);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Mark as needing onboarding
        userData.hasCompletedOnboarding = false;
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem(`user_data_${userId}`, JSON.stringify(userData));
        console.log('✅ User marked for profile completion:', userId);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Error forcing profile completion:', error);
    return false;
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isCheckingPersistentAuth, setIsCheckingPersistentAuth] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Test backend connectivity when app starts
  useEffect(() => {
    const checkBackendConnectivity = async () => {
      try {
        console.log('🔄 Initializing backend connectivity...');
        console.log('📌 Initial API URL:', API_CONFIG.BASE_URL);
        
        // Try all possible URLs to find one that works
        const result = await testBackendConnectivity();
        setBackendConnected(result.success);
        
        console.log(`🌐 Backend connectivity: ${result.success ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}`);
        
        if (result.success) {
          console.log(`📡 Using API URL: ${API_CONFIG.BASE_URL}`);
        } else {
          console.warn('⚠️ Cannot connect to backend. Using offline mode with AsyncStorage only.');
          
          // Show an alert to the user
          setTimeout(() => {
            Alert.alert(
              'Connection Issue',
              'Cannot connect to the server. Some features may be limited.\n\n' +
              'Make sure your server is running and your device is properly connected.',
              [{ text: 'OK' }]
            );
          }, 2000); // Delay to ensure UI is ready
        }
        
        // Try to connect to server every minute in the background
        const intervalId = setInterval(async () => {
          console.log('🔄 Background connectivity check...');
          const pingResult = await testBackendConnectivity();
          setBackendConnected(pingResult.success);
          console.log(`🌐 Backend status: ${pingResult.success ? 'ONLINE ✅' : 'OFFLINE ❌'}`);
        }, 60000); // Every minute
        
        // Clean up interval on unmount
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('❌ Error testing connectivity:', error);
        setBackendConnected(false);
      }
    };
    
    checkBackendConnectivity();
  }, []);

  // Debug function to check stored data
  const debugStoredData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const storedData = await AsyncStorage.getItem(`user_data_${currentUser.uid}`);
        console.log('🔍 DEBUG - Raw stored data:', storedData);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log('🔍 DEBUG - Parsed stored data:', parsed);
        }
      }
    } catch (error) {
      console.log('🔍 DEBUG - Error checking stored data:', error);
    }
  };

  // Check for persistent authentication on app start
  useEffect(() => {
    const checkPersistentAuth = async () => {
      try {
        console.log('🔍 Checking for persistent authentication...');
        console.log('🧪 DEBUG: App started, checking authentication state');
        await debugStoredData(); // Debug what's stored
        
        const currentUser = auth().currentUser;
        
        if (currentUser) {
          console.log('✅ User already authenticated:', currentUser.email);
          console.log('🧪 DEBUG: Firebase user found:', {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          });
          
          // Check if this is a user's very first login ever
          // This will help us identify new users even when backend is unreachable
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('🧪 DEBUG: All AsyncStorage keys:', allKeys);
          
          const hasLoginHistory = allKeys.some(key => key === `login_history_${currentUser.email}`);
          const isFirstEverLogin = !hasLoginHistory;
          console.log('🧪 DEBUG: Login history check:', { 
            email: currentUser.email,
            hasLoginHistory,
            isFirstEverLogin,
            historyKey: `login_history_${currentUser.email}`
          });
          
          if (isFirstEverLogin) {
            console.log('🆕 FIRST LOGIN DETECTED - This is a brand new user!');
          }
          
          // Check if we have stored user data
          const storedUserData = await AsyncStorage.getItem(`user_data_${currentUser.uid}`);
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            console.log('📱 Found stored user data:', {
              username: userData.username,
              hasCompletedOnboarding: userData.hasCompletedOnboarding,
              email: userData.email,
              isNewUser: userData.isNewUser || isFirstEverLogin
            });
            
            setUser(currentUser);
            
            // Check onboarding status more carefully
            const hasValidUsername = userData.username && userData.username.trim().length > 0;
            const hasCompletedOnboarding = userData.hasCompletedOnboarding === true;
            
            // If this is detected as a new user OR marked as new in stored data,
            // OR they have no valid username, they need onboarding
            const isNewUser = userData.isNewUser || isFirstEverLogin;
            const needsOnboarding = isNewUser || !hasValidUsername || !hasCompletedOnboarding;
            
            console.log('🎯 Onboarding decision:', {
              hasValidUsername,
              hasCompletedOnboarding,
              isNewUser,
              isFirstEverLogin,
              needsOnboarding,
              decision: needsOnboarding ? 'GO TO GetStarted' : 'GO TO Home'
            });
            
            setNeedsOnboarding(needsOnboarding);
            
            // If this is a first login, always record it so we can track returning users
            if (isFirstEverLogin) {
              await AsyncStorage.setItem(`login_history_${currentUser.email}`, new Date().toISOString());
              console.log('📝 Recorded first login for future reference');
            }
          } else {
            console.log('⚠️ No stored user data, will check with backend');
            setUser(currentUser);
            
            // If this is clearly a first login ever, go straight to onboarding
            if (isFirstEverLogin) {
              console.log('🆕 First login, going straight to onboarding');
              setNeedsOnboarding(true);
              
              // Create basic user data
              const newUserData = {
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || '',
                avatar: currentUser.photoURL || '',
                isNewUser: true,
                hasCompletedOnboarding: false
              };
              
              await AsyncStorage.setItem(`user_data_${currentUser.uid}`, JSON.stringify(newUserData));
              await AsyncStorage.setItem(`login_history_${currentUser.email}`, new Date().toISOString());
              console.log('💾 Created new user data and recorded first login');
            } else {
              // Otherwise try backend check
              await checkOnboardingStatus(currentUser);
            }
          }
        } else {
          console.log('❌ No authenticated user found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error checking persistent auth:', error);
        setUser(null);
      } finally {
        setIsCheckingPersistentAuth(false);
        setInitializing(false);
      }
    };

    checkPersistentAuth();
  }, []);

  // Check if user has completed onboarding
  const checkOnboardingStatus = async (firebaseUser) => {
    try {
      // Try to connect to server at the specific network URL from server log
      console.log(`🔍 Using server at: ${API_CONFIG.BASE_URL}`);
      
      // If we can't connect to the backend, we should assume this is a returning user
      // and store some basic data and bypass the GetStarted page
      const createFallbackUserData = async (isNewUserCheck = false) => {
        console.log('⚠️ Creating fallback user data...');
        
        // First check if we've seen this user before
        try {
          // Look for stored user data first
          const storedUserData = await AsyncStorage.getItem(`user_data_${firebaseUser.uid}`);
          if (storedUserData) {
            // We have existing user data, so use that
            const userData = JSON.parse(storedUserData);
            console.log('✅ Found existing user data in AsyncStorage:', {
              username: userData.username || '(missing)',
              hasCompletedOnboarding: userData.hasCompletedOnboarding
            });
            
            // If we have username and onboarding completed, don't show GetStarted
            if (userData.username && userData.hasCompletedOnboarding) {
              console.log('🏠 User has completed profile, going to Home');
              setNeedsOnboarding(false);
              return;
            }
            
            // Otherwise, they need to complete onboarding
            console.log('🚀 User has incomplete profile, showing GetStarted');
            setNeedsOnboarding(true);
            return;
          }
          
          // If no stored data, check login history
          const allKeys = await AsyncStorage.getAllKeys();
          const previousLogin = allKeys.some(key => key === `login_history_${firebaseUser.email}`);
          
          // If we've never seen this email before, it's likely a new user
          const isLikelyNewUser = !previousLogin;
          console.log('🔍 Login history check:', isLikelyNewUser ? 'New user detected' : 'Returning user detected');
          
          // For new user detection, mark as needing onboarding
          if (isNewUserCheck && isLikelyNewUser) {
            console.log('🆕 New user detected, redirecting to GetStarted');
            setNeedsOnboarding(true);
            
            // Create minimal user data but mark as needing onboarding
            const newUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              avatar: firebaseUser.photoURL || '',
              hasCompletedOnboarding: false, // New user needs onboarding
              firstSeen: new Date().toISOString(),
              isNewUser: true
            };
            
            await AsyncStorage.setItem(`user_data_${firebaseUser.uid}`, JSON.stringify(newUserData));
            console.log('💾 New user data created, will show GetStarted screen');
            
            return;
          }
          
          // Otherwise, assume it's a returning user who has completed onboarding
          // Create minimal user data to bypass onboarding
          const fallbackUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
            avatar: firebaseUser.photoURL || '',
            // Don't set username - let user choose in GetStarted
            tempUsername: firebaseUser.email.split('@')[0], // Temporary username
            hasCompletedOnboarding: !isLikelyNewUser, // Only assume completed if not a new user
            lastLogin: new Date().toISOString(),
            offlineCreated: true
          };
          
          // Store the fallback data
          await AsyncStorage.setItem(`user_data_${firebaseUser.uid}`, JSON.stringify(fallbackUserData));
          
          // Record this login to detect new users in future
          await AsyncStorage.setItem(`login_history_${firebaseUser.email}`, new Date().toISOString());
          
          console.log('💾 Fallback user data created:', fallbackUserData);
          
          // Go straight to home if not a new user
          setNeedsOnboarding(isLikelyNewUser);
        } catch (error) {
          console.log('❌ Error in fallback data creation:', error);
          // Default to GetStarted for safety if anything goes wrong
          setNeedsOnboarding(true);
        }
      };
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      console.log('🔍 Checking user onboarding status with backend...');
      
      try {
        // First test auth endpoint explicitly
        const authTest = await testAuthEndpoint(idToken);
        
        if (!authTest.success) {
          console.warn('⚠️ Auth endpoint test failed, using fallback user data');
          await createFallbackUserData(true);
          return;
        }
        
        // Try to reach the backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // Check for profile completeness
          const hasUsername = data.user.username && data.user.username.trim().length > 0;
          const hasIndustry = data.user.industry && data.user.industry !== 'Select' && data.user.industry.trim().length > 0;
          const hasPhoneNumber = data.user.phoneNumber && data.user.phoneNumber.trim().length > 0;
          const backendHasCompletedOnboarding = data.user.hasCompletedOnboarding === true;
          
          // Detailed logging to troubleshoot issues
          console.log('✅ User data received from backend:', {
            username: data.user.username || '(missing)',
            hasUsername: hasUsername,
            industry: data.user.industry || '(missing)',
            hasIndustry: hasIndustry,
            phoneNumber: data.user.phoneNumber ? '(present)' : '(missing)',
            hasPhoneNumber: hasPhoneNumber,
            hasCompletedOnboarding: backendHasCompletedOnboarding,
            isNewUser: data.isNewUser,
          });
          
          // Record this login to detect new users in future
          await AsyncStorage.setItem(`login_history_${firebaseUser.email}`, new Date().toISOString());
  
          // Store user data
          const userData = {
            uid: firebaseUser.uid,
            id: data.user.id,
            username: data.user.username,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar,
            industry: data.user.industry,
            phoneNumber: data.user.phoneNumber,
            role: data.user.role,
            hasCompletedOnboarding: data.user.hasCompletedOnboarding,
            isNewUser: data.isNewUser
          };
          
          await AsyncStorage.setItem(`user_data_${firebaseUser.uid}`, JSON.stringify(userData));
          console.log('💾 User data stored in AsyncStorage');
  
          // Comprehensive profile check - user needs onboarding if ANY required field is missing
          const isProfileComplete = hasUsername && hasIndustry && hasPhoneNumber && backendHasCompletedOnboarding;
          const needsOnboarding = !isProfileComplete;
          
          console.log('📊 Profile completeness check:', {
            isProfileComplete: isProfileComplete,
            needsOnboarding: needsOnboarding,
            missingFields: [
              !hasUsername ? 'username' : null,
              !hasIndustry ? 'industry' : null, 
              !hasPhoneNumber ? 'phoneNumber' : null,
              !backendHasCompletedOnboarding ? 'onboardingFlag' : null
            ].filter(Boolean)
          });
          
          setNeedsOnboarding(needsOnboarding);
          
          console.log(needsOnboarding ? '🚀 User needs onboarding' : '🏠 User goes to home');
        } else {
          console.log('⚠️ Backend check failed, creating fallback user data');
          await createFallbackUserData(true); // true = check if new user
        }
      } catch (fetchError) {
        console.error('❌ Network error connecting to backend:', fetchError.message);
        console.log('⚠️ Using fallback user data since backend is unreachable');
        await createFallbackUserData(true); // true = check if new user
      }
    } catch (error) {
      console.error('❌ Error in overall onboarding check:', error);
      // If all else fails, assume a new user
      setNeedsOnboarding(true);
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    if (isCheckingPersistentAuth) return; // Don't start listener until persistent check is done
    
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `User signed in: ${firebaseUser.email}` : 'User signed out');
      
      if (firebaseUser) {
        console.log('🧪 DEBUG: Auth state SIGN IN detected for:', firebaseUser.email);
        
        // Let's immediately mark this as a new user if we've never seen the email before
        const allKeys = await AsyncStorage.getAllKeys();
        const loginHistoryKey = `login_history_${firebaseUser.email}`;
        const hasSeenBefore = allKeys.includes(loginHistoryKey);
        
        console.log('🧪 DEBUG: Auth state new user check:', {
          email: firebaseUser.email,
          allKeys: allKeys.length,
          hasSeenBefore,
          isLikelyNewUser: !hasSeenBefore,
          loginHistoryKey
        });
        
        // If this is definitely a new user (first time seeing this email), mark them for onboarding
        if (!hasSeenBefore) {
          console.log('🚨 IMPORTANT: NEW USER DETECTED in auth state change!');
          console.log('📱 Creating new user record and redirecting to GetStarted...');
          
          // Create a simple user record
          const newUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
            avatar: firebaseUser.photoURL || '',
            isNewUser: true,
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString()
          };
          
          // Store the data
          await AsyncStorage.setItem(`user_data_${firebaseUser.uid}`, JSON.stringify(newUserData));
          setUser(firebaseUser);
          setNeedsOnboarding(true);
          
          console.log('🚀 Setting needsOnboarding = true, user should go to GetStarted');
          
          // Don't record login history yet - we'll do that after onboarding
          return;
        }
        
        setUser(firebaseUser);
        // Check for stored user data
        const storedUserData = await AsyncStorage.getItem(`user_data_${firebaseUser.uid}`);
        console.log('🧪 DEBUG: Stored user data found?', !!storedUserData);
        
        if (storedUserData) {
          // We have stored data, check if it's complete
          try {
            const userData = JSON.parse(storedUserData);
            console.log('📱 Using stored user data:', {
              username: userData.username,
              hasCompletedOnboarding: userData.hasCompletedOnboarding,
              email: userData.email
            });
            
            // Check if data is valid and complete
            const hasValidUsername = userData.username && userData.username.trim().length > 0;
            const hasCompletedOnboarding = userData.hasCompletedOnboarding === true;
            const needsOnboarding = !hasValidUsername || !hasCompletedOnboarding;
            
            console.log('🎯 Auth change onboarding decision:', {
              hasValidUsername,
              hasCompletedOnboarding, 
              needsOnboarding,
              decision: needsOnboarding ? 'GO TO GetStarted' : 'GO TO Home'
            });
            
            setNeedsOnboarding(needsOnboarding);
          } catch (parseError) {
            console.error('❌ Error parsing stored user data:', parseError);
            await checkOnboardingStatus(firebaseUser);
          }
        } else {
          // No stored data, check with backend
          console.log('⚠️ No stored user data in auth change, will check with backend');
          await checkOnboardingStatus(firebaseUser);
        }
      } else {
        setUser(null);
        setNeedsOnboarding(false);
        // Clear any stored user data on sign out
        try {
          const keys = await AsyncStorage.getAllKeys();
          const userDataKeys = keys.filter(key => key.startsWith('user_data_'));
          await AsyncStorage.multiRemove(userDataKeys);
          console.log('🗑️ Cleared stored user data on sign out');
        } catch (error) {
          console.error('Error clearing stored data:', error);
        }
      }
      
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing, isCheckingPersistentAuth]);

  if (initializing || isCheckingPersistentAuth) return null; // Loading screen

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // User is signed in
            needsOnboarding ? (
              // New user - needs onboarding
              <>
                <Stack.Screen name="GetStarted" component={GetStartedScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
              </>
            ) : (
              // Existing user - go directly to home
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="GetStarted" component={GetStartedScreen} />
              </>
            )
          ) : (
            // User is not signed in
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
          
          {/* Additional screens available after login */}
          <Stack.Screen name="BugDetail" component={BugDetailScreen} />
          <Stack.Screen name="Points" component={PointsScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          <Stack.Screen name="NetworkDiagnostics" component={NetworkDiagnosticsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
