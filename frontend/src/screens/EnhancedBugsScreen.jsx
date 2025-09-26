import React, {useState, useEffect, useCallback} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/enhancedNetworkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth} = Dimensions.get('window');

const EnhancedBugsScreen = ({navigation}) => {
  // State for bugs and filters
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // User and permissions
  const [currentUser, setCurrentUser] = useState(null);
  
  // Auto-refresh for real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filter options
  const statusOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    loadCurrentUser();
    loadBugs();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadBugs(true); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [bugs, searchQuery, selectedStatus, selectedPriority, selectedProject]);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadBugs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await apiRequest('/api/bugs?limit=50&sortBy=createdAt&sortOrder=desc');
      
      if (response.success) {
        console.log('📋 Bugs API response:', response.data);
        const bugsArray = response.data.bugs || [];
        console.log('🐛 First bug sample:', bugsArray[0]);
        setBugs(bugsArray);
        setLastRefresh(new Date());
      } else {
        console.error('❌ Failed to load bugs:', response.message);
        if (!silent) {
          Alert.alert('Error', response.message || 'Failed to load bugs');
        }
      }
    } catch (error) {
      console.error('Error loading bugs:', error);
      if (!silent) {
        Alert.alert('Error', 'Failed to load bugs');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBugs();
    setRefreshing(false);
  }, []);

  const applyFilters = () => {
    let filtered = [...bugs];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(bug => 
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.bugId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(bug => 
        bug.status.toLowerCase().replace('-', ' ') === selectedStatus.toLowerCase().replace('-', ' ')
      );
    }

    // Apply priority filter
    if (selectedPriority !== 'All') {
      filtered = filtered.filter(bug => 
        bug.priority.toLowerCase() === selectedPriority.toLowerCase()
      );
    }

    // Apply project filter
    if (selectedProject !== 'All') {
      filtered = filtered.filter(bug => 
        bug.project?.name === selectedProject
      );
    }

    setFilteredBugs(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedProject('All');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase().replace('-', '')) {
      case 'open': return '#FF6B6B';
      case 'inprogress': return '#4ECDC4';
      case 'resolved': return '#45B7D1';
      case 'closed': return '#6C5CE7';
      default: return '#95A5A6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#E74C3C';
      case 'high': return '#E67E22';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  };

  const navigateToBugDetail = (bugId) => {
    console.log('🔍 Navigating to bug detail with ID:', bugId);
    navigation.navigate('EnhancedBugDetail', { bugId });
  };

  const navigateToCreateBug = () => {
    navigation.navigate('CreateBug');
  };

  const BugCard = ({ bug }) => (
    <TouchableOpacity 
      style={styles.bugCard}
      onPress={() => {
        console.log('🐛 Bug data:', { id: bug.id, _id: bug._id, bugId: bug.bugId });
        const bugId = bug._id || bug.id;
        if (!bugId) {
          console.error('❌ Bug ID is undefined!');
          Alert.alert('Error', 'Cannot open bug details: Invalid bug ID');
          return;
        }
        navigateToBugDetail(bugId);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.bugHeader}>
        <View style={styles.bugMeta}>
          <Text style={styles.bugId}>#{bug.bugId}</Text>
          <Text style={styles.timeAgo}>{getTimeAgo(bug.createdAt)}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bug.status) }]}>
            <Text style={styles.badgeText}>{bug.status?.toUpperCase()}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(bug.priority) }]}>
            <Text style={styles.badgeText}>{bug.priority?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bugTitle} numberOfLines={2}>{bug.title}</Text>
      <Text style={styles.bugDescription} numberOfLines={3}>{bug.description}</Text>

      <View style={styles.bugFooter}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {bug.reportedBy?.name ? bug.reportedBy.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{bug.reportedBy?.name || 'Unknown'}</Text>
        </View>

        <View style={styles.bugStats}>
          {bug.comments && bug.comments.length > 0 && (
            <View style={styles.statItem}>
              <Icon name="comment" size={16} color="#666" />
              <Text style={styles.statText}>{bug.comments.length}</Text>
            </View>
          )}
          
          {bug.pullRequests && bug.pullRequests.length > 0 && (
            <View style={styles.statItem}>
              <Icon name="merge-type" size={16} color="#666" />
              <Text style={styles.statText}>{bug.pullRequests.length}</Text>
            </View>
          )}
          
          {bug.pointsAwarded > 0 && (
            <View style={styles.statItem}>
              <Icon name="stars" size={16} color="#F39C12" />
              <Text style={[styles.statText, { color: '#F39C12' }]}>{bug.pointsAwarded}</Text>
            </View>
          )}
        </View>
      </View>

      {bug.project && (
        <View style={styles.projectTag}>
          <Text style={styles.projectTagText}>{bug.project.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Bugs</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                  {statusOptions.map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        selectedStatus === status && styles.filterChipSelected
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedStatus === status && styles.filterChipTextSelected
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Priority</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterRow}>
                  {priorityOptions.map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.filterChip,
                        selectedPriority === priority && styles.filterChipSelected
                      ]}
                      onPress={() => setSelectedPriority(priority)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedPriority === priority && styles.filterChipTextSelected
                      ]}>
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Auto-refresh Toggle */}
            <View style={styles.filterSection}>
              <View style={styles.toggleRow}>
                <Text style={styles.filterSectionTitle}>Auto-refresh</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    autoRefresh && styles.toggleActive
                  ]}
                  onPress={() => setAutoRefresh(!autoRefresh)}
                >
                  <View style={[
                    styles.toggleThumb,
                    autoRefresh && styles.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.lastRefreshText}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.filterModalActions}>
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading bugs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bug Reports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="filter-list" size={24} color="#2E3A59" />
            {(selectedStatus !== 'All' || selectedPriority !== 'All' || selectedProject !== 'All') && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Icon name="refresh" size={24} color="#2E3A59" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bugs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{bugs.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {bugs.filter(b => b.status === 'open').length}
          </Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {bugs.filter(b => b.status === 'resolved').length}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {bugs.filter(b => b.priority === 'critical' || b.priority === 'high').length}
          </Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>

      {/* Active Filters */}
      {(selectedStatus !== 'All' || selectedPriority !== 'All' || searchQuery) && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFiltersRow}>
              {searchQuery && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close" size={16} color="#3498DB" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedStatus !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Status: {selectedStatus}</Text>
                  <TouchableOpacity onPress={() => setSelectedStatus('All')}>
                    <Icon name="close" size={16} color="#3498DB" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedPriority !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Priority: {selectedPriority}</Text>
                  <TouchableOpacity onPress={() => setSelectedPriority('All')}>
                    <Icon name="close" size={16} color="#3498DB" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={clearFilters} style={styles.clearAllFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bug List */}
      <FlatList
        data={filteredBugs || []}
        renderItem={({ item }) => <BugCard bug={item} />}
        keyExtractor={(item, index) => item?._id || `bug-${index}`}
        contentContainerStyle={styles.bugList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bug-report" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No bugs found</Text>
            <Text style={styles.emptySubtitle}>
              {filteredBugs.length !== bugs.length 
                ? 'Try adjusting your filters'
                : 'Be the first to report a bug'
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Create Bug FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToCreateBug}
        activeOpacity={0.7}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flex: 1,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#3498DB',
    marginRight: 6,
  },
  clearAllFilters: {
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  bugList: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
    backgroundColor: '#000000',
  },
  bugCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bugMeta: {
    flex: 1,
  },
  bugId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666666',
  },
  badges: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 22,
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  userName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  bugStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  projectTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  projectTagText: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#000000',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
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
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444444',
    marginRight: 8,
    backgroundColor: '#2a2a2a',
  },
  filterChipSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterChipText: {
    fontSize: 14,
    color: '#ffffff',
  },
  filterChipTextSelected: {
    color: '#FFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444444',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#3498DB',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  lastRefreshText: {
    fontSize: 12,
    color: '#888888',
  },
  filterModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3498DB',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default EnhancedBugsScreen;