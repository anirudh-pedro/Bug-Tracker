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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width: screenWidth} = Dimensions.get('window');

const BugsScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sample bug data with different users
  const [allBugs, setAllBugs] = useState([
    {
      id: 1,
      title: 'Login button not responding',
      description: 'The login button becomes unresponsive after multiple clicks...',
      priority: 'High',
      status: 'Open',
      project: 'Web App',
      category: 'Frontend',
      user: {
        name: 'Sarah Chen',
        avatar: 'SC',
        color: '#4CAF50'
      },
      timeAgo: '2 hours ago',
      tags: ['Authentication', 'UI/UX']
    },
    {
      id: 2,
      title: 'Database connection timeout',
      description: 'Users experiencing timeouts when trying to connect to the database...',
      priority: 'Critical',
      status: 'In Progress',
      project: 'Backend API',
      category: 'Backend',
      user: {
        name: 'Mike Johnson',
        avatar: 'MJ',
        color: '#2196F3'
      },
      timeAgo: '4 hours ago',
      tags: ['Database', 'Performance']
    },
    {
      id: 3,
      title: 'Mobile app crashes on startup',
      description: 'The mobile application crashes immediately after opening...',
      priority: 'Critical',
      status: 'Open',
      project: 'Mobile App',
      category: 'Mobile',
      user: {
        name: 'Alex Rodriguez',
        avatar: 'AR',
        color: '#FF9800'
      },
      timeAgo: '6 hours ago',
      tags: ['Crash', 'Startup']
    },
    {
      id: 4,
      title: 'Email notifications not sending',
      description: 'Users are not receiving email notifications for new activities...',
      priority: 'Medium',
      status: 'Open',
      project: 'Email Service',
      category: 'Backend',
      user: {
        name: 'Lisa Wang',
        avatar: 'LW',
        color: '#9C27B0'
      },
      timeAgo: '8 hours ago',
      tags: ['Email', 'Notifications']
    },
    {
      id: 5,
      title: 'UI elements misaligned on tablets',
      description: 'Several UI components appear misaligned when viewed on tablet devices...',
      priority: 'Low',
      status: 'Resolved',
      project: 'Web App',
      category: 'Frontend',
      user: {
        name: 'David Kim',
        avatar: 'DK',
        color: '#795548'
      },
      timeAgo: '1 day ago',
      tags: ['Responsive', 'UI/UX']
    },
    {
      id: 6,
      title: 'API response times are slow',
      description: 'The API endpoints are taking longer than expected to respond...',
      priority: 'Medium',
      status: 'In Progress',
      project: 'Backend API',
      category: 'Backend',
      user: {
        name: 'Emma Thompson',
        avatar: 'ET',
        color: '#E91E63'
      },
      timeAgo: '1 day ago',
      tags: ['Performance', 'API']
    }
  ]);

  const [filteredBugs, setFilteredBugs] = useState(allBugs);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleStatusToggle = (bugId) => {
    setAllBugs(prevBugs => 
      prevBugs.map(bug => {
        if (bug.id === bugId) {
          const newStatus = bug.status === 'Open' ? 'Resolved' : 'Open';
          return {...bug, status: newStatus};
        }
        return bug;
      })
    );
  };

  const handleDeleteBug = (bugId) => {
    Alert.alert(
      'Delete Bug',
      'Are you sure you want to delete this bug report?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAllBugs(prevBugs => prevBugs.filter(bug => bug.id !== bugId));
          }
        }
      ]
    );
  };

  const filterBugs = () => {
    let filtered = allBugs;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(bug => bug.status === selectedFilter);
    }

    // Filter by priority
    if (selectedPriority !== 'All') {
      filtered = filtered.filter(bug => bug.priority === selectedPriority);
    }

    // Filter by project
    if (selectedProject !== 'All') {
      filtered = filtered.filter(bug => bug.project === selectedProject);
    }

    setFilteredBugs(filtered);
  };

  useEffect(() => {
    filterBugs();
  }, [searchQuery, selectedFilter, selectedPriority, selectedProject, allBugs]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#FF4444';
      case 'High':
        return '#FF8800';
      case 'Medium':
        return '#FFBB33';
      case 'Low':
        return '#00C851';
      default:
        return '#999999';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#2196F3';
      case 'In Progress':
        return '#FF9800';
      case 'Resolved':
        return '#4CAF50';
      case 'Closed':
        return '#9E9E9E';
      default:
        return '#999999';
    }
  };

  const renderBugItem = ({item}) => (
    <View style={styles.bugCard}>
      <TouchableOpacity 
        style={styles.bugContent}
        onPress={() => navigation.navigate('BugDetail', {bugId: item.id})}
      >
        <View style={styles.bugHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, {backgroundColor: item.user.color}]}>
              <Text style={styles.avatarText}>{item.user.avatar}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(item.priority)}]} />
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        
        <Text style={styles.bugTitle}>{item.title}</Text>
        <Text style={styles.bugDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.bugFooter}>
          <View style={styles.projectInfo}>
            <Icon name="folder" size={16} color="#ff9500" />
            <Text style={styles.projectText}>{item.project}</Text>
          </View>
          <View style={[styles.statusTag, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
      
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickActionButton, styles.statusToggleButton]}
          onPress={() => handleStatusToggle(item.id)}
        >
          <Icon 
            name={item.status === 'Open' ? 'check' : 'refresh'} 
            size={16} 
            color="#ffffff" 
          />
          <Text style={styles.quickActionText}>
            {item.status === 'Open' ? 'Resolve' : 'Reopen'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, styles.deleteActionButton]}
          onPress={() => handleDeleteBug(item.id)}
        >
          <Icon name="delete" size={16} color="#ffffff" />
          <Text style={styles.quickActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Bugs</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      selectedFilter === status && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedFilter(status)}>
                    <Text style={[
                      styles.filterOptionText,
                      selectedFilter === status && styles.selectedFilterOptionText
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
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      selectedPriority === priority && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedPriority(priority)}>
                    <Text style={[
                      styles.filterOptionText,
                      selectedPriority === priority && styles.selectedFilterOptionText
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
                {['All', 'Web App', 'Mobile App', 'Backend API', 'Email Service'].map((project) => (
                  <TouchableOpacity
                    key={project}
                    style={[
                      styles.filterOption,
                      selectedProject === project && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedProject(project)}>
                    <Text style={[
                      styles.filterOptionText,
                      selectedProject === project && styles.selectedFilterOptionText
                    ]}>
                      {project}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bug Reports</Text>
          <Text style={styles.headerSubtitle}>{filteredBugs.length} bugs found</Text>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color="#999999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bugs, tags, or descriptions..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}>
            <Icon name="filter-list" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Bugs List */}
        <FlatList
          data={filteredBugs}
          renderItem={renderBugItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.bugsList}
          contentContainerStyle={styles.bugsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ff9500']}
              tintColor="#ff9500"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="bug-report" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>No bugs found</Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to report a bug
              </Text>
            </View>
          }
        />

        <FilterModal />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  filterButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bugsList: {
    flex: 1,
  },
  bugsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bugCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.8)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bugContent: {
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    gap: 1,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  statusToggleButton: {
    backgroundColor: '#2196F3',
  },
  deleteActionButton: {
    backgroundColor: '#ff4757',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  bugDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  bugFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectText: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#cccccc',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'rgba(17, 17, 17, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterContent: {
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
    borderRadius: 8,
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedFilterOption: {
    backgroundColor: '#ff9500',
    borderColor: '#ff9500',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '500',
  },
  selectedFilterOptionText: {
    color: '#ffffff',
  },
  applyButton: {
    margin: 20,
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

export default BugsScreen;
