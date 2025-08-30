import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { runNetworkDiagnostics, getTroubleshootingSteps } from '../utils/networkDiagnostics';
import { getAdbPortForwardingInstructions, getNetworkRecommendations } from '../utils/adbHelper';
import { testBackendConnectivity } from '../utils/connectivityTest';
import { API_CONFIG } from '../config/networkConfig';
import GradientBackground from '../components/GradientBackground';

/**
 * NetworkDiagnosticsScreen
 * 
 * A developer-focused screen for diagnosing and fixing network connectivity issues
 * Includes:
 * - Network diagnostics
 * - Server connectivity testing
 * - ADB port forwarding instructions
 * - Configuration recommendations
 */
const NetworkDiagnosticsScreen = ({ navigation }) => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [troubleshootingSteps, setTroubleshootingSteps] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adbInstructions, setAdbInstructions] = useState(null);
  const [networkRecommendations, setNetworkRecommendations] = useState(null);
  
  const runDiagnostics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Test server connectivity
      const serverTest = await testBackendConnectivity();
      setServerStatus(serverTest);
      
      // Run network diagnostics
      const diagnosticsResults = await runNetworkDiagnostics();
      setDiagnostics(diagnosticsResults);
      
      // Get troubleshooting steps
      const steps = getTroubleshootingSteps(diagnosticsResults);
      setTroubleshootingSteps(steps);
      
      // Get ADB instructions
      const adbInfo = getAdbPortForwardingInstructions();
      setAdbInstructions(adbInfo);
      
      // Get network recommendations
      const recommendations = getNetworkRecommendations();
      setNetworkRecommendations(recommendations);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      Alert.alert('Error', 'An error occurred while running diagnostics: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Run diagnostics when the screen loads
  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Network Diagnostics</Text>
        
        <View style={styles.serverStatusContainer}>
          <Text style={styles.sectionTitle}>Server Status</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0066cc" />
          ) : (
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: serverStatus?.success ? '#4CD964' : '#FF3B30' }
              ]} />
              <Text style={styles.statusText}>
                {serverStatus?.success 
                  ? `Connected to ${API_CONFIG.BASE_URL}` 
                  : `Failed to connect to ${API_CONFIG.BASE_URL}`}
              </Text>
            </View>
          )}
        </View>
        
        <ScrollView style={styles.scrollContainer}>
          {!isLoading && (
            <>
              {/* Troubleshooting Steps */}
              {troubleshootingSteps.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Troubleshooting Steps</Text>
                  {troubleshootingSteps.map((step, index) => (
                    <Text key={index} style={styles.troubleshootingStep}>{step}</Text>
                  ))}
                </View>
              )}
              
              {/* ADB Instructions for Android */}
              {adbInstructions?.canUseAdb && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ADB Port Forwarding</Text>
                  {adbInstructions.steps.map((step, index) => (
                    <Text key={index} style={styles.step}>{step}</Text>
                  ))}
                </View>
              )}
              
              {/* Network Recommendations */}
              {networkRecommendations && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Configuration Recommendations for {networkRecommendations.deviceType}
                  </Text>
                  {networkRecommendations.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationCard}>
                      <Text style={styles.recommendationTitle}>{rec.title}</Text>
                      <Text style={styles.recommendationUrl}>{rec.url}</Text>
                      <Text style={styles.recommendationSetup}>{rec.setup}</Text>
                      
                      <View style={styles.prosConsContainer}>
                        <View style={styles.prosContainer}>
                          <Text style={styles.prosConsTitle}>Pros:</Text>
                          {rec.pros.map((pro, idx) => (
                            <Text key={idx} style={styles.prosCons}>• {pro}</Text>
                          ))}
                        </View>
                        
                        {rec.cons.length > 0 && (
                          <View style={styles.consContainer}>
                            <Text style={styles.prosConsTitle}>Cons:</Text>
                            {rec.cons.map((con, idx) => (
                              <Text key={idx} style={styles.prosCons}>• {con}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Network Diagnostics Details */}
              {diagnostics && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Diagnostic Details</Text>
                  
                  <View style={styles.diagnosticItem}>
                    <Text style={styles.diagnosticLabel}>Device:</Text>
                    <Text style={styles.diagnosticValue}>
                      {diagnostics.device.platform} {diagnostics.device.version}
                    </Text>
                  </View>
                  
                  <View style={styles.diagnosticItem}>
                    <Text style={styles.diagnosticLabel}>Network Type:</Text>
                    <Text style={styles.diagnosticValue}>
                      {diagnostics.networkInfo.type}
                    </Text>
                  </View>
                  
                  <View style={styles.diagnosticItem}>
                    <Text style={styles.diagnosticLabel}>Internet Connection:</Text>
                    <Text style={[
                      styles.diagnosticValue,
                      { color: diagnostics.internetConnectivity.success ? '#4CD964' : '#FF3B30' }
                    ]}>
                      {diagnostics.internetConnectivity.success ? 'Connected' : 'Not Connected'}
                    </Text>
                  </View>
                  
                  <View style={styles.diagnosticItem}>
                    <Text style={styles.diagnosticLabel}>Server Connection:</Text>
                    <Text style={[
                      styles.diagnosticValue,
                      { color: diagnostics.serverConnectivity.success ? '#4CD964' : '#FF3B30' }
                    ]}>
                      {diagnostics.serverConnectivity.success ? 'Connected' : 'Not Connected'}
                    </Text>
                  </View>
                  
                  <View style={styles.diagnosticItem}>
                    <Text style={styles.diagnosticLabel}>Server URL:</Text>
                    <Text style={styles.diagnosticValue}>
                      {diagnostics.serverConfig.mainUrl}
                    </Text>
                  </View>
                  
                  {diagnostics.networkInfo.ipAddresses?.publicIp && (
                    <View style={styles.diagnosticItem}>
                      <Text style={styles.diagnosticLabel}>Public IP:</Text>
                      <Text style={styles.diagnosticValue}>
                        {diagnostics.networkInfo.ipAddresses.publicIp}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runDiagnostics}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  serverStatusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  troubleshootingStep: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  step: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  diagnosticItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  diagnosticLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 150,
  },
  diagnosticValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recommendationCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationUrl: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 4,
  },
  recommendationSetup: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  prosConsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prosContainer: {
    flex: 1,
    marginRight: 8,
  },
  consContainer: {
    flex: 1,
  },
  prosConsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  prosCons: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NetworkDiagnosticsScreen;
