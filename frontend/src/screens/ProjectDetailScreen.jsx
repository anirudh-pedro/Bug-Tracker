import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';

const ProjectDetailScreen = ({navigation, route}) => {
  const {projectId, projectName} = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, []);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading project details for:', projectId);
      
      const response = await apiRequest(`/api/projects/${projectId}`, {
        method: 'GET'
      });

      console.log('📋 Project details response:', response);
      
      if (response.success) {
        setProject(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load project details');
      }
    } catch (error) {
      console.error('❌ Load project details error:', error);
      Alert.alert('Error', 'Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjectDetails();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#667eea';
      case 'inactive': return '#ff6b6b';
      case 'archived': return '#888888';
      default: return '#888888';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9500" />
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Project not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backIconButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Project Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.projectHeader}
          >
            <View style={styles.projectTitleSection}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectKey}>#{project.key}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) }
            ]}>
              <Text style={styles.statusText}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Text>
            </View>
          </LinearGradient>

          {/* Project Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {project.description || 'No description available'}
            </Text>
          </View>

          {/* Project Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="bug-report" size={24} color="#ff6b6b" />
                <Text style={styles.statNumber}>{project.stats?.totalBugs || 0}</Text>
                <Text style={styles.statLabel}>Total Bugs</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="done" size={24} color="#10b981" />
                <Text style={styles.statNumber}>{project.stats?.resolvedBugs || 0}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="pending" size={24} color="#f59e0b" />
                <Text style={styles.statNumber}>{project.stats?.openBugs || 0}</Text>
                <Text style={styles.statLabel}>Open</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="people" size={24} color="#667eea" />
                <Text style={styles.statNumber}>{project.stats?.memberCount || 0}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
            </View>
          </View>

          {/* Project Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(project.createdAt)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDate(project.updatedAt)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Owner</Text>
                <Text style={styles.infoValue}>{project.owner?.name || 'Unknown'}</Text>
              </View>
              {project.repository?.url && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Repository</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {project.repository.url}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Bugs', { 
                projectId: project._id, 
                projectName: project.name 
              })}
            >
              <Icon name="bug-report" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>View Bugs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('CreateBug', { 
                projectId: project._id, 
                projectName: project.name 
              })}
            >
              <Icon name="add" size={20} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Report Bug</Text>
            </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    margin: 20,
    borderRadius: 16,
  },
  projectTitleSection: {
    flex: 1,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  projectKey: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  infoGrid: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#cccccc',
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  actionSection: {
    margin: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ff9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});

export default ProjectDetailScreen;