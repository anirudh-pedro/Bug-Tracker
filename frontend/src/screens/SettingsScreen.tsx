import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Colors, getThemeColors } from '../constants/colors';
import TopHeader from '../components/TopHeader';

const SettingsScreen: React.FC = () => {
  const isDarkMode = true; // Force dark theme
  const themeColors = getThemeColors(isDarkMode);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleAbout = () => {
    Alert.alert(
      'About Bug Tracker',
      'Bug Tracker v1.0.0\n\nA comprehensive bug tracking application for teams.\n\nDeveloped with React Native.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support functionality coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'Terms of service coming soon!');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality coming soon!');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader title="Settings" />
      
      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Notifications
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: themeColors.text }]}>
              Push Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: themeColors.border, true: Colors.primary }}
              thumbColor={notifications ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: themeColors.text }]}>
              Email Alerts
            </Text>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: themeColors.border, true: Colors.primary }}
              thumbColor={emailAlerts ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data & Sync Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Data & Sync
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: themeColors.text }]}>
              Auto Sync
            </Text>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: themeColors.border, true: Colors.primary }}
              thumbColor={autoSync ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Export Data
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Support
          </Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSupport}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Help & Support
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              About
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Legal
          </Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePrivacy}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleTerms}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuText, { color: themeColors.text }]}>
              Terms of Service
            </Text>
            <Text style={[styles.menuChevron, { color: themeColors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
  },
  menuChevron: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default SettingsScreen;
