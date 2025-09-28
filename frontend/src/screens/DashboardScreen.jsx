import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, getStatusColor, getPriorityColor } from '../theme/colors';

const {width: screenWidth} = Dimensions.get('window');

const DashboardScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sample bug data with different users
  const allBugs = [
    {
      id: 1,
      title: 'Login page not responsive on mobile devices',
      description: 'The login form overlaps with footer on screens smaller than 375px width. Submit button becomes inaccessible.',
      priority: 'High',
      status: 'Open',
      category: 'Bug',
      project: 'Bug Tracker Mobile App',
      reportedBy: {
        name: 'Alice Johnson',
        avatar: 'AJ',
        email: 'alice.j@example.com'
      },
      createdAt: '2024-08-24T10:30:00Z',
      updatedAt: '2024-08-24T14:15:00Z',
      assignedTo: 'John Doe',
      tags: ['mobile', 'responsive', 'ui'],
      stepsToReproduce: '1. Open login page on mobile\n2. Try to scroll down\n3. Notice footer overlap'
    },
    {
      id: 2,
      title: 'Database connection timeout in production',
      description: 'Users experiencing 504 gateway timeout errors when trying to fetch project data during peak hours.',
      priority: 'Critical',
      status: 'In Progress',
      category: 'Bug',
      project: 'E-commerce Platform',
      reportedBy: {
        name: 'Mike Chen',
        avatar: 'MC',
        email: 'mike.chen@example.com'
      },
      createdAt: '2024-08-23T16:45:00Z',
      updatedAt: '2024-08-24T09:20:00Z',
      assignedTo: 'Sarah Wilson',
      tags: ['backend', 'database', 'performance'],
      stepsToReproduce: '1. Login during peak hours\n2. Navigate to projects\n3. Wait for timeout'
    },
    {
      id: 3,
      title: 'Add dark mode toggle to user preferences',
      description: 'Users have requested the ability to switch between light and dark themes. Currently only dark theme is available.',
      priority: 'Medium',
      status: 'Open',
      category: 'Feature Request',
      project: 'Bug Tracker Mobile App',
      reportedBy: {
        name: 'Emma Davis',
        avatar: 'ED',
        email: 'emma.davis@example.com'
      },
      createdAt: '2024-08-22T11:20:00Z',
      updatedAt: '2024-08-23T15:30:00Z',
      assignedTo: null,
      tags: ['ui', 'theme', 'preferences'],
      stepsToReproduce: 'N/A - Feature request'
    },
    {
      id: 4,
      title: 'UI alignment issues in project cards',
      description: 'Project status badges are not properly aligned with project titles on tablet devices.',
      priority: 'Low',
      status: 'Resolved',
      category: 'Bug',
      project: 'Social Media Dashboard',
      reportedBy: {
        name: 'David Rodriguez',
        avatar: 'DR',
        email: 'david.r@example.com'
      },
      createdAt: '2024-08-21T14:10:00Z',
      updatedAt: '2024-08-24T12:45:00Z',
      assignedTo: 'Lisa Park',
      tags: ['ui', 'tablet', 'alignment'],
      stepsToReproduce: '1. Open on tablet\n2. View projects screen\n3. Notice misalignment'
    },
    {
      id: 5,
      title: 'Improve error handling for file uploads',
      description: 'When file upload fails, users only see a generic error message. Need more specific error details.',
      priority: 'Medium',
      status: 'Open',
      category: 'Enhancement',
      project: 'Data Analytics Dashboard',
      reportedBy: {
        name: 'Sophie Turner',
        avatar: 'ST',
        email: 'sophie.t@example.com'
      },
      createdAt: '2024-08-20T09:15:00Z',
      updatedAt: '2024-08-22T13:25:00Z',
      assignedTo: null,
      tags: ['upload', 'error-handling', 'ux'],
      stepsToReproduce: '1. Try to upload large file\n2. Wait for failure\n3. See generic error'
    },
    {
      id: 6,
      title: 'API documentation needs update for v2.0',
      description: 'Several new endpoints are not documented, and some examples are outdated.',
      priority: 'Medium',
      status: 'In Progress',
      category: 'Documentation',
      project: 'Bug Tracker Mobile App',
      reportedBy: {
        name: 'Alex Kim',
        avatar: 'AK',
        email: 'alex.kim@example.com'
      },
      createdAt: '2024-08-19T13:40:00Z',
      updatedAt: '2024-08-24T10:10:00Z',
      assignedTo: 'Tom Johnson',
      tags: ['documentation', 'api', 'v2.0'],
      stepsToReproduce: 'N/A - Documentation task'
    }
  ];

  const projects = ['All', 'Bug Tracker Mobile App', 'E-commerce Platform', 'Social Media Dashboard', 'Data Analytics Dashboard'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const categories = ['All', 'Bug', 'Feature Request', 'Enhancement', 'Documentation'];

  // Filter bugs based on search and filters
  const filteredBugs = allBugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bug.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedFilter === 'All' || bug.status === selectedFilter;
    const matchesPriority = selectedPriority === 'All' || bug.priority === selectedPriority;
    const matchesProject = selectedProject === 'All' || bug.project === selectedProject;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Get stats from filtered data
  const stats = [
    {id: 1, title: 'Total Bugs', count: filteredBugs.length, icon: 'bug-report', color: Colors.primary.main},
    {id: 2, title: 'Open Issues', count: filteredBugs.filter(b => b.status === 'Open').length, icon: 'error', color: Colors.primary.main},
    {id: 3, title: 'In Progress', count: filteredBugs.filter(b => b.status === 'In Progress').length, icon: 'schedule', color: Colors.primary.main},
    {id: 4, title: 'Resolved', count: filteredBugs.filter(b => b.status === 'Resolved').length, icon: 'check-circle', color: Colors.primary.main},
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const resetFilters = () => {
    setSelectedFilter('All');
    setSelectedPriority('All');
    setSelectedProject('All');
    setSearchQuery('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Render individual bug card
  const renderBugCard = ({ item }) => (
    <TouchableOpacity style={styles.bugCard}>
      <View style={styles.bugHeader}>
        <View style={styles.bugHeaderLeft}>
          <Text style={styles.bugTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.bugMeta}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.reportedBy.avatar}</Text>
              </View>
              <Text style={styles.userName}>{item.reportedBy.name}</Text>
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.bugHeaderRight}>
          <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(item.priority)}]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bugDescription} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.bugFooter}>
        <View style={styles.bugProject}>
          <Icon name="folder" size={14} color="#888888" />
          <Text style={styles.projectText}>{item.project}</Text>
        </View>
        <View style={[styles.statusBadge, {borderColor: getStatusColor(item.status)}]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>{item.status}</Text>
        </View>
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={`${item.id}-tag-${index}-${tag}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🐛 All Bug Reports</Text>
          <Text style={styles.subtitle}>{filteredBugs.length} bugs found</Text>
        </View>

        {/* Search and Filter Bar */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bugs, users, projects..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="tune" size={20} color="#ff9500" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(selectedFilter !== 'All' || selectedPriority !== 'All' || selectedProject !== 'All') && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedFilter !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Status: {selectedFilter}</Text>
                  <TouchableOpacity onPress={() => setSelectedFilter('All')}>
                    <Icon name="close" size={16} color="#ff9500" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedPriority !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Priority: {selectedPriority}</Text>
                  <TouchableOpacity onPress={() => setSelectedPriority('All')}>
                    <Icon name="close" size={16} color="#ff9500" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedProject !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Project: {selectedProject}</Text>
                  <TouchableOpacity onPress={() => setSelectedProject('All')}>
                    <Icon name="close" size={16} color="#ff9500" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearAllFilters} onPress={resetFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <TouchableOpacity key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, {backgroundColor: stat.color}]}>
                <Icon name={stat.icon} size={20} color="#ffffff" />
              </View>
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bug List */}
        <FlatList
          data={filteredBugs || []}
          renderItem={renderBugCard}
          keyExtractor={(item, index) => item?.id?.toString() || `bug-${index}`}
          style={styles.bugsList}
          contentContainerStyle={styles.bugsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff9500"
              colors={['#ff9500']}
            />
          }
          // Performance optimizations
          initialNumToRender={8}
          maxToRenderPerBatch={4}
          windowSize={8}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter Bugs</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterModalContent}>
                {/* Status Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Status</Text>
                  <View style={styles.filterOptions}>
                    {statuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterOption,
                          selectedFilter === status && styles.filterOptionSelected
                        ]}
                        onPress={() => setSelectedFilter(status)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedFilter === status && styles.filterOptionTextSelected
                        ]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Priority Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Priority</Text>
                  <View style={styles.filterOptions}>
                    {priorities.map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.filterOption,
                          selectedPriority === priority && styles.filterOptionSelected
                        ]}
                        onPress={() => setSelectedPriority(priority)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedPriority === priority && styles.filterOptionTextSelected
                        ]}>
                          {priority}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Project Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Project</Text>
                  <View style={styles.filterOptions}>
                    {projects.map((project) => (
                      <TouchableOpacity
                        key={project}
                        style={[
                          styles.filterOption,
                          selectedProject === project && styles.filterOptionSelected
                        ]}
                        onPress={() => setSelectedProject(project)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedProject === project && styles.filterOptionTextSelected
                        ]}>
                          {project}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filterModalFooter}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#111111',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff950020',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ff9500',
    gap: 6,
  },
  activeFilterText: {
    color: '#ff9500',
    fontSize: 12,
    fontWeight: '500',
  },
  clearAllFilters: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333333',
    borderRadius: 16,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '500',
  },
  bugsList: {
    flex: 1,
  },
  bugsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bugCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bugHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 22,
  },
  bugMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666666',
  },
  bugHeaderRight: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  bugDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  bugFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bugProject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  projectText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterModalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterOptionSelected: {
    backgroundColor: '#ff9500',
    borderColor: '#ff9500',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ff9500',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DashboardScreen;
