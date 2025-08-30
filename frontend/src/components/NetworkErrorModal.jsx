import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { runNetworkDiagnostics, getTroubleshootingSteps } from '../utils/networkDiagnostics';
import { getAdbPortForwardingInstructions } from '../utils/adbHelper';
import { Platform } from 'react-native';

/**
 * A modal component that displays when there's a network connection error
 * Provides helpful troubleshooting information and retry functionality
 */
const NetworkErrorModal = ({ 
  visible, 
  onDismiss, 
  onRetry, 
  errorDetails,
  isRetrying = false 
}) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [troubleshootingSteps, setTroubleshootingSteps] = useState([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [adbInstructions, setAdbInstructions] = useState(null);
  
  // Run network diagnostics when modal is shown
  useEffect(() => {
    if (visible && !diagnostics) {
      runDiagnostics();
    }
    
    if (Platform.OS === 'android') {
      setAdbInstructions(getAdbPortForwardingInstructions());
    }
  }, [visible]);
  
  // Run network diagnostics
  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const results = await runNetworkDiagnostics();
      setDiagnostics(results);
      const steps = getTroubleshootingSteps(results);
      setTroubleshootingSteps(steps);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Network Connection Error</Text>
          
          <Text style={styles.modalText}>
            Unable to connect to the server. Please check your connection and try again.
          </Text>
          
          {errorDetails && (
            <View style={styles.errorDetailsContainer}>
              <Text style={styles.errorDetailsTitle}>Error Details:</Text>
              <Text style={styles.errorDetailsText}>{errorDetails}</Text>
            </View>
          )}
          
          {isDiagnosing ? (
            <View style={styles.diagnosingContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.diagnosingText}>Running network diagnostics...</Text>
            </View>
          ) : (
            <>
              {troubleshootingSteps.length > 0 && (
                <View style={styles.troubleshootingContainer}>
                  <Text style={styles.troubleshootingTitle}>Troubleshooting Steps:</Text>
                  <ScrollView style={styles.troubleshootingScroll}>
                    {troubleshootingSteps.map((step, index) => (
                      <Text key={index} style={styles.troubleshootingStep}>{step}</Text>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {adbInstructions?.canUseAdb && (
                <View style={styles.adbInstructionsContainer}>
                  <Text style={styles.adbInstructionsTitle}>ADB Port Forwarding:</Text>
                  <ScrollView style={styles.adbInstructionsScroll}>
                    {adbInstructions.steps.map((step, index) => (
                      <Text key={index} style={styles.adbInstructionStep}>{step}</Text>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonDiagnose]}
              onPress={runDiagnostics}
              disabled={isDiagnosing}
            >
              <Text style={styles.buttonTextDiagnose}>
                {isDiagnosing ? 'Diagnosing...' : 'Run Diagnostics'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonRetry]}
              onPress={onRetry}
              disabled={isRetrying}
            >
              <Text style={styles.buttonTextRetry}>
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonTextClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#FF3B30',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  errorDetailsContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  errorDetailsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FF3B30',
  },
  errorDetailsText: {
    fontSize: 14,
    color: '#666',
  },
  diagnosingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  diagnosingText: {
    marginTop: 10,
    color: '#0066cc',
  },
  troubleshootingContainer: {
    marginVertical: 10,
  },
  troubleshootingTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  troubleshootingScroll: {
    maxHeight: 120,
  },
  troubleshootingStep: {
    marginBottom: 5,
    color: '#333',
  },
  adbInstructionsContainer: {
    marginVertical: 10,
  },
  adbInstructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  adbInstructionsScroll: {
    maxHeight: 120,
  },
  adbInstructionStep: {
    marginBottom: 5,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 15,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginBottom: 8,
  },
  buttonClose: {
    backgroundColor: '#DDDDDD',
  },
  buttonRetry: {
    backgroundColor: '#4CD964',
  },
  buttonDiagnose: {
    backgroundColor: '#0066CC',
  },
  buttonTextClose: {
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextRetry: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextDiagnose: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NetworkErrorModal;
