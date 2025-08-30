import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { API_CONFIG, buildApiUrl } from '../config/apiConfig';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ route, navigation }) => {
  const { user, token } = route.params;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    industry: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  const industries = [
    'Technology',
    'Healthcare', 
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Real Estate',
    'Media & Entertainment',
    'Non-Profit',
    'Government',
    'Other'
  ];

  const steps = [
    {
      title: 'Choose Your Username',
      subtitle: 'Pick a unique username for your profile',
      icon: 'person'
    },
    {
      title: 'Select Your Industry',
      subtitle: 'Help us customize your experience',
      icon: 'business'
    },
    {
      title: 'Add Phone Number',
      subtitle: 'Optional - for notifications and security',
      icon: 'phone'
    }
  ];

  useEffect(() => {
    animateSlide();
  }, [currentStep]);

  const animateSlide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: currentStep,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.USERS.CHECK_USERNAME)}/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text) => {
    setFormData({ ...formData, username: text });
    
    // Debounce username check
    clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(() => {
      checkUsernameAvailability(text);
    }, 500);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Username
        if (!formData.username || formData.username.length < 3) {
          Alert.alert('Error', 'Username must be at least 3 characters long');
          return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
          return false;
        }
        if (usernameAvailable === false) {
          Alert.alert('Error', 'Username is already taken. Please choose a different one.');
          return false;
        }
        return true;
      case 1: // Industry
        if (!formData.industry) {
          Alert.alert('Error', 'Please select your industry');
          return false;
        }
        return true;
      case 2: // Phone (optional)
        if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
          Alert.alert('Error', 'Phone number must be exactly 10 digits');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('📝 Starting onboarding submission...');
    console.log('📋 Form data:', formData);
    console.log('🎫 Token present:', !!token);
    
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USERS.COMPLETE_ONBOARDING), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (data.success) {
        console.log('✅ Onboarding completed successfully!');
        Alert.alert(
          'Welcome!',
          'Your profile has been set up successfully.',
          [
            {
              text: 'Get Started',
              onPress: () => {
                console.log('🚀 Navigating to Home screen');
                navigation.replace('Home');
              },
            },
          ]
        );
      } else {
        console.error('❌ Onboarding failed:', data.message);
        Alert.alert('Error', data.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUsernameStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[
            styles.textInput,
            usernameAvailable === false && styles.errorInput,
            usernameAvailable === true && styles.successInput
          ]}
          placeholder="Enter your username"
          value={formData.username}
          onChangeText={handleUsernameChange}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={30}
        />
        {checkingUsername && (
          <ActivityIndicator size="small" color="#4ecdc4" style={styles.checkingIcon} />
        )}
        {!checkingUsername && usernameAvailable === true && (
          <Icon name="check-circle" size={24} color="#4CAF50" style={styles.checkingIcon} />
        )}
        {!checkingUsername && usernameAvailable === false && (
          <Icon name="error" size={24} color="#F44336" style={styles.checkingIcon} />
        )}
      </View>
      
      <Text style={styles.helperText}>
        Username must be 3-30 characters and contain only letters, numbers, and underscores
      </Text>
      
      {usernameAvailable === false && (
        <Text style={styles.errorText}>Username is already taken</Text>
      )}
      {usernameAvailable === true && (
        <Text style={styles.successText}>Username is available!</Text>
      )}
    </View>
  );

  const renderIndustryStep = () => (
    <View style={styles.stepContent}>
      <ScrollView style={styles.industryList} showsVerticalScrollIndicator={false}>
        {industries.map((industry, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.industryOption,
              formData.industry === industry && styles.selectedIndustry
            ]}
            onPress={() => setFormData({ ...formData, industry })}
          >
            <Text style={[
              styles.industryText,
              formData.industry === industry && styles.selectedIndustryText
            ]}>
              {industry}
            </Text>
            {formData.industry === industry && (
              <Icon name="check" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPhoneStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter your phone number (optional)"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>
      
      <Text style={styles.helperText}>
        Phone number is optional but helps with account security and notifications
      </Text>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderUsernameStep();
      case 1:
        return renderIndustryStep();
      case 2:
        return renderPhoneStep();
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
            <Text style={styles.subtitle}>Let's set up your profile</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.activeDot
                ]}
              />
            ))}
          </View>

          {/* Step Header */}
          <Animated.View
            style={[
              styles.stepHeader,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, -width * 0.1, -width * 0.2],
                  })
                }]
              }
            ]}
          >
            <View style={styles.stepIcon}>
              <Icon name={steps[currentStep].icon} size={32} color="#ffffff" />
            </View>
            <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
            <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
          </Animated.View>

          {/* Step Content */}
          <Animated.View
            style={[
              styles.contentContainer,
              { opacity: fadeAnim }
            ]}
          >
            {renderStepContent()}
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-back" size={20} color="#667eea" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                currentStep === 0 && !formData.username && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={loading || (currentStep === 0 && !formData.username)}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </Text>
                  <Icon name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  activeDot: {
    backgroundColor: '#ffffff',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  stepContent: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  errorInput: {
    borderColor: '#F44336',
  },
  successInput: {
    borderColor: '#4CAF50',
  },
  checkingIcon: {
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
  industryList: {
    flex: 1,
  },
  industryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedIndustry: {
    backgroundColor: '#4ecdc4',
    borderColor: '#4ecdc4',
  },
  industryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedIndustryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#4ecdc4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default OnboardingScreen;
