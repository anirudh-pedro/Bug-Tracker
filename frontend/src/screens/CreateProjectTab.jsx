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
  Dimensions
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width: screenWidth} = Dimensions.get('window');

const CreateBugReportScreen = ({navigation}) => {
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedCategory, setSelectedCategory] = useState('Bug');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [stepsToReproduce, setStepsToReproduce] = useState('');

  // Sample projects - in real app, this would come from your data source
  const projects = [
    { id: 1, name: 'Bug Tracker Mobile App', status: 'Active' },
    { id: 2, name: 'E-commerce Platform', status: 'Active' },
    { id: 3, name: 'Social Media Dashboard', status: 'Active' },
    { id: 4, name: 'Data Analytics Dashboard', status: 'On Hold' },
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Bug', 'Feature Request', 'Enhancement', 'Documentation'];

  const handleSubmitBug = () => {
    if (!bugTitle.trim()) {
      Alert.alert('Error', 'Please enter a bug title');
      return;
    }
    if (!bugDescription.trim()) {
      Alert.alert('Error', 'Please provide a bug description');
      return;
    }
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    // Here you would typically send the data to your backend
    Alert.alert(
      'Success', 
      'Bug report submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setBugTitle('');
            setBugDescription('');
            setSelectedProject('');
            setStepsToReproduce('');
            setSelectedPriority('Medium');
            setSelectedCategory('Bug');
            // Navigate back to home
            navigation.navigate('Home');
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                  {selectedProject || 'Select a project'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#888888" />
              </TouchableOpacity>
            </View>

            {/* Priority and Category Row */}
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
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowCategoryDropdown(true)}
                >
                  <Text style={styles.dropdownText}>{selectedCategory}</Text>
                  <Icon name="arrow-drop-down" size={24} color="#888888" />
                </TouchableOpacity>
              </View>
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
              <Text style={styles.label}>Steps to Reproduce</Text>
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

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBug}>
              <Icon name="bug-report" size={24} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Bug Report</Text>
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
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProject(project.name);
                    setShowProjectDropdown(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{project.name}</Text>
                  <Text style={[styles.modalItemStatus, {
                    color: project.status === 'Active' ? '#10b981' : '#888888'
                  }]}>
                    {project.status}
                  </Text>
                </TouchableOpacity>
              ))}
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

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: '#111111',
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
  },
  dropdown: {
    backgroundColor: '#111111',
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
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#ff9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
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
});

export default CreateBugReportScreen;
