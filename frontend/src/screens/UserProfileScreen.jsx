import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiRequest } from '../utils/enhancedNetworkUtils';

const UserProfileScreen = ({ route, navigation }) => {
  console.log('UserProfileScreen received route.params:', route.params);
  const { userId, userName } = route.params || {};
  console.log('UserProfileScreen extracted - userId:', userId, 'userName:', userName);
  
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  
  // Points awarding state
  const [awardingPoints, setAwardingPoints] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('User ID is required to load profile');
      setLoading(false);
      return;
    }
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Load user profile and stats in parallel
      const [profileResponse, statsResponse] = await Promise.all([
        apiRequest(`/api/users/profile/${userId}`),
        apiRequest(`/api/users/stats/${userId}`)
      ]);

      console.log('📦 Profile API Response:', JSON.stringify(profileResponse, null, 2));
      console.log('📊 Stats API Response:', JSON.stringify(statsResponse, null, 2));

      if (profileResponse.success) {
        console.log('👤 Setting user profile:', profileResponse.data?.user || profileResponse.data);
        // Handle different response structures
        const userData = profileResponse.data?.user || profileResponse.data;
        setUserProfile(userData);
      }

      if (statsResponse.success) {
        console.log('📈 Setting user stats:', statsResponse.data?.stats || statsResponse.data);
        const statsData = statsResponse.data?.stats || statsResponse.data;
        setUserStats(statsData);
        setRecentActivity(statsResponse.data?.recentActivity || []);
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const openGitHubProfile = () => {
    if (userProfile?.githubProfile?.url) {
      Linking.openURL(userProfile.githubProfile.url);
    } else {
      Alert.alert('Info', 'GitHub profile not available');
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'admin-panel-settings';
      case 'manager': return 'manage-accounts';
      case 'developer': return 'code';
      case 'tester': return 'bug-report';
      case 'designer': return 'design-services';
      default: return 'person';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#E74C3C';
      case 'manager': return '#9B59B6';
      case 'developer': return '#3498DB';
      case 'tester': return '#E67E22';
      case 'designer': return '#1ABC9C';
      default: return '#95A5A6';
    }
  };

  const awardPoints = async () => {
    // Give fixed 50 points for solving a bug
    const pointsAmount = 50;
    const reason = 'Bug Resolution Reward';

    setAwardingPoints(true);
    try {
      const response = await apiRequest('/api/users/award-points', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          points: pointsAmount,
          reason: reason
        }),
      });

      if (response.success) {
        // Add a comment to the bug about the points award
        await addPointsAwardComment(pointsAmount);
        
        Alert.alert('Success', `${pointsAmount} points awarded to ${userProfile.name} for solving the bug!`);
        // Refresh user stats to show updated points
        loadUserProfile();
      } else {
        Alert.alert('Error', response.message || 'Failed to award points');
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      Alert.alert('Error', 'Failed to award points');
    } finally {
      setAwardingPoints(false);
    }
  };

  const addPointsAwardComment = async (pointsAwarded) => {
    try {
      const bugId = route.params?.bugId;
      if (!bugId) {
        console.log('No bugId available for comment');
        return;
      }

      const commentText = `🎉 @${userProfile.name} has been awarded ${pointsAwarded} points for solving this bug! Great work! 💪`;

      const response = await apiRequest(`/api/bugs/${bugId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: commentText
        }),
      });

      if (response.success) {
        console.log('Points award comment added successfully');
      } else {
        console.log('Failed to add points award comment:', response.message);
      }
    } catch (error) {
      console.error('Error adding points award comment:', error);
      // Don't show error to user since this is a secondary action
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Profile</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Profile</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color="#E74C3C" />
          <Text style={styles.errorTitle}>Profile Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Profile</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Icon name="person-off" size={80} color="#BDC3C7" />
          <Text style={styles.errorText}>User profile not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{userProfile.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={60} color="#FFF" />
              </View>
            )}
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userProfile.role) }]}>
              <Icon name={getRoleIcon(userProfile.role)} size={16} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userRole}>{userProfile.role || 'Developer'}</Text>
          
          {userProfile.company && (
            <Text style={styles.userCompany}>🏢 {userProfile.company}</Text>
          )}
          
          {userProfile.location && (
            <Text style={styles.userLocation}>📍 {userProfile.location}</Text>
          )}
        </View>

        {/* GitHub Profile */}
        {userProfile.githubProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GitHub Profile</Text>
            <TouchableOpacity style={styles.githubCard} onPress={openGitHubProfile}>
              <Icon name="code" size={24} color="#333" />
              <View style={styles.githubInfo}>
                <Text style={styles.githubUsername}>
                  @{userProfile.githubProfile.username || 'GitHub User'}
                </Text>
                <Text style={styles.githubUrl}>View on GitHub</Text>
              </View>
              <Icon name="open-in-new" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Statistics */}
        {userStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="star" size={24} color="#F39C12" />
                <Text style={styles.statNumber}>{userStats.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="bug-report" size={24} color="#E74C3C" />
                <Text style={styles.statNumber}>{userStats.bugsReported || 0}</Text>
                <Text style={styles.statLabel}>Bugs Reported</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="check-circle" size={24} color="#27AE60" />
                <Text style={styles.statNumber}>{userStats.bugsResolved || 0}</Text>
                <Text style={styles.statLabel}>Bugs Resolved</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="merge-type" size={24} color="#3498DB" />
                <Text style={styles.statNumber}>{userStats.pullRequests || 0}</Text>
                <Text style={styles.statLabel}>Pull Requests</Text>
              </View>
            </View>
          </View>
        )}

        {/* Award Points Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Award Points</Text>
          <Text style={styles.sectionSubtitle}>Recognize this user's contributions</Text>
          
          <TouchableOpacity 
            style={styles.awardPointsButton}
            onPress={awardPoints}
            disabled={awardingPoints}
          >
            <Icon name="star" size={20} color="#FFF" />
            <Text style={styles.awardPointsText}>
              {awardingPoints ? 'Awarding...' : 'Award 50 Points'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity.slice(0, 5).map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Icon 
                  name={activity.type === 'bug_reported' ? 'bug-report' : 
                        activity.type === 'bug_resolved' ? 'check-circle' : 
                        activity.type === 'pr_submitted' ? 'merge-type' : 'star'}
                  size={20} 
                  color={activity.type === 'bug_reported' ? '#E74C3C' : 
                         activity.type === 'bug_resolved' ? '#27AE60' : 
                         activity.type === 'pr_submitted' ? '#3498DB' : '#F39C12'}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.description}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bio/About */}
        {userProfile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{userProfile.bio}</Text>
          </View>
        )}

        {/* Skills */}
        {userProfile.skills && userProfile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {userProfile.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Icon name="email" size={20} color="#666" />
            <Text style={styles.contactText}>{userProfile.email}</Text>
          </View>
          
          {userProfile.phoneNumber && (
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.contactText}>{userProfile.phoneNumber}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },
  userCompany: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  githubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  githubInfo: {
    flex: 1,
    marginLeft: 12,
  },
  githubUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  githubUrl: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  bioText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#444444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  awardPointsButton: {
    backgroundColor: '#F39C12',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  awardPointsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserProfileScreen;