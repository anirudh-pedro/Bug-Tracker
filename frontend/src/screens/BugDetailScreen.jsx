import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width: screenWidth} = Dimensions.get('window');

const BugDetailScreen = ({route, navigation}) => {
  const {bugId} = route.params;
  
  const [bug, setBug] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isReporter, setIsReporter] = useState(true); // In real app, check if current user is the reporter
  const [userRole, setUserRole] = useState('reporter'); // 'reporter' or 'contributor'

  // Sample bug data - in real app, fetch from API
  const sampleBug = {
    id: bugId,
    title: 'Login button not responding after multiple clicks',
    description: 'When users click the login button multiple times quickly, it becomes unresponsive and the app freezes temporarily. This happens consistently across different devices.',
    stepsToReproduce: '1. Open the app\n2. Navigate to login screen\n3. Click login button rapidly 5-6 times\n4. Observe button becomes unresponsive',
    expectedBehavior: 'Login should process once and disable button during processing',
    actualBehavior: 'Button becomes unresponsive and app freezes',
    environment: 'Android 12, iOS 15+, React Native 0.71',
    priority: 'High',
    severity: 'Major',
    status: 'Open',
    category: 'Bug',
    project: 'Bug Tracker Mobile App',
    repositoryUrl: 'https://github.com/user/bug-tracker',
    reportedBy: {
      id: 1,
      name: 'Sarah Chen',
      avatar: 'SC',
      color: '#4CAF50',
      points: 150
    },
    assignedTo: null,
    reportedAt: '2025-08-25T10:30:00Z',
    points: 15, // Points awarded for solving this bug
    attachments: [
      {
        id: 1,
        type: 'image',
        name: 'login_screen_bug.png',
        url: 'https://example.com/image1.png'
      }
    ],
    comments: [
      {
        id: 1,
        user: {
          id: 2,
          name: 'Mike Johnson',
          avatar: 'MJ',
          color: '#2196F3'
        },
        message: 'I can reproduce this issue. It seems like a race condition in the authentication handler.',
        timestamp: '2025-08-25T11:00:00Z',
        type: 'comment'
      },
      {
        id: 2,
        user: {
          id: 3,
          name: 'Alex Rodriguez',
          avatar: 'AR',
          color: '#FF9800'
        },
        message: 'I\'ve forked the repo and working on a fix. Will submit PR soon.',
        timestamp: '2025-08-25T12:30:00Z',
        type: 'activity'
      }
    ],
    relatedPRs: [
      {
        id: 1,
        title: 'Fix login button race condition',
        url: 'https://github.com/user/bug-tracker/pull/123',
        author: 'Alex Rodriguez',
        status: 'open',
        createdAt: '2025-08-25T13:00:00Z'
      }
    ],
    tags: ['Authentication', 'UI/UX', 'Race Condition']
  };

  useEffect(() => {
    // In real app, fetch bug details from API
    setBug(sampleBug);
    
    // Determine if current user is the reporter
    setUserRole(sampleBug.reportedBy.id === 1 ? 'reporter' : 'contributor'); // Mock current user ID = 1
  }, [bugId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        id: 1, // Current user
        name: 'Current User',
        avatar: 'CU',
        color: '#ff9500'
      },
      message: newComment.trim(),
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    setBug(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
    setNewComment('');
  };

  const handleStatusChange = (newStatus) => {
    setBug(prev => ({...prev, status: newStatus}));
    setShowStatusModal(false);
    
    if (newStatus === 'Resolved') {
      Alert.alert(
        'Bug Resolved!',
        'Great work! The contributor who solved this bug will receive points.',
        [{text: 'OK'}]
      );
    }
  };

  const handleForkRepository = () => {
    if (bug.repositoryUrl) {
      Alert.alert(
        'Fork Repository',
        'This will open the repository in your browser where you can fork it and start working on a fix.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Repository', onPress: () => Linking.openURL(bug.repositoryUrl)}
        ]
      );
    } else {
      Alert.alert('No Repository', 'This bug doesn\'t have a linked repository.');
    }
  };

  const handleAssignToMe = () => {
    Alert.alert(
      'Assign Bug',
      'Are you sure you want to assign this bug to yourself? This indicates you\'re working on a solution.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Assign',
          onPress: () => {
            setBug(prev => ({
              ...prev,
              assignedTo: {
                id: 1,
                name: 'Current User',
                avatar: 'CU',
                color: '#ff9500'
              }
            }));
          }
        }
      ]
    );
  };

  const handleDeleteBug = () => {
    Alert.alert(
      'Delete Bug Report',
      'Are you sure you want to delete this bug report? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In real app, make API call to delete bug
            navigation.goBack();
            Alert.alert('Bug Deleted', 'The bug report has been deleted successfully.');
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#ff4757';
      case 'High': return '#ff9500';
      case 'Medium': return '#ffa502';
      case 'Low': return '#2ed573';
      default: return '#888888';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#2196F3';
      case 'In Progress': return '#FF9800';
      case 'Resolved': return '#4CAF50';
      case 'Closed': return '#9E9E9E';
      default: return '#888888';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (!bug) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bug details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bug Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Bug Info Card */}
        <View style={styles.bugCard}>
          <View style={styles.bugHeader}>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(bug.priority)}]} />
              <Text style={styles.priorityText}>{bug.priority}</Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(bug.status)}]}>
              <Text style={styles.statusText}>{bug.status}</Text>
            </View>
          </View>

          <Text style={styles.bugTitle}>{bug.title}</Text>
          
          <View style={styles.bugMeta}>
            <View style={styles.reporterInfo}>
              <View style={[styles.avatar, {backgroundColor: bug.reportedBy.color}]}>
                <Text style={styles.avatarText}>{bug.reportedBy.avatar}</Text>
              </View>
              <View>
                <Text style={styles.reporterName}>Reported by {bug.reportedBy.name}</Text>
                <Text style={styles.reportedTime}>{formatTimestamp(bug.reportedAt)}</Text>
              </View>
            </View>
            
            <View style={styles.pointsBadge}>
              <Icon name="emoji-events" size={16} color="#ff9500" />
              <Text style={styles.pointsText}>{bug.points} pts</Text>
            </View>
          </View>

          {bug.assignedTo && (
            <View style={styles.assignedSection}>
              <Icon name="person" size={16} color="#ff9500" />
              <Text style={styles.assignedText}>
                Assigned to {bug.assignedTo.name}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {userRole === 'contributor' && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleForkRepository}>
                <Icon name="call-split" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Fork & Fix</Text>
              </TouchableOpacity>
              
              {!bug.assignedTo && (
                <TouchableOpacity style={styles.actionButton} onPress={handleAssignToMe}>
                  <Icon name="person-add" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Assign to Me</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          {userRole === 'reporter' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.statusButton]} 
                onPress={() => setShowStatusModal(true)}
              >
                <Icon name="edit" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Update Status</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={handleDeleteBug}
              >
                <Icon name="delete" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bug Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>{bug.description}</Text>

          <Text style={styles.sectionTitle}>Steps to Reproduce</Text>
          <Text style={styles.sectionContent}>{bug.stepsToReproduce}</Text>

          {bug.expectedBehavior && (
            <>
              <Text style={styles.sectionTitle}>Expected Behavior</Text>
              <Text style={styles.sectionContent}>{bug.expectedBehavior}</Text>
            </>
          )}

          {bug.actualBehavior && (
            <>
              <Text style={styles.sectionTitle}>Actual Behavior</Text>
              <Text style={styles.sectionContent}>{bug.actualBehavior}</Text>
            </>
          )}

          {bug.environment && (
            <>
              <Text style={styles.sectionTitle}>Environment</Text>
              <Text style={styles.sectionContent}>{bug.environment}</Text>
            </>
          )}

          {bug.repositoryUrl && (
            <View style={styles.repositorySection}>
              <Text style={styles.sectionTitle}>Repository</Text>
              <TouchableOpacity 
                style={styles.repositoryLink}
                onPress={() => Linking.openURL(bug.repositoryUrl)}
              >
                <Icon name="link" size={16} color="#ff9500" />
                <Text style={styles.repositoryText} numberOfLines={1}>
                  {bug.repositoryUrl}
                </Text>
                <Icon name="open-in-new" size={16} color="#ff9500" />
              </TouchableOpacity>
            </View>
          )}

          {bug.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {bug.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Related Pull Requests */}
        {bug.relatedPRs.length > 0 && (
          <View style={styles.prCard}>
            <Text style={styles.sectionTitle}>Related Pull Requests</Text>
            {bug.relatedPRs.map((pr, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.prItem}
                onPress={() => Linking.openURL(pr.url)}
              >
                <Icon name="merge-type" size={20} color="#ff9500" />
                <View style={styles.prInfo}>
                  <Text style={styles.prTitle}>{pr.title}</Text>
                  <Text style={styles.prAuthor}>by {pr.author} • {formatTimestamp(pr.createdAt)}</Text>
                </View>
                <View style={[styles.prStatus, {
                  backgroundColor: pr.status === 'open' ? '#2196F3' : '#4CAF50'
                }]}>
                  <Text style={styles.prStatusText}>{pr.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsCard}>
          <Text style={styles.sectionTitle}>Discussion ({bug.comments.length})</Text>
          
          {bug.comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={[styles.commentAvatar, {backgroundColor: comment.user.color}]}>
                <Text style={styles.commentAvatarText}>{comment.user.avatar}</Text>
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                  <Text style={styles.commentTime}>{formatTimestamp(comment.timestamp)}</Text>
                </View>
                <Text style={styles.commentMessage}>{comment.message}</Text>
              </View>
            </View>
          ))}

          {/* Add Comment */}
          <View style={styles.addCommentSection}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#666666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={styles.commentButton}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Icon name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Bug Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Icon name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusOptions}>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    bug.status === status && styles.selectedStatusOption
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <View style={[styles.statusDot, {backgroundColor: getStatusColor(status)}]} />
                  <Text style={[
                    styles.statusOptionText,
                    bug.status === status && styles.selectedStatusOptionText
                  ]}>
                    {status}
                  </Text>
                  {status === 'Resolved' && (
                    <Text style={styles.statusDescription}>
                      Mark as fixed and award points
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#000000',
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bugCard: {
    backgroundColor: '#111111',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityBadge: {
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
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  bugTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 26,
  },
  bugMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterInfo: {
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
  reporterName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  reportedTime: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '600',
  },
  assignedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  assignedText: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#111111',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionContent: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  repositorySection: {
    marginTop: 16,
  },
  repositoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  repositoryText: {
    flex: 1,
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '500',
  },
  tagsSection: {
    marginTop: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#222222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '500',
  },
  prCard: {
    backgroundColor: '#111111',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  prInfo: {
    flex: 1,
  },
  prTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  prAuthor: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  prStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  prStatusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  commentsCard: {
    backgroundColor: '#111111',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 11,
    color: '#888888',
  },
  commentMessage: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 18,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 80,
  },
  commentButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  statusModal: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
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
  statusOptions: {
    padding: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedStatusOption: {
    backgroundColor: '#ff9500',
    borderColor: '#ff9500',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedStatusOptionText: {
    color: '#ffffff',
  },
  statusDescription: {
    fontSize: 12,
    color: '#cccccc',
  },
});

export default BugDetailScreen;
