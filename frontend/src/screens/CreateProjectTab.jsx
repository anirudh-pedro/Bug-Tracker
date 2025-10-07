import React, {useState, useEffect} from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiRequest } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Colors from '../theme/colors';

const {width: screenWidth} = Dimensions.get('window');

const CreateBugReportScreen = ({navigation}) => {
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedSeverity, setSelectedSeverity] = useState('Medium');
  const [selectedCategory, setSelectedCategory] = useState('Bug');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [environment, setEnvironment] = useState('');
  
  // Projects state - fetched from API
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load user's projects on component mount
  useEffect(() => {
    loadUserProjects();
  }, []);

  const loadUserProjects = async () => {
    try {
      setLoadingProjects(true);
      console.log('🔄 Loading user projects...');
      
      const response = await apiRequest('/api/projects', {
        method: 'GET'
      });

      console.log('📋 User projects API response:', response);

      if (response.success) {
        const projectsData = response.data?.projects || [];
        console.log('✅ User projects loaded:', projectsData.length, 'projects');
        setProjects(projectsData);
      } else {
        const errorMsg = response.message || response.error || 'Failed to load projects';
        console.error('❌ User projects API error:', errorMsg);
        setProjects([]);
      }
    } catch (error) {
      console.error('💥 Error loading user projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const severities = ['Minor', 'Medium', 'Major', 'Critical'];
  const categories = ['Bug', 'Feature', 'Improvement', 'Task', 'Story'];

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newAttachment = {
          id: Date.now().toString(),
          type: 'image',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          uri: asset.uri,
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg',
        };
        
        setAttachedFiles(prev => [...prev, newAttachment]);
        setShowAttachmentModal(false);
      }
    });
  };

  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const newAttachment = {
          id: Date.now().toString(),
          type: 'image',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          uri: asset.uri,
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg',
        };
        
        setAttachedFiles(prev => [...prev, newAttachment]);
        setShowAttachmentModal(false);
      }
    });
  };

  const removeAttachment = (id) => {
    setAttachedFiles(attachedFiles.filter(file => file.id !== id));
  };

  const validateRepositoryUrl = (url) => {
    if (!url) return true; // Optional field
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    const gitlabPattern = /^https:\/\/gitlab\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url) || gitlabPattern.test(url);
  };

  // Helper function to get selected project name
  const getSelectedProjectName = () => {
    if (!selectedProject) return 'Select a project';
    const project = projects.find(p => p._id === selectedProject);
    return project ? project.name : 'Select a project';
  };

  const handleSubmitBug = async () => {
    if (!bugTitle.trim()) {
      Alert.alert('Error', 'Please enter a bug title');
      return;
    }
    if (!bugDescription.trim()) {
      Alert.alert('Error', 'Please provide a bug description');
      return;
    }
    if (!stepsToReproduce.trim()) {
      Alert.alert('Error', 'Please provide steps to reproduce the bug');
      return;
    }
    if (repositoryUrl && !validateRepositoryUrl(repositoryUrl)) {
      Alert.alert('Error', 'Please enter a valid GitHub or GitLab repository URL');
      return;
    }

    setSubmitting(true);

    try {
      // Create bug report object to match backend expectations
      const bugReport = {
        title: bugTitle.trim(),
        description: bugDescription.trim(),
        priority: selectedPriority.toLowerCase(),
        project: selectedProject || null, // Send project ID or null if not selected
        stepsToReproduce: stepsToReproduce.trim() || undefined,
        expectedBehavior: expectedBehavior.trim() || undefined,
        actualBehavior: actualBehavior.trim() || undefined,
        environment: environment.trim() || undefined,
        category: selectedCategory.toLowerCase(), // Ensure lowercase for backend
        repositoryUrl: repositoryUrl.trim() || undefined,
        // Enhanced fields for GitHub integration
        githubRepo: repositoryUrl.trim() ? {
          url: repositoryUrl.trim(),
          name: repositoryUrl.trim().split('/').slice(-1)[0] || '',
          owner: repositoryUrl.trim().split('/').slice(-2, -1)[0] || ''
        } : null,
        bountyPoints: 10, // Default bounty points
        tags: [selectedCategory.toLowerCase(), selectedPriority.toLowerCase()],
        attachments: attachedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          mimeType: file.mimeType
        }))
      };

      console.log('🐛 Submitting bug report:', JSON.stringify(bugReport, null, 2));

      const response = await apiRequest('/api/bugs', {
        method: 'POST',
        body: JSON.stringify(bugReport)
      });

      if (response.success) {
        Alert.alert(
          'Success', 
          'Bug report submitted successfully!\n\nYour bug is now visible in the bug report page and available for community collaboration.',
          [
            {
              text: 'View Bugs',
              onPress: () => {
                resetForm();
                navigation.navigate('Bugs');
              }
            },
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to submit bug report');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      
      let errorMessage = 'Failed to submit bug report. Please check your connection and try again.';
      
      // Check if it's a validation error with specific details
      if (error.message.includes('Validation failed')) {
        errorMessage = 'Please check that all required fields are filled correctly:\n\n';
        errorMessage += '• Title (3-200 characters)\n';
        errorMessage += '• Description (10-1000 characters)\n';
        errorMessage += '• Steps to reproduce\n';
        errorMessage += '• Priority must be: Low, Medium, High, or Critical';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setBugTitle('');
    setBugDescription('');
    setSelectedProject('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
    setEnvironment('');
    setRepositoryUrl('');
    setAttachedFiles([]);
    setSelectedPriority('Medium');
    setSelectedSeverity('Medium');
    setSelectedCategory('Bug');
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ff4757';
      case 'Major': return '#ff6b35';
      case 'Medium': return '#ffa502';
      case 'Minor': return '#2ed573';
      default: return '#888888';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report a Bug</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Bug Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Bug Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a clear, concise bug title"
                placeholderTextColor="#666666"
                value={bugTitle}
                onChangeText={setBugTitle}
                maxLength={100}
              />
            </View>

            {/* Project Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Project <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowProjectDropdown(true)}
              >
                <Text style={[styles.dropdownText, !selectedProject && styles.placeholder]}>
                  {getSelectedProjectName()}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#888888" />
              </TouchableOpacity>
            </View>

            {/* Priority and Severity Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Priority</Text>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowPriorityDropdown(true)}
                >
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(selectedPriority)}]} />
                    <Text style={styles.dropdownText}>{selectedPriority}</Text>
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#888888" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Severity</Text>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowSeverityDropdown(true)}
                >
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityDot, {backgroundColor: getSeverityColor(selectedSeverity)}]} />
                    <Text style={styles.dropdownText}>{selectedSeverity}</Text>
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#888888" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowCategoryDropdown(true)}
              >
                <Text style={styles.dropdownText}>{selectedCategory}</Text>
                <Icon name="arrow-drop-down" size={24} color="#888888" />
              </TouchableOpacity>
            </View>

            {/* Bug Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the bug in detail. What happened? What did you expect to happen?"
                placeholderTextColor="#666666"
                value={bugDescription}
                onChangeText={setBugDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Steps to Reproduce */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Steps to Reproduce <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                placeholderTextColor="#666666"
                value={stepsToReproduce}
                onChangeText={setStepsToReproduce}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Expected vs Actual Behavior */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Expected Behavior</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What should happen..."
                  placeholderTextColor="#666666"
                  value={expectedBehavior}
                  onChangeText={setExpectedBehavior}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Actual Behavior</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What actually happened..."
                  placeholderTextColor="#666666"
                  value={actualBehavior}
                  onChangeText={setActualBehavior}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Environment */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Environment</Text>
              <TextInput
                style={styles.input}
                placeholder="OS, Browser/App version, Device model..."
                placeholderTextColor="#666666"
                value={environment}
                onChangeText={setEnvironment}
              />
            </View>

            {/* Repository URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Repository URL <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/username/repository"
                placeholderTextColor="#666666"
                value={repositoryUrl}
                onChangeText={setRepositoryUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.helperText}>
                Link to GitHub/GitLab repository for community collaboration
              </Text>
            </View>

            {/* Attachments */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Attachments <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={() => setShowAttachmentModal(true)}
              >
                <Icon name="attach-file" size={20} color="#ff9500" />
                <Text style={styles.attachmentButtonText}>Add Screenshots, Logs, or Files</Text>
                <Icon name="add" size={20} color="#ff9500" />
              </TouchableOpacity>
              
              {attachedFiles.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachedFiles.map((file) => (
                    <View key={file.id} style={styles.attachmentItem}>
                      {file.type === 'image' ? (
                        <View style={styles.imageAttachment}>
                          <Image source={{uri: file.uri}} style={styles.attachmentThumbnail} />
                          <View style={styles.attachmentInfo}>
                            <Text style={styles.attachmentName} numberOfLines={1}>
                              {file.name}
                            </Text>
                            <Text style={styles.attachmentSize}>
                              {(file.size / 1024).toFixed(1)} KB
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => removeAttachment(file.id)}
                          >
                            <Icon name="close" size={18} color="#ff4757" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.fileAttachment}>
                          <Icon name="attach-file" size={16} color="#ff9500" />
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <TouchableOpacity onPress={() => removeAttachment(file.id)}>
                            <Icon name="close" size={16} color="#ff4757" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              onPress={handleSubmitBug}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Icon name="bug-report" size={24} color="#ffffff" />
              )}
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Project Selection Modal */}
        <Modal
          visible={showProjectDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProjectDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProjectDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Project</Text>
              {loadingProjects ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="small" color="#ff9500" />
                  <Text style={styles.modalLoadingText}>Loading projects...</Text>
                </View>
              ) : projects.length === 0 ? (
                <View style={styles.modalEmptyContainer}>
                  <Text style={styles.modalEmptyText}>No projects found</Text>
                  <Text style={styles.modalEmptySubtext}>Create a project first from the Projects tab</Text>
                </View>
              ) : (
                projects.map((project) => (
                  <TouchableOpacity
                    key={project._id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedProject(project._id); // Store project ID instead of name
                      setShowProjectDropdown(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{project.name}</Text>
                    <Text style={[styles.modalItemStatus, {
                      color: project.status === 'active' ? '#10b981' : '#888888'
                    }]}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Priority Selection Modal */}
        <Modal
          visible={showPriorityDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPriorityDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPriorityDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Priority</Text>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedPriority(priority);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <View style={styles.priorityModalItem}>
                    <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(priority)}]} />
                    <Text style={styles.modalItemText}>{priority}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Severity Selection Modal */}
        <Modal
          visible={showSeverityDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSeverityDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSeverityDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Severity</Text>
              {severities.map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSeverity(severity);
                    setShowSeverityDropdown(false);
                  }}
                >
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityDot, {backgroundColor: getSeverityColor(severity)}]} />
                    <Text style={styles.modalItemText}>{severity}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Attachment Modal */}
        <Modal
          visible={showAttachmentModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachmentModal(false)}
        >
          <View style={styles.attachmentModalOverlay}>
            <View style={styles.attachmentModalContent}>
              <View style={styles.attachmentModalHeader}>
                <Text style={styles.attachmentModalTitle}>Add Attachment</Text>
                <TouchableOpacity onPress={() => setShowAttachmentModal(false)}>
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.attachmentOptions}>
                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => {
                    setShowAttachmentModal(false);
                    takePhoto();
                  }}
                >
                  <Icon name="camera-alt" size={32} color="#ff9500" />
                  <Text style={styles.attachmentOptionText}>Take Photo</Text>
                  <Text style={styles.attachmentOptionSubtext}>Capture screenshot of the bug</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => {
                    setShowAttachmentModal(false);
                    selectImage();
                  }}
                >
                  <Icon name="image" size={32} color="#ff9500" />
                  <Text style={styles.attachmentOptionText}>Choose from Gallery</Text>
                  <Text style={styles.attachmentOptionSubtext}>Select existing images or files</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: '#ff9500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#ffffff',
  },
  placeholder: {
    color: '#666666',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: '#ff9500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
    shadowColor: '#666666',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    minWidth: screenWidth * 0.8,
    maxWidth: screenWidth * 0.9,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalItemStatus: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  priorityModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optional: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '400',
  },
  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 6,
    lineHeight: 16,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  attachmentButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 12,
  },
  attachmentsList: {
    marginTop: 12,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 12,
    color: '#cccccc',
  },
  imageAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  attachmentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentSize: {
    fontSize: 10,
    color: '#888',
  },
  removeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  attachmentModalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  attachmentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  attachmentOptions: {
    padding: 20,
    gap: 16,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  attachmentOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  attachmentOptionSubtext: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  modalLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  modalEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalEmptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default CreateBugReportScreen;
