import React, { useEffect, useRef, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../utils/networkUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import { AUTH_CONFIG } from '../config/authConfig';

const CreateProjectScreen = ({ navigation, route }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [techStackList, setTechStackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const techStackInputRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  // Get callback from route params
  const onProjectCreated = route?.params?.onProjectCreated;

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem(
          AUTH_CONFIG.STORAGE_KEYS.CURRENT_USERNAME
        );

        if (storedUsername) {
          setCurrentUsername(storedUsername);
          console.log('👤 Loaded current username for project key:', storedUsername);
        }
      } catch (error) {
        console.error('❌ Failed to load current username:', error);
      }
    };

    loadUsername();
  }, []);

  const generateProjectKey = (name, usernameOverride = currentUsername) => {
    const sanitize = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const usernameSegment = usernameOverride ? sanitize(usernameOverride).slice(0, 3) : '';

    const rawNameSegment = sanitize(
      name
        .split(' ')
        .map((word) => word.slice(0, 2))
        .join('')
    );

    const availableLength = Math.max(2, 8 - usernameSegment.length);
    const nameSegment = rawNameSegment.slice(0, availableLength);

    const randomSuffix = Math.floor(10 + Math.random() * 90); // two digits ensures <= 10 chars
    const combinedKey = `${usernameSegment}${nameSegment}${randomSuffix}`;

    return combinedKey.slice(0, 10);
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
      let usernameForKey = currentUsername;

      if (!usernameForKey) {
        const storedUsername = await AsyncStorage.getItem(
          AUTH_CONFIG.STORAGE_KEYS.CURRENT_USERNAME
        );
        if (storedUsername) {
          setCurrentUsername(storedUsername);
          usernameForKey = storedUsername;
        }
      }

      const projectKey = generateProjectKey(projectName, usernameForKey);
      
      const response = await apiRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          key: projectKey,
          ownerUsername: usernameForKey || undefined,
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
          colors={[Colors.background.secondary, Colors.background.primary]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={Colors.text.primary} />
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
              colors={Colors.gradients.amber}
              style={styles.iconGradient}
            >
              <Icon name="rocket-launch" size={40} color={Colors.text.primary} />
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
                placeholderTextColor={Colors.text.muted}
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
                  placeholderTextColor={Colors.text.muted}
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
                  <Icon name="add" size={20} color={techStack.trim() ? Colors.text.primary : Colors.text.muted} />
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
                        <Icon name="close" size={16} color={Colors.status.error} />
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
                placeholderTextColor={Colors.text.muted}
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
              colors={loading ? [Colors.text.muted, Colors.text.tertiary] : Colors.gradients.amber}
              style={styles.createButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.text.primary} />
              ) : (
                <>
                  <Icon name="add" size={20} color={Colors.text.primary} />
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
    backgroundColor: Colors.background.primary,
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
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
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
    shadowColor: Colors.gradients.amber[0],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.tertiary,
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
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 5,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'right',
    marginTop: 5,
  },
  createButton: {
    marginBottom: 20,
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: Colors.gradients.amber[0],
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
    color: Colors.text.primary,
  },
  // Tech Stack Styles
  techStackInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techStackInput: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.dark,
    elevation: 2,
    shadowColor: Colors.background.primary,
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
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  techStackText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateProjectScreen;