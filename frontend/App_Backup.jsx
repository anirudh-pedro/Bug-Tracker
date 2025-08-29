import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNa  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthState('signed_in');
      } else {
        setUser(null);
        setAuthState('signed_out');
      }
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);r} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, View, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authState, setAuthState] = useState('signed_out');
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const navigationRef = useRef();
  const [navigationReady, setNavigationReady] = useState(false);

  // Initialize auth manager
  useEffect(() => {
    console.log('� App.jsx: Initializing AuthManager...');
    
    // Initialize Google Sign-In
    authManager.initializeGoogle();

    // Add auth state listener
    const handleAuthStateChange = (state, data) => {
      console.log('🔄 App.jsx: AuthManager state change:', state);
      setAuthState(state);

      switch (state) {
        case AUTH_STATES.SIGNED_IN:
          setUser(data.user);
          setRequiresOnboarding(data.requiresOnboarding);
          break;
        case AUTH_STATES.SIGNED_OUT:
          setUser(null);
          setRequiresOnboarding(false);
          if (navigationReady && navigationRef.current) {
            console.log('🔄 App.jsx: Navigating to Login due to sign out');
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
          break;
        case AUTH_STATES.ERROR:
          console.error('❌ App.jsx: Auth error:', data?.error);
          break;
      }
    };

    authManager.addAuthListener(handleAuthStateChange);

    // Firebase auth state listener (for external auth changes)
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      console.log('🔄 App.jsx: Firebase auth state change:', firebaseUser ? 'User exists' : 'No user');
      
      if (!firebaseUser && authState !== AUTH_STATES.SIGNING_OUT) {
        // User signed out externally, sync with auth manager
        authManager.notifyListeners(AUTH_STATES.SIGNED_OUT);
      }
      
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => {
      authManager.removeAuthListener(handleAuthStateChange);
      unsubscribe();
    };
  }, [authState, initializing, navigationReady]);

  if (initializing) {
    console.log('⏳ App.jsx: Initializing...');
    return null; // You can add a loading screen component here
  }

  const isSignedIn = user && authState === AUTH_STATES.SIGNED_IN;

  console.log('🎯 App.jsx: Navigation decision:', {
    user: !!user,
    authState,
    requiresOnboarding,
    decision: isSignedIn ? (requiresOnboarding ? 'SHOW_ONBOARDING' : 'SHOW_APP') : 'SHOW_LOGIN'
  });

  return (
    <SafeAreaProvider>
      <NavigationContainer 
        ref={navigationRef}
        onReady={() => {
          console.log('✅ App.jsx: Navigation is ready');
          setNavigationReady(true);
        }}
      >
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isSignedIn ? (
            requiresOnboarding ? (
              // User is signed in but needs onboarding
              <>
                <Stack.Screen name="GetStarted" component={GetStartedScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Home" component={TabNavigator} />
              </>
            ) : (
              // User is signed in and onboarding is complete
              <>
                <Stack.Screen name="Home" component={TabNavigator} />
                <Stack.Screen name="BugDetail" component={BugDetailScreen} />
                <Stack.Screen name="Points" component={PointsScreen} />
                <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
              </>
            )
          ) : (
            // User is not signed in
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="GetStarted" component={GetStartedScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
