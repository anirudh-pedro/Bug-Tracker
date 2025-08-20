import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen = () => {
  const stats = [
    {id: 1, title: 'Total Bugs', count: 42, icon: 'bug-report', color: '#ef4444'},
    {id: 2, title: 'Open Issues', count: 15, icon: 'error', color: '#f59e0b'},
    {id: 3, title: 'Resolved', count: 27, icon: 'check-circle', color: '#10b981'},
    {id: 4, title: 'In Progress', count: 8, icon: 'schedule', color: '#3b82f6'},
  ];

  const recentBugs = [
    {id: 1, title: 'Login page not responsive', priority: 'High', status: 'Open'},
    {id: 2, title: 'Database connection timeout', priority: 'Critical', status: 'In Progress'},
    {id: 3, title: 'UI alignment issues', priority: 'Medium', status: 'Open'},
  ];

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🐛 Dashboard</Text>
            <Text style={styles.subtitle}>Bug Tracking Overview</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {stats.map((stat) => (
              <TouchableOpacity key={stat.id} style={styles.statCard}>
                <View style={[styles.statIcon, {backgroundColor: stat.color}]}>
                  <Icon name={stat.icon} size={24} color="#ffffff" />
                </View>
                <Text style={styles.statCount}>{stat.count}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Bugs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Bugs</Text>
            <View style={styles.bugsContainer}>
              {recentBugs.map((bug) => (
                <TouchableOpacity key={bug.id} style={styles.bugCard}>
                  <View style={styles.bugHeader}>
                    <Text style={styles.bugTitle}>{bug.title}</Text>
                    <View style={[
                      styles.priorityBadge,
                      {backgroundColor: bug.priority === 'Critical' ? '#ef4444' : 
                                      bug.priority === 'High' ? '#f59e0b' : '#10b981'}
                    ]}>
                      <Text style={styles.priorityText}>{bug.priority}</Text>
                    </View>
                  </View>
                  <Text style={styles.bugStatus}>Status: {bug.status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="add" size={24} color="#ffffff" />
              <Text style={styles.actionButtonText}>Report New Bug</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Icon name="list" size={24} color="#667eea" />
              <Text style={styles.actionButtonTextSecondary}>View All Bugs</Text>
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
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  bugsContainer: {
    gap: 12,
  },
  bugCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  bugStatus: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 100, // Extra padding for bottom tab bar
  },
  actionButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    gap: 12,
  },
  actionButtonTextSecondary: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
