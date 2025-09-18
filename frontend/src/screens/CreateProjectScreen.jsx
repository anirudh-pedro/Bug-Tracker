import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiRequest } from '../utils/networkUtils';

const CreateProjectScreen = ({ navigation }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!techStack.trim()) {
      Alert.alert('Required Field', 'Please enter the tech stack');
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
          tags: techStack.split(',').map(tag => tag.trim()).filter(tag => tag),
          category: 'web', // Default category
          priority: 'medium' // Default priority
        })
      });

      if (response.success) {
        Alert.alert(
          'Success', 
          `Project "${projectName}" created successfully!`,
          [
            {
              text: 'View Projects',
              onPress: () => navigation.navigate('Projects')
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
          <Text style={styles.headerTitle}>Create Project</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <TextInput
                style={styles.input}
                placeholder="e.g., React Native, Node.js, MongoDB"
                placeholderTextColor="#666666"
                value={techStack}
                onChangeText={setTechStack}
                multiline={true}
                numberOfLines={2}
              />
              <Text style={styles.hint}>Separate technologies with commas</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 30,
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
    marginBottom: 30,
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
});

export default CreateProjectScreen;