import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';
import auth from '@react-native-firebase/auth';
import Colors from '../theme/colors';

const {width: screenWidth} = Dimensions.get('window');

const PointsScreen = ({navigation}) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const user = auth().currentUser;

  // Load leaderboard data from API
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const response = await apiRequest('/api/users/leaderboard', {
        method: 'GET'
      });

      if (response.success && response.data) {
        setLeaderboardData(response.data.leaderboard || []);
        setCurrentUser(response.data.currentUser);
        
        // If current user not in top list, add them
        if (!response.data.currentUser && response.data.currentUserRank) {
          // Get current user data and add to list
          const currentUserData = await getCurrentUserData();
          if (currentUserData) {
            currentUserData.rank = response.data.currentUserRank;
            setCurrentUser(currentUserData);
          }
        }
      } else {
        setError(response.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentUserData = async () => {
    try {
      if (!user?.uid) return null;
      
      const response = await apiRequest(`/api/users/stats/${user.uid}`, {
        method: 'GET'
      });

      if (response.success && response.data) {
        const stats = response.data.stats;
        const nameWords = user.displayName?.split(' ') || ['User'];
        const avatar = nameWords.length > 1 
          ? nameWords[0].charAt(0) + nameWords[1].charAt(0)
          : nameWords[0].charAt(0) + (nameWords[0].charAt(1) || 'U');

        let badge = 'Newcomer';
        if (stats.totalPoints >= 5000) badge = 'Legend';
        else if (stats.totalPoints >= 3000) badge = 'Master';
        else if (stats.totalPoints >= 2000) badge = 'Expert';
        else if (stats.totalPoints >= 1000) badge = 'Advanced';
        else if (stats.totalPoints >= 500) badge = 'Intermediate';
        else if (stats.totalPoints >= 100) badge = 'Beginner';

        return {
          id: user.uid,
          name: user.displayName || 'Current User',
          avatar: avatar.toUpperCase(),
          color: '#ff9500',
          points: stats.totalPoints,
          bugsFixed: stats.bugsResolved,
          badge: badge,
          weeklyPoints: Math.floor(stats.totalPoints * 0.1),
          monthlyPoints: Math.floor(stats.totalPoints * 0.3)
        };
      }
    } catch (err) {
      console.error('Error getting current user data:', err);
    }
    return null;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };
  const getDisplayData = () => {
    return leaderboardData.sort((a, b) => b.points - a.points);
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderLeaderboardItem = ({item, index}) => {
    const isCurrentUser = currentUser && item.id.toString() === currentUser.id.toString();
    const displayRank = item.rank || (index + 1);
    
    return (
      <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isCurrentUser && styles.currentUserText]}>
            {displayRank}
          </Text>
          {displayRank <= 3 && (
            <Icon 
              name={displayRank === 1 ? 'emoji-events' : 'workspace-premium'} 
              size={16} 
              color={displayRank === 1 ? '#FFD700' : displayRank === 2 ? '#C0C0C0' : '#CD7F32'} 
            />
          )}
        </View>
        
        <View style={[styles.avatar, {backgroundColor: item.color}]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
            {item.name}
          </Text>
          <Text style={styles.userBadge}>{item.badge}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={[styles.pointsText, isCurrentUser && styles.currentUserText]}>
            {item.points.toLocaleString()} pts
          </Text>
          <Text style={styles.bugsText}>{item.bugsFixed} bugs fixed</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9500" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLeaderboard}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Current User Stats */}
      {currentUser && (
        <View style={styles.currentUserCard}>
          <View style={styles.currentUserHeader}>
            <View style={[styles.currentUserAvatar, {backgroundColor: currentUser.color}]}>
              <Text style={styles.currentUserAvatarText}>{currentUser.avatar}</Text>
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{currentUser.name}</Text>
              <Text style={styles.currentUserBadge}>{currentUser.badge}</Text>
            </View>
          </View>
          
          <View style={styles.currentUserStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.points.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.rank}{getRankSuffix(currentUser.rank)}</Text>
              <Text style={styles.statLabel}>Global Rank</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.bugsFixed}</Text>
              <Text style={styles.statLabel}>Bugs Fixed</Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={getDisplayData()}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff9500"
            colors={['#ff9500']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  currentUserCard: {
    backgroundColor: '#111111',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  currentUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  currentUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  currentUserBadge: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '600',
    marginTop: 2,
  },
  currentUserStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#333333',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  currentUserItem: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    gap: 2,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  currentUserText: {
    color: '#ff9500',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  userBadge: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  bugsText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PointsScreen;
