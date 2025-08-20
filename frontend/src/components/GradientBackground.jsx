import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({children, colors = ['#0a0a0a', '#1a1a1a']}) => {
  return (
    <LinearGradient colors={colors} style={styles.gradient}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
