import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProjectsScreen = ({navigation}) => {
  const [searchText, setSearchText] = useState('');

  const projects = [
    {
      id: 1,
      name: 'Bug Tracker Mobile App',
      description: 'React Native application for tracking and managing bugs',
      status: 'Active',
      bugs: 15,
      members: 5,
      progress: 75,
      color: '#ff9500',
      lastUpdated: '2 hours ago',
    },
    {
      id: 2,
      name: 'E-commerce Backend API',
      description: 'Node.js REST API for e-commerce platform',
      status: 'Active',
      bugs: 8,
      members: 3,
      progress: 60,
      color: '#ff9500',
      lastUpdated: '1 day ago',
    },
    {
      id: 3,
      name: 'User Authentication Service',
      description: 'Microservice for user authentication and authorization',
      status: 'Completed',
      bugs: 2,
      members: 2,
      progress: 100,
      color: '#ff9500',
      lastUpdated: '3 days ago',
    },
    {
      id: 4,
      name: 'Data Analytics Dashboard',
      description: 'React dashboard for business analytics and reporting',
      status: 'On Hold',
      bugs: 12,
      members: 4,
      progress: 40,
      color: '#ff9500',
      lastUpdated: '1 week ago',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Completed': return '#667eea';
      case 'On Hold': return '#ff6b6b';
      default: return '#888888';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                {projects.filter(p => p.status === 'Active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, styles.totalBugsCard]}>
              <Icon name="bug-report" size={24} color="#ff9500" />
              <Text style={styles.statNumber}>
                {projects.reduce((sum, p) => sum + p.bugs, 0)}
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
                onPress={() => navigation.navigate('CreateProject')}
              >
                <Icon name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>New</Text>
              </TouchableOpacity>
            </View>

            {filteredProjects.map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={styles.projectCard}
                onPress={() => navigation.navigate('Bugs', { projectId: project.id, projectName: project.name })}
              >
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <View style={[styles.projectColorDot, {backgroundColor: project.color}]} />
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      {borderColor: getStatusColor(project.status)}
                    ]}>
                      <Text style={[
                        styles.statusText,
                        {color: getStatusColor(project.status)}
                      ]}>
                        {project.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>{project.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        {
                          width: `${project.progress}%`,
                          backgroundColor: project.color,
                        }
                      ]}
                    />
                  </View>
                </View>

                {/* Project Stats */}
                <View style={styles.projectStats}>
                  <View style={styles.projectStat}>
                    <Icon name="bug-report" size={16} color="#ff6b6b" />
                    <Text style={styles.projectStatText}>{project.bugs} bugs</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Icon name="people" size={16} color="#10b981" />
                    <Text style={styles.projectStatText}>{project.members} members</Text>
                  </View>
                  <View style={styles.projectStat}>
                    <Icon name="schedule" size={16} color="#888888" />
                    <Text style={styles.projectStatText}>{project.lastUpdated}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          {filteredProjects.length === 0 && searchText && (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={48} color="#666666" />
              <Text style={styles.emptyStateTitle}>No projects found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms
              </Text>
            </View>
          )}
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
});

export default ProjectsScreen;
