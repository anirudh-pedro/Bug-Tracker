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
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth} = Dimensions.get('window');

const EnhancedBugDetailScreen = ({route, navigation}) => {
  const {bugId} = route.params;
  
  const [bug, setBug] = useState(null);
  const [githubActivity, setGithubActivity] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals and inputs
  const [showAwardPointsModal, setShowAwardPointsModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showGithubLinkModal, setShowGithubLinkModal] = useState(false);
  const [showForkModal, setShowForkModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  
  // Form states
  const [pointsToAward, setPointsToAward] = useState('');
  const [awardComment, setAwardComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [githubProfileUrl, setGithubProfileUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [forkUrl, setForkUrl] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [prNumber, setPrNumber] = useState('');

  useEffect(() => {
    loadBugDetails();
    loadCurrentUser();
  }, [bugId]);

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

  const loadBugDetails = async () => {
    try {
      setLoading(true);
      
      // Load bug details and GitHub activity in parallel
      const [bugResponse, githubResponse] = await Promise.all([
        apiRequest(`/api/bugs/${bugId}`),
        apiRequest(`/api/github/activity/${bugId}`)
      ]);

      if (bugResponse.success) {
        setBug(bugResponse.data.bug);
      }

      if (githubResponse.success) {
        setGithubActivity(githubResponse.data);
      }

    } catch (error) {
      console.error('Error loading bug details:', error);
      Alert.alert('Error', 'Failed to load bug details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBugDetails();
    setRefreshing(false);
  };

  const linkGithubRepo = async () => {
    try {
      if (!githubRepoUrl.trim()) {
        Alert.alert('Error', 'Please enter a valid GitHub repository URL');
        return;
      }

      // Extract owner and repo name from URL
      const urlParts = githubRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!urlParts) {
        Alert.alert('Error', 'Invalid GitHub repository URL format');
        return;
      }

      const [, owner, name] = urlParts;

      const response = await apiRequest(`/api/github/link-repo/${bugId}`, {
        method: 'POST',
        body: JSON.stringify({
          repoUrl: githubRepoUrl,
          owner: owner,
          name: name.replace('.git', ''),
          isPublic: true
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Repository linked successfully!');
        setShowGithubLinkModal(false);
        setGithubRepoUrl('');
        handleRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to link repository');
      }

    } catch (error) {
      console.error('Error linking repository:', error);
      Alert.alert('Error', 'Failed to link repository');
    }
  };

  const recordFork = async () => {
    try {
      if (!forkUrl.trim() || !githubUsername.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const response = await apiRequest(`/api/github/fork/${bugId}`, {
        method: 'POST',
        body: JSON.stringify({
          githubUsername,
          forkUrl
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Fork recorded successfully!');
        setShowForkModal(false);
        setForkUrl('');
        setGithubUsername('');
        handleRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to record fork');
      }

    } catch (error) {
      console.error('Error recording fork:', error);
      Alert.alert('Error', 'Failed to record fork');
    }
  };

  const submitPullRequest = async () => {
    try {
      if (!prUrl.trim() || !prTitle.trim() || !prNumber.trim() || !githubUsername.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const response = await apiRequest(`/api/github/pull-request/${bugId}`, {
        method: 'POST',
        body: JSON.stringify({
          prUrl,
          title: prTitle,
          githubUsername,
          prNumber: parseInt(prNumber)
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Pull request submitted successfully!');
        setShowPRModal(false);
        setPrUrl('');
        setPrTitle('');
        setPrNumber('');
        setGithubUsername('');
        handleRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to submit pull request');
      }

    } catch (error) {
      console.error('Error submitting pull request:', error);
      Alert.alert('Error', 'Failed to submit pull request');
    }
  };

  const awardPoints = async () => {
    try {
      if (!pointsToAward.trim() || isNaN(pointsToAward) || parseInt(pointsToAward) <= 0) {
        Alert.alert('Error', 'Please enter a valid number of points');
        return;
      }

      if (!bug.resolvedBy) {
        Alert.alert('Error', 'Bug must be resolved before awarding points');
        return;
      }

      const response = await apiRequest(`/api/bugs/${bugId}/award-points`, {
        method: 'POST',
        body: JSON.stringify({
          points: parseInt(pointsToAward),
          awardedToUserId: bug.resolvedBy._id,
          comment: awardComment.trim()
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Points awarded successfully!');
        setShowAwardPointsModal(false);
        setPointsToAward('');
        setAwardComment('');
        handleRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to award points');
      }

    } catch (error) {
      console.error('Error awarding points:', error);
      Alert.alert('Error', 'Failed to award points');
    }
  };

  const addComment = async () => {
    try {
      if (!newComment.trim()) {
        Alert.alert('Error', 'Please enter a comment');
        return;
      }

      const response = await apiRequest(`/api/bugs/${bugId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: newComment,
          githubProfile: githubProfileUrl.trim() || undefined
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Comment added successfully!');
        setShowCommentModal(false);
        setNewComment('');
        setGithubProfileUrl('');
        handleRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to add comment');
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open URL');
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#FF6B6B';
      case 'in-progress': return '#4ECDC4';
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading bug details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bug) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bug not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isReporter = currentUser && bug.reportedBy && currentUser.id === bug.reportedBy._id;
  const canAwardPoints = isReporter && bug.status === 'resolved' && bug.pointsAwarded === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2E3A59" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bug Details</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#2E3A59" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Bug Header */}
        <View style={styles.bugHeader}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bug.status) }]}>
              <Text style={styles.statusText}>{bug.status?.toUpperCase()}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(bug.priority) }]}>
              <Text style={styles.priorityText}>{bug.priority?.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.bugTitle}>{bug.title}</Text>
          <Text style={styles.bugId}>#{bug.bugId}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Reported by {bug.reportedBy?.name} • {new Date(bug.createdAt).toLocaleDateString()}
            </Text>
            {bug.resolvedBy && (
              <Text style={styles.metaText}>
                Resolved by {bug.resolvedBy.name}
              </Text>
            )}
          </View>
        </View>

        {/* Points Section */}
        {(bug.bountyPoints > 0 || bug.pointsAwarded > 0) && (
          <View style={styles.pointsSection}>
            <View style={styles.pointsHeader}>
              <Icon name="stars" size={24} color="#F39C12" />
              <Text style={styles.pointsTitle}>Points & Rewards</Text>
            </View>
            {bug.bountyPoints > 0 && (
              <Text style={styles.pointsText}>
                💰 Bounty: {bug.bountyPoints} points
              </Text>
            )}
            {bug.pointsAwarded > 0 && (
              <Text style={styles.pointsText}>
                🏆 {bug.pointsAwarded} points awarded to {bug.awardedTo?.name}
              </Text>
            )}
            {canAwardPoints && (
              <TouchableOpacity 
                style={styles.awardButton}
                onPress={() => setShowAwardPointsModal(true)}
              >
                <Icon name="card-giftcard" size={20} color="#FFF" />
                <Text style={styles.awardButtonText}>Award Points</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* GitHub Integration Section */}
        <View style={styles.githubSection}>
          <View style={styles.sectionHeader}>
            <Icon name="code" size={24} color="#333" />
            <Text style={styles.sectionTitle}>GitHub Integration</Text>
          </View>

          {githubActivity?.githubRepo ? (
            <View style={styles.repoInfo}>
              <Text style={styles.repoUrl}>{githubActivity.githubRepo.url}</Text>
              <TouchableOpacity onPress={() => openUrl(githubActivity.githubRepo.url)}>
                <Text style={styles.openRepoText}>Open Repository</Text>
              </TouchableOpacity>
            </View>
          ) : (
            isReporter && (
              <TouchableOpacity 
                style={styles.linkRepoButton}
                onPress={() => setShowGithubLinkModal(true)}
              >
                <Icon name="link" size={20} color="#FFF" />
                <Text style={styles.linkRepoText}>Link GitHub Repository</Text>
              </TouchableOpacity>
            )
          )}

          {/* GitHub Statistics */}
          {githubActivity && (
            <View style={styles.githubStats}>
              <View style={styles.statItem}>
                <Icon name="call-split" size={20} color="#666" />
                <Text style={styles.statText}>{githubActivity.statistics.forkCount} Forks</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="merge-type" size={20} color="#666" />
                <Text style={styles.statText}>{githubActivity.statistics.prCount} PRs</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="check-circle" size={20} color="#27AE60" />
                <Text style={styles.statText}>{githubActivity.statistics.mergedPRs} Merged</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {githubActivity?.githubRepo && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowForkModal(true)}
              >
                <Icon name="call-split" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Record Fork</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowPRModal(true)}
              >
                <Icon name="merge-type" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Submit PR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Pull Requests Section */}
        {githubActivity?.pullRequests && githubActivity.pullRequests.length > 0 && (
          <View style={styles.prSection}>
            <Text style={styles.sectionTitle}>Pull Requests</Text>
            {githubActivity.pullRequests.map((pr, index) => (
              <View key={index} style={styles.prItem}>
                <View style={styles.prHeader}>
                  <Text style={styles.prTitle}>{pr.title}</Text>
                  <View style={[styles.prStatus, { backgroundColor: pr.status === 'merged' ? '#27AE60' : '#3498DB' }]}>
                    <Text style={styles.prStatusText}>{pr.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.prAuthor}>by {pr.author.githubUsername}</Text>
                <TouchableOpacity onPress={() => openUrl(pr.url)}>
                  <Text style={styles.prLink}>View on GitHub</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{bug.description}</Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>Comments ({bug.comments?.length || 0})</Text>
            <TouchableOpacity 
              style={styles.addCommentButton}
              onPress={() => setShowCommentModal(true)}
            >
              <Icon name="add-comment" size={20} color="#FFF" />
              <Text style={styles.addCommentText}>Add Comment</Text>
            </TouchableOpacity>
          </View>

          {bug.comments && bug.comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                <Text style={styles.commentTime}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              {comment.pointsAwarded > 0 && (
                <View style={styles.pointsAwarded}>
                  <Icon name="stars" size={16} color="#F39C12" />
                  <Text style={styles.pointsAwardedText}>
                    {comment.pointsAwarded} points awarded!
                  </Text>
                </View>
              )}
              {comment.githubProfile && (
                <TouchableOpacity onPress={() => openUrl(comment.githubProfile)}>
                  <Text style={styles.githubLink}>View GitHub Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Award Points Modal */}
      <Modal visible={showAwardPointsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Award Points</Text>
            <Text style={styles.modalSubtitle}>
              Award points to {bug.resolvedBy?.name} for resolving this bug
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Points to award (1-1000)"
              value={pointsToAward}
              onChangeText={setPointsToAward}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional comment..."
              value={awardComment}
              onChangeText={setAwardComment}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAwardPointsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={awardPoints}
              >
                <Text style={styles.confirmButtonText}>Award Points</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Comment Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
            />
            
            <TextInput
              style={styles.input}
              placeholder="GitHub profile URL (optional)"
              value={githubProfileUrl}
              onChangeText={setGithubProfileUrl}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addComment}
              >
                <Text style={styles.confirmButtonText}>Add Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Link GitHub Repo Modal */}
      <Modal visible={showGithubLinkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link GitHub Repository</Text>
            
            <TextInput
              style={styles.input}
              placeholder="GitHub repository URL"
              value={githubRepoUrl}
              onChangeText={setGithubRepoUrl}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowGithubLinkModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={linkGithubRepo}
              >
                <Text style={styles.confirmButtonText}>Link Repository</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Fork Modal */}
      <Modal visible={showForkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Fork</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your GitHub username"
              value={githubUsername}
              onChangeText={setGithubUsername}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Fork URL"
              value={forkUrl}
              onChangeText={setForkUrl}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowForkModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={recordFork}
              >
                <Text style={styles.confirmButtonText}>Record Fork</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit PR Modal */}
      <Modal visible={showPRModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Pull Request</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your GitHub username"
              value={githubUsername}
              onChangeText={setGithubUsername}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Pull request title"
              value={prTitle}
              onChangeText={setPrTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="PR number"
              value={prNumber}
              onChangeText={setPrNumber}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Pull request URL"
              value={prUrl}
              onChangeText={setPrUrl}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPRModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitPullRequest}
              >
                <Text style={styles.confirmButtonText}>Submit PR</Text>
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
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  bugHeader: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bugTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  bugId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metaInfo: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pointsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  awardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  awardButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  githubSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginLeft: 8,
  },
  repoInfo: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  repoUrl: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  openRepoText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  linkRepoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  linkRepoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  githubStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  prSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  prItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  prStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  prAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  prLink: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentsSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addCommentText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  commentItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  pointsAwarded: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsAwardedText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
    marginLeft: 4,
  },
  githubLink: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: screenWidth * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95A5A6',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#27AE60',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedBugDetailScreen;