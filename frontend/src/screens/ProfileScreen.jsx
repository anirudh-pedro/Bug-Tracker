import React from 'react';
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

const ProfileScreen = () => {
  const user = auth().currentUser;

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
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>

            <Text style={styles.userName}>
              {user.displayName || 'No name available'}
            </Text>
            <Text style={styles.userEmail}>
              {user.email || 'No email available'}
            </Text>

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
    marginBottom: 16,
    textAlign: 'center',
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
});

export default ProfileScreen;
