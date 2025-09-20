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
  const [showCommentPointsModal, setShowCommentPointsModal] = useState(false);
  
  // Form states
  const [pointsToAward, setPointsToAward] = useState('');
  const [awardComment, setAwardComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [githubProfileUrl, setGithubProfileUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [selectedComment, setSelectedComment] = useState(null);
  const [commentPointsToAward, setCommentPointsToAward] = useState('');
  const [commentAwardReason, setCommentAwardReason] = useState('');
  
  // Username suggestion states
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

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
    // Navigate to edit bug screen (you might need to create this screen)
    Alert.alert('Info', 'Edit bug functionality - to be implemented');
    // navigation.navigate('EditBug', { bugId: bugId, bug: bug });
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
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open URL');
    });
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

          {/* Bug Management Actions - Only visible to bug reporter */}
          {currentUser && bug && currentUser.id === bug.reportedBy._id && (
            <View style={styles.bugActionsContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditBug}
              >
                <Icon name="edit" size={18} color="#3498DB" />
                <Text style={styles.editButtonText}>Edit Bug</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteBug}
              >
                <Icon name="delete" size={18} color="#E74C3C" />
                <Text style={styles.deleteButtonText}>Delete Bug</Text>
              </TouchableOpacity>
            </View>
          )}
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

          {bug.comments && bug.comments.map((comment, index) => {
            // Check if comment mentions PR or pull request
            const hasPRMention = /pull request|PR|pr|merge request/i.test(comment.content);
            const prUrlMatch = comment.content.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)/i);
            
            return (
              <View key={index} style={[
                styles.commentItem,
                comment.isResolutionComment && styles.resolutionComment,
                hasPRMention && styles.prMentionComment
              ]}>
                <View style={styles.commentHeader}>
                  <TouchableOpacity 
                    onPress={(comment.author && (comment.author._id || comment.author.id || comment.author.name)) ? () => handleUsernameClick(comment) : null}
                    onLongPress={comment.author ? () => handleUsernameLongPress(comment) : null}
                    disabled={!(comment.author && (comment.author._id || comment.author.id || comment.author.name))}
                  >
                    <Text style={[
                      styles.commentAuthor,
                      (comment.author && (comment.author._id || comment.author.id || comment.author.name)) && styles.clickableUsername
                    ]}>
                      {comment.author?.name || 'Unknown User'}
                      {hasPRMention && ' 🔀'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.commentTime}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                {renderCommentWithMentions(comment.content || '')}
                
                {/* Show PR link if detected */}
                {prUrlMatch && (
                  <TouchableOpacity 
                    style={styles.prLinkContainer}
                    onPress={() => openUrl(prUrlMatch[0])}
                  >
                    <Icon name="code" size={16} color="#4ECDC4" />
                    <Text style={styles.detectedPrLink}>
                      Pull Request #{prUrlMatch[1]}
                    </Text>
                  </TouchableOpacity>
                )}
                
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
                
                {/* Show award points hint for bug reporter */}
                {currentUser && bug && currentUser.id === bug.reportedBy._id && 
                 comment.pointsAwarded === 0 && hasPRMention && (
                  <Text style={styles.awardHint}>
                    💡 Tap username to view profile • Long press to award points
                  </Text>
                )}
              </View>
            );
          })}
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
                      <Icon name="person" size={16} color="#666" />
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
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
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
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bugHeader: {
    backgroundColor: '#1a1a1a',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bugId: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  metaInfo: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  pointsSection: {
    backgroundColor: '#1a1a1a',
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
    color: '#FFFFFF',
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
    backgroundColor: '#1a1a1a',
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
    color: '#FFFFFF',
    marginLeft: 8,
  },
  repoInfo: {
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 16,
  },
  repoUrl: {
    fontSize: 14,
    color: '#CCCCCC',
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
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginBottom: 8,
  },
  prItem: {
    padding: 12,
    backgroundColor: '#2a2a2a',
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
    color: '#CCCCCC',
    marginBottom: 4,
  },
  prLink: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  commentsSection: {
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#2a2a2a',
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
});

export default EnhancedBugDetailScreen;