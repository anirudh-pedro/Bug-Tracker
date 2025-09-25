import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';
import { useFocusEffect } from '@react-navigation/native';

const ProjectsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit/Delete modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editedProjectName, setEditedProjectName] = useState('');
  const [editedProjectDescription, setEditedProjectDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  // Reload projects when screen comes into focus (e.g., after creating a new project)
  useFocusEffect(
    React.useCallback(() => {
      loadProjects();
    }, [])
  );

  useEffect(() => {
    filterProjects();
  }, [searchText, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading projects...');
      
      const response = await apiRequest('/api/projects', {
        method: 'GET'
      });

      console.log('📋 Projects API response:', response);

      if (response.success) {
        const projectsData = response.data?.projects || [];
        console.log('✅ Projects loaded:', projectsData.length, 'projects');
        setProjects(projectsData);
      } else {
        const errorMsg = response.message || response.error || 'Failed to load projects';
        console.error('❌ Projects API error:', errorMsg);
        
        // Handle authentication errors
        if (response.authError) {
          Alert.alert(
            'Authentication Error', 
            'Your session has expired. Please log in again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
          return;
        }
        
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('💥 Error loading projects:', error);
      // More specific error handling
      let errorMessage = 'Failed to load projects. Please try again.';
      
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
      // Set empty array so UI doesn't break
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filterProjects = () => {
    if (!searchText.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Edit project handler
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditedProjectName(project.name);
    setEditedProjectDescription(project.description);
    setEditModalVisible(true);
  };

  // Delete project handler
  const handleDeleteProject = (project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => confirmDeleteProject(project._id)
        }
      ]
    );
  };

  // Confirm delete project
  const confirmDeleteProject = async (projectId) => {
    try {
      console.log('🗑️ Deleting project:', projectId);
      
      const response = await apiRequest(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        Alert.alert('Success', 'Project deleted successfully');
        loadProjects(); // Reload the projects list
      } else {
        Alert.alert('Error', response.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('❌ Delete project error:', error);
      Alert.alert('Error', 'Failed to delete project. Please try again.');
    }
  };

  // Save edited project
  const handleSaveEditedProject = async () => {
    if (!editedProjectName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    try {
      setEditLoading(true);
      console.log('✏️ Updating project:', selectedProject._id);
      
      const response = await apiRequest(`/api/projects/${selectedProject._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editedProjectName.trim(),
          description: editedProjectDescription.trim()
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Project updated successfully');
        setEditModalVisible(false);
        loadProjects(); // Reload the projects list
      } else {
        Alert.alert('Error', response.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('❌ Update project error:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📂 Projects</Text>
            <Text style={styles.subtitle}>Manage your bug tracking projects</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#666666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search projects..."
                placeholderTextColor="#666666"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="clear" size={20} color="#666666" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff9500" />
              <Text style={styles.loadingText}>Loading projects...</Text>
            </View>
          ) : (
            <>
              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, styles.totalProjectsCard]}>
                  <Icon name="folder" size={24} color="#ff9500" />
                  <Text style={styles.statNumber}>{projects.length}</Text>
                  <Text style={styles.statLabel}>Total Projects</Text>
                </View>
                <View style={[styles.statCard, styles.activeProjectsCard]}>
                  <Icon name="play-arrow" size={24} color="#ff9500" />
                  <Text style={styles.statNumber}>
                    {projects.filter(p => p.status === 'active').length}
                  </Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={[styles.statCard, styles.totalBugsCard]}>
                  <Icon name="bug-report" size={24} color="#ff9500" />
                  <Text style={styles.statNumber}>
                    {projects.reduce((sum, p) => sum + (p.stats?.totalBugs || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total Bugs</Text>
                </View>
              </View>

              {/* Projects List */}
              <View style={styles.projectsContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Projects</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateProject', { 
                      onProjectCreated: loadProjects 
                    })}
                  >
                    <Icon name="add" size={20} color="#ffffff" />
                    <Text style={styles.addButtonText}>New</Text>
                  </TouchableOpacity>
                </View>

                {filteredProjects.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="folder-open" size={80} color="#666666" />
                    <Text style={styles.emptyTitle}>
                      {projects.length === 0 ? 'No Projects Yet' : 'No Matching Projects'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {projects.length === 0 
                        ? 'Create your first project to get started' 
                        : 'Try adjusting your search terms'
                      }
                    </Text>
                    {projects.length === 0 && (
                      <TouchableOpacity 
                        style={styles.createFirstButton}
                        onPress={() => navigation.navigate('CreateProject', { 
                          onProjectCreated: loadProjects 
                        })}
                      >
                        <Icon name="add" size={20} color="#ffffff" />
                        <Text style={styles.createFirstButtonText}>Create First Project</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredProjects.map((project) => (
                    <View key={project._id} style={styles.projectCard}>
                      <TouchableOpacity 
                        style={styles.projectContent}
                        onPress={() => navigation.navigate('ProjectDetail', { 
                          projectId: project._id, 
                          projectName: project.name 
                        })}
                      >
                        <View style={styles.projectHeader}>
                          <View style={styles.projectTitleRow}>
                            <Text style={styles.projectName}>{project.name}</Text>
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusColor(project.status) }
                            ]}>
                              <Text style={styles.statusText}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.projectKey}>#{project.key}</Text>
                        </View>

                      <Text style={styles.projectDescription} numberOfLines={2}>
                        {project.description}
                      </Text>

                      {/* Project Stats */}
                      <View style={styles.projectStats}>
                        <View style={styles.projectStat}>
                          <Icon name="bug-report" size={16} color="#ff6b6b" />
                          <Text style={styles.projectStatText}>
                            {project.stats?.totalBugs || 0} bugs
                          </Text>
                        </View>
                        <View style={styles.projectStat}>
                          <Icon name="people" size={16} color="#10b981" />
                          <Text style={styles.projectStatText}>
                            {project.stats?.memberCount || 0} members
                          </Text>
                        </View>
                        <View style={styles.projectStat}>
                          <Icon name="schedule" size={16} color="#888888" />
                          <Text style={styles.projectStatText}>
                            {formatDate(project.updatedAt || project.createdAt)}
                          </Text>
                        </View>
                      </View>
                      </TouchableOpacity>
                      
                      {/* Action buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => handleEditProject(project)}
                        >
                          <Icon name="edit" size={18} color="#667eea" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteProject(project)}
                        >
                          <Icon name="delete" size={18} color="#ff6b6b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Edit Project Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Project</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project Name</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={editedProjectName}
                  onChangeText={setEditedProjectName}
                  placeholder="Enter project name"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalTextInput, styles.textArea]}
                  value={editedProjectDescription}
                  onChangeText={setEditedProjectDescription}
                  placeholder="Enter project description"
                  placeholderTextColor="#666666"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, editLoading && styles.disabledButton]}
                  onPress={handleSaveEditedProject}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  totalProjectsCard: {
    backgroundColor: '#1b1f2d',
    borderColor: '#667eea',
  },
  activeProjectsCard: {
    backgroundColor: '#0d2818',
    borderColor: '#10b981',
  },
  totalBugsCard: {
    backgroundColor: '#2d1b1b',
    borderColor: '#ff6b6b',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '600',
    textAlign: 'center',
  },
  projectsContainer: {
    marginBottom: 100,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  projectHeader: {
    marginBottom: 16,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  projectColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
    fontWeight: '400',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#222222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  projectStatText: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  createFirstButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // New styles for edit/delete functionality
  projectContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  deleteButton: {
    backgroundColor: '#2d1b1b',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalTextInput: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#444444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProjectsScreen;
