import React, { useState } from 'react';
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

const GetStartedScreen = ({ navigation, route }) => {
  const [industry, setIndustry] = useState('Select');
  const [contactNumber, setContactNumber] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const user = route?.params?.user || {};

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

  const handleGetStarted = () => {
    if (industry === 'Select') {
      Alert.alert('Required Field', 'Please select your industry');
      return;
    }
    
    if (!contactNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your contact number');
      return;
    }

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
              style={styles.textInput}
              placeholder="Enter your Contact Number"
              placeholderTextColor="#888888"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
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
