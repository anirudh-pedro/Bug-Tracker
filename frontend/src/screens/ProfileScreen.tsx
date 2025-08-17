import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, getThemeColors } from '../constants/colors';
import TopHeader from '../components/TopHeader';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const isDarkMode = true; // Force dark theme
  const themeColors = getThemeColors(isDarkMode);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Change password functionality coming soon!');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader title="Profile" />
      
      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>
                {user && user.name 
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                  : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: themeColors.text }]}>
                {user?.name || 'User Name'}
              </Text>
              <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Actions */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Edit Profile
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Change Password
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: Colors.danger }]}>
              Logout
            </Text>
            <Text style={[styles.menuChevron, { color: Colors.danger }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
  },
  menuChevron: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default ProfileScreen;
