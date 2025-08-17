import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import BugListScreen from '../screens/BugListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Colors, getThemeColors } from '../constants/colors';

// Create tab navigator
const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  const isDarkMode = true; // Force dark theme
  const themeColors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const getTabBarIcon = (routeName: string) => {
    return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
      let iconName: string;

      switch (routeName) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Bugs':
          iconName = focused ? 'bug' : 'bug-outline';
          break;
        case 'Profile':
          iconName = focused ? 'person' : 'person-outline';
          break;
        case 'Settings':
          iconName = focused ? 'settings' : 'settings-outline';
          break;
        default:
          iconName = 'help-outline';
      }

      return (
        <Ionicons
          name={iconName}
          size={size || 24}
          color={color}
        />
      );
    };
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route.name),
          headerShown: false, // We're using our custom TopHeader
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#38383A',
            borderTopWidth: 0.5,
            height: 68 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 12,
            paddingHorizontal: 20,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: 2,
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Bugs"
          component={BugListScreen}
          options={{
            tabBarLabel: 'Bugs',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomTabNavigator;
