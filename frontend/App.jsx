import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, View, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './src/utils/enhancedNetworkUtils';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import CreateProjectScreen from './src/screens/CreateProjectScreen';
import CreateProjectTab from './src/screens/CreateProjectTab';
import EnhancedBugsScreen from './src/screens/EnhancedBugsScreen';
import EnhancedBugDetailScreen from './src/screens/EnhancedBugDetailScreen';
import PointsScreen from './src/screens/PointsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

// Import components
import CustomTabBar from './src/components/CustomTabBar';
import LoadingScreen from './src/components/LoadingScreen';
import { AUTH_CONFIG } from './src/config/authConfig';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator Component
const TabNavigator = ({ route }) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 15,
          paddingTop: 15,
          paddingHorizontal: 20,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          marginHorizontal: 5,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 0,
          height: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#ff9500',
        tabBarInactiveTintColor: '#666666',
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={route?.params}
        options={{
          tabBarLabel: () => null,
          tabBarBadge: null,
          tabBarIcon: ({focused, color}) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.15)' : 'transparent',
              position: 'relative',
            }}>
              <Icon 
                name="home" 
                size={focused ? 28 : 24} 
                color={focused ? '#ff9500' : '#666666'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Bugs" 
        component={EnhancedBugsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: '#ff3333',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: '700',
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#1a1a1a',
            top: 5,
            right: 15,
          },
          tabBarIcon: ({focused, color}) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.15)' : 'transparent',
              position: 'relative',
            }}>
              <Icon 
                name="bug-report" 
                size={focused ? 28 : 24} 
                color={focused ? '#ff9500' : '#666666'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="ReportBug" 
        component={CreateProjectTab}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: focused ? '#ff9500' : '#ff7700',
              marginTop: -20,
              elevation: 8,
              shadowColor: '#ff9500',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              borderWidth: 3,
              borderColor: '#1a1a1a',
            }}>
              <Icon 
                name="add" 
                size={30} 
                color="#ffffff" 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarBadge: null,
          tabBarIcon: ({focused, color}) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.15)' : 'transparent',
              position: 'relative',
            }}>
              <Icon 
                name="folder" 
                size={focused ? 28 : 24} 
                color={focused ? '#ff9500' : '#666666'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileSettingsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarBadge: null,
          tabBarIcon: ({focused, color}) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? 'rgba(255, 149, 0, 0.15)' : 'transparent',
              position: 'relative',
            }}>
              <Icon 
                name="person" 
                size={focused ? 28 : 24} 
                color={focused ? '#ff9500' : '#666666'} 
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  // State management for authentication workflow
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(null);

  console.log('🔄 APP STATE:', {
    isLoading,
    user: user ? user.email : 'none',
    isCheckingProfile,
    hasCompletedProfile
  });

  // Initialize authentication
  useEffect(() => {
    console.log('🚀 App initialization started');
    
    const app = getApp();
    const unsubscribe = auth(app).onAuthStateChanged(async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? firebaseUser.email : 'logged out');
      
      if (firebaseUser) {
        // User is logged in - check their profile
        setUser(firebaseUser);
        setIsLoading(false);
        console.log('✅ User authenticated, checking profile...');
        await checkUserProfile(firebaseUser);
      } else {
        // User is logged out
        setUser(null);
        setHasCompletedProfile(null);
        setIsLoading(false);
        setIsCheckingProfile(false);
        console.log('👋 User logged out - showing login screen');
      }
    });

    return unsubscribe;
  }, []);

  // Check if user has completed their profile (has username in database)
  const checkUserProfile = async (firebaseUser) => {
    console.log('🔍 CHECKING PROFILE for EMAIL:', firebaseUser.email);
    console.log('🔍 Checking if this email has username in database...');
    setIsCheckingProfile(true);
    
    try {
      // Wait for token to be available after login
      let token = null;
      let attempts = 0;
      const maxAttempts = 10; // Wait up to 10 seconds
      
      while (!token && attempts < maxAttempts) {
        token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log(`⏳ Waiting for authentication token... attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }
      
      if (!token) {
        console.log('❌ No authentication token found after waiting - forcing re-authentication');
        await auth(getApp()).signOut();
        return;
      }

      console.log('🎫 Token found, checking if user has username in database...');
      console.log('🎫 Using token for profile check:', token.substring(0, 30) + '...');

      // Call backend to check if this email has username in database
      const response = await apiRequest('/api/users/profile-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Database check response:', response);

      if (response.success) {
        const data = response;
        console.log('✅ Database response received:', data);
        console.log('📊 DETAILED BACKEND RESPONSE:');
        console.log('  🔍 success:', data.success);
        console.log('  🔍 profileCompleted:', data.profileCompleted);
        console.log('  🔍 user object:', data.user);
        console.log('  🔍 user.username:', data.user?.username);
        console.log('  🔍 user.hasCompletedOnboarding:', data.user?.hasCompletedOnboarding);
        
        // Check if user has username in database (profile completed)
        const userHasUsername = !!(data.user && data.user.username && data.user.username.trim() !== '');
        
        console.log('🔍 EMAIL PROFILE CHECK RESULTS:');
        console.log('  📧 Email:', firebaseUser.email);
        console.log('  🗃️ User found in database:', !!data.user);
        console.log('  👤 Username in database:', data.user?.username || 'NO USERNAME');
        console.log('  ✅ Has username (profile complete):', userHasUsername);
        console.log('  � Backend says profile completed:', data.profileCompleted);
        console.log('  �🏠 Should go to home page:', userHasUsername);
        console.log('  🚀 Should go to GetStarted page:', !userHasUsername);
        
        // Use backend's profileCompleted flag as primary check
        const shouldShowHome = userHasUsername && data.profileCompleted;
        setHasCompletedProfile(shouldShowHome);
        
        console.log('🎯 FINAL DECISION:');
        console.log('  🔍 shouldShowHome:', shouldShowHome);
        console.log('  🔍 Setting hasCompletedProfile to:', shouldShowHome);
        
        if (shouldShowHome) {
          console.log('✅ EXISTING USER DETECTED - Email has username in DB → REDIRECT TO HOME');
        } else {
          console.log('🆕 NEW USER DETECTED - Email has NO username in DB → REDIRECT TO GET STARTED');
        }
      } else {
        console.log('❌ Database check failed:', response.message || 'Unknown error');
        console.log('❌ Error details:', response);
        
        if (response.authError) {
          console.log('🔄 Invalid authentication token - signing out user');
          await auth(getApp()).signOut();
        } else {
          // On error, default to GetStarted page for safety (assume new user)
          console.log('⚠️ Defaulting to GetStarted page due to error');
          setHasCompletedProfile(false);
        }
      }
    } catch (error) {
      console.error('❌ Profile check error:', error);
      console.log('⚠️ Network/connection error - defaulting to GetStarted page');
      // On error, default to GetStarted page for safety (assume new user)
      setHasCompletedProfile(false);
    } finally {
      setIsCheckingProfile(false);
      console.log('✅ Profile check completed');
    }
  };

  // Function to refresh profile status (called from GetStarted after completion)
  const refreshProfileStatus = async () => {
    if (user) {
      console.log('🔄 Refreshing profile status...');
      await checkUserProfile(user);
    }
  };

  // Render the appropriate screen based on authentication state
  const renderScreens = () => {
    // App is initializing
    if (isLoading) {
      console.log('📱 RENDER: Loading screen (app initializing)');
      return <LoadingScreen message="Starting app..." />;
    }

    // No user logged in
    if (!user) {
      console.log('📱 RENDER: Login screen');
      return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      );
    }

    // User logged in but checking profile
    if (isCheckingProfile) {
      console.log('📱 RENDER: Loading screen (checking if email has username in database)');
      return <LoadingScreen message="Checking if you're a new user..." />;
    }

    // User logged in and profile check complete
    if (hasCompletedProfile === true) {
      console.log('📱 RENDER: Main app (user has completed profile)');
      return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="EnhancedBugDetail" component={EnhancedBugDetailScreen} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
          <Stack.Screen name="Points" component={PointsScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      );
    }

    if (hasCompletedProfile === false) {
      console.log('📱 RENDER: GetStarted screen (user needs to complete profile)');
      return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="GetStarted" 
            component={GetStartedScreen}
            initialParams={{ refreshProfileStatus }}
          />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      );
    }

    // Fallback loading state
    console.log('📱 RENDER: Fallback loading screen');
    return <LoadingScreen message="Loading..." />;
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: '#000000' }}>
      <NavigationContainer>
        {renderScreens()}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
