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

const GetStartedScreen = ({ navigation, route }) => {
  const [username, setUsername] = useState('');
  const [industry, setIndustry] = useState('Select');
  const [contactNumber, setContactNumber] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const user = route?.params?.user || {};
  const [token, setToken] = useState(route?.params?.token || '');

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

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Check if user already has username and completed onboarding
        if (user.username && user.onboardingCompleted) {
          console.log('🔄 User already completed onboarding, redirecting to Home');
          navigation.replace('Home');
          return;
        }

        // Also check AsyncStorage as backup
        const hasCompletedOnboarding = await AsyncStorage.getItem(`user_onboarding_${user.uid}`);
        const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
        
        if (hasCompletedOnboarding && userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.username) {
            console.log('🔄 User found in AsyncStorage with username, redirecting to Home');
            navigation.replace('Home');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, stay on GetStarted screen to be safe
      }
    };

    if (user.uid || user.id) {
      checkOnboardingStatus();
    }
  }, [user, navigation]);

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
      const response = await fetch(`http://10.0.2.2:5000/api/users/check-username/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
    console.log('📋 Current form data:', { username, industry, contactNumber });
    console.log('🔍 Username available:', usernameAvailable);
    console.log('❌ Username error:', usernameError);
    console.log('🎫 Token available:', !!token);
    console.log('🎫 Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');

    // TEMPORARY: Skip username validation for testing
    console.log('⚠️ TEMPORARY: Skipping username validation for testing');
    
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
    
    if (!contactNumber.trim()) {
      console.log('❌ Contact number validation failed: empty');
      Alert.alert('Required Field', 'Please enter your contact number');
      return;
    }

    // Validate phone number - must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNumber.trim())) {
      console.log('❌ Phone number validation failed:', contactNumber);
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
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
        phoneNumber: contactNumber.trim()
      });

      console.log('🔍 Testing authentication first...');
      
      // First test if authentication works
      const authTestResponse = await fetch('http://10.0.2.2:5000/api/users/test-auth', {
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

      // Submit to backend
      const response = await fetch('http://10.0.2.2:5000/api/users/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          phoneNumber: contactNumber.trim(),
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
        phoneNumber: contactNumber.trim(),
        industry: industry,
        completedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`user_data_${user.uid || user.id}`, JSON.stringify(userData));
      await AsyncStorage.setItem(`user_onboarding_${user.uid || user.id}`, 'completed');

      console.log('✅ Data saved locally');

      // Navigate to main app
      console.log('🚀 Navigating to MainApp');
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'MainApp', 
          params: { 
            showCreateProject: true,
            userInfo: { username: username.trim(), industry, contactNumber, ...user }
          }
        }],
      });
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      Alert.alert('Error', error.message || 'Failed to save your information. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.title}>Welcome to Bug Tracker </Text>
            <Text style={styles.emoji}>🎉</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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
              onPress={() => setShowIndustryDropdown(!showIndustryDropdown)}
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

          {/* Contact Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Contact Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                contactNumber && !/^\d{10}$/.test(contactNumber.trim()) && styles.invalidInput
              ]}
              placeholder="Enter 10-digit Contact Number"
              placeholderTextColor="#888888"
              value={contactNumber}
              onChangeText={(text) => {
                // Only allow numbers and limit to 10 digits
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
                setContactNumber(numericText);
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {contactNumber && !/^\d{10}$/.test(contactNumber.trim()) && (
              <Text style={styles.validationError}>
                Please enter exactly 10 digits
              </Text>
            )}
            {contactNumber && /^\d{10}$/.test(contactNumber.trim()) && (
              <Text style={styles.validationSuccess}>
                ✓ Valid phone number
              </Text>
            )}
          </View>

          {/* Get Started Button */}
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => {
              console.log('🚨 BUTTON PRESSED - onPress triggered');
              handleGetStarted();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
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
  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
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
});

export default GetStartedScreen;
