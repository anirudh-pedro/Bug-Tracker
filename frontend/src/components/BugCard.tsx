import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Bug, Priority, BugStatus } from '../types/Bug';

interface BugCardProps {
  bug: Bug;
  onPress: (bug: Bug) => void;
}

const BugCard: React.FC<BugCardProps> = ({ bug, onPress }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const cardStyle = {
    backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#333333',
  };

  const subtextStyle = {
    color: isDarkMode ? '#cccccc' : '#666666',
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return '#FF3B30';
      case Priority.HIGH:
        return '#FF9500';
      case Priority.MEDIUM:
        return '#FFCC00';
      case Priority.LOW:
        return '#34C759';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case BugStatus.OPEN:
        return '#FF3B30';
      case BugStatus.IN_PROGRESS:
        return '#007AFF';
      case BugStatus.RESOLVED:
        return '#34C759';
      case BugStatus.CLOSED:
        return '#6c757d';
      case BugStatus.REOPENED:
        return '#FF9500';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatStatus = (status: BugStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <TouchableOpacity
      style={[styles.container, cardStyle]}
      onPress={() => onPress(bug)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]} numberOfLines={2}>
          {bug.title}
        </Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(bug.priority) },
            ]}
          >
            <Text style={styles.badgeText}>
              {bug.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, subtextStyle]} numberOfLines={2}>
        {bug.description}
      </Text>

      {/* Status and Meta */}
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(bug.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {formatStatus(bug.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={[styles.metaText, subtextStyle]}>
            #{bug.id} • {formatDate(bug.createdAt)}
          </Text>
          {bug.assignee && (
            <Text style={[styles.metaText, subtextStyle]}>
              Assigned to: {bug.assignee}
            </Text>
          )}
        </View>
      </View>

      {/* Tags */}
      {bug.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {bug.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {bug.tags.length > 3 && (
            <Text style={[styles.tagText, subtextStyle]}>
              +{bug.tags.length - 3} more
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#495057',
  },
});

export default BugCard;
