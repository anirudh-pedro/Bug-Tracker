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
import {useFocusEffect} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../utils/enhancedNetworkUtils';
import Colors from '../theme/colors';

const {width: screenWidth} = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const HomeScreen = ({ navigation, route }) => {
  const app = getApp();
  const user = auth(app).currentUser;
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
          console.log('🔍 Loading user profile data on HomeScreen');
          const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUserProfile(prev => ({
              ...prev,
              username: parsedData.username || '',
              industry: parsedData.industry || '',
              displayName: parsedData.username || parsedData.name || user?.displayName || 'User'
            }));
            console.log('✅ User profile loaded successfully');
          } else {
            // Fallback to Firebase user data if no AsyncStorage data
            console.log('⚠️ No user data found in AsyncStorage, using Firebase data');
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

  // Dynamic data states
  const [statsData, setStatsData] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [openBugs, setOpenBugs] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  
  // Project management states
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectKey, setEditProjectKey] = useState('');

  // Load user-specific data from API
  const fetchUserContributions = async () => {
      try {
        // Fetch user-specific statistics
        const userStatsRes = await apiRequest('/api/users/my-stats', { method: 'GET' });
        if (userStatsRes.success && userStatsRes.data) {
          const userStats = userStatsRes.data.stats;
          setStatsData([
            { id: '1', title: 'Bugs Resolved', count: userStats.bugsResolved || 0, icon: 'check-circle', gradient: Colors.gradients.emerald, iconBg: 'rgba(16, 185, 129, 0.15)' },
            { id: '2', title: 'Bugs Reported', count: userStats.bugsReported || 0, icon: 'bug-report', gradient: Colors.gradients.amber, iconBg: 'rgba(245, 158, 11, 0.15)' },
            { id: '3', title: 'Projects', count: userStats.projectsCreated || 0, icon: 'folder', gradient: Colors.gradients.blue, iconBg: 'rgba(59, 130, 246, 0.15)' },
          ]);
          setUserPoints(userStats.totalPoints || 0);
          
          // Set recent contributions from user data
          setRecentContributions((userStatsRes.data.recentActivity || []).map((activity, idx) => ({
            id: `${activity.type}-${activity.createdAt || Date.now()}-${idx}`,
            title: activity.description,
            project: activity.project || '',
            status: activity.type === 'bug_resolved' ? 'Resolved' : activity.type === 'pr_submitted' ? 'PR Submitted' : 'Open',
            timestamp: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '',
            type: activity.type,
          })));
        }

        // Fetch user-specific projects and global dashboard data
        const [projectsRes, dashboardRes] = await Promise.all([
          apiRequest('/api/projects', { method: 'GET' }),
          apiRequest('/api/dashboard', { method: 'GET' })
        ]);

        // Set user's own projects instead of global trending projects
        if (projectsRes.success && projectsRes.data) {
          setTrendingProjects((projectsRes.data.projects || []).map((proj, idx) => ({
            id: proj._id || `project-${idx}-${Date.now()}`,
            name: proj.name,
            owner: proj.owner?.name || 'Unknown',
            bugCount: proj.stats?.totalBugs || 0,
            description: proj.description || '',
            repo: proj.repository?.url || '',
          })));
        }

        // Get global recent bugs (or we could make this user-specific too)
        if (dashboardRes.success && dashboardRes.data) {
          // Open bugs
          setOpenBugs((dashboardRes.data.recentBugs || []).map((bug, idx) => ({
            id: bug._id || `bug-${idx}-${Date.now()}`,
            title: bug.title,
            project: bug.project?.name || '',
            priority: bug.priority || 'Medium',
            lastUpdated: bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString() : '',
            status: bug.status,
          })));
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    };

  // Load data on component mount
  useEffect(() => {
    fetchUserContributions();
  }, []);

  // Refresh data when screen comes into focus (after navigating back)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 HomeScreen focused - refreshing data');
      fetchUserContributions();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserContributions();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Stats card component with modern gradient design
  const renderStatCard = ({ item, index }) => {
    const cardWidth = (screenWidth - 48) / 3; // 3 cards in a row with gaps
    const isBugsReported = item.title === 'Bugs Reported';
    
    return (
      <TouchableOpacity 
        style={[
          styles.modernStatCard, 
          { 
            width: cardWidth,
            marginRight: (index < 2) ? 8 : 0, // Small gap between cards
          }
        ]}
        onPress={() => handleStatCardPress(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[
            item.gradient[0] + '40', // Add transparency (25% opacity)
            item.gradient[1] + '40'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <View style={styles.modernStatContent}>
            <View style={[styles.modernStatIconContainer, { backgroundColor: item.iconBg }]}>
              <Icon name={item.icon} size={24} color={Colors.text.primary} />
            </View>
            <View style={styles.modernStatTextContainer}>
              <Text style={styles.modernStatNumber}>
                {item.count}
              </Text>
              <Text style={styles.modernStatLabel}>{item.title}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Your project card component
  const renderProjectCard = ({ item }) => (
    <View style={styles.projectCard}>
      <TouchableOpacity 
        style={styles.projectContent} 
        onPress={() => handleProjectPress(item)}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{item.name}</Text>
          <View style={styles.projectHeaderRight}>
            <View style={styles.bugCountBadge}>
              <Text style={styles.bugCountText}>{item.bugCount} bugs</Text>
            </View>
            <TouchableOpacity 
              style={styles.projectMenuButton}
              onPress={() => handleProjectMenuPress(item)}
            >
              <Icon name="more-vert" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.projectOwner}>by {item.owner}</Text>
        <Text style={styles.projectDescription}>{item.description}</Text>
        <View style={styles.projectFooter}>
          <Icon name="link" size={14} color={Colors.primary.main} />
          <Text style={styles.repoText}>{item.repo}</Text>
        </View>
      </TouchableOpacity>
    </View>
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
        <Icon name="arrow-forward" size={14} color={Colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  // Recent contribution card component
  const renderContributionCard = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return Colors.status.success;
      case 'PR Submitted': return Colors.status.warning;
      case 'Open': return Colors.status.error;
      case 'In Progress': return Colors.status.warning;
      default: return Colors.text.tertiary;
    }
  };    const getStatusIcon = (type) => {
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
        <Icon name="arrow-forward" size={16} color={Colors.primary.main} />
      </TouchableOpacity>
    );
  };

  // Event handlers
  const handleStatCardPress = (stat) => {
    console.log('Stat card pressed:', stat.title);
    // Navigate to relevant screens based on stat type
    if (stat.title === 'Bugs Reported' || stat.title === 'Active Bugs' || stat.title === 'Open Issues' || stat.title === 'Bugs Resolved') {
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
      // Simple project creation - navigate to dedicated screen for full details
      navigation.navigate('CreateProject');
      setShowCreateProjectModal(false);
      setProjectName('');
      
    } catch (error) {
      console.error('Error navigating to create project:', error);
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
      await auth(app).signOut();
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
      await auth(app).signOut();
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

  // Project management handlers
  const handleProjectMenuPress = (project) => {
    setSelectedProject(project);
    setShowProjectMenu(true);
  };

  const handleEditProject = () => {
    setEditProjectName(selectedProject.name);
    setEditProjectDescription(selectedProject.description);
    setEditProjectKey(selectedProject.key);
    setShowProjectMenu(false);
    setShowEditProjectModal(true);
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${selectedProject.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await apiRequest(`/api/projects/${selectedProject.id}`, {
                method: 'DELETE'
              });
              
              if (response.success) {
                Alert.alert('Success', 'Project deleted successfully');
                // Refresh the projects list
                onRefresh();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete project');
              }
            } catch (error) {
              console.error('Delete project error:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
            setShowProjectMenu(false);
          }
        }
      ]
    );
  };

  const handleUpdateProject = async () => {
    if (!editProjectName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    try {
      const response = await apiRequest(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editProjectName.trim(),
          description: editProjectDescription.trim(),
          key: editProjectKey.trim().toUpperCase()
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Project updated successfully');
        // Refresh the projects list
        onRefresh();
        setShowEditProjectModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Update project error:', error);
      Alert.alert('Error', 'Failed to update project');
    }
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
              tintColor={Colors.primary.main}
              colors={[Colors.primary.main]}
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
                      <Icon name="bug-report" size={24} color={Colors.primary.main} />
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
                  <Icon name="emoji-events" size={20} color={Colors.primary.main} />
                  <Text style={styles.pointsButtonText}>{userPoints.toLocaleString()}</Text>
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
                    <Icon name="person" size={12} color={Colors.text.primary} />
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
                        <Icon name="person" size={20} color={Colors.text.tertiary} />
                        <Text style={styles.dropdownItemText}>Profile Settings</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={handleAppSettings}
                        activeOpacity={0.7}
                      >
                        <Icon name="settings" size={20} color={Colors.text.tertiary} />
                        <Text style={styles.dropdownItemText}>App Settings</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={handleHelpSupport}
                        activeOpacity={0.7}
                      >
                        <Icon name="help" size={20} color={Colors.text.tertiary} />
                        <Text style={styles.dropdownItemText}>Help & Support</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.dropdownDivider} />
                      
                      <TouchableOpacity 
                        style={[styles.dropdownItem, styles.logoutItem]} 
                        onPress={confirmSignOut}
                        activeOpacity={0.7}
                      >
                        <Icon name="logout" size={20} color={Colors.status.error} />
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
                data={statsData || []}
                renderItem={renderStatCard}
                keyExtractor={(item, index) => item?.id || `stat-${index}`}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.statsContainer}
                columnWrapperStyle={styles.statsRow}
              />
            </View>

            {/* 2. Search + Trending Section */}
            <View style={styles.searchTrendingSection}>
              <Text style={styles.sectionTitle}>Trending & Active</Text>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Icon name="search" size={20} color={Colors.text.muted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search projects or bugs..."
                    placeholderTextColor={Colors.text.muted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  <TouchableOpacity>
                    <Icon name="tune" size={20} color={Colors.text.muted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trending Content */}
              <View style={[styles.trendingContent, isTablet && styles.trendingContentTablet]}>
                {/* Trending Projects */}
                <View style={[styles.trendingColumn, isTablet && styles.trendingColumnTablet]}>
                  <View style={styles.columnHeader}>
                    <Text style={styles.columnTitle}>� Your Projects</Text>
                  </View>
                  <FlatList
                    data={trendingProjects || []}
                    renderItem={renderProjectCard}
                    keyExtractor={(item, index) => item?.id || `project-${index}`}
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
                    data={openBugs || []}
                    renderItem={renderBugCard}
                    keyExtractor={(item, index) => item?.id || `bug-${index}`}
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
                data={recentContributions || []}
                renderItem={renderContributionCard}
                keyExtractor={(item, index) => item?.id || `contribution-${index}`}
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
              <Icon name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.rocketContainer}>
              <Icon name="rocket-launch" size={40} color={Colors.text.primary} />
            </View>

            <Text style={styles.modalTitle}>Create your first project</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.projectInput}
                placeholder="Project name"
                placeholderTextColor={Colors.text.tertiary}
                value={projectName}
                onChangeText={setProjectName}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateProject}
            >
              <Text style={styles.createButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Project Menu Modal */}
      <Modal
        visible={showProjectMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProjectMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProjectMenu(false)}
        >
          <View style={styles.projectMenuContainer}>
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={handleEditProject}
            >
              <Icon name="edit" size={20} color={Colors.primary.main} />
              <Text style={styles.menuOptionText}>Edit Project</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuOption, styles.deleteOption]}
              onPress={handleDeleteProject}
            >
              <Icon name="delete" size={20} color={Colors.status.error} />
              <Text style={[styles.menuOptionText, styles.deleteOptionText]}>Delete Project</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        visible={showEditProjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Project</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEditProjectModal(false)}
              >
                <Icon name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.editFormContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Project Name</Text>
                <TextInput
                  style={styles.projectInput}
                  placeholder="Enter project name"
                  placeholderTextColor={Colors.text.tertiary}
                  value={editProjectName}
                  onChangeText={setEditProjectName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Project Key</Text>
                <TextInput
                  style={styles.projectInput}
                  placeholder="Enter project key (e.g., PROJ)"
                  placeholderTextColor={Colors.text.tertiary}
                  value={editProjectKey}
                  onChangeText={setEditProjectKey}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.projectInput, styles.textArea]}
                  placeholder="Enter project description"
                  placeholderTextColor={Colors.text.tertiary}
                  value={editProjectDescription}
                  onChangeText={setEditProjectDescription}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity 
                style={styles.updateButton}
                onPress={handleUpdateProject}
              >
                <Text style={styles.updateButtonText}>Update Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 95, // Padding for the absolute positioned bottom tab bar
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
    borderBottomColor: Colors.border.light,
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
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  logoSubtitle: {
    fontSize: 10,
    color: Colors.text.muted,
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
    backgroundColor: Colors.background.secondary,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 6,
  },
  pointsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  profileIconContainer: {
    position: 'relative',
  },
  topProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  topDefaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  topAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
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
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingVertical: 4,
    zIndex: 999,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: 4,
  },
  dropdownUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dropdownUserEmail: {
    fontSize: 11,
    color: Colors.text.muted,
    fontWeight: '400',
  },
  dropdownUserIndustry: {
    fontSize: 10,
    color: Colors.primary.main,
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
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 4,
  },
  logoutItem: {
    marginTop: 0,
  },
  logoutText: {
    color: Colors.status.error,
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
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text.muted,
    fontWeight: '500',
  },

  // 1. Stats Section (Overview Cards)
  statsSection: {
    marginBottom: 32,
  },
  statsContainer: {
    paddingTop: 12,
  },
  statsRow: {
    justifyContent: 'flex-start',
  },
  statCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    // Shadow for depth
    shadowColor: Colors.background.primary,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Modern gradient stat cards
  modernStatCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: Colors.background.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  statGradient: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Transparent background
  },
  modernStatContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.background.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modernStatTextContainer: {
    alignItems: 'center',
  },
  modernStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernStatLabel: {
    fontSize: 10,
    color: Colors.text.primary,
    fontWeight: '600',
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 13,
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
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
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
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },

  // Project Cards
  projectCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  projectOwner: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 6,
  },
  bugCountBadge: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  bugCountText: {
    fontSize: 10,
    color: Colors.status.error,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 12,
    color: Colors.text.tertiary,
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
    color: Colors.status.info,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Bug Cards
  bugCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    color: Colors.text.primary,
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
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderColor: Colors.status.error,
  },
  priorityMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.status.warning,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  bugProject: {
    fontSize: 11,
    color: Colors.text.tertiary,
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
    color: Colors.text.muted,
    fontWeight: '400',
  },

  // 3. Recent Contributions Section
  recentContributionsSection: {
    marginBottom: 32,
  },
  contributionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contributionStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.card,
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
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  contributionProject: {
    fontSize: 12,
    color: Colors.text.tertiary,
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
    color: Colors.text.primary,
  },
  contributionTime: {
    fontSize: 11,
    color: Colors.text.muted,
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
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.status.error,
    fontWeight: '600',
  },

  errorText: {
    fontSize: 16,
    color: Colors.status.error,
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
    backgroundColor: Colors.border.light,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 350,
    elevation: 10,
    shadowColor: Colors.background.primary,
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
    backgroundColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 5,
  },
  rocketContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  projectInput: {
    backgroundColor: Colors.border.dark,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.text.tertiary,
  },
  createButton: {
    backgroundColor: Colors.status.error,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 3,
    shadowColor: Colors.status.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Project card enhancements
  projectContent: {
    flex: 1,
  },
  projectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectMenuButton: {
    padding: 4,
    borderRadius: 4,
  },
  
  // Project menu modal styles
  projectMenuContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    position: 'absolute',
    top: 100,
    right: 20,
    elevation: 10,
    shadowColor: Colors.background.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuOptionText: {
    color: Colors.text.primary,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    marginTop: 4,
  },
  deleteOptionText: {
    color: Colors.status.error,
  },
  
  // Edit project modal styles
  editModalContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: Colors.background.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  editFormContainer: {
    padding: 20,
  },
  inputLabel: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  updateButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
