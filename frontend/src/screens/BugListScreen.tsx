import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  useColorScheme,
  RefreshControl,
  Alert,
} from 'react-native';
import { BugCard, Button, Loader } from '../components';
import TopHeader from '../components/TopHeader';
import { Bug, BugStatus, Priority } from '../types/Bug';
import BugAPI from '../api/bugApi';
import { Colors, getThemeColors } from '../constants/colors';
import { Strings } from '../constants/strings';

const BugListScreen: React.FC = () => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BugStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');

  const isDarkMode = useColorScheme() === 'dark';
  const themeColors = getThemeColors(isDarkMode);

  const handleBugPress = (bug: Bug) => {
    Alert.alert(
      'Bug Details',
      `Title: ${bug.title}\n\nDescription: ${bug.description}\n\nStatus: ${bug.status}\nPriority: ${bug.priority}\nReporter: ${bug.reporter}${bug.assignee ? `\nAssignee: ${bug.assignee}` : ''}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleCreateBug = () => {
    Alert.alert(
      'Create Bug',
      'Bug creation form will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  const loadBugs = async () => {
    try {
      setLoading(true);
      const fetchedBugs = await BugAPI.getBugs();
      setBugs(fetchedBugs);
    } catch (error) {
      console.error('Failed to load bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBugs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadBugs();
  }, []);

  const filteredBugs = useMemo(() => {
    let filtered = bugs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(query) ||
        bug.description.toLowerCase().includes(query) ||
        bug.id.toLowerCase().includes(query) ||
        bug.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(bug => bug.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(bug => bug.priority === selectedPriority);
    }

    return filtered;
  }, [bugs, searchQuery, selectedStatus, selectedPriority]);

  const renderFilterButton = (
    title: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <Button
      title={title}
      onPress={onPress}
      variant={isSelected ? 'primary' : 'outline'}
      size="small"
      style={styles.filterButton}
    />
  );

  const renderBugItem = ({ item }: { item: Bug }) => (
    <BugCard bug={item} onPress={handleBugPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
        {searchQuery ? 'No bugs found matching your search' : Strings.noBugs}
      </Text>
      {!searchQuery && (
        <Button
          title={Strings.reportBug}
          onPress={handleCreateBug}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  if (loading) {
    return <Loader text="Loading bugs..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader title={Strings.bugs} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={Strings.searchPlaceholder}
          placeholderTextColor={themeColors.textLight}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.filterLabel, { color: themeColors.text }]}>
          Status:
        </Text>
        <View style={styles.filterRow}>
          {renderFilterButton(
            'All',
            selectedStatus === 'all',
            () => setSelectedStatus('all')
          )}
          {Object.values(BugStatus).map(status => (
            renderFilterButton(
              status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
              selectedStatus === status,
              () => setSelectedStatus(status)
            )
          ))}
        </View>

        <Text style={[styles.filterLabel, { color: themeColors.text }]}>
          Priority:
        </Text>
        <View style={styles.filterRow}>
          {renderFilterButton(
            'All',
            selectedPriority === 'all',
            () => setSelectedPriority('all')
          )}
          {Object.values(Priority).map(priority => (
            renderFilterButton(
              priority.charAt(0).toUpperCase() + priority.slice(1),
              selectedPriority === priority,
              () => setSelectedPriority(priority)
            )
          ))}
        </View>
      </View>

      {/* Bug List */}
      <FlatList
        data={filteredBugs}
        renderItem={renderBugItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Button
          title="+ New Bug"
          onPress={handleCreateBug}
          style={styles.fab}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginBottom: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100, // Space for FAB
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default BugListScreen;
