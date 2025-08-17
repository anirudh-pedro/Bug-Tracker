import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors, getThemeColors } from '../constants/colors';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const themeColors = getThemeColors(isDarkMode);

  const loaderColor = color || Colors.primary;

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={[styles.loaderContainer, { backgroundColor: themeColors.surface }]}>
          <ActivityIndicator size={size} color={loaderColor} />
          {text && (
            <Text style={[styles.text, { color: themeColors.text }]}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={loaderColor} />
      {text && (
        <Text style={[styles.text, { color: themeColors.text }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContainer: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Loader;
