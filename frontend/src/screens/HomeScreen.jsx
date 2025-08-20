import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const user = auth().currentUser;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      setShowProfileDropdown(false);
      
      // Check if user is signed in with Google
      const isGoogleSignedIn = await GoogleSignin.isSignedIn();
      console.log('Google signed in status:', isGoogleSignedIn);
      
      if (isGoogleSignedIn) {
        console.log('Signing out from Google...');
        await GoogleSignin.signOut();
        console.log('Google sign out successful');
      }
      
      console.log('Signing out from Firebase...');
      await auth().signOut();
      console.log('Firebase sign out successful');
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      Alert.alert('Error', `Failed to sign out: ${error.message}. Please try again.`);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Sign Out', style: 'destructive', onPress: signOut},
        {text: 'Force Sign Out', style: 'destructive', onPress: forceSignOut},
      ],
    );
  };

  const forceSignOut = async () => {
    try {
      console.log('Force signing out...');
      setShowProfileDropdown(false);
      // Just sign out from Firebase - this should be enough to return to login
      await auth().signOut();
      console.log('Force sign out successful');
    } catch (error) {
      console.error('Force sign-out error:', error);
      Alert.alert('Error', `Force sign out failed: ${error.message}`);
    }
  };

  const handleProfileSettings = () => {
    console.log('Profile Settings clicked');
    setShowProfileDropdown(false);
    Alert.alert('Profile Settings', 'Profile settings will be implemented soon!');
  };

  const handleAppSettings = () => {
    console.log('App Settings clicked');
    setShowProfileDropdown(false);
    Alert.alert('App Settings', 'App settings will be implemented soon!');
  };

  const handleHelpSupport = () => {
    console.log('Help Support clicked');
    setShowProfileDropdown(false);
    Alert.alert('Help & Support', 'Help documentation will be available soon!');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Text style={styles.errorText}>No user data available</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header with Logo and Profile */}
            <View style={styles.topHeader}>
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoImageContainer}>
                    {/* Replace this with actual logo image once added to assets */}
                    <View style={styles.logoPlaceholder}>
                      <Icon name="bug-report" size={24} color="#667eea" />
                    </View>
                    {/* Uncomment this line when you add the actual logo image:
                    <Image 
                      source={require('../../assets/images/bug-tracker-logo.png')} 
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                    */}
                  </View>
                  <View style={styles.logoText}>
                    <Text style={styles.logoTitle}>BUG TRACKER</Text>
                    <Text style={styles.logoSubtitle}>SQUASH EVERY BUG</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.profileSection}>
                <TouchableOpacity 
                  style={styles.profileIconContainer}
                  onPress={toggleProfileDropdown}
                >
                  {user.photoURL ? (
                    <Image source={{uri: user.photoURL}} style={styles.topProfileImage} />
                  ) : (
                    <View style={styles.topDefaultAvatar}>
                      <Text style={styles.topAvatarText}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.profileBadge}>
                    <Icon name="person" size={12} color="#ffffff" />
                  </View>
                </TouchableOpacity>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity 
                      style={styles.dropdownBackdrop}
                      activeOpacity={1}
                      onPress={() => setShowProfileDropdown(false)}
                    />
                    <View style={styles.dropdownContent}>
                      <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownUserName}>
                          {user.displayName || 'User'}
                        </Text>
                        <Text style={styles.dropdownUserEmail}>
                          {user.email || 'No email'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={handleProfileSettings}
                        activeOpacity={0.7}
                      >
                        <Icon name="person" size={20} color="#a0a0a0" />
                        <Text style={styles.dropdownItemText}>Profile Settings</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={handleAppSettings}
                        activeOpacity={0.7}
                      >
                        <Icon name="settings" size={20} color="#a0a0a0" />
                        <Text style={styles.dropdownItemText}>App Settings</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={handleHelpSupport}
                        activeOpacity={0.7}
                      >
                        <Icon name="help" size={20} color="#a0a0a0" />
                        <Text style={styles.dropdownItemText}>Help & Support</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.dropdownDivider} />
                      
                      <TouchableOpacity 
                        style={[styles.dropdownItem, styles.logoutItem]} 
                        onPress={confirmSignOut}
                        activeOpacity={0.7}
                      >
                        <Icon name="logout" size={20} color="#ef4444" />
                        <Text style={[styles.dropdownItemText, styles.logoutText]}>
                          Sign Out
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Welcome Header */}
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeContent}>
                <View style={styles.userGreeting}>
                  <Text style={styles.welcomeText}>
                    Welcome back, {user.displayName || 'User'}!
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Icon name="bug-report" size={28} color="#667eea" />
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Total Bugs</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="pending" size={28} color="#f59e0b" />
                  <Text style={styles.statNumber}>8</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Icon name="check-circle" size={28} color="#10b981" />
                  <Text style={styles.statNumber}>16</Text>
                  <Text style={styles.statLabel}>Resolved</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="priority-high" size={28} color="#ef4444" />
                  <Text style={styles.statNumber}>3</Text>
                  <Text style={styles.statLabel}>High Priority</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activityContainer}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon name="check-circle" size={16} color="#10b981" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Bug #101 resolved by John Doe</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon name="add" size={16} color="#667eea" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>New bug #125 reported by Sarah Smith</Text>
                    <Text style={styles.activityTime}>4 hours ago</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon name="assignment" size={16} color="#f59e0b" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>Bug #98 assigned to you</Text>
                    <Text style={styles.activityTime}>1 day ago</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Active Projects */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Projects</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.projectsContainer}>
                <View style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>Mobile App</Text>
                    <View style={styles.bugCount}>
                      <Text style={styles.bugCountText}>5 bugs</Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>React Native bug tracker app</Text>
                </View>
                <View style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>Web Dashboard</Text>
                    <View style={styles.bugCount}>
                      <Text style={styles.bugCountText}>3 bugs</Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>Admin panel for bug management</Text>
                </View>
              </View>
            </View>

            {/* Assigned to Me */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Assigned to Me</Text>
                <View style={styles.assignedBadge}>
                  <Text style={styles.assignedBadgeText}>4</Text>
                </View>
              </View>
              <View style={styles.assignedContainer}>
                <View style={styles.assignedItem}>
                  <View style={styles.assignedContent}>
                    <Text style={styles.assignedTitle}>Login authentication issue</Text>
                    <Text style={styles.assignedId}>#98</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>
                <View style={styles.assignedItem}>
                  <View style={styles.assignedContent}>
                    <Text style={styles.assignedTitle}>UI layout broken on mobile</Text>
                    <Text style={styles.assignedId}>#112</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusInProgress]}>
                    <Text style={styles.statusText}>In Progress</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="add" size={24} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Report Bug</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="search" size={24} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Search Bugs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="bar-chart" size={24} color="#ffffff" />
                  <Text style={styles.actionButtonText}>View Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="folder" size={24} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Projects</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.notificationsContainer}>
              <View style={styles.notificationItem}>
                <Icon name="warning" size={20} color="#f59e0b" />
                <Text style={styles.notificationText}>
                  2 overdue bugs require attention
                </Text>
              </View>
              <View style={styles.notificationItem}>
                <Icon name="notification-important" size={20} color="#667eea" />
                <Text style={styles.notificationText}>
                  1 new bug assigned to you
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  
  // Top Header with Logo and Profile
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  logoSection: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImageContainer: {
    marginRight: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  profileSection: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  profileIconContainer: {
    position: 'relative',
  },
  topProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333333',
  },
  topDefaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  topAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ff00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  
  // Dropdown Styles
  dropdownContainer: {
    position: 'absolute',
    top: 42,
    right: 0,
    zIndex: 999,
    minWidth: 200,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -50,
    left: -1000,
    right: -50,
    bottom: -1000,
    zIndex: 998,
  },
  dropdownContent: {
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222222',
    paddingVertical: 4,
    zIndex: 999,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    marginBottom: 4,
  },
  dropdownUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  dropdownUserEmail: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#222222',
    marginVertical: 4,
  },
  logoutItem: {
    marginTop: 0,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  
  // Welcome Header
  welcomeHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  welcomeContent: {
    alignItems: 'flex-start',
  },
  userGreeting: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },

  // Stats Cards
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section Containers
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  seeAllText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },

  // Recent Activity
  activityContainer: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '400',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400',
  },

  // Active Projects
  projectsContainer: {
    gap: 8,
  },
  projectCard: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222222',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  bugCount: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bugCountText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },

  // Assigned to Me
  assignedBadge: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  assignedBadgeText: {
    fontSize: 10,
    color: '#ff4444',
    fontWeight: '600',
  },
  assignedContainer: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 8,
  },
  assignedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  assignedContent: {
    flex: 1,
    marginRight: 10,
  },
  assignedTitle: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 2,
  },
  assignedId: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: '#222222',
    borderColor: '#333333',
  },
  statusInProgress: {
    backgroundColor: '#222222',
    borderColor: '#333333',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#888888',
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: '#222222',
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.1,
  },

  // Notifications
  notificationsContainer: {
    gap: 8,
  },
  notificationItem: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  notificationText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '400',
    marginLeft: 10,
    flex: 1,
  },

  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },
});

export default HomeScreen;