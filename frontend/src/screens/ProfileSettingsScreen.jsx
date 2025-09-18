import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { apiRequest } from '../utils/networkUtils';

const ProfileSettingsScreen = ({ navigation }) => {
  const user = auth().currentUser;
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

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

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user?.uid) {
          const userData = await AsyncStorage.getItem(`user_data_${user.uid}`);
          if (userData) {
            const parsedData = JSON.parse(userData);
            setUsername(parsedData.username || '');
            setOriginalUsername(parsedData.username || '');
            setName(parsedData.name || user.displayName || '');
            setPhoneNumber(parsedData.phoneNumber || '');
            setIndustry(parsedData.industry || '');
          } else {
            // Fallback to Firebase data
            setName(user.displayName || '');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Username validation
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
    
    // If username hasn't changed, don't check availability
    if (text === originalUsername) {
      setUsernameAvailable(true);
      return;
    }

    // Check availability
    checkUsernameAvailability(text);
  };

  // Check username availability
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck === originalUsername) return;
    
    setCheckingUsername(true);
    try {
      const response = await apiRequest('/api/users/check-username', {
        method: 'POST',
        body: JSON.stringify({ username: usernameToCheck })
      });
      
      if (response.success) {
        setUsernameAvailable(response.data.available);
        if (!response.data.available) {
          setUsernameError('Username is already taken');
        }
      } else {
        setUsernameError('Error checking username availability');
        setUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Handle username change
  const handleUsernameChange = (text) => {
    setUsername(text);
    validateUsername(text);
  };

  // Save profile changes
  const saveChanges = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (usernameError || usernameAvailable === false) {
      Alert.alert('Error', 'Please fix the username issues before saving');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/api/users/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          username: username.trim(),
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          industry: industry
        })
      });

      if (response.success) {
        // Update local storage
        const updatedUserData = {
          uid: user.uid,
          id: response.data.user.id,
          username: response.data.user.username,
          name: response.data.user.name,
          email: response.data.user.email,
          avatar: response.data.user.avatar,
          industry: response.data.user.industry,
          phoneNumber: response.data.user.phoneNumber,
          role: response.data.user.role,
          onboardingCompleted: response.data.user.onboardingCompleted
        };
        
        await AsyncStorage.setItem(`user_data_${user.uid}`, JSON.stringify(updatedUserData));
        
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
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
              console.log('🚪 User logging out...');
              
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

  const getUsernameIconColor = () => {
    if (checkingUsername) return '#fbbf24';
    if (usernameError) return '#ef4444';
    if (usernameAvailable === true) return '#10b981';
    if (usernameAvailable === false) return '#ef4444';
    return '#6b7280';
  };

  const getUsernameIconName = () => {
    if (checkingUsername) return 'refresh';
    if (usernameError) return 'error';
    if (usernameAvailable === true) return 'check-circle';
    if (usernameAvailable === false) return 'cancel';
    return 'help-outline';
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Settings Form */}
          <View style={styles.formContainer}>
            
            {/* Username Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    usernameError && styles.inputError,
                    usernameAvailable === true && styles.inputSuccess
                  ]}
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="Enter your username"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Icon 
                  name={getUsernameIconName()} 
                  size={20} 
                  color={getUsernameIconColor()}
                  style={[
                    styles.inputIcon,
                    checkingUsername && styles.rotatingIcon
                  ]}
                />
              </View>
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : usernameAvailable === true && username !== originalUsername ? (
                <Text style={styles.successText}>Username is available!</Text>
              ) : null}
            </View>

            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
              />
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            {/* Industry Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Industry</Text>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownValue}>{industry || 'Select Industry'}</Text>
                <Icon name="keyboard-arrow-down" size={24} color="#666" />
              </View>
              
              {/* Industry Options */}
              <View style={styles.industryGrid}>
                {industries.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[
                      styles.industryOption,
                      industry === ind && styles.industryOptionSelected
                    ]}
                    onPress={() => setIndustry(ind)}
                  >
                    <Text style={[
                      styles.industryOptionText,
                      industry === ind && styles.industryOptionTextSelected
                    ]}>
                      {ind}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (loading || usernameError || usernameAvailable === false) && styles.saveButtonDisabled
              ]}
              onPress={saveChanges}
              disabled={loading || usernameError || usernameAvailable === false}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="save" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputSuccess: {
    borderColor: '#10b981',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 17,
  },
  rotatingIcon: {
    transform: [{ rotate: '0deg' }],
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 4,
  },
  dropdownContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#ffffff',
  },
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  industryOption: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  industryOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  industryOptionText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  industryOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default ProfileSettingsScreen;
