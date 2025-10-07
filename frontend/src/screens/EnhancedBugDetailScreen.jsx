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
import { apiRequest } from '../utils/enhancedNetworkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { Colors, getStatusColor, getPriorityColor, CommonStyles } from '../theme/colors';

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
  const [showCommentPointsModal, setShowCommentPointsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form states
  const [pointsToAward, setPointsToAward] = useState('');
  const [awardComment, setAwardComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [githubProfileUrl, setGithubProfileUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [selectedComment, setSelectedComment] = useState(null);
  const [commentPointsToAward, setCommentPointsToAward] = useState('');
  const [commentAwardReason, setCommentAwardReason] = useState('');
  
  // Edit bug states
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPriority, setEditedPriority] = useState('medium');
  const [editLoading, setEditLoading] = useState(false);
  
  // Username suggestion states
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  
  // Nested comments states
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [replyText, setReplyText] = useState('');

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

  // Helper functions for styling using centralized theme
  const getStatusColorStyle = (status) => {
    return { backgroundColor: getStatusColor(status) };
  };

  const getPriorityColorStyle = (priority) => {
    return { backgroundColor: getPriorityColor(priority) };
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
        console.log('🐛 Bug API response:', bugResponse.data);
        console.log('🔍 Available bug fields:', Object.keys(bugResponse.data));
        console.log('🔍 Reporter data:', bugResponse.data.reportedBy);
        // console.log('🔍 Full bug response data:', JSON.stringify(bugResponse.data, null, 2));
        setBug(bugResponse.data);
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

  const handleDeleteBug = () => {
    Alert.alert(
      'Delete Bug',
      'Are you sure you want to delete this bug? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteBug
        }
      ]
    );
  };

  const deleteBug = async () => {
    try {
      const response = await apiRequest(`/api/bugs/${bugId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        Alert.alert('Success', 'Bug deleted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the main app and then to the Bugs tab
              navigation.navigate('MainApp', { screen: 'Bugs' });
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to delete bug');
      }
    } catch (error) {
      console.error('Error deleting bug:', error);
      Alert.alert('Error', 'Failed to delete bug');
    }
  };

  const handleEditBug = () => {
    setEditedTitle(bug.title);
    setEditedDescription(bug.description);
    setEditedPriority(bug.priority);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Error', 'Bug title is required');
      return;
    }

    setEditLoading(true);
    
    try {
      const updateData = {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        priority: editedPriority.toLowerCase()
      };

      const response = await apiRequest(`/api/bugs/${bugId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (response.success) {
        // Update local bug state
        setBug(prevBug => ({
          ...prevBug,
          title: editedTitle.trim(),
          description: editedDescription.trim(),
          priority: editedPriority
        }));
        
        setShowEditModal(false);
        Alert.alert('Success', 'Bug updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update bug');
      }
    } catch (error) {
      console.error('Error updating bug:', error);
      Alert.alert('Error', 'Failed to update bug. Please try again.');
    } finally {
      setEditLoading(false);
    }
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

  // Function to fetch users for suggestions
  const fetchUserSuggestions = async (query) => {
    try {
      if (query.length < 2) {
        setUserSuggestions([]);
        return;
      }

      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setUserSuggestions(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  // Handle text change in comment input with @ mention detection
  const handleCommentTextChange = (text) => {
    setNewComment(text);
    
    // Detect @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      const currentMention = spaceIndex === -1 ? afterAt : afterAt.substring(0, spaceIndex);
      
      if (currentMention.length >= 0 && currentMention.indexOf('\n') === -1) {
        setMentionQuery(currentMention);
        setShowSuggestions(true);
        fetchUserSuggestions(currentMention);
      } else {
        setShowSuggestions(false);
        setUserSuggestions([]);
      }
    } else {
      setShowSuggestions(false);
      setUserSuggestions([]);
    }
  };

  // Handle selecting a user from suggestions
  const selectUserMention = (user) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeAt = newComment.substring(0, lastAtIndex);
    const afterAt = newComment.substring(lastAtIndex + 1);
    const spaceIndex = afterAt.indexOf(' ');
    const afterMention = spaceIndex === -1 ? '' : afterAt.substring(spaceIndex);
    
    const newText = `${beforeAt}@${user.name}${afterMention}`;
    setNewComment(newText);
    setShowSuggestions(false);
    setUserSuggestions([]);
    setMentionQuery('');
  };

  // Function to render comment text with highlighted @ mentions
  const renderCommentWithMentions = (text) => {
    if (!text || typeof text !== 'string') {
      return <Text style={styles.commentContent}>{text}</Text>;
    }
    
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(
          <Text key={lastIndex} style={styles.commentContent}>
            {text.substring(lastIndex, match.index)}
          </Text>
        );
      }

      // Add highlighted mention (clickable)
      const username = match[1];
      if (username && username.trim()) {
        parts.push(
          <TouchableOpacity
            key={match.index}
            onPress={() => handleMentionClick(username)}
            style={styles.mentionContainer}
          >
            <Text style={[styles.commentContent, styles.mentionText]}>
              {match[0]}
            </Text>
          </TouchableOpacity>
        );
      } else {
        // If username is invalid, just render as normal text
        parts.push(
          <Text key={match.index} style={styles.commentContent}>
            {match[0]}
          </Text>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={lastIndex} style={styles.commentContent}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return parts.length > 0 ? (
      <Text style={styles.commentContent}>{parts}</Text>
    ) : (
      <Text style={styles.commentContent}>{text}</Text>
    );
  };

  // Handle clicking on @ mentions
  const handleMentionClick = async (username) => {
    if (!username || typeof username !== 'string') {
      console.error('Invalid username provided to handleMentionClick:', username);
      return;
    }
    
    try {
      console.log('🔍 handleMentionClick called with username:', username);
      // Search for user by name
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(username)}`);
      console.log('📦 Mention search response:', JSON.stringify(response, null, 2));
      
      // Fix: API returns data directly, not wrapped in a data property
      const users = response.users || response.data?.users || [];
      console.log('👥 Extracted users array:', users);
      
      if (response.success && users.length > 0) {
        const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
        console.log('👤 Found user for mention:', JSON.stringify(user, null, 2));
        
        // Handle both _id and id field names (MongoDB returns _id, but JSON conversion might use id)
        const userId = user?._id || user?.id;
        
        if (user && userId) {
          console.log('✅ Navigating to profile for mention - userId:', userId, 'userName:', user.name);
          navigation.navigate('UserProfile', {
            userId: userId,
            userName: user.name,
            bugId: bugId, // Pass the current bug ID
            timestamp: Date.now() // Add timestamp to prevent caching
          });
        } else {
          console.log('❌ User found but missing both _id and id:', user);
          Alert.alert('User Not Found', `Could not find user @${username}`);
        }
      } else {
        console.log('❌ No users found for mention. Response success:', response.success, 'Users length:', users.length);
        Alert.alert('User Not Found', `Could not find user @${username}`);
      }
    } catch (error) {
      console.error('💥 Error finding mentioned user:', error);
      Alert.alert('Error', 'Failed to find user');
    }
  };

  // Handle nested comment functions
  const handleReplyTo = (comment) => {
    setReplyingTo(comment);
    setReplyText(`@${comment.author?.name || 'User'} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const submitReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    try {
      const response = await apiRequest(`/api/bugs/${bugId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: replyText.trim(),
          parentCommentId: replyingTo._id || replyingTo.id,
          replyingTo: replyingTo.author?.name || 'User'
        })
      });

      if (response.success) {
        await loadBugDetails();
        setReplyingTo(null);
        setReplyText('');
      } else {
        Alert.alert('Error', response.message || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  const toggleCommentExpansion = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const renderComment = (comment, depth = 0, isReply = false) => {
    const commentId = comment._id || comment.id || `${comment.author?.name}-${comment.createdAt}`;
    const isExpanded = expandedComments.has(commentId);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3; // Limit nesting depth
    
    return (
      <View key={commentId} style={[
        styles.commentItem,
        isReply && styles.replyComment,
        { marginLeft: Math.min(depth * 20, maxDepth * 20) },
        comment.isResolutionComment && styles.resolutionComment
      ]}>
        <View style={styles.commentHeader}>
          <TouchableOpacity 
            onPress={() => handleUsernameClick(comment)}
            disabled={!(comment.author && (comment.author._id || comment.author.id || comment.author.name))}
          >
            <Text style={[
              styles.commentAuthor,
              (comment.author && (comment.author._id || comment.author.id || comment.author.name)) && styles.clickableUsername
            ]}>
              {comment.author?.name || 'Unknown User'}
              {isReply && ' (Reply)'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.commentTime}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        {renderCommentWithMentions(comment.content || '')}
        
        {comment.pointsAwarded > 0 && (
          <View style={styles.pointsAwarded}>
            <Icon name="stars" size={16} color={Colors.primary.main} />
            <Text style={styles.pointsAwardedText}>
              {comment.pointsAwarded} points awarded!
            </Text>
          </View>
        )}

        {/* Comment Actions */}
        <View style={styles.commentActions}>
          {depth < maxDepth && (
            <TouchableOpacity 
              style={styles.replyButton}
              onPress={() => handleReplyTo(comment)}
            >
              <Icon name="reply" size={14} color={Colors.primary.main} />
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          )}
          
          {hasReplies && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => toggleCommentExpansion(commentId)}
            >
              <Icon 
                name={isExpanded ? "expand-less" : "expand-more"} 
                size={16} 
                color={Colors.text.muted} 
              />
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Render replies if expanded */}
        {hasReplies && isExpanded && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => 
              renderComment(reply, depth + 1, true)
            )}
          </View>
        )}
      </View>
    );
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
          content: newComment
        })
      });

      if (response.success) {
        Alert.alert('Success', 'Comment added successfully!');
        setShowCommentModal(false);
        setNewComment('');
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
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error('Invalid URL:', url);
      Alert.alert('Error', 'Invalid URL provided');
      return;
    }
    
    Linking.openURL(url.trim()).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open URL');
    });
  };

  const handleUserPress = (user) => {
    if (user && (user._id || user.id)) {
      console.log('Navigating to user profile:', user);
      navigation.navigate('UserProfile', {
        userId: user._id || user.id,
        userName: user.name || user.username || 'Unknown User',
        bugId: bugId,
        timestamp: Date.now()
      });
    } else {
      Alert.alert('Error', 'User information not available');
    }
  };

  const handleUsernameClick = async (comment) => {
    console.log('handleUsernameClick called with comment:', JSON.stringify(comment, null, 2));
    console.log('comment.author:', comment.author);
    console.log('comment.author._id:', comment.author?._id);
    console.log('comment.author.id:', comment.author?.id);
    
    // Try to get user ID first
    let userId = comment.author?._id || comment.author?.id;
    const userName = comment.author?.name;
    
    // Convert ObjectId to string if needed
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
    
    console.log('Extracted userId:', userId, 'type:', typeof userId);
    console.log('Extracted userName:', userName);
    
    if (userId) {
      console.log('Navigating with userId:', userId, 'userName:', userName);
      // We have user ID, navigate directly
      navigation.navigate('UserProfile', {
        userId: userId,
        userName: userName || 'Unknown User',
        bugId: bugId, // Pass the current bug ID
        timestamp: Date.now() // Add timestamp to force fresh navigation
      });
    } else if (userName) {
      console.log('No userId, trying to search by userName:', userName);
      // No user ID but we have a name, try to search for the user
      try {
        console.log('Searching for user with name:', userName);
        const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(userName)}`);
        console.log('Search response:', JSON.stringify(response, null, 2));
        
        // Fix: API returns data directly, not wrapped in a data property
        const users = response.users || response.data?.users || [];
        console.log('Extracted users array:', users);
        
        if (response.success && users.length > 0) {
          const user = users.find(u => u.name.toLowerCase() === userName.toLowerCase());
          console.log('Found user:', JSON.stringify(user, null, 2));
          console.log('User has _id?:', !!user?._id);
          console.log('User has id?:', !!user?.id);
          
          // Handle both _id and id field names (MongoDB returns _id, but JSON conversion might use id)
          const userId = user?._id || user?.id;
          
          if (user && userId) {
            console.log('Navigating with found userId:', userId, 'user.name:', user.name);
            navigation.navigate('UserProfile', {
              userId: userId,
              userName: user.name,
              bugId: bugId, // Pass the current bug ID
              timestamp: Date.now() // Add timestamp to force fresh navigation
            });
          } else {
            console.log('User found but missing both _id and id:', user);
            Alert.alert('User Not Found', `Could not find user profile for ${userName}`);
          }
        } else {
          console.log('No users found. Response success:', response.success, 'Users length:', users.length);
          Alert.alert('User Not Found', `Could not find user profile for ${userName}`);
        }
      } catch (error) {
        console.error('Error searching for user:', error);
        Alert.alert('Error', 'Failed to find user profile');
      }
    } else {
      console.log('No userId or userName available');
      // No user ID or name available
      Alert.alert('Error', 'Cannot open user profile - user information not available');
    }
  };

  const handleUsernameLongPress = (comment) => {
    // Check if comment has author
    if (!comment.author) {
      Alert.alert('Error', 'Cannot award points - comment author not found');
      return;
    }
    
    // Only allow bug reporter to award points
    if (currentUser && bug && currentUser.id === bug.reportedBy._id) {
      setSelectedComment(comment);
      setShowCommentPointsModal(true);
    } else {
      Alert.alert('Info', 'Only the bug reporter can award points to contributors');
    }
  };

  const awardPointsToComment = async () => {
    try {
      if (!commentPointsToAward.trim() || isNaN(commentPointsToAward) || 
          parseInt(commentPointsToAward) < 1 || parseInt(commentPointsToAward) > 1000) {
        Alert.alert('Error', 'Please enter a valid number of points (1-1000)');
        return;
      }

      const response = await apiRequest(`/api/bugs/${bugId}/comments/${selectedComment._id}/award-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: parseInt(commentPointsToAward),
          reason: commentAwardReason.trim()
        }),
      });

      if (response.success) {
        Alert.alert('Success', `${commentPointsToAward} points awarded to ${selectedComment.author?.name || 'Unknown User'}!`);
        setShowCommentPointsModal(false);
        setCommentPointsToAward('');
        setCommentAwardReason('');
        setSelectedComment(null);
        loadBugDetails(); // Refresh to show updated points
      } else {
        Alert.alert('Error', response.message || 'Failed to award points');
      }

    } catch (error) {
      console.error('Error awarding points to comment:', error);
      Alert.alert('Error', 'Failed to award points');
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
          <Icon name="arrow-back" size={24} color={Colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bug Details</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color={Colors.iconPrimary} />
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
            <View style={[styles.statusBadge, getStatusColorStyle(bug.status)]}>
              <Text style={styles.statusText}>{bug.status?.toUpperCase()}</Text>
            </View>
            <View style={[styles.priorityBadge, getPriorityColorStyle(bug.priority)]}>
              <Text style={styles.priorityText}>{bug.priority?.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.bugTitle}>{bug.title}</Text>
          <Text style={styles.bugId}>#{bug.bugId}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Reported by {bug.reportedBy?.name || bug.reportedBy?.username || 'Unknown User'} • {new Date(bug.createdAt).toLocaleDateString()}
            </Text>
            {bug.resolvedBy && (
              <Text style={styles.metaText}>
                Resolved by {bug.resolvedBy.name}
              </Text>
            )}
          </View>

          {/* Bug Management Actions - Only visible to bug reporter */}
          {currentUser && bug && currentUser.id === bug.reportedBy._id && (
            <View style={styles.bugActionsContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditBug}
              >
                <Icon name="edit" size={18} color={Colors.accent.blue} />
                <Text style={styles.editButtonText}>Edit Bug</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteBug}
              >
                <Icon name="delete" size={18} color={Colors.status.danger} />
                <Text style={styles.deleteButtonText}>Delete Bug</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Points Section */}
        {(bug.bountyPoints > 0 || bug.pointsAwarded > 0) && (
          <View style={styles.pointsSection}>
            <View style={styles.pointsHeader}>
              <Icon name="stars" size={24} color={Colors.accent.yellow} />
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
                <Icon name="card-giftcard" size={20} color={Colors.text.primary} />
                <Text style={styles.awardButtonText}>Award Points</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* GitHub Integration Section */}
        <View style={styles.githubSection}>
          <View style={styles.sectionHeader}>
            <Icon name="code" size={24} color={Colors.text.muted} />
            <Text style={styles.sectionTitle}>GitHub Integration</Text>
          </View>

          {githubActivity?.githubRepo?.url ? (
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
                <Icon name="link" size={20} color={Colors.text.primary} />
                <Text style={styles.linkRepoText}>Link GitHub Repository</Text>
              </TouchableOpacity>
            )
          )}


        </View>



        {/* Description */}
        <View style={styles.enhancedSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Icon name="description" size={20} color={Colors.primary.main} />
            <Text style={styles.enhancedSectionTitle}>Description</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.description}>{bug.description}</Text>
          </View>
        </View>

        {/* Bug Details Grid */}
        <View style={styles.enhancedSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Icon name="bug-report" size={20} color={Colors.primary.main} />
            <Text style={styles.enhancedSectionTitle}>Bug Information</Text>
          </View>
          <View style={styles.gridContainer}>
            {/* Steps to Reproduce */}
            {bug.stepsToReproduce && (
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <Icon name="list" size={16} color={Colors.accent.blue} />
                  <Text style={styles.cardTitle}>Steps to Reproduce</Text>
                </View>
                <Text style={styles.cardContent}>{bug.stepsToReproduce}</Text>
              </View>
            )}

            {/* Expected Behavior */}
            {bug.expectedBehavior && (
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <Icon name="check-circle" size={16} color={Colors.status.success} />
                  <Text style={styles.cardTitle}>Expected Behavior</Text>
                </View>
                <Text style={styles.cardContent}>{bug.expectedBehavior}</Text>
              </View>
            )}

            {/* Actual Behavior */}
            {bug.actualBehavior && (
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <Icon name="error" size={16} color={Colors.status.danger} />
                  <Text style={styles.cardTitle}>Actual Behavior</Text>
                </View>
                <Text style={styles.cardContent}>{bug.actualBehavior}</Text>
              </View>
            )}

            {/* Environment */}
            {bug.environment && (bug.environment.os || bug.environment.browser || bug.environment.version || bug.environment.device) && (
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <Icon name="computer" size={16} color={Colors.accent.purple} />
                  <Text style={styles.cardTitle}>Environment</Text>
                </View>
                <View style={styles.environmentDetails}>
                  {bug.environment.os && (
                    <Text style={styles.cardContent}>
                      <Text style={styles.environmentLabel}>OS: </Text>
                      {bug.environment.os}
                    </Text>
                  )}
                  {bug.environment.browser && (
                    <Text style={styles.cardContent}>
                      <Text style={styles.environmentLabel}>Browser: </Text>
                      {bug.environment.browser}
                    </Text>
                  )}
                  {bug.environment.version && (
                    <Text style={styles.cardContent}>
                      <Text style={styles.environmentLabel}>Version: </Text>
                      {bug.environment.version}
                    </Text>
                  )}
                  {bug.environment.device && (
                    <Text style={styles.cardContent}>
                      <Text style={styles.environmentLabel}>Device: </Text>
                      {bug.environment.device}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.enhancedSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Icon name="settings" size={20} color={Colors.primary.main} />
            <Text style={styles.enhancedSectionTitle}>Technical Details</Text>
          </View>
          <View style={styles.techDetailsCard}>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Status:</Text>
              <View style={[styles.statusBadge, getStatusColor(bug.status)]}>
                <Text style={styles.statusText}>{bug.status?.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Priority:</Text>
              <View style={[styles.priorityBadge, getPriorityColor(bug.priority)]}>
                <Text style={styles.priorityText}>{bug.priority?.toUpperCase()}</Text>
              </View>
            </View>
            {bug.severity && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Severity:</Text>
                <Text style={styles.techValue}>{bug.severity}</Text>
              </View>
            )}
            {bug.category && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Category:</Text>
                <Text style={styles.techValue}>{bug.category}</Text>
              </View>
            )}
            {bug.project && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Project:</Text>
                <Text style={styles.techValue}>{bug.project.name}</Text>
              </View>
            )}
            {bug.reportedBy && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Reported By:</Text>
                <TouchableOpacity onPress={() => handleUserPress(bug.reportedBy)}>
                  <Text style={[styles.techValue, styles.userLink]}>{bug.reportedBy.name || bug.reportedBy.username || 'Unknown User'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {bug.repositoryUrl && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Repository:</Text>
                <TouchableOpacity onPress={() => openUrl(bug.repositoryUrl)}>
                  <Text style={[styles.techValue, styles.linkText]} numberOfLines={1}>{bug.repositoryUrl}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Bug ID:</Text>
              <Text style={styles.techValue}>#{bug.bugId}</Text>
            </View>
            {bug.bountyPoints && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Bounty Points:</Text>
                <Text style={[styles.techValue, {color: Colors.accent.yellow, fontWeight: 'bold'}]}>{bug.bountyPoints} points</Text>
              </View>
            )}
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Created:</Text>
              <Text style={styles.techValue}>{new Date(bug.createdAt).toLocaleDateString()}</Text>
            </View>
            {bug.updatedAt && bug.updatedAt !== bug.createdAt && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Last Updated:</Text>
                <Text style={styles.techValue}>{new Date(bug.updatedAt).toLocaleDateString()}</Text>
              </View>
            )}
            {bug.tags && bug.tags.length > 0 && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {bug.tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Show tags if available */}
            {bug.tags && bug.tags.length > 0 && (
              <View style={styles.techRow}>
                <Text style={styles.techLabel}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {bug.tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Repository Link */}
        {bug.repositoryUrl && (
          <View style={styles.enhancedSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <Icon name="code" size={20} color={Colors.primary.main} />
              <Text style={styles.enhancedSectionTitle}>Repository</Text>
            </View>
            <TouchableOpacity 
              style={styles.repoCard}
              onPress={() => openUrl(bug.repositoryUrl)}
            >
              <Icon name="link" size={20} color={Colors.accent.blue} />
              <Text style={styles.repoLinkText}>View Repository</Text>
              <Icon name="open-in-new" size={16} color={Colors.accent.blue} />
            </TouchableOpacity>
          </View>
        )}

        {/* Attachments */}
        {bug.attachments && bug.attachments.length > 0 && (
          <View style={styles.enhancedSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <Icon name="attach-file" size={20} color={Colors.primary.main} />
              <Text style={styles.enhancedSectionTitle}>Attachments ({bug.attachments.length})</Text>
            </View>
            <View style={styles.attachmentGrid}>
              {bug.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentCard}>
                  <Icon name="insert-drive-file" size={24} color={Colors.status.info} />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <Text style={styles.attachmentSize}>
                      {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </Text>
                  </View>
                  <Icon name="download" size={20} color={Colors.primary.main} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.enhancedSection}>
          <View style={styles.sectionHeaderWithIcon}>
            <Icon name="comment" size={20} color={Colors.primary.main} />
            <Text style={styles.enhancedSectionTitle}>Comments ({bug.comments?.length || 0})</Text>
            <View style={styles.spacer} />
            <TouchableOpacity 
              style={styles.addCommentButton}
              onPress={() => setShowCommentModal(true)}
            >
              <Icon name="add" size={16} color={Colors.background.primary} />
              <Text style={styles.addCommentText}>Add Comment</Text>
            </TouchableOpacity>
          </View>

          {bug.comments && bug.comments.map((comment) => {
            // Only render top-level comments (no parentCommentId)
            if (comment.parentCommentId) return null;
            return renderComment(comment, 0, false);
          })}

          {/* Reply Input */}
          {replyingTo && (
            <View style={styles.replyInputContainer}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyingToText}>
                  Replying to @{replyingTo.author?.name || 'User'}
                </Text>
                <TouchableOpacity onPress={cancelReply}>
                  <Icon name="close" size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.replyInput}
                placeholder="Write your reply..."
                placeholderTextColor={Colors.text.tertiary}
                multiline
                value={replyText}
                onChangeText={setReplyText}
              />
              <View style={styles.replyActions}>
                <TouchableOpacity 
                  style={styles.cancelReplyButton}
                  onPress={cancelReply}
                >
                  <Text style={styles.cancelReplyText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitReplyButton}
                  onPress={submitReply}
                  disabled={!replyText.trim()}
                >
                  <Text style={styles.submitReplyText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
            <Text style={styles.modalSubtitle}>
              💡 Type @ to mention users (e.g., @username for PR contributions)
            </Text>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your thoughts, mention team members with @username, or link your PR: https://github.com/owner/repo/pull/123"
                value={newComment}
                onChangeText={handleCommentTextChange}
                multiline
                numberOfLines={4}
              />
              
              {/* Username Suggestions */}
              {showSuggestions && userSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Tap to mention:</Text>
                  {userSuggestions.map((user, index) => (
                    <TouchableOpacity
                      key={user._id || index}
                      style={styles.suggestionItem}
                      onPress={() => selectUserMention(user)}
                    >
                      <Icon name="person" size={16} color={Colors.text.muted} />
                      <Text style={styles.suggestionText}>@{user.name}</Text>
                      {user.githubProfile?.username && (
                        <Text style={styles.suggestionGithub}>({user.githubProfile.username})</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCommentModal(false);
                  setNewComment('');
                  setShowSuggestions(false);
                  setUserSuggestions([]);
                }}
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

      {/* Award Points from Comment Modal */}
      <Modal visible={showCommentPointsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Award Points</Text>
            <Text style={styles.modalSubtitle}>
              Award points to {selectedComment?.author?.name} for their contribution
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Points to award (1-1000)"
              value={commentPointsToAward}
              onChangeText={setCommentPointsToAward}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Reason for awarding points (optional)..."
              value={commentAwardReason}
              onChangeText={setCommentAwardReason}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCommentPointsModal(false);
                  setSelectedComment(null);
                  setCommentPointsToAward('');
                  setCommentAwardReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={awardPointsToComment}
              >
                <Text style={styles.confirmButtonText}>Award Points</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Bug Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Bug</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bug Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter bug title"
                value={editedTitle}
                onChangeText={setEditedTitle}
                multiline={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter bug description"
                value={editedDescription}
                onChangeText={setEditedDescription}
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {['Low', 'Medium', 'High', 'Critical'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      editedPriority.toLowerCase() === priority.toLowerCase() && styles.priorityOptionSelected
                    ]}
                    onPress={() => setEditedPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      editedPriority.toLowerCase() === priority.toLowerCase() && styles.priorityOptionTextSelected
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={editLoading}
              >
                <Text style={styles.modalButtonText}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </Text>
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
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.status.danger,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  bugHeader: {
    backgroundColor: Colors.backgroundCard,
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
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bugTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bugId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  metaInfo: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pointsSection: {
    backgroundColor: Colors.backgroundCard,
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
    color: Colors.text.primary,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  awardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  awardButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  githubSection: {
    backgroundColor: Colors.background.secondary,
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
    color: Colors.text.primary,
    marginLeft: 8,
  },
  repoInfo: {
    padding: 12,
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  repoUrl: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  openRepoText: {
    fontSize: 14,
    color: Colors.status.info,
    fontWeight: '600',
  },
  linkRepoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  linkRepoText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  githubStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  prSection: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    marginBottom: 8,
  },
  prItem: {
    padding: 12,
    backgroundColor: Colors.background.card,
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
    color: Colors.text.primary,
    flex: 1,
  },
  prStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prStatusText: {
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  prAuthor: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  prLink: {
    fontSize: 12,
    color: Colors.status.info,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.backgroundCard,
    padding: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  commentsSection: {
    backgroundColor: Colors.backgroundCard,
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
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  addCommentText: {
    color: Colors.background.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  commentItem: {
    padding: 12,
    backgroundColor: Colors.background.card,
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
    color: '#FFFFFF',
  },
  commentTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  commentContent: {
    fontSize: 14,
    color: '#FFFFFF',
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
  // New styles for enhanced comment features
  resolutionComment: {
    backgroundColor: '#1a4a3d',
    borderLeftWidth: 3,
    borderLeftColor: '#27AE60',
  },
  prMentionComment: {
    backgroundColor: '#1a2a3d',
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  clickableUsername: {
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  prLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  detectedPrLink: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  awardHint: {
    fontSize: 11,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: screenWidth * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Username suggestion styles
  commentInputContainer: {
    position: 'relative',
  },
  suggestionsContainer: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  suggestionGithub: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  // @ mention highlighting
  mentionText: {
    color: '#3498DB',
    fontWeight: '600',
    backgroundColor: '#EBF3FD',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  mentionContainer: {
    display: 'inline-block',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bugActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  editButtonText: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  deleteButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
    backgroundColor: '#2A2A2A',
  },
  priorityOptionSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  priorityOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
  },
  saveButton: {
    backgroundColor: '#3498DB',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#CCCCCC',
  },
  // New styles for enhanced bug details
  detailText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  techDetails: {
    gap: 12,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
    minWidth: 80,
  },
  techValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  userLink: {
    color: Colors.primary.main,
    textDecorationLine: 'underline',
  },
  linkText: {
    color: Colors.accent.blue,
    textDecorationLine: 'underline',
  },
  repoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  repoLinkText: {
    fontSize: 14,
    color: Colors.accent.blue,
    fontWeight: '600',
    flex: 1,
  },
  attachmentsContainer: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  tagChip: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary.text,
    fontWeight: '600',
  },
  // Nested comments styles
  replyComment: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyButtonText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButtonText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyInputContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  replyingToText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  replyInput: {
    backgroundColor: Colors.background.card,
    borderRadius: 8,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelReplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: Colors.border.light,
  },
  cancelReplyText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  submitReplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: Colors.primary.main,
  },
  submitReplyText: {
    color: Colors.primary.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced UI Styles
  enhancedSection: {
    marginBottom: 24,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  enhancedSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  contentCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  gridContainer: {
    gap: 12,
  },
  detailCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  techDetailsCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  repoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
  },
  attachmentGrid: {
    gap: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  environmentDetails: {
    gap: 8,
  },
  environmentLabel: {
    fontWeight: '600',
    color: Colors.primary.main,
  },
});

export default EnhancedBugDetailScreen;