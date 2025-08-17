import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Loader } from '../components';
import { useAuth } from '../context/AuthContext';
import { Colors, getThemeColors } from '../constants/colors';
import { Strings } from '../constants/strings';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { signInWithGoogle, isLoading, error } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const themeColors = getThemeColors(isDarkMode);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {isLoading && <Loader overlay text={Strings.loading} />}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {Strings.appName}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {Strings.appSubtitle}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: themeColors.text }]}>
            {Strings.login}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Welcome Message */}
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { color: themeColors.text }]}>
              Welcome to Bug Tracker! 🐛
            </Text>
            <Text style={[styles.welcomeText, { color: themeColors.textSecondary }]}>
              Sign in with your Google account to get started managing your bugs efficiently.
            </Text>
          </View>

          {/* Google Sign-In */}
          <Button
            title="🚀 Continue with Google"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            variant="primary"
            style={styles.googleButton}
          />

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: themeColors.textSecondary }]}>
              {Strings.dontHaveAccount}
            </Text>
            <Button
              title={Strings.signUp}
              onPress={onNavigateToRegister}
              variant="outline"
              size="small"
              style={styles.registerButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.white,
    textAlign: 'center',
    fontSize: 14,
  },
  welcomeContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButton: {
    marginBottom: 24,
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
    minHeight: 50,
  },
  registerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  registerText: {
    fontSize: 14,
  },
  registerButton: {
    minWidth: 120,
  },
});

export default LoginScreen;
