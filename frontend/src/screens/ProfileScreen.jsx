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
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [userProfile, setUserProfile] = useState({
    username: '',
    name: '',
    industry: '',
    phoneNumber: '',
    role: ''
  });

  // Load user profile data from AsyncStorage
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (user?.uid) {
          const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUserProfile({
              username: parsedData.username || '',
              name: parsedData.name || user.displayName || '',
              industry: parsedData.industry || '',
              phoneNumber: parsedData.phoneNumber || '',
              role: parsedData.role || 'developer'
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  const signOut = async () => {
    try {
      // Clear stored user data from AsyncStorage
      try {
        // For complete sign-out, let's clear ALL AsyncStorage data
        // This ensures the next login is treated as a completely new user
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('🔍 Found keys to clear:', allKeys.length);
          
          if (allKeys.length > 0) {
            await AsyncStorage.multiRemove(allKeys);
            console.log('🗑️ Cleared ALL AsyncStorage data for fresh start');
          }
        } catch (clearError) {
          console.error('Error clearing all storage:', clearError);
          
          // Fallback to just clearing user data
          const currentUser = auth().currentUser;
          if (currentUser) {
            await AsyncStorage.removeItem(`user_data_${currentUser.uid}`);
            console.log('🗑️ Cleared stored user data');
          }
        }
      } catch (storageError) {
        console.log('Storage clear error:', storageError.message);
      }
      
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

  // Check if profile is incomplete
  const hasIncompleteProfile = () => {
    const missingFields = [];
    
    if (!userProfile.username || userProfile.username.trim() === '') {
      missingFields.push('username');
    }
    
    if (!userProfile.industry || userProfile.industry === 'Select') {
      missingFields.push('industry');
    }
    
    if (!userProfile.phoneNumber || userProfile.phoneNumber.trim() === '') {
      missingFields.push('phone number');
    }
    
    // Store missing fields for UI display
    setMissingFields(missingFields);
    
    // If any required fields are missing, return true (profile is incomplete)
    return missingFields.length > 0;
  };

  // State to track missing fields
  const [missingFields, setMissingFields] = useState([]);

  // Navigate to complete profile
  const navigateToCompleteProfile = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser?.uid) {
        // Mark the user as needing to complete their profile
        if (global.forceProfileCompletion) {
          await global.forceProfileCompletion(currentUser.uid);
          
          Alert.alert(
            'Profile Update Required',
            'You will now be redirected to complete your profile information.',
            [
              { 
                text: 'Continue', 
                onPress: () => navigation.navigate('GetStarted')
              }
            ]
          );
        } else {
          // Fallback if global function isn't available
          navigation.navigate('GetStarted');
        }
      } else {
        Alert.alert('Error', 'Could not identify your user account. Please sign out and sign in again.');
      }
    } catch (error) {
      console.error('Error navigating to profile completion:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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

            {userProfile.industry && (
              <Text style={styles.userIndustry}>
                {userProfile.industry}
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

          {/* Complete Profile Button - Show only if profile is incomplete */}
          {hasIncompleteProfile() && (
            <View style={styles.completeProfileContainer}>
              <TouchableOpacity 
                style={styles.completeProfileButton} 
                onPress={navigateToCompleteProfile}
              >
                <Icon name="edit" size={24} color="#3b82f6" />
                <Text style={styles.completeProfileButtonText}>Complete Your Profile</Text>
              </TouchableOpacity>
              <Text style={styles.incompleteProfileText}>
                Your profile is incomplete. Missing information:
              </Text>
              <View style={styles.missingFieldsList}>
                {missingFields.map((field, index) => (
                  <View key={index} style={styles.missingField}>
                    <Icon name="error-outline" size={16} color="#f59e0b" />
                    <Text style={styles.missingFieldText}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
  completeProfileContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  completeProfileButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 12,
    marginBottom: 12,
  },
  completeProfileButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  incompleteProfileText: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  missingFieldsList: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  missingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missingFieldText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
