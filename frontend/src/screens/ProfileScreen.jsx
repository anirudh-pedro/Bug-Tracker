import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../utils/enhancedNetworkUtils';

const ProfileScreen = ({ navigation }) => {
  const user = auth().currentUser;
  const [userProfile, setUserProfile] = useState({
    username: '',
    name: '',
    industry: '',
    githubUrl: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);

  // Load user profile data from both AsyncStorage and API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        if (user?.uid) {
          // First try to load from AsyncStorage for quick display
          const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUserProfile({
              username: parsedData.username || '',
              name: parsedData.name || user.displayName || '',
              industry: parsedData.industry || '',
              githubUrl: parsedData.githubUrl || '',
              role: parsedData.role || 'developer'
            });
          }

          // Then fetch fresh data from API
          try {
            const response = await apiRequest('/api/users/profile', {
              method: 'GET'
            });
            
            if (response.success && response.data) {
              const profileData = {
                username: response.data.username || '',
                name: response.data.name || user.displayName || '',
                industry: response.data.industry || '',
                githubUrl: response.data.githubUrl || '',
                role: response.data.role || 'developer'
              };
              setUserProfile(profileData);
              
              // Update AsyncStorage with fresh data
              await AsyncStorage.setItem(`user_data_${user.uid}`, JSON.stringify(profileData));
            }
          } catch (apiError) {
            console.log('API profile fetch failed, using cached data:', apiError);
            // Continue with AsyncStorage data if API fails
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Sign Out', style: 'destructive', onPress: signOut},
      ],
    );
  };

  const menuItems = [
    {id: 1, title: 'Account Settings', icon: 'settings', onPress: () => {}},
    {id: 2, title: 'Notifications', icon: 'notifications', onPress: () => {}},
    {id: 3, title: 'Privacy Policy', icon: 'privacy-tip', onPress: () => {}},
    {id: 4, title: 'Help & Support', icon: 'help', onPress: () => {}},
    {id: 5, title: 'About', icon: 'info', onPress: () => {}},
  ];

  if (!user) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Text style={styles.errorText}>No user data available</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              {user.photoURL ? (
                <Image source={{uri: user.photoURL}} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 
                     userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 
                     user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>

            <Text style={styles.userName}>
              {userProfile.username || userProfile.name || user.displayName || 'No name available'}
            </Text>
            <Text style={styles.userEmail}>
              {user.email || 'No email available'}
            </Text>

            {userProfile.githubUrl && (
              <TouchableOpacity 
                style={styles.githubLinkContainer}
                onPress={() => {
                  // You could open the GitHub URL here if needed
                  console.log('GitHub URL:', userProfile.githubUrl);
                }}
              >
                <Icon name="link" size={16} color="#ff9500" />
                <Text style={styles.userGithub}>
                  {userProfile.githubUrl}
                </Text>
              </TouchableOpacity>
            )}

            {userProfile.industry && (
              <Text style={styles.userIndustry}>
                🏢 {userProfile.industry}
              </Text>
            )}

            {userProfile.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </Text>
              </View>
            )}

            <View style={styles.verificationBadge}>
              <Icon 
                name={user.emailVerified ? 'verified' : 'error'} 
                size={20} 
                color={user.emailVerified ? '#10b981' : '#ef4444'} 
              />
              <Text style={[
                styles.verificationText,
                {color: user.emailVerified ? '#10b981' : '#ef4444'}
              ]}>
                {user.emailVerified ? 'Verified Account' : 'Unverified Account'}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <Icon name="edit" size={20} color="#ff9500" />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* User Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Account Information</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Member since</Text>
              <Text style={styles.statValue}>
                {user.metadata.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'
                }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Last sign in</Text>
              <Text style={styles.statValue}>
                {user.metadata.lastSignInTime 
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : 'Unknown'
                }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>User ID</Text>
              <Text style={styles.statValue}>
                {user.uid.substring(0, 8)}...
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <Icon name={item.icon} size={24} color="#a0a0a0" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#a0a0a0" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity style={styles.signOutButton} onPress={confirmSignOut}>
              <Icon name="logout" size={24} color="#ef4444" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333333',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333333',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 8,
    textAlign: 'center',
  },
  userIndustry: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  signOutContainer: {
    marginBottom: 100, // Extra padding for bottom tab bar
  },
  signOutButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ef4444',
    gap: 12,
  },
  signOutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  githubLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: '#ff9500',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  userGithub: {
    fontSize: 12,
    color: '#ff9500',
    marginLeft: 6,
    fontWeight: '500',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: '#ff9500',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  editProfileButtonText: {
    color: '#ff9500',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
});

export default ProfileScreen;
