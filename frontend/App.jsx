import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, View, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import CreateProjectTab from './src/screens/CreateProjectTab';
import BugsScreen from './src/screens/BugsScreen';
import BugDetailScreen from './src/screens/BugDetailScreen';
import PointsScreen from './src/screens/PointsScreen';

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
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user has completed onboarding
  const checkUserOnboardingStatus = async (user) => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(`user_onboarding_${user.uid}`);
      
      if (!hasCompletedOnboarding) {
        setIsFirstTimeUser(true);
      } else {
        setIsFirstTimeUser(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding for safety
      setIsFirstTimeUser(true);
    }
  };

  // Handle user state changes
  function onAuthStateChanged(user) {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    console.log('User details:', user);
    setUser(user);
    
    if (user) {
      checkUserOnboardingStatus(user);
    } else {
      setIsFirstTimeUser(false);
    }
    
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) return null; // Loading screen can be added here

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {user ? (
            <>
              <Stack.Screen 
                name="GetStarted" 
                component={GetStartedScreen}
                initialParams={{ user, isFirstTimeUser }}
              />
              <Stack.Screen name="MainApp" component={TabNavigator} />
              <Stack.Screen name="BugDetail" component={BugDetailScreen} />
              <Stack.Screen name="Points" component={PointsScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
