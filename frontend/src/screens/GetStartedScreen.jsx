import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { apiRequest } from '../utils/networkUtils';
import { AUTH_CONFIG } from '../config/authConfig';

const GetStartedScreen = ({ navigation, route }) => {
  const [username, setUsername] = useState('');
  const [industry, setIndustry] = useState('Select');
  const [githubUrl, setGithubUrl] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const user = route?.params?.user || {};
  const [token, setToken] = useState(route?.params?.token || '');

  // DEBUG: Log when component mounts/unmounts
  useEffect(() => {
    console.log('🔥 GetStartedScreen MOUNTED');
    console.log('📋 Route params:', route?.params);
    console.log('👤 User from params:', user);
    console.log('🎫 Token from params:', token ? 'HAS TOKEN' : 'NO TOKEN');
    
    return () => {
      console.log('🔥 GetStartedScreen UNMOUNTED');
    };
  }, []);

  // Load token from AsyncStorage if not available in params
  useEffect(() => {
    const loadToken = async () => {
      try {
        if (!token) {
          console.log('🔍 No token in params, checking AsyncStorage...');
          const storedToken = await AsyncStorage.getItem('userToken');
          if (storedToken) {
            console.log('✅ Token found in AsyncStorage');
            setToken(storedToken);
          } else {
            console.log('❌ No token found in AsyncStorage either');
          }
        } else {
          console.log('✅ Token available from params:', token.substring(0, 20) + '...');
        }
      } catch (error) {
        console.error('❌ Error loading token:', error);
      }
    };
    
    loadToken();
  }, [token]);

  // Function to handle re-authentication when no token is available
  const handleReAuthenticate = async () => {
    try {
      console.log('🔄 Re-authenticating user...');
      Alert.alert(
        'Re-authentication Required',
        'You need to sign in again to complete your profile. You will be redirected to the login screen.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In Again',
            onPress: async () => {
              // Sign out current user and redirect to login
              await auth().signOut();
              // The App.jsx will automatically redirect to Login screen
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error during re-authentication:', error);
      Alert.alert('Error', 'Failed to re-authenticate. Please try again.');
    }
  };

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // We don't need to redirect anymore, because this screen 
        // is only shown when needed based on username check
        console.log('� User directed to profile completion page');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, stay on GetStarted screen to be safe
      }
    };

    if (user.uid || user.id) {
      checkOnboardingStatus();
    }
  }, [user]);

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

  // Username validation function
  const validateUsername = (text) => {
    if (!text) {
      setUsernameError('');
      setUsernameAvailable(null);
      return;
    }
    
    if (text.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameAvailable(false);
      return;
    }
    
    if (text.length > 30) {
      setUsernameError('Username cannot exceed 30 characters');
      setUsernameAvailable(false);
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(text)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setUsernameAvailable(false);
      return;
    }
    
    setUsernameError('');
    // Check availability with backend
    checkUsernameAvailability(text);
  };

  const checkUsernameAvailability = async (username) => {
    if (!token) {
      console.log('No token available for username check');
      return;
    }
    
    setCheckingUsername(true);
    try {
      const response = await apiRequest('/api/users/check-username', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      setUsernameAvailable(data.available);
      if (!data.available) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    
    // Debounce username validation
    clearTimeout(window.usernameValidationTimeout);
    window.usernameValidationTimeout = setTimeout(() => {
      validateUsername(text);
    }, 500);
  };

  const handleGetStarted = async () => {
    console.log('🔥 Get Started button pressed');
    console.log('📋 Current form data:', { username, industry, githubUrl });
    console.log('🔍 Username available:', usernameAvailable);
    console.log('❌ Username error:', usernameError);
    console.log('🎫 Token available:', !!token);
    console.log('🎫 Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');

    // Check username availability before proceeding
    if (!usernameAvailable) {
      console.log('❌ Username is not available or not checked yet');
      Alert.alert('Username Error', 'Please ensure your username is available before proceeding');
      return;
    }
    
    if (!username.trim()) {
      console.log('❌ Username validation failed: empty');
      Alert.alert('Required Field', 'Please enter a username');
      return;
    }
    
    if (industry === 'Select') {
      console.log('❌ Industry not selected');
      Alert.alert('Required Field', 'Please select your industry');
      return;
    }
    
    if (!githubUrl.trim()) {
      console.log('❌ GitHub URL validation failed: empty');
      Alert.alert('Required Field', 'Please enter your GitHub URL');
      return;
    }

    // Validate GitHub URL format
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/;
    if (!githubRegex.test(githubUrl.trim())) {
      console.log('❌ GitHub URL validation failed:', githubUrl);
      Alert.alert('Invalid GitHub URL', 'Please enter a valid GitHub URL (e.g., https://github.com/username)');
      return;
    }

    if (!token) {
      console.log('❌ No token available for API call');
      console.log('📋 User object:', user);
      console.log('📋 Route params:', route?.params);
      
      // Try to get token from AsyncStorage one more time
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          console.log('🔄 Found token in AsyncStorage, retrying...');
          setToken(storedToken);
          // Retry the function with the token
          return;
        }
      } catch (error) {
        console.error('❌ Error checking AsyncStorage for token:', error);
      }
      
      Alert.alert('Authentication Error', 'Please try signing in again.');
      return;
    }

    try {
      console.log('🚀 Submitting onboarding data:', {
        username: username.trim(),
        industry,
        githubUrl: githubUrl.trim()
      });

      console.log('🔍 Testing authentication first...');
      
      // First test if authentication works
      const authTestResponse = await apiRequest('/api/users/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Auth test response status:', authTestResponse.status);
      const authTestData = await authTestResponse.json();
      console.log('🔍 Auth test response:', authTestData);

      if (!authTestResponse.ok) {
        console.error('❌ Authentication test failed');
        Alert.alert('Authentication Error', 'Your session has expired. Please sign in again.');
        
        // Navigate back to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
        return;
      }

      console.log('✅ Authentication test passed, proceeding with onboarding...');

      // Final username check before submitting
      console.log('🔍 Performing final username availability check...');
      const finalUsernameCheck = await apiRequest('/api/users/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const finalCheckData = await finalUsernameCheck.json();
      console.log('🔍 Final username check result:', finalCheckData);

      if (!finalCheckData.available) {
        console.log('❌ Username no longer available');
        Alert.alert('Username Taken', 'This username is no longer available. Please choose another one.');
        setUsernameAvailable(false);
        return;
      }

      // Submit to backend
      const response = await apiRequest('/api/users/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          githubUrl: githubUrl.trim(),
          industry: industry
        }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Onboarding response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user data');
      }

      console.log('✅ User onboarding completed:', data);

      // Save user data locally as well
      const userData = {
        uid: user.uid || user.id,
        username: username.trim(),
        githubUrl: githubUrl.trim(),
        industry: industry,
        completedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`user_data_${user.uid || user.id}`, JSON.stringify(userData));
      await AsyncStorage.setItem(`user_onboarding_${user.uid || user.id}`, 'completed');

      console.log('✅ Data saved locally');

      // Call refresh function to update auth state in App.jsx
      const refreshProfileStatus = route?.params?.refreshProfileStatus;
      if (refreshProfileStatus) {
        console.log('🔄 Calling refresh function to update auth state...');
        refreshProfileStatus();
      } else {
        console.log('⚠️ No refresh function available in route params');
      }

      console.log('✅ Profile completed successfully - App.jsx will handle navigation');
      
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      Alert.alert('Error', error.message || 'Failed to save your information. Please try again.');
    }
  };

  // Handle logout - back button functionality
  const handleLogout = async () => {
    Alert.alert(
      'Go Back',
      'Going back will sign you out. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 User logging out from GetStarted page...');
              
              // Clear AsyncStorage
              await AsyncStorage.clear();
              console.log('✅ AsyncStorage cleared');
              
              // Sign out from Firebase
              await auth().signOut();
              console.log('✅ Firebase sign out successful');
              
              // Navigation will be handled automatically by App.jsx
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleLogout}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationBackground}>
            {/* Team collaboration illustration */}
            <View style={styles.teamIllustration}>
              {/* Person 1 */}
              <View style={[styles.person, styles.person1]}>
                <View style={styles.personHead} />
                <View style={[styles.personBody, { backgroundColor: '#87CEEB' }]} />
                <View style={[styles.personArm, styles.leftArm]} />
                <View style={[styles.personArm, styles.rightArm]} />
                <View style={[styles.personLeg, styles.leftLeg]} />
                <View style={[styles.personLeg, styles.rightLeg]} />
              </View>
              
              {/* Person 2 */}
              <View style={[styles.person, styles.person2]}>
                <View style={styles.personHead} />
                <View style={[styles.personBody, { backgroundColor: '#FFA07A' }]} />
                <View style={[styles.personArm, styles.leftArm]} />
                <View style={[styles.personArm, styles.rightArm]} />
                <View style={[styles.personLeg, styles.leftLeg, { backgroundColor: '#4169E1' }]} />
                <View style={[styles.personLeg, styles.rightLeg, { backgroundColor: '#4169E1' }]} />
              </View>
              
              {/* Handshake area */}
              <View style={styles.handshakeArea} />
            </View>
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.greeting}>Hello {user.displayName || 'User'}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.emoji}>📝</Text>
          </View>
          
          {/* Show message if no token available */}
          {!token && (
            <View style={styles.noTokenContainer}>
              <Text style={styles.noTokenText}>
                ⚠️ Authentication required to complete profile
              </Text>
              <TouchableOpacity 
                style={styles.reAuthButton}
                onPress={handleReAuthenticate}
              >
                <Text style={styles.reAuthButtonText}>Sign In Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Form Section */}
        <View style={[styles.formContainer, !token && styles.disabledForm]}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[
                  styles.textInput,
                  usernameError ? styles.invalidInput : 
                  usernameAvailable === true ? styles.validInput : null
                ]}
                placeholder="Enter your username"
                placeholderTextColor="#888888"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                editable={!!token}
              />
              {checkingUsername && (
                <View style={styles.inputIcon}>
                  <Icon name="hourglass-empty" size={20} color="#ffa500" />
                </View>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <View style={styles.inputIcon}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                </View>
              )}
              {!checkingUsername && (usernameAvailable === false || usernameError) && (
                <View style={styles.inputIcon}>
                  <Icon name="error" size={20} color="#F44336" />
                </View>
              )}
            </View>
            
            {usernameError && (
              <Text style={styles.validationError}>{usernameError}</Text>
            )}
            {!usernameError && usernameAvailable === true && (
              <Text style={styles.validationSuccess}>✓ Username is available!</Text>
            )}
            <Text style={styles.helperText}>
              3-30 characters, letters, numbers, and underscores only
            </Text>
          </View>

          {/* Industry Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => token && setShowIndustryDropdown(!showIndustryDropdown)}
              disabled={!token}
            >
              <Text style={[styles.dropdownText, industry === 'Select' && styles.placeholder]}>
                {industry}
              </Text>
              <Icon 
                name={showIndustryDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#666666" 
              />
            </TouchableOpacity>
            
            {showIndustryDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {industries.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setIndustry(item);
                        setShowIndustryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* GitHub URL Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              GitHub URL <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                githubUrl && !/^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/.test(githubUrl.trim()) && styles.invalidInput
              ]}
              placeholder="https://github.com/username"
              placeholderTextColor="#888888"
              value={githubUrl}
              onChangeText={(text) => {
                if (!token) return;
                setGithubUrl(text);
              }}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!!token}
            />
            {githubUrl && !/^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/.test(githubUrl.trim()) && (
              <Text style={styles.validationError}>
                Please enter a valid GitHub URL (e.g., https://github.com/username)
              </Text>
            )}
            {githubUrl && /^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/.test(githubUrl.trim()) && (
              <Text style={styles.validationSuccess}>
                ✓ Valid GitHub URL
              </Text>
            )}
          </View>

          {/* Get Started Button */}
          <TouchableOpacity 
            style={[
              styles.getStartedButton,
              !token && styles.disabledButton
            ]}
            onPress={() => {
              if (!token) {
                handleReAuthenticate();
                return;
              }
              console.log('🚨 BUTTON PRESSED - onPress triggered');
              handleGetStarted();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.getStartedText}>
              {!token ? 'Sign In Required' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
  scrollView: {
    flex: 1,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  illustrationBackground: {
    width: 300,
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  teamIllustration: {
    width: 200,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  person: {
    position: 'absolute',
    width: 60,
    height: 100,
  },
  person1: {
    left: 20,
    top: 10,
  },
  person2: {
    right: 20,
    top: 10,
  },
  personHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4A574',
    alignSelf: 'center',
    marginBottom: 2,
  },
  personBody: {
    width: 30,
    height: 35,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 2,
  },
  personArm: {
    position: 'absolute',
    width: 8,
    height: 25,
    backgroundColor: '#D4A574',
    borderRadius: 4,
  },
  leftArm: {
    top: 25,
    left: 8,
    transform: [{ rotate: '20deg' }],
  },
  rightArm: {
    top: 25,
    right: 8,
    transform: [{ rotate: '-20deg' }],
  },
  personLeg: {
    width: 8,
    height: 30,
    backgroundColor: '#2F4F4F',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  leftLeg: {
    left: 18,
  },
  rightLeg: {
    right: 18,
  },
  handshakeArea: {
    position: 'absolute',
    width: 40,
    height: 20,
    top: 45,
    left: '50%',
    marginLeft: -20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderRadius: 10,
    opacity: 0.6,
  },
  welcomeContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emoji: {
    fontSize: 28,
    marginLeft: 8,
  },
  noTokenContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  noTokenText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  reAuthButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: 'center',
  },
  reAuthButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  disabledForm: {
    opacity: 0.6,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '500',
  },
  required: {
    color: '#ff6b6b',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  placeholder: {
    color: '#888888',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 50,
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingRight: 15,
  },
  inputIcon: {
    paddingLeft: 10,
  },
  validInput: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  invalidInput: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  helperText: {
    color: '#888888',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 5,
  },
  invalidInput: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  validationError: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  validationSuccess: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  getStartedButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.7,
  },
});

export default GetStartedScreen;
