import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width: screenWidth} = Dimensions.get('window');

const PointsScreen = ({navigation}) => {
  // Sample leaderboard data
  const leaderboardData = [
    {
      id: 1,
      name: 'Alex Rodriguez',
      avatar: 'AR',
      color: '#FF9800',
      points: 2840,
      bugsFixed: 24,
      rank: 1,
      badge: 'Bug Hunter Elite',
      weeklyPoints: 480,
      monthlyPoints: 1120
    },
    {
      id: 2,
      name: 'Sarah Chen',
      avatar: 'SC',
      color: '#4CAF50',
      points: 2650,
      bugsFixed: 21,
      rank: 2,
      badge: 'Code Ninja',
      weeklyPoints: 320,
      monthlyPoints: 890
    },
    {
      id: 3,
      name: 'Mike Johnson',
      avatar: 'MJ',
      color: '#2196F3',
      points: 2180,
      bugsFixed: 18,
      rank: 3,
      badge: 'Debug Master',
      weeklyPoints: 290,
      monthlyPoints: 720
    },
    {
      id: 4,
      name: 'Emma Thompson',
      avatar: 'ET',
      color: '#E91E63',
      points: 1920,
      bugsFixed: 16,
      rank: 4,
      badge: 'Problem Solver',
      weeklyPoints: 250,
      monthlyPoints: 580
    },
    {
      id: 5,
      name: 'David Kim',
      avatar: 'DK',
      color: '#795548',
      points: 1650,
      bugsFixed: 14,
      rank: 5,
      badge: 'Bug Squasher',
      weeklyPoints: 180,
      monthlyPoints: 450
    },
    {
      id: 6,
      name: 'Current User',
      avatar: 'CU',
      color: '#ff9500',
      points: 1280,
      bugsFixed: 11,
      rank: 8,
      badge: 'Rising Star',
      weeklyPoints: 120,
      monthlyPoints: 320
    }
  ];

  const currentUser = leaderboardData.find(user => user.name === 'Current User');
  
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
    const isCurrentUser = item.name === 'Current User';
    const displayRank = index + 1;
    
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

      {/* Leaderboard List */}
      <FlatList
        data={getDisplayData()}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
});

export default PointsScreen;
