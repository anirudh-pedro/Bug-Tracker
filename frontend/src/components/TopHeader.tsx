import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors, getThemeColors } from '../constants/colors';
import { Strings } from '../constants/strings';

interface TopHeaderProps {
  title?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ title = Strings.appName }) => {
  const { user, logout } = useAuth();
  const isDarkMode = true; // Force dark theme
  const themeColors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfilePress = () => {
    // For now, show an alert - you can expand this to show a profile menu
    // The logout functionality will be handled through the navigation
    alert('Profile menu coming soon!');
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: themeColors.surface,
        paddingTop: insets.top + 8, // Add safe area top padding
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {title}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: Colors.primary }]}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          <Text style={styles.profileInitials}>
            {user ? getInitials(user.name) : 'U'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TopHeader;
