import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { useBugStore } from '../store/bugStore';
import { BugStats } from '../types/Bug';
import { Colors, getThemeColors } from '../constants/colors';
import { Strings } from '../constants/strings';

const { width } = Dimensions.get('window');

// Dashboard Header Component
interface DashboardHeaderProps {
  user: any;
  themeColors: ReturnType<typeof getThemeColors>;
  onSearch: (text: string) => void;
  onProfilePress: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  themeColors, 
  onSearch, 
  onProfilePress 
}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <LinearGradient
      colors={['#1C1C1E', '#2C2C2E']}
      style={styles.headerContainer}
    >
      <View style={styles.headerTop}>
        {/* App Logo/Name */}
        <View style={styles.logoContainer}>
          <Ionicons name="bug" size={28} color="white" />
          <Text style={styles.appTitle}>Bug Tracker</Text>
        </View>

        {/* User Avatar & Dropdown */}
        <TouchableOpacity 
          style={styles.userContainer}
          onPress={onProfilePress}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="white" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Navigation Links */}
      <View style={styles.navLinks}>
        {['Dashboard', 'Projects', 'Bugs', 'Reports'].map((item) => (
          <TouchableOpacity 
            key={item}
            style={[styles.navItem, item === 'Dashboard' && styles.navItemActive]}
          >
            <Text style={[
              styles.navText, 
              item === 'Dashboard' && styles.navTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: 'white' }]}
          placeholder="Search bugs, projects, or assignees..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onSearch(text);
          }}
        />
      </View>
    </LinearGradient>
  );
};

// Quick Stats Cards Component
interface QuickStatsProps {
  stats: BugStats;
  themeColors: ReturnType<typeof getThemeColors>;
  onStatPress: (type: string) => void;
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats, themeColors, onStatPress }) => {
  const statsData = [
    {
      title: 'Open Bugs',
      value: stats.openBugs,
      color: '#ff6b6b',
      icon: 'alert-circle',
      type: 'open'
    },
    {
      title: 'Resolved Bugs',
      value: stats.resolvedBugs,
      color: '#51cf66',
      icon: 'checkmark-circle',
      type: 'resolved'
    },
    {
      title: 'High Priority',
      value: stats.highPriorityBugs,
      color: '#ff922b',
      icon: 'warning',
      type: 'high'
    },
    {
      title: 'Assigned to Me',
      value: Math.floor(stats.totalBugs * 0.3), // Mock data for assigned bugs
      color: '#339af0',
      icon: 'person-circle',
      type: 'assigned'
    }
  ];

  return (
    <View style={styles.quickStatsContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        📊 Quick Overview
      </Text>
      <View style={styles.statsRow}>
        {statsData.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dashboardStatCard, { backgroundColor: themeColors.surface }]}
            onPress={() => onStatPress(stat.type)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[styles.statTitle, { color: themeColors.textSecondary }]}>
              {stat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Recent Bugs Table Component
interface RecentBugsProps {
  themeColors: ReturnType<typeof getThemeColors>;
}

const RecentBugs: React.FC<RecentBugsProps> = ({ themeColors }) => {
  const recentBugs = [
    {
      id: '#001',
      title: 'Login form validation error',
      project: 'Web App',
      priority: 'High',
      status: 'Open',
      assignee: 'John Doe',
      lastUpdated: '2 hours ago',
      priorityColor: '#ff922b'
    },
    {
      id: '#002', 
      title: 'Database connection timeout',
      project: 'API Server',
      priority: 'Critical',
      status: 'In Progress',
      assignee: 'Sarah Wilson',
      lastUpdated: '1 day ago',
      priorityColor: '#ff6b6b'
    },
    {
      id: '#003',
      title: 'UI alignment issue on mobile',
      project: 'Mobile App',
      priority: 'Medium',
      status: 'Open',
      assignee: 'Mike Johnson',
      lastUpdated: '3 days ago',
      priorityColor: '#339af0'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#ff6b6b';
      case 'in progress': return '#339af0';
      case 'resolved': return '#51cf66';
      case 'closed': return '#868e96';
      default: return themeColors.textSecondary;
    }
  };

  const renderBugItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.bugItem, { backgroundColor: themeColors.surface }]}
      activeOpacity={0.8}
    >
      <View style={styles.bugHeader}>
        <View style={styles.bugTitleContainer}>
          <Text style={[styles.bugId, { color: themeColors.textSecondary }]}>{item.id}</Text>
          <Text style={[styles.bugTitle, { color: themeColors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: item.priorityColor + '15' }]}>
          <Text style={[styles.priorityText, { color: item.priorityColor }]}>
            {item.priority}
          </Text>
        </View>
      </View>
      
      <View style={styles.bugDetails}>
        <View style={styles.bugDetailItem}>
          <Ionicons name="folder-outline" size={14} color={themeColors.textSecondary} />
          <Text style={[styles.bugDetailText, { color: themeColors.textSecondary }]}>
            {item.project}
          </Text>
        </View>
        <View style={styles.bugDetailItem}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.bugDetailText, { color: themeColors.textSecondary }]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.bugDetailItem}>
          <Ionicons name="person-outline" size={14} color={themeColors.textSecondary} />
          <Text style={[styles.bugDetailText, { color: themeColors.textSecondary }]}>
            {item.assignee}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.lastUpdated, { color: themeColors.textSecondary }]}>
        Updated {item.lastUpdated}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.recentBugsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          🐛 Recent Bugs
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentBugs}
        renderItem={renderBugItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

// Projects Overview Component
interface ProjectsOverviewProps {
  themeColors: ReturnType<typeof getThemeColors>;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ themeColors }) => {
  const projects = [
    { name: 'Web App', bugs: 12, color: '#667eea' },
    { name: 'Mobile App', bugs: 8, color: '#764ba2' },
    { name: 'API Server', bugs: 5, color: '#f093fb' },
    { name: 'Admin Dashboard', bugs: 3, color: '#ffecd2' }
  ];

  return (
    <View style={styles.projectsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          📁 Active Projects
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: Colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.projectsGrid}>
        {projects.map((project, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.projectCard, { backgroundColor: themeColors.surface }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[project.color, project.color + '80']}
              style={styles.projectHeader}
            >
              <Text style={styles.projectName}>{project.name}</Text>
            </LinearGradient>
            <View style={styles.projectStats}>
              <Text style={[styles.projectBugCount, { color: themeColors.text }]}>
                {project.bugs} bugs
              </Text>
              <TouchableOpacity style={styles.viewProjectBtn}>
                <Text style={[styles.viewProjectText, { color: Colors.primary }]}>
                  View Project
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Activity Timeline Component
interface ActivityTimelineProps {
  themeColors: ReturnType<typeof getThemeColors>;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ themeColors }) => {
  const activities = [
    {
      id: 1,
      user: 'Anirudh',
      action: 'changed Bug #101 status to',
      status: 'In Progress',
      time: '2 hours ago',
      color: '#339af0'
    },
    {
      id: 2,
      user: 'Sarah Wilson',
      action: 'created new bug',
      status: 'Bug #102',
      time: '4 hours ago',
      color: '#ff6b6b'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'resolved',
      status: 'Bug #099',
      time: '1 day ago',
      color: '#51cf66'
    }
  ];

  return (
    <View style={styles.activityContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        ⏰ Recent Activity
      </Text>
      {activities.map((activity, index) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, { color: themeColors.text }]}>
              <Text style={styles.activityUser}>{activity.user}</Text>
              {' '}{activity.action}{' '}
              <Text style={[styles.activityStatus, { color: activity.color }]}>
                {activity.status}
              </Text>
            </Text>
            <Text style={[styles.activityTime, { color: themeColors.textSecondary }]}>
              {activity.time}
            </Text>
          </View>
          {index < activities.length - 1 && (
            <View style={[styles.activityLine, { backgroundColor: themeColors.border }]} />
          )}
        </View>
      ))}
    </View>
  );
};

// Enhanced StatCard Component with gradients and animations
interface StatCardProps {
  title: string;
  value: number;
  color?: string;
  gradient?: string[];
  icon?: string;
  onPress?: () => void;
  themeColors: ReturnType<typeof getThemeColors>;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color = Colors.primary,
  gradient = [Colors.primary + '20', Colors.primary + '10'],
  icon = '📊',
  onPress,
  themeColors 
}) => (
  <TouchableOpacity
    style={[styles.statCard, { backgroundColor: themeColors.surface }]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.8 : 1}
  >
    <View style={[styles.statCardContent, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={[styles.statBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.statNumber, { color }]}>{value}</Text>
        </View>
      </View>
      <Text style={[styles.statLabel, { color: themeColors.text }]}>
        {title}
      </Text>
      <View style={[styles.statProgress, { backgroundColor: color + '10' }]}>
        <View 
          style={[
            styles.statProgressBar, 
            { 
              backgroundColor: color,
              width: `${Math.min((value / 100) * 100, 100)}%` as any
            }
          ]} 
        />
      </View>
    </View>
  </TouchableOpacity>
);

// Quick Action Card Component
interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
  themeColors: ReturnType<typeof getThemeColors>;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
  themeColors
}) => (
  <TouchableOpacity
    style={[styles.quickActionCard, { backgroundColor: themeColors.surface, width: '48%' }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
      <Text style={styles.quickActionIconText}>{icon}</Text>
    </View>
    <Text style={[styles.quickActionTitle, { color: themeColors.text }]}>
      {title}
    </Text>
    <Text style={[styles.quickActionSubtitle, { color: themeColors.textSecondary }]}>
      {subtitle}
    </Text>
  </TouchableOpacity>
);

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'tester' | 'manager';
}

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { getStats } = useBugStore();
  const isDarkMode = true; // Force dark theme
  const themeColors = getThemeColors(isDarkMode);
  
  const stats = useMemo(() => getStats(), [getStats]);

  const handleNavigateToBugList = () => {
    Alert.alert('Navigation', 'This will navigate to Bug List when navigation is fully set up');
  };

  const handleCreateBug = () => {
    Alert.alert('Create Bug', 'Bug creation form will be implemented in the next phase.');
  };

  const handleSearch = (text: string) => {
    console.log('Search:', text);
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile options will be implemented');
  };

  const handleStatPress = (type: string) => {
    Alert.alert('Bug Filter', `Show ${type} bugs`);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dashboard Header */}
        <DashboardHeader 
          user={user}
          themeColors={themeColors}
          onSearch={handleSearch}
          onProfilePress={handleProfilePress}
        />

        {/* Quick Stats Cards */}
        <QuickStats 
          stats={stats}
          themeColors={themeColors}
          onStatPress={handleStatPress}
        />

        {/* Recent Bugs Table */}
        <RecentBugs themeColors={themeColors} />

        {/* Projects Overview */}
        <ProjectsOverview themeColors={themeColors} />

        {/* Activity Timeline */}
        <ActivityTimeline themeColors={themeColors} />

        {/* Bottom Padding for Safe Area */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={handleCreateBug}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  timeGreeting: {
    fontSize: 16,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: width < 400 ? '100%' : '48%', // Full width on small screens
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  statCardContent: {
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  statProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  quickActionsContainer: {
    marginTop: 8,
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  quickActionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionArrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Hero Section Styles
  heroSection: {
    marginHorizontal: -16,
    marginTop: -8,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Enhanced Section Styles
  statsSection: {
    marginBottom: 24,
  },
  actionsSection: {
    marginBottom: 24,
  },
  summarySection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Enhanced Summary Styles
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  // Dashboard Header Styles
  headerContainer: {
    paddingHorizontal: width < 400 ? 16 : 20, // Responsive padding
    paddingVertical: 16,
    paddingBottom: 20,
    marginHorizontal: -16, // Extend to screen edges
    marginTop: -16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appTitle: {
    fontSize: width < 400 ? 18 : 22, // Responsive font size
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chevron: {
    opacity: 0.8,
  },
  navLinks: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  navTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  // Quick Stats Styles
  quickStatsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardStatCard: {
    width: width < 400 ? '100%' : '48%', // Full width on small screens
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Recent Bugs Styles
  recentBugsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bugItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bugTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  bugId: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  bugTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bugDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bugDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  bugDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  lastUpdated: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Projects Overview Styles
  projectsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  projectCard: {
    width: width < 400 ? '100%' : '48%', // Full width on small screens
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  projectHeader: {
    padding: 16,
  },
  projectName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  projectStats: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectBugCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewProjectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewProjectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Activity Timeline Styles
  activityContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityStatus: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 4,
  },
  activityLine: {
    position: 'absolute',
    left: 3.5,
    top: 20,
    width: 1,
    height: 16,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
