import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const CommentComponent = ({ 
  comments = [], 
  onAddComment, 
  currentUser, 
  canAwardPoints = false,
  onAwardPoints 
}) => {
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [githubPRUrl, setGithubPRUrl] = useState('');
  const [githubPRTitle, setGithubPRTitle] = useState('');
  const [commentType, setCommentType] = useState('regular'); // 'regular', 'resolution', 'progress'
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const commentData = {
        content: newComment.trim(),
        type: commentType,
        githubProfile: githubProfile.trim() || null,
        githubPullRequest: githubPRUrl.trim() ? {
          url: githubPRUrl.trim(),
          title: githubPRTitle.trim() || 'Pull Request',
          status: 'open'
        } : null
      };

      await onAddComment(commentData);
      
      // Reset form
      setNewComment('');
      setGithubProfile('');
      setGithubPRUrl('');
      setGithubPRTitle('');
      setCommentType('regular');
      setShowAddCommentModal(false);
      
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening URL:', err);
        Alert.alert('Error', 'Could not open URL');
      });
    }
  };

  const getCommentTypeIcon = (type) => {
    switch (type) {
      case 'resolution': return { name: 'check-circle', color: '#27AE60' };
      case 'progress': return { name: 'timeline', color: '#3498DB' };
      default: return { name: 'comment', color: '#666' };
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, index }) => {
    const typeIcon = getCommentTypeIcon(comment.type);
    
    return (
      <View key={index} style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthorInfo}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.commentMeta}>
              <Text style={styles.commentAuthor}>{comment.author?.name || 'Unknown User'}</Text>
              <View style={styles.commentSubMeta}>
                <Icon name={typeIcon.name} size={12} color={typeIcon.color} />
                <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
              </View>
            </View>
          </View>
          
          {comment.pointsAwarded > 0 && (
            <View style={styles.pointsBadge}>
              <Icon name="stars" size={14} color="#F39C12" />
              <Text style={styles.pointsText}>{comment.pointsAwarded}</Text>
            </View>
          )}
        </View>

        <Text style={styles.commentContent}>{comment.content}</Text>

        {comment.githubProfile && (
          <TouchableOpacity 
            style={styles.githubProfileLink}
            onPress={() => openUrl(comment.githubProfile)}
          >
            <Icon name="person" size={16} color="#333" />
            <Text style={styles.githubProfileText}>View GitHub Profile</Text>
          </TouchableOpacity>
        )}

        {comment.githubPullRequest && (
          <View style={styles.pullRequestInfo}>
            <View style={styles.prHeader}>
              <Icon name="merge-type" size={16} color="#3498DB" />
              <Text style={styles.prTitle}>{comment.githubPullRequest.title}</Text>
              <View style={[
                styles.prStatusBadge,
                { backgroundColor: comment.githubPullRequest.status === 'merged' ? '#27AE60' : '#3498DB' }
              ]}>
                <Text style={styles.prStatusText}>
                  {comment.githubPullRequest.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => openUrl(comment.githubPullRequest.url)}>
              <Text style={styles.prLink}>View Pull Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {comment.isResolutionComment && (
          <View style={styles.resolutionBadge}>
            <Icon name="check-circle" size={16} color="#27AE60" />
            <Text style={styles.resolutionText}>Resolution Comment</Text>
          </View>
        )}

        {comment.attachments && comment.attachments.length > 0 && (
          <View style={styles.attachments}>
            {comment.attachments.map((attachment, attachIndex) => (
              <TouchableOpacity 
                key={attachIndex}
                style={styles.attachment}
                onPress={() => openUrl(attachment.url)}
              >
                <Icon name="attachment" size={16} color="#666" />
                <Text style={styles.attachmentName}>{attachment.filename}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments ({comments.length})</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddCommentModal(true)}
        >
          <Icon name="add-comment" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Comment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
        {comments.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="comment" size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateTitle}>No comments yet</Text>
            <Text style={styles.emptyStateSubtitle}>Be the first to comment on this bug</Text>
          </View>
        ) : (
          comments.map((comment, index) => (
            <CommentItem key={index} comment={comment} index={index} />
          ))
        )}
      </ScrollView>

      {/* Add Comment Modal */}
      <Modal visible={showAddCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity 
                onPress={() => setShowAddCommentModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Comment Type Selector */}
              <View style={styles.commentTypeSection}>
                <Text style={styles.sectionLabel}>Comment Type</Text>
                <View style={styles.commentTypeOptions}>
                  <TouchableOpacity
                    style={[
                      styles.commentTypeOption,
                      commentType === 'regular' && styles.commentTypeOptionSelected
                    ]}
                    onPress={() => setCommentType('regular')}
                  >
                    <Icon name="comment" size={18} color={commentType === 'regular' ? '#FFF' : '#666'} />
                    <Text style={[
                      styles.commentTypeText,
                      commentType === 'regular' && styles.commentTypeTextSelected
                    ]}>
                      General
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.commentTypeOption,
                      commentType === 'progress' && styles.commentTypeOptionSelected
                    ]}
                    onPress={() => setCommentType('progress')}
                  >
                    <Icon name="timeline" size={18} color={commentType === 'progress' ? '#FFF' : '#666'} />
                    <Text style={[
                      styles.commentTypeText,
                      commentType === 'progress' && styles.commentTypeTextSelected
                    ]}>
                      Progress
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.commentTypeOption,
                      commentType === 'resolution' && styles.commentTypeOptionSelected
                    ]}
                    onPress={() => setCommentType('resolution')}
                  >
                    <Icon name="check-circle" size={18} color={commentType === 'resolution' ? '#FFF' : '#666'} />
                    <Text style={[
                      styles.commentTypeText,
                      commentType === 'resolution' && styles.commentTypeTextSelected
                    ]}>
                      Resolution
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comment Content */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Comment *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your comment here..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* GitHub Profile Link */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>GitHub Profile (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://github.com/username"
                  value={githubProfile}
                  onChangeText={setGithubProfile}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              {/* GitHub Pull Request Info */}
              {(commentType === 'resolution' || commentType === 'progress') && (
                <>
                  <View style={styles.inputSection}>
                    <Text style={styles.sectionLabel}>Pull Request URL (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="https://github.com/owner/repo/pull/123"
                      value={githubPRUrl}
                      onChangeText={setGithubPRUrl}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>

                  {githubPRUrl.trim() && (
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionLabel}>Pull Request Title</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Brief description of the PR"
                        value={githubPRTitle}
                        onChangeText={setGithubPRTitle}
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddCommentModal(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAddComment}
                disabled={loading || !newComment.trim()}
              >
                {loading ? (
                  <Text style={styles.submitButtonText}>Adding...</Text>
                ) : (
                  <>
                    <Icon name="send" size={16} color="#FFF" />
                    <Text style={styles.submitButtonText}>Add Comment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  commentsList: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  commentSubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
    marginLeft: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  githubProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  githubProfileText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  pullRequestInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  prTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 6,
  },
  prStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  prLink: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  resolutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  resolutionText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
  attachments: {
    marginTop: 8,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  attachmentName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    textDecorationLine: 'underline',
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
    width: screenWidth * 0.95,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  commentTypeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  commentTypeOptionSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  commentTypeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  commentTypeTextSelected: {
    color: '#FFF',
  },
  inputSection: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#95A5A6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#95A5A6',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3498DB',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
});

export default CommentComponent;