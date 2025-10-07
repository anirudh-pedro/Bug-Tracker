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
import { Colors, getStatusColor, getPriorityColor } from '../theme/colors';
import { BugListSkeleton } from '../components/SkeletonLoader';

const {width: screenWidth} = Dimensions.get('window');

const EnhancedBugsScreen = ({navigation, route}) => {
  // Project filter from navigation params
  const projectFilter = route?.params?.projectId ? {
    projectId: route.params.projectId,
    projectName: route.params.projectName
  } : null;

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
  
  // Section management for My Bugs vs Global Bugs
  const [activeSection, setActiveSection] = useState('global-bugs'); // 'my-bugs' or 'global-bugs'
  
  // Bug counts for tabs
  const [myBugsCount, setMyBugsCount] = useState(0);
  const [globalBugsCount, setGlobalBugsCount] = useState(0);
  
  // Auto-refresh for real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Edit/Delete modal states
  const [selectedBug, setSelectedBug] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSeverity, setEditSeverity] = useState('Medium');
  const [editStatus, setEditStatus] = useState('Open');
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter options
  const statusOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    loadCurrentUser();
    loadBugs();
    
    // Set up auto-refresh every 2 minutes (less aggressive)
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadBugs(true); // Silent refresh
      }
    }, 120000); // 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, bugs, loading, activeSection]);

  const loadCurrentUser = async () => {
    try {
      // First try to get user data from the standardized 'user_data' key
      let userData = await AsyncStorage.getItem('user_data');
      
      if (!userData) {
        // If that doesn't work, try to get all keys and find user_data_* keys
        const allKeys = await AsyncStorage.getAllKeys();
        const userDataKey = allKeys.find(key => key.startsWith('user_data_'));
        
        if (userDataKey) {
          console.log('🔍 Found user data key:', userDataKey);
          userData = await AsyncStorage.getItem(userDataKey);
        }
      }
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Loaded current user:', user);
        setCurrentUser(user);
      } else {
        console.log('⚠️ No user data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadBugs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await apiRequest('/api/bugs?limit=20&sortBy=createdAt&sortOrder=desc');
      
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

  const getMyBugs = useCallback(() => {
    if (!currentUser) {
      console.log('🔍 getMyBugs: No current user, returning empty array');
      return [];
    }
    
    // Convert both IDs to strings for comparison to handle ObjectId vs string mismatch
    const currentUserId = String(currentUser.id);
    const myBugs = bugs.filter(bug => {
      const reportedById = String(bug.reportedBy?.id || '');
      const match = reportedById === currentUserId;
      return match;
    });
    
    console.log('🔍 getMyBugs: currentUser.id:', currentUser.id);
    console.log('🔍 getMyBugs: currentUserId (string):', currentUserId);
    console.log('🔍 getMyBugs: Total bugs:', bugs.length);
    console.log('🔍 getMyBugs: My bugs:', myBugs.length);
    if (bugs.length > 0) {
      console.log('🔍 getMyBugs: First bug reportedBy:', bugs[0].reportedBy);
      console.log('🔍 getMyBugs: First bug reportedById (string):', String(bugs[0].reportedBy?.id));
      console.log('🔍 getMyBugs: ID comparison:', String(bugs[0].reportedBy?.id), '===', currentUserId, '→', String(bugs[0].reportedBy?.id) === currentUserId);
    }
    return myBugs;
  }, [bugs, currentUser]);

  const getGlobalBugs = useCallback(() => {
    console.log('🔍 getGlobalBugs: Returning ALL bugs');
    console.log('🔍 getGlobalBugs: Total bugs:', bugs.length);
    if (bugs.length > 0) {
      console.log('🔍 getGlobalBugs: First bug reportedBy:', bugs[0].reportedBy);
    }
    return bugs; // Show ALL bugs in global view
  }, [bugs]);

  // Edit and Delete handlers
  const handleEditBug = (bug) => {
    setSelectedBug(bug);
    setEditTitle(bug.title);
    setEditDescription(bug.description);
    setEditSeverity(bug.severity);
    setEditStatus(bug.status);
    setShowEditModal(true);
  };

  const handleDeleteBug = (bug) => {
    setSelectedBug(bug);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBug || !editTitle.trim()) return;

    try {
      setIsEditingSaving(true);
      const response = await enhancedNetworkUtils.put(`/bugs/${selectedBug._id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        severity: editSeverity,
        status: editStatus,
      });

      if (response.success) {
        // Update the bug in the local state
        setBugs(prevBugs => prevBugs.map(bug => 
          bug._id === selectedBug._id 
            ? { ...bug, title: editTitle, description: editDescription, severity: editSeverity, status: editStatus }
            : bug
        ));
        
        setShowEditModal(false);
        setSelectedBug(null);
        Alert.alert('Success', 'Bug updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update bug');
      }
    } catch (error) {
      console.error('Error updating bug:', error);
      Alert.alert('Error', 'Failed to update bug. Please try again.');
    } finally {
      setIsEditingSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBug) return;

    try {
      setIsDeleting(true);
      const response = await enhancedNetworkUtils.delete(`/bugs/${selectedBug._id}`);

      if (response.success) {
        // Remove the bug from local state
        setBugs(prevBugs => prevBugs.filter(bug => bug._id !== selectedBug._id));
        setShowDeleteModal(false);
        setSelectedBug(null);
        Alert.alert('Success', 'Bug deleted successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to delete bug');
      }
    } catch (error) {
      console.error('Error deleting bug:', error);
      Alert.alert('Error', 'Failed to delete bug. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBugs();
    setRefreshing(false);
  }, []);

  const applyFilters = useCallback(() => {
    console.log('🔍 applyFilters: Starting - loading:', loading, 'bugs.length:', bugs.length, 'activeSection:', activeSection);
    
    // Don't apply filters if we're still loading or have no bugs
    if (loading || bugs.length === 0) {
      console.log('🔍 applyFilters: Skipping - loading:', loading, 'bugs.length:', bugs.length);
      setFilteredBugs([]);
      return;
    }

    // Get base data based on active section
    let filtered = activeSection === 'my-bugs' ? getMyBugs() : getGlobalBugs();
    console.log('🔍 applyFilters: activeSection =', activeSection);
    console.log('🔍 applyFilters: base filtered count =', filtered.length);
    console.log('🔍 applyFilters: first bug sample =', filtered[0] ? { title: filtered[0].title, reportedBy: filtered[0].reportedBy?.name } : 'none');
    console.log('🔍 applyFilters: base filtered count =', filtered.length);

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

    // Apply route-based project filter (from navigation params)
    if (projectFilter) {
      filtered = filtered.filter(bug => 
        bug.project?._id === projectFilter.projectId
      );
    }

    console.log('🔍 applyFilters final result:', filtered.length, 'bugs');
    console.log('🔍 Setting filteredBugs to:', filtered);
    setFilteredBugs(filtered);
    
    // Update counts for tabs
    const myBugs = getMyBugs();
    const globalBugs = getGlobalBugs();
    setMyBugsCount(myBugs.length);
    setGlobalBugsCount(globalBugs.length);
    console.log('🔍 Updated counts - My Bugs:', myBugs.length, 'Global Bugs:', globalBugs.length);
  }, [loading, bugs.length, getMyBugs, getGlobalBugs, searchQuery, selectedStatus, selectedPriority, selectedProject, activeSection, projectFilter?.projectId]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedProject('All');
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
              <Icon name="comment" size={16} color={Colors.text.muted} />
              <Text style={styles.statText}>{bug.comments.length}</Text>
            </View>
          )}
          
          {bug.pullRequests && bug.pullRequests.length > 0 && (
            <View style={styles.statItem}>
              <Icon name="merge-type" size={16} color={Colors.text.muted} />
              <Text style={styles.statText}>{bug.pullRequests.length}</Text>
            </View>
          )}
          
          {bug.pointsAwarded > 0 && (
            <View style={styles.statItem}>
              <Icon name="stars" size={16} color={Colors.accent.yellow} />
              <Text style={[styles.statText, { color: Colors.accent.yellow }]}>{bug.pointsAwarded}</Text>
            </View>
          )}
        </View>
      </View>

      {bug.project && (
        <View style={styles.projectTag}>
          <Text style={styles.projectTagText}>{bug.project.name}</Text>
        </View>
      )}

      {/* Edit/Delete Actions - Only for user's own bugs in My Bugs section */}
      {activeSection === 'my-bugs' && currentUser && bug.reportedBy?.id === currentUser.id && (
        <View style={styles.bugActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditBug(bug)}
          >
            <Icon name="edit" size={16} color={Colors.accent.blue} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={() => handleDeleteBug(bug)}
          >
            <Icon name="delete" size={16} color={Colors.status.danger} />
            <Text style={[styles.actionButtonText, { color: Colors.status.danger }]}>Delete</Text>
          </TouchableOpacity>
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
              <Icon name="close" size={24} color={Colors.text.muted} />
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bug Reports</Text>
        </View>
        <BugListSkeleton count={8} />
      </SafeAreaView>
    );
  }

  console.log('🎯 RENDER: filteredBugs.length =', filteredBugs?.length);
  console.log('🎯 RENDER: activeSection =', activeSection);
  console.log('🎯 RENDER: bugs.length =', bugs?.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {projectFilter ? `${projectFilter.projectName} Bugs` : 'Bug Reports'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="filter-list" size={24} color={Colors.text.primary} />
            {(selectedStatus !== 'All' || selectedPriority !== 'All' || selectedProject !== 'All') && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Icon name="refresh" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity 
          style={[styles.sectionTab, activeSection === 'my-bugs' && styles.sectionTabActive]}
          onPress={() => setActiveSection('my-bugs')}
        >
          <Icon name="person" size={18} color={activeSection === 'my-bugs' ? Colors.primary.main : Colors.text.muted} />
          <Text style={[styles.sectionTabText, activeSection === 'my-bugs' && styles.sectionTabTextActive]}>
            My Bugs ({myBugsCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sectionTab, activeSection === 'global-bugs' && styles.sectionTabActive]}
          onPress={() => setActiveSection('global-bugs')}
        >
          <Icon name="public" size={18} color={activeSection === 'global-bugs' ? Colors.primary.main : Colors.text.muted} />
          <Text style={[styles.sectionTabText, activeSection === 'global-bugs' && styles.sectionTabTextActive]}>
            Global Bugs ({globalBugsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeSection === 'my-bugs' ? 'My Bug Reports' : 'Global Bug Reports'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {activeSection === 'my-bugs' 
            ? 'Bugs you have reported. You can edit and delete these.'
            : 'All bugs reported by everyone, including yourself.'
          }
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={Colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bugs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={Colors.text.muted} />
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
                    <Icon name="close" size={16} color={Colors.primary.main} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedStatus !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Status: {selectedStatus}</Text>
                  <TouchableOpacity onPress={() => setSelectedStatus('All')}>
                    <Icon name="close" size={16} color={Colors.primary.main} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedPriority !== 'All' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Priority: {selectedPriority}</Text>
                  <TouchableOpacity onPress={() => setSelectedPriority('All')}>
                    <Icon name="close" size={16} color={Colors.primary.main} />
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
            <Icon name="bug-report" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>
              {activeSection === 'my-bugs' ? 'No bugs reported by you' : 'No bugs found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filteredBugs.length !== bugs.length 
                ? 'Try adjusting your filters'
                : activeSection === 'my-bugs' 
                  ? 'Create your first bug report'
                  : 'No bugs have been reported yet'
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120, // estimated item height
          offset: 120 * index,
          index,
        })}
        updateCellsBatchingPeriod={50}
      />

      {/* Create Bug FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToCreateBug}
        activeOpacity={0.7}
      >
        <Icon name="add" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      <FilterModal />

      {/* Edit Bug Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.editModalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Bug</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={Colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter bug title"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, { height: 100 }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter bug description"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Severity</Text>
                <View style={styles.pickerContainer}>
                  {['Low', 'Medium', 'High', 'Critical'].map((severity) => (
                    <TouchableOpacity
                      key={severity}
                      style={[
                        styles.pickerOption,
                        editSeverity === severity && styles.pickerOptionSelected
                      ]}
                      onPress={() => setEditSeverity(severity)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editSeverity === severity && styles.pickerOptionTextSelected
                      ]}>
                        {severity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.pickerContainer}>
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.pickerOption,
                        editStatus === status && styles.pickerOptionSelected
                      ]}
                      onPress={() => setEditStatus(status)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editStatus === status && styles.pickerOptionTextSelected
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEdit}
                disabled={isEditingSaving}
              >
                {isEditingSaving ? (
                  <ActivityIndicator size="small" color={Colors.text.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.editModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Icon name="warning" size={48} color={Colors.status.error} />
              <Text style={styles.deleteModalTitle}>Delete Bug</Text>
              <Text style={styles.deleteModalMessage}>
                Are you sure you want to delete this bug? This action cannot be undone.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.text.primary} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
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
    backgroundColor: Colors.status.danger,
  },
  refreshButton: {
    padding: 8,
  },
  // Section Tab Styles
  sectionTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: Colors.background.card,
    borderWidth: 2,
    borderColor: Colors.border.medium,
  },
  sectionTabActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 6,
  },
  sectionTabTextActive: {
    color: Colors.primary.text,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.muted,
    lineHeight: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flex: 1,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  activeFilterText: {
    fontSize: 12,
    color: Colors.primary.main,
    marginRight: 6,
  },
  clearAllFilters: {
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: Colors.status.error,
    fontWeight: '600',
  },
  bugList: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
    backgroundColor: Colors.background.primary,
  },
  bugCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.background.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.text.muted,
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
    color: Colors.text.primary,
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  bugDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.status.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  userName: {
    fontSize: 14,
    color: Colors.text.primary,
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
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  projectTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  projectTagText: {
    fontSize: 10,
    color: Colors.status.success,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.background.primary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.background.primary,
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
  
  // Bug actions styles
  bugActions: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#3498DB',
    gap: 4,
  },
  deleteActionButton: {
    borderColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3498DB',
  },
  
  // Modal styles for edit/delete
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    backgroundColor: '#F8F9FA',
  },
  pickerOptionSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  pickerOptionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    backgroundColor: '#F8F9FA',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#3498DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#E74C3C',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  deleteModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 12,
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EnhancedBugsScreen;