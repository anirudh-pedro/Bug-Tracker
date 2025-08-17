/**
 * Bug Tracker Mobile App
 * A React Native application for tracking and managing software bugs
 *
 * @format
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/config/firebase'; // Initialize Firebase
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useBugStore } from './src/store/bugStore';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Loader } from './src/components';
import { Bug } from './src/types/Bug';
import { getThemeColors } from './src/constants/colors';

// Main App Component (after authentication)
const MainApp: React.FC = () => {
  const { loadBugs } = useBugStore();
  const isDarkMode = useColorScheme() === 'dark';
  const themeColors = getThemeColors(isDarkMode);

  // Load bugs on app start
  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  return (
    <BottomTabNavigator />
  );
};

// Authentication wrapper
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [_showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return <Loader text="Loading..." />;
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onNavigateToRegister={() => setShowRegister(true)}
      />
    );
  }

  return <MainApp />;
};

// Root App Component
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
