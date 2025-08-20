import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, View, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import CreateProjectTab from './src/screens/CreateProjectTab';

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
          height: 90,
          paddingBottom: 25,
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
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarActiveTintColor: '#667eea',
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
                borderRadius: 12,
                marginHorizontal: 4,
                backgroundColor: props.accessibilityState?.selected ? '#667eea20' : 'transparent',
              }
            ]}
            activeOpacity={0.7}
          />
        ),
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let iconSize = focused ? 26 : 22;
          let isCreateTab = route.name === 'CreateProject';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Bugs') {
            iconName = 'bug-report';
          } else if (route.name === 'CreateProject') {
            iconName = 'add';
            iconSize = 28; // Slightly larger for the + icon
          } else if (route.name === 'Projects') {
            iconName = 'folder';
          }

          if (isCreateTab) {
            return (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 45,
                height: 45,
                backgroundColor: '#ff6b6b',
                borderRadius: 22.5,
                elevation: 4,
                shadowColor: '#ff6b6b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                marginBottom: 10,
              }}>
                <Icon 
                  name={iconName} 
                  size={iconSize} 
                  color="#ffffff"
                />
              </View>
            );
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: iconSize + 4,
              height: iconSize + 4,
            }}>
              <Icon 
                name={iconName} 
                size={iconSize} 
                color={color}
                style={{
                  textShadowColor: focused ? '#667eea' : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: focused ? 8 : 0,
                }}
              />
            </View>
          );
        },
        tabBarLabel: ({focused, color}) => {
          let label;
          
          if (route.name === 'Home') {
            label = '🏠 Home';
          } else if (route.name === 'Bugs') {
            label = '🐞 Bugs';
          } else if (route.name === 'CreateProject') {
            label = '➕ Create';
          } else if (route.name === 'Projects') {
            label = '📂 My Projects';
          }

          return (
            <Text style={{
              fontSize: route.name === 'CreateProject' ? 10 : 11,
              fontWeight: focused ? '700' : '500',
              color: route.name === 'CreateProject' ? '#ff6b6b' : color,
              textAlign: 'center',
              marginTop: route.name === 'CreateProject' ? -5 : 2,
              textShadowColor: focused && route.name !== 'CreateProject' ? '#667eea40' : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: focused ? 4 : 0,
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
        component={DashboardScreen}
        options={{
          tabBarBadge: 3, // Example: 3 new bugs
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
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
        listeners={({navigation}) => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            
            // Navigate to Home and show project creation modal
            navigation.navigate('Home', { showCreateModal: true });
          },
        })}
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

  // Handle user state changes
  function onAuthStateChanged(user) {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    console.log('User details:', user);
    setUser(user);
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
              <Stack.Screen name="GetStarted" component={GetStartedScreen} />
              <Stack.Screen name="MainApp" component={TabNavigator} />
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
