import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const CreateProjectTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create New Project</Text>
      <Text style={styles.subtitle}>This tab will trigger project creation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreateProjectTab;
