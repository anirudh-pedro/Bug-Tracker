import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreateProjectScreen = ({ navigation, route }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [techStackList, setTechStackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const techStackInputRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  // Get callback from route params
  const onProjectCreated = route?.params?.onProjectCreated;

  const generateProjectKey = (name) => {
    // Generate a project key from the name
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.slice(0, 3))
      .join('')
      .slice(0, 10);
  };

  const addTechStack = () => {
    if (techStack.trim() && !techStackList.includes(techStack.trim())) {
      setTechStackList([...techStackList, techStack.trim()]);
      setTechStack('');
      // Keep the input focused to prevent keyboard dismissal
      setTimeout(() => {
        if (techStackInputRef.current) {
          techStackInputRef.current.focus();
        }
      }, 50);
    }
  };

  const removeTechStack = (indexToRemove) => {
    setTechStackList(techStackList.filter((_, index) => index !== indexToRemove));
  };

  const handleTechStackSubmit = () => {
    addTechStack();
  };

  const handleCreateProject = async () => {
    // Validation
    if (!projectName.trim()) {
      Alert.alert('Required Field', 'Please enter a project name');
      return;
    }
    
    if (!projectDescription.trim()) {
      Alert.alert('Required Field', 'Please enter a project description');
      return;
    }

    if (!techStackList.length) {
      Alert.alert('Required Field', 'Please add at least one technology to the tech stack');
      return;
    }

    setLoading(true);
    try {
      const projectKey = generateProjectKey(projectName);
      
      const response = await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          key: projectKey,
          tags: techStackList,
          category: 'web', // Default category
          priority: 'medium' // Default priority
        })
      });

      if (response.success) {
        // Reset form
        setProjectName('');
        setProjectDescription('');
        setTechStackList([]);
        
        // Call callback to refresh projects list if provided
        if (onProjectCreated) {
          onProjectCreated();
        }
        
        Alert.alert(
          'Success', 
          `Project "${projectName}" created successfully!`,
          [
            {
              text: 'View Projects',
              onPress: () => {
                navigation.goBack(); // Go back to Projects screen
                // The useFocusEffect will automatically reload projects
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create project');
      }
      
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Project</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        >
          {/* Project Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#ff6b6b', '#ff5252']}
              style={styles.iconGradient}
            >
              <Icon name="rocket-launch" size={40} color="#ffffff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Start Your New Project</Text>
          <Text style={styles.subtitle}>
            Tell us about your project to get started
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Project Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your project name"
                placeholderTextColor="#666666"
                value={projectName}
                onChangeText={setProjectName}
                maxLength={100}
              />
            </View>

            {/* Tech Stack */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tech Stack *</Text>
              <View style={styles.techStackInputContainer}>
                <TextInput
                  ref={techStackInputRef}
                  style={styles.techStackInput}
                  placeholder="Add a technology (e.g., React Native)"
                  placeholderTextColor="#666666"
                  value={techStack}
                  onChangeText={setTechStack}
                  onSubmitEditing={handleTechStackSubmit}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPressIn={addTechStack}
                  disabled={!techStack.trim()}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={20} color={techStack.trim() ? "#ffffff" : "#666666"} />
                </TouchableOpacity>
              </View>
              
              {/* Tech Stack List */}
              {techStackList.length > 0 && (
                <View style={styles.techStackList}>
                  {techStackList.map((tech, index) => (
                    <View key={index} style={styles.techStackItem}>
                      <Text style={styles.techStackText}>{tech}</Text>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeTechStack(index)}
                      >
                        <Icon name="close" size={16} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={styles.hint}>
                {techStackList.length === 0 
                  ? "Add technologies one by one" 
                  : `${techStackList.length} technolog${techStackList.length === 1 ? 'y' : 'ies'} added`
                }
              </Text>
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what your project is about..."
                placeholderTextColor="#666666"
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {projectDescription.length}/500 characters
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateProject}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#666666', '#555555'] : ['#ff6b6b', '#ff5252']}
              style={styles.createButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="add" size={20} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Project</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    marginLeft: 15,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  charCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 5,
  },
  createButton: {
    marginBottom: 20,
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Tech Stack Styles
  techStackInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techStackInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444444',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  techStackList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  techStackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#444444',
  },
  techStackText: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateProjectScreen;