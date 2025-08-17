import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { useBugStore } from '../store/bugStore';
import TopHeader from '../components/TopHeader';
import { Colors, getThemeColors } from '../constants/colors';
import { BugStatus, Priority } from '../types/Bug';

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
              width: `${Math.min((value / 100) * 100, 100)}%`
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
    style={[styles.quickActionCard, { backgroundColor: themeColors.surface }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
      <Text style={styles.quickActionIconText}>{icon}</Text>
    </View>
    <View style={styles.quickActionContent}>
      <Text style={[styles.quickActionTitle, { color: themeColors.text }]}>
        {title}
      </Text>
      <Text style={[styles.quickActionSubtitle, { color: themeColors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    <View style={[styles.quickActionArrow, { backgroundColor: color + '10' }]}>
      <Text style={[styles.quickActionArrowText, { color }]}>→</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const { user } = useAuth();
  const { bugs } = useBugStore();
  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const themeColors = getThemeColors(isDarkMode);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = useMemo(() => {
    const totalBugs = bugs.length;
    const openBugs = bugs.filter(bug => bug.status === BugStatus.OPEN).length;
    const inProgressBugs = bugs.filter(bug => bug.status === BugStatus.IN_PROGRESS).length;
    const resolvedBugs = bugs.filter(bug => bug.status === BugStatus.RESOLVED).length;
    const highPriorityBugs = bugs.filter(bug => bug.priority === Priority.HIGH).length;

    return {
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      highPriorityBugs,
    };
  }, [bugs]);

  const statCards = [
    {
      title: 'Total Bugs',
      value: stats.totalBugs,
      color: Colors.primary,
      icon: '🐛',
    },
    {
      title: 'Open Issues',
      value: stats.openBugs,
      color: Colors.danger,
      icon: '🔓',
    },
    {
      title: 'In Progress',
      value: stats.inProgressBugs,
      color: Colors.warning,
      icon: '⚡',
    },
    {
      title: 'Resolved',
      value: stats.resolvedBugs,
      color: Colors.success,
      icon: '✅',
    },
  ];

  const quickActions = [
    {
      title: 'Report New Bug',
      subtitle: 'Create a new bug report',
      icon: '🆕',
      color: Colors.primary,
      onPress: () => navigation.navigate('ReportBug'),
    },
    {
      title: 'View All Bugs',
      subtitle: 'Browse all reported issues',
      icon: '📋',
      color: Colors.info,
      onPress: () => navigation.navigate('BugList'),
    },
    {
      title: 'High Priority',
      subtitle: `${stats.highPriorityBugs} urgent issues`,
      icon: '🚨',
      color: Colors.danger,
      onPress: () => navigation.navigate('BugList', { filter: 'high' }),
    },
    {
      title: 'My Reports',
      subtitle: 'View your submitted bugs',
      icon: '👤',
      color: Colors.success,
      onPress: () => navigation.navigate('BugList', { filter: 'mine' }),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[Colors.primary + '10', themeColors.background]}
        style={styles.gradientBackground}
      />
      
      <TopHeader title="Dashboard" />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: themeColors.surface }]}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: themeColors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
          <Text style={[styles.timeGreeting, { color: themeColors.textSecondary }]}>
            {getTimeBasedGreeting()}! Ready to squash some bugs? 🚀
          </Text>
        </View>

        {/* Statistics Grid */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          📊 Bug Statistics
        </Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
              themeColors={themeColors}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          ⚡ Quick Actions
        </Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              color={action.color}
              onPress={action.onPress}
              themeColors={themeColors}
            />
          ))}
        </View>
      </ScrollView>
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
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    flexDirection: 'row',
    padding: 16,
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
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
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
});

export default HomeScreen;
