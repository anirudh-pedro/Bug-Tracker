import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth} = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const HomeScreen = ({ navigation, route }) => {
  const user = auth().currentUser;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState({
    username: '',
    industry: '',
    displayName: user?.displayName || 'User'
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (user?.uid) {
          const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUserProfile(prev => ({
              ...prev,
              username: parsedData.username || '',
              industry: parsedData.industry || '',
              displayName: parsedData.username || parsedData.name || user?.displayName || 'User'
            }));
          } else {
            // Fallback to Firebase user data if no AsyncStorage data
            setUserProfile(prev => ({
              ...prev,
              displayName: user?.displayName || user?.email?.split('@')[0] || 'User'
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to Firebase user data
        setUserProfile(prev => ({
          ...prev,
          displayName: user?.displayName || user?.email?.split('@')[0] || 'User'
        }));
      }
    };

    loadUserProfile();
  }, [user?.uid]);

  // Sample data for stats
  const statsData = [
    { id: '1', title: 'Bugs Resolved', count: 24, icon: 'check-circle', color: '#ff9500', bgColor: '#2d1f0a' },
    { id: '2', title: 'Bugs Reported', count: 12, icon: 'bug-report', color: '#ff9500', bgColor: '#2d1f0a' },
    { id: '3', title: 'Projects Created', count: 3, icon: 'folder', color: '#ff9500', bgColor: '#2d1f0a' },
    { id: '4', title: 'Active/Open Bugs', count: 8, icon: 'pending', color: '#ff9500', bgColor: '#2d1f0a' },
  ];

  // Sample data for trending projects
  const trendingProjects = [
    { id: '1', name: 'React E-Commerce', owner: 'john_dev', bugCount: 15, description: 'Full-stack e-commerce app', repo: 'github.com/shop/react-app' },
    { id: '2', name: 'Mobile Weather App', owner: 'weather_team', bugCount: 8, description: 'React Native weather app', repo: 'github.com/weather/mobile' },
    { id: '3', name: 'Django Blog API', owner: 'blog_devs', bugCount: 6, description: 'RESTful blog API', repo: 'github.com/blog/api' },
    { id: '4', name: 'Vue.js Dashboard', owner: 'admin_ui', bugCount: 4, description: 'Admin management panel', repo: 'github.com/admin/vue-dash' },
  ];

  // Sample data for open bugs
  const openBugs = [
    { id: '1', title: 'Authentication timeout error', project: 'React E-Commerce', priority: 'High', lastUpdated: '2h ago', status: 'open' },
    { id: '2', title: 'UI layout breaks on mobile', project: 'Mobile Weather App', priority: 'Medium', lastUpdated: '4h ago', status: 'open' },
    { id: '3', title: 'Database connection pooling', project: 'Django Blog API', priority: 'Medium', lastUpdated: '1d ago', status: 'open' },
    { id: '4', title: 'Memory leak in data processing', project: 'Vue.js Dashboard', priority: 'High', lastUpdated: '2d ago', status: 'open' },
  ];

  // Sample data for recent contributions
  const recentContributions = [
    { id: '1', title: 'Fixed login validation bug', project: 'React E-Commerce', status: 'Resolved', timestamp: '2 hours ago', type: 'fix' },
    { id: '2', title: 'Submitted PR for API rate limiting', project: 'Django Blog API', status: 'PR Submitted', timestamp: '1 day ago', type: 'pr' },
    { id: '3', title: 'Reported CSS styling issue', project: 'Mobile Weather App', status: 'Open', timestamp: '3 days ago', type: 'report' },
    { id: '4', title: 'Working on database optimization', project: 'Vue.js Dashboard', status: 'In Progress', timestamp: '5 days ago', type: 'progress' },
  ];

  // Pull to refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Stats card component
  const renderStatCard = ({ item, index }) => {
    const cardWidth = isTablet ? (screenWidth - 80) / 4 : (screenWidth - 48) / 2;
    
    return (
      <TouchableOpacity 
        style={[
          styles.statCard, 
          { 
            width: cardWidth,
            backgroundColor: item.bgColor,
            borderColor: item.color,
          }
        ]}
        onPress={() => handleStatCardPress(item)}
      >
        <View style={styles.statIconContainer}>
          <Icon name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={styles.statNumber}>{item.count}</Text>
        <Text style={styles.statLabel}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  // Trending project card component
  const renderProjectCard = ({ item }) => (
    <TouchableOpacity style={styles.projectCard} onPress={() => handleProjectPress(item)}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={styles.bugCountBadge}>
          <Text style={styles.bugCountText}>{item.bugCount} bugs</Text>
        </View>
      </View>
      <Text style={styles.projectOwner}>by {item.owner}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
      <View style={styles.projectFooter}>
        <Icon name="link" size={14} color="#ff9500" />
        <Text style={styles.repoText}>{item.repo}</Text>
      </View>
    </TouchableOpacity>
  );

  // Open bug card component
  const renderBugCard = ({ item }) => (
    <TouchableOpacity style={styles.bugCard} onPress={() => handleBugPress(item)}>
      <View style={styles.bugHeader}>
        <Text style={styles.bugTitle} numberOfLines={2}>{item.title}</Text>
        <View style={[
          styles.priorityBadge, 
          item.priority === 'High' ? styles.priorityHigh : styles.priorityMedium
        ]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      <Text style={styles.bugProject}>{item.project}</Text>
      <View style={styles.bugFooter}>
        <Text style={styles.bugTime}>{item.lastUpdated}</Text>
        <Icon name="arrow-forward" size={14} color="#888888" />
      </View>
    </TouchableOpacity>
  );

  // Recent contribution card component
  const renderContributionCard = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Resolved': return '#10b981';
        case 'PR Submitted': return '#f59e0b';
        case 'Open': return '#ff6b6b';
        case 'In Progress': return '#667eea';
        default: return '#888888';
      }
    };

    const getStatusIcon = (type) => {
      switch (type) {
        case 'fix': return 'check-circle';
        case 'pr': return 'code';
        case 'report': return 'bug-report';
        case 'progress': return 'pending';
        default: return 'circle';
      }
    };

    return (
      <TouchableOpacity style={styles.contributionCard} onPress={() => handleContributionPress(item)}>
        <View style={styles.contributionStatusIcon}>
          <Icon name={getStatusIcon(item.type)} size={16} color={getStatusColor(item.status)} />
        </View>
        <View style={styles.contributionContent}>
          <Text style={styles.contributionTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.contributionProject}>{item.project}</Text>
          <View style={styles.contributionFooter}>
            <View style={[
              styles.contributionStatus,
              { borderColor: getStatusColor(item.status) }
            ]}>
              <Text style={styles.contributionStatusText}>{item.status}</Text>
            </View>
            <Text style={styles.contributionTime}>{item.timestamp}</Text>
          </View>
        </View>
        <Icon name="arrow-forward" size={16} color="#ff9500" />
      </TouchableOpacity>
    );
  };

  // Event handlers
  const handleStatCardPress = (stat) => {
    console.log('Stat card pressed:', stat.title);
    // Navigate to relevant screens based on stat type
    if (stat.title === 'Active Bugs' || stat.title === 'Open Issues') {
      navigation.navigate('Bugs');
    } else if (stat.title === 'Projects') {
      navigation.navigate('Projects');
    } else if (stat.title === 'Points') {
      navigation.navigate('Points');
    }
  };

  const handleProjectPress = (project) => {
    console.log('Project pressed:', project.name);
    // Navigate to project bugs or details
    navigation.navigate('Bugs');
  };

  const handleBugPress = (bug) => {
    console.log('Bug pressed:', bug.title);
    // Navigate to bug details
    navigation.navigate('BugDetail', { bugId: bug.id });
  };

  const handleContributionPress = (contribution) => {
    console.log('Contribution pressed:', contribution.title);
    // Navigate to bug details or projects
    navigation.navigate('Bugs');
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Implement search logic
  };

  // Check if we should show the create project modal
  useEffect(() => {
    const checkAndShowCreateModal = async () => {
      try {
        // Check if this is a request to show the modal
        if (route?.params?.showCreateProject) {
          
          // Check if this is specifically for first-time users
          if (route?.params?.showCreateModal) {
            // This is from the "+" button - always show
            setShowCreateProjectModal(true);
          } else {
            // This is from first-time onboarding - check if already shown
            const hasShownFirstProjectModal = await AsyncStorage.getItem(`first_project_modal_${user?.uid}`);
            
            if (!hasShownFirstProjectModal) {
              setShowCreateProjectModal(true);
              // Mark that we've shown the first-time project creation modal
              await AsyncStorage.setItem(`first_project_modal_${user?.uid}`, 'shown');
            }
          }
          
          // Clear the navigation parameters to prevent showing again
          navigation.setParams({ 
            showCreateProject: undefined,
            showCreateModal: undefined 
          });
        }
      } catch (error) {
        console.error('Error checking first project modal status:', error);
      }
    };

    checkAndShowCreateModal();
  }, [route?.params, navigation, user?.uid]);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Required Field', 'Please enter a project name');
      return;
    }

    try {
      // Here you would typically save the project to your backend
      console.log('Creating project:', projectName);
      console.log('User info:', route?.params?.userInfo);
      
      // Close modal and clear state
      setShowCreateProjectModal(false);
      setProjectName('');
      
      // Show success message
      Alert.alert('Success', `Project "${projectName}" created successfully!`);
      
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    }
  };

  const closeCreateProjectModal = () => {
    setShowCreateProjectModal(false);
    setProjectName('');
  };

  const showCreateProjectModalManually = () => {
    // This function can be called when user manually wants to create a project
    // (e.g., from the "+" button in bottom navigation)
    setShowCreateProjectModal(true);
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
    navigation.navigate('ProfileSettings');
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
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff9500"
              colors={['#ff9500']}
            />
          }
        >
          <View style={styles.content}>
            {/* Header with Logo and Profile */}
            <View style={styles.topHeader}>
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoImageContainer}>
                    <View style={styles.logoPlaceholder}>
                      <Icon name="bug-report" size={24} color="#ff9500" />
                    </View>
                  </View>
                  <View style={styles.logoText}>
                    <Text style={styles.logoTitle}>BUG TRACKER</Text>
                    <Text style={styles.logoSubtitle}>SQUASH EVERY BUG</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.profileSection}>
                <TouchableOpacity 
                  style={styles.pointsButton}
                  onPress={() => navigation.navigate('Points')}
                >
                  <Icon name="emoji-events" size={20} color="#ff9500" />
                  <Text style={styles.pointsButtonText}>1280</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.profileIconContainer}
                  onPress={toggleProfileDropdown}
                >
                  {user.photoURL ? (
                    <Image source={{uri: user.photoURL}} style={styles.topProfileImage} />
                  ) : (
                    <View style={styles.topDefaultAvatar}>
                      <Text style={styles.topAvatarText}>
                        {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 
                         userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : '?'}
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
                          {userProfile.username || userProfile.displayName || 'User'}
                        </Text>
                        <Text style={styles.dropdownUserEmail}>
                          {user.email || 'No email'}
                        </Text>
                        {userProfile.industry && (
                          <Text style={styles.dropdownUserIndustry}>
                            {userProfile.industry}
                          </Text>
                        )}
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
                    Welcome back, {userProfile.username || userProfile.displayName || 'Developer'}!
                  </Text>
                  <Text style={styles.dateText}>
                    Ready to squash some bugs today?
                  </Text>
                </View>
              </View>
            </View>

            {/* 1. Stats Section (Overview Cards) */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Your Dashboard</Text>
              <FlatList
                data={statsData}
                renderItem={renderStatCard}
                keyExtractor={(item) => item.id}
                numColumns={isTablet ? 4 : 2}
                scrollEnabled={false}
                contentContainerStyle={styles.statsContainer}
                columnWrapperStyle={isTablet ? undefined : styles.statsRow}
              />
            </View>

            {/* 2. Search + Trending Section */}
            <View style={styles.searchTrendingSection}>
              <Text style={styles.sectionTitle}>Trending & Active</Text>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Icon name="search" size={20} color="#666666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search projects or bugs..."
                    placeholderTextColor="#666666"
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  <TouchableOpacity>
                    <Icon name="tune" size={20} color="#666666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trending Content */}
              <View style={[styles.trendingContent, isTablet && styles.trendingContentTablet]}>
                {/* Trending Projects */}
                <View style={[styles.trendingColumn, isTablet && styles.trendingColumnTablet]}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>🔥 Trending Projects</Text>
                  </View>
                  <FlatList
                    data={trendingProjects}
                    renderItem={renderProjectCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>

                {/* Open Bugs */}
                <View style={[styles.trendingColumn, isTablet && styles.trendingColumnTablet]}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>🚨 Open Bugs</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Bugs')}>
                      <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={openBugs}
                    renderItem={renderBugCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </View>

            {/* 3. Recent Contributions Section */}
            <View style={styles.recentContributionsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Recent Contributions</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>View all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={recentContributions}
                renderItem={renderContributionCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Create Project Modal */}
      <Modal
        visible={showCreateProjectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCreateProjectModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeCreateProjectModal}
            >
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.rocketContainer}>
              <Icon name="rocket-launch" size={40} color="#ffffff" />
            </View>

            <Text style={styles.modalTitle}>Create your first project</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.projectInput}
                placeholder="Project name"
                placeholderTextColor="#888888"
                value={projectName}
                onChangeText={setProjectName}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateProject}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    gap: 12,
  },
  pointsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333333',
    gap: 6,
  },
  pointsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff9500',
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
  dropdownUserIndustry: {
    fontSize: 10,
    color: '#ff9500',
    fontWeight: '500',
    marginTop: 2,
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  welcomeContent: {
    alignItems: 'flex-start',
  },
  userGreeting: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },

  // 1. Stats Section (Overview Cards)
  statsSection: {
    marginBottom: 32,
  },
  statsContainer: {
    paddingTop: 16,
  },
  statsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '600',
    textAlign: 'center',
  },

  // 2. Search + Trending Section
  searchTrendingSection: {
    marginBottom: 32,
  },
  searchContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '400',
  },

  // Trending Content Layout
  trendingContent: {
    flexDirection: 'column',
    gap: 24,
  },
  trendingContentTablet: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingColumn: {
    flex: 1,
  },
  trendingColumnTablet: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.1,
  },

  // Project Cards
  projectCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  projectOwner: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 6,
  },
  bugCountBadge: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bugCountText: {
    fontSize: 10,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '400',
    marginBottom: 10,
    lineHeight: 16,
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repoText: {
    fontSize: 11,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Bug Cards
  bugCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bugTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityHigh: {
    backgroundColor: '#2d1b1b',
    borderColor: '#ff4444',
  },
  priorityMedium: {
    backgroundColor: '#2d2416',
    borderColor: '#f59e0b',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
  },
  bugProject: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 10,
  },
  bugFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bugTime: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '400',
  },

  // 3. Recent Contributions Section
  recentContributionsSection: {
    marginBottom: 32,
  },
  contributionCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contributionStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributionContent: {
    flex: 1,
  },
  contributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 18,
  },
  contributionProject: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 8,
  },
  contributionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  contributionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  contributionTime: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400',
  },

  // Section Containers
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    color: '#ff6b6b',
    fontWeight: '600',
  },

  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#333333',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 350,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 5,
  },
  rocketContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  projectInput: {
    backgroundColor: '#555555',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#888888',
  },
  createButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 3,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
