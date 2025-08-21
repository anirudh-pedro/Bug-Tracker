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
  const [industry, setIndustry] = useState('Select');
  const [contactNumber, setContactNumber] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const user = route?.params?.user || {};

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem(`user_onboarding_${user.uid}`);
        
        if (hasCompletedOnboarding) {
          // User has already completed onboarding, navigate directly to MainApp
          navigation.replace('MainApp');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, stay on GetStarted screen to be safe
      }
    };

    if (user.uid) {
      checkOnboardingStatus();
    }
  }, [user.uid, navigation]);

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

  const handleGetStarted = async () => {
    if (industry === 'Select') {
      Alert.alert('Required Field', 'Please select your industry');
      return;
    }
    
    if (!contactNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your contact number');
      return;
    }

    // Validate phone number - must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNumber.trim())) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // For now, we'll skip the API call and just save locally
      // In production, you would make the API call here
      /*
      const response = await fetch('http://192.168.212.115:5000/api/users/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` // Assuming we have access token
        },
        body: JSON.stringify({
          phoneNumber: contactNumber.trim(),
          industry: industry
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user data');
      }

      console.log('User onboarding completed:', data);
      */

      // Save user data locally for now
      const userData = {
        uid: user.uid,
        phoneNumber: contactNumber.trim(),
        industry: industry,
        completedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`user_data_${user.uid}`, JSON.stringify(userData));

      // Mark onboarding as complete in AsyncStorage
      await AsyncStorage.setItem(`user_onboarding_${user.uid}`, 'completed');

      console.log('User onboarding completed locally:', userData);

      // Navigate to main app with flag to show project creation modal
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'MainApp', 
          params: { 
            showCreateProject: true,
            userInfo: { industry, contactNumber, ...user }
          }
        }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
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
            onPress={handleGetStarted}
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
