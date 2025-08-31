import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CompleteProfileButton = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    hasUsername: false,
    hasIndustry: false,
    hasPhoneNumber: false
  });
  const user = auth().currentUser;

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      if (!user) {
        setVisible(false);
        return;
      }

      // Check if user has completed profile
      const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
      
      if (!userData) {
        setVisible(true);
        setProfileStatus({
          hasUsername: false,
          hasIndustry: false,
          hasPhoneNumber: false
        });
        return;
      }

      const parsedData = JSON.parse(userData);
      const hasCompletedOnboarding = await AsyncStorage.getItem(`user_onboarding_${user.uid}`);

      // Check specific profile fields
      const status = {
        hasUsername: !!parsedData.username,
        hasIndustry: !!parsedData.industry,
        hasPhoneNumber: !!parsedData.phoneNumber
      };
      
      setProfileStatus(status);

      // Check if essential profile fields are filled
      const isProfileComplete = status.hasUsername && 
                               status.hasIndustry && 
                               hasCompletedOnboarding === 'completed';

      setVisible(!isProfileComplete);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // If there's an error, we show the button to be safe
      setVisible(true);
    }
  };

  const navigateToProfileCompletion = () => {
    if (!user) {
      Alert.alert('Error', 'Unable to complete profile. Please sign in again.');
      return;
    }

    // Get token from AsyncStorage for API calls
    const getTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        // Navigate to GetStartedScreen with user data
        navigation.navigate('GetStarted', { 
          user: { 
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          },
          isProfileCompletion: true, // Flag to indicate this is a profile completion flow
          token // Include token for API calls
        });
      } catch (error) {
        console.error('Error retrieving token:', error);
        // Navigate even if token retrieval fails
        navigation.navigate('GetStarted', { 
          user: { 
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          },
          isProfileCompletion: true
        });
      }
    };
    
    getTokenAndNavigate();
  };

  if (!visible) {
    return null;
  }

  // Calculate how many profile fields are missing
  const missingFields = Object.values(profileStatus).filter(value => !value).length;
  const getButtonText = () => {
    if (missingFields === 3) {
      return "Complete Your Profile";
    } else if (missingFields > 0) {
      return `Complete Profile (${missingFields} left)`;
    } else {
      return "Finish Setup";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={navigateToProfileCompletion}
    >
      <Icon name="person-add" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90, // Position above the tab bar
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
    // Add pulse animation using a border
    borderWidth: 2,
    borderColor: '#4CAF5040',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default CompleteProfileButton;
