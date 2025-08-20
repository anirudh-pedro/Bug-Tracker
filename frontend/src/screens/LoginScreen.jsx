import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '505775401765-43mt53j5jri7f6pqtlq37b99s0ui216d.apps.googleusercontent.com',
});

const {width, height} = Dimensions.get('window');

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(1);
  const floatAnim = new Animated.Value(0);
  
  const slides = [
    {
      title: "Report Bugs",
      subtitle: "Easily report and track bugs in real-time.",
      icon: 'bug_report'
    },
    {
      title: "Team Collaboration", 
      subtitle: "Collaborate with your team to resolve bugs faster.",
      icon: 'group'
    },
    {
      title: "Upload & Attachments",
      subtitle: "Upload screenshots, logs, or documents with ease.",
      icon: 'cloud_upload'
    },
    {
      title: "Quick Access Anywhere",
      subtitle: "Stay updated and fix bugs faster from anywhere.",
      icon: 'dashboard'
    }
  ];

  useEffect(() => {
    // Initial animation - start visible
    fadeAnim.setValue(1);
    slideAnim.setValue(1);

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto slide change - optional, can be disabled for manual only
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      setCurrentSlide(nextSlide);
      // Auto scroll to next slide
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextSlide * width,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const onScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      console.log('User signed in:', userCredential.user.displayName);
      
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        Alert.alert(
          'Account Exists',
          'An account already exists with the same email address but different sign-in credentials.'
        );
      } else if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      } else {
        Alert.alert('Sign-In Error', error.message || 'An error occurred during sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Horizontal Scrollable Slides */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {slides.map((slide, index) => (
              <View key={index} style={styles.slideContainer}>
                {/* Illustration Area */}
                <Animated.View 
                  style={[
                    styles.illustrationContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.mainIllustration}>
                    {index === 0 && (
                      <View style={styles.bugReportContainer}>
                        <View style={styles.magnifyingGlass}>
                          <View style={styles.magnifyingLens}>
                            <Icon name="bug-report" size={60} color="#ff6b6b" />
                          </View>
                          <View style={styles.magnifyingHandle} />
                        </View>
                        <View style={styles.codeSnippets}>
                          <View style={[styles.codeBlock, {top: 20, left: 10}]} />
                          <View style={[styles.codeBlock, {top: 60, right: 15}]} />
                          <View style={[styles.codeBlock, {bottom: 40, left: 20}]} />
                        </View>
                        <Animated.View 
                          style={[
                            styles.floatingShape,
                            styles.shape1,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -10]
                                })
                              }]
                            }
                          ]}
                        />
                        <Animated.View 
                          style={[
                            styles.floatingShape,
                            styles.shape2,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 8]
                                })
                              }]
                            }
                          ]}
                        />
                      </View>
                    )}
                    
                    {index === 1 && (
                      <View style={styles.teamCollabContainer}>
                        {/* Central glowing bug card */}
                        <Animated.View 
                          style={[
                            styles.centralBugCard,
                            styles.glowingBug,
                            {
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.1]
                                })
                              }]
                            }
                          ]}
                        >
                          <Icon name="bug-report" size={50} color="#ff6b6b" />
                        </Animated.View>
                        
                        {/* Developer 1 - Top Left with Chat Animation */}
                        <Animated.View 
                          style={[
                            styles.developer, 
                            styles.dev1,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -5]
                                })
                              }]
                            }
                          ]}
                        >
                          <View style={styles.devAvatar}>
                            <Icon name="person" size={24} color="#ffffff" />
                          </View>
                          <Animated.View 
                            style={[
                              styles.taskIcon,
                              {
                                transform: [{
                                  scale: floatAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [1, 1.2, 1]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="chat-bubble" size={18} color="#4ecdc4" />
                          </Animated.View>
                          <View style={[styles.connectionLine, styles.line1]} />
                          
                          {/* Chat bubbles animation */}
                          <Animated.View 
                            style={[
                              styles.chatBubble,
                              styles.bubble1,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.3, 0.6, 1],
                                  outputRange: [0, 1, 1, 0]
                                }),
                                transform: [{
                                  translateX: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 15]
                                  })
                                }]
                              }
                            ]}
                          />
                          <Animated.View 
                            style={[
                              styles.chatBubble,
                              styles.bubble2,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.4, 0.7, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateX: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 20]
                                  })
                                }]
                              }
                            ]}
                          />
                        </Animated.View>
                        
                        {/* Developer 2 - Top Right with Checklist Animation */}
                        <Animated.View 
                          style={[
                            styles.developer, 
                            styles.dev2,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -3]
                                })
                              }]
                            }
                          ]}
                        >
                          <View style={styles.devAvatar}>
                            <Icon name="person" size={24} color="#ffffff" />
                          </View>
                          <Animated.View 
                            style={[
                              styles.taskIcon,
                              {
                                transform: [{
                                  rotate: floatAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: ['0deg', '10deg', '0deg']
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="checklist" size={18} color="#96ceb4" />
                          </Animated.View>
                          <View style={[styles.connectionLine, styles.line2]} />
                          
                          {/* Checkmark animations */}
                          <Animated.View 
                            style={[
                              styles.checkmark,
                              styles.check1,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.2, 0.4, 0.6],
                                  outputRange: [0, 1, 1, 0]
                                }),
                                transform: [{
                                  scale: floatAnim.interpolate({
                                    inputRange: [0, 0.3, 0.5],
                                    outputRange: [0, 1.2, 1]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="check" size={12} color="#96ceb4" />
                          </Animated.View>
                          <Animated.View 
                            style={[
                              styles.checkmark,
                              styles.check2,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 0.7, 0.9],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  scale: floatAnim.interpolate({
                                    inputRange: [0.5, 0.8, 1],
                                    outputRange: [0, 1.2, 1]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="check" size={12} color="#96ceb4" />
                          </Animated.View>
                        </Animated.View>
                        
                        {/* Developer 3 - Bottom with Fix Animation */}
                        <Animated.View 
                          style={[
                            styles.developer, 
                            styles.dev3,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -4]
                                })
                              }]
                            }
                          ]}
                        >
                          <View style={styles.devAvatar}>
                            <Icon name="person" size={24} color="#ffffff" />
                          </View>
                          <Animated.View 
                            style={[
                              styles.taskIcon,
                              {
                                transform: [{
                                  rotate: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="build" size={18} color="#ffb74d" />
                          </Animated.View>
                          <View style={[styles.connectionLine, styles.line3]} />
                          
                          {/* Sparks/fixes animation */}
                          <Animated.View 
                            style={[
                              styles.spark,
                              styles.spark1,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.3, 0.6, 1],
                                  outputRange: [0, 1, 0, 0]
                                }),
                                transform: [{
                                  translateX: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -10]
                                  })
                                }, {
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8]
                                  })
                                }]
                              }
                            ]}
                          />
                          <Animated.View 
                            style={[
                              styles.spark,
                              styles.spark2,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.4, 0.7, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateX: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 12]
                                  })
                                }, {
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -12]
                                  })
                                }]
                              }
                            ]}
                          />
                        </Animated.View>
                        
                        {/* Enhanced glowing highlights around the bug */}
                        <Animated.View 
                          style={[
                            styles.glowRing1,
                            {
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.4, 0.8]
                              }),
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.15]
                                })
                              }]
                            }
                          ]}
                        />
                        <Animated.View 
                          style={[
                            styles.glowRing2,
                            {
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.2, 0.5]
                              }),
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1.3, 1.5]
                                })
                              }]
                            }
                          ]}
                        />
                      </View>
                    )}
                    
                    {index === 2 && (
                      <View style={styles.uploadContainer}>
                        {/* Enhanced Cloud with pulsing glow */}
                        <Animated.View 
                          style={[
                            styles.cloudIcon,
                            {
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [1, 1.08, 1]
                                })
                              }]
                            }
                          ]}
                        >
                          <Icon name="cloud" size={90} color="#ff6b6b" />
                          
                          {/* Cloud glow effect */}
                          <Animated.View 
                            style={[
                              styles.cloudGlow,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.3, 0.7]
                                })
                              }
                            ]}
                          />
                        </Animated.View>
                        
                        {/* Progress ring around cloud */}
                        <Animated.View 
                          style={[
                            styles.uploadProgress,
                            {
                              transform: [{
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg']
                                })
                              }]
                            }
                          ]}
                        />
                        
                        {/* Multiple floating files with staggered animations */}
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file1,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -80]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -10]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '15deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.1, 0.7, 1],
                                outputRange: [1, 1, 0.6, 0.2]
                              })
                            }
                          ]}
                        >
                          <Icon name="image" size={24} color="#45b7d1" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>JPG</Text>
                          </View>
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file2,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -85]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 5]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '-10deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.2, 0.8, 1],
                                outputRange: [1, 1, 0.5, 0.1]
                              })
                            }
                          ]}
                        >
                          <Icon name="description" size={24} color="#96ceb4" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>PDF</Text>
                          </View>
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file3,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -75]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 15]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '8deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.15, 0.75, 1],
                                outputRange: [1, 1, 0.7, 0.3]
                              })
                            }
                          ]}
                        >
                          <Icon name="video-library" size={24} color="#ffb74d" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>MP4</Text>
                          </View>
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file4,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -90]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -8]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '-12deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.25, 0.85, 1],
                                outputRange: [1, 1, 0.4, 0.1]
                              })
                            }
                          ]}
                        >
                          <Icon name="folder-zip" size={24} color="#ff9999" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>ZIP</Text>
                          </View>
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file5,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -70]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -15]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '20deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.3, 0.9, 1],
                                outputRange: [1, 1, 0.3, 0.05]
                              })
                            }
                          ]}
                        >
                          <Icon name="table-chart" size={24} color="#dda0dd" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>XLS</Text>
                          </View>
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.floatingFile,
                            styles.file6,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -95]
                                })
                              }, {
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 20]
                                })
                              }, {
                                rotate: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '-5deg']
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.35, 0.95, 1],
                                outputRange: [1, 1, 0.2, 0]
                              })
                            }
                          ]}
                        >
                          <Icon name="code" size={24} color="#87ceeb" />
                          <View style={styles.fileTypeLabel}>
                            <Text style={styles.fileTypeText}>JS</Text>
                          </View>
                        </Animated.View>
                        
                        {/* Enhanced Hand with upload gesture */}
                        <Animated.View 
                          style={[
                            styles.handContainer,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [0, -10, 0]
                                })
                              }]
                            }
                          ]}
                        >
                          <Icon name="pan-tool" size={40} color="#4ecdc4" />
                          
                          {/* Upload gesture indicators */}
                          <Animated.View 
                            style={[
                              styles.gestureIndicator,
                              styles.indicator1,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.3, 0.6, 1],
                                  outputRange: [0, 1, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -20]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="keyboard-arrow-up" size={16} color="#4ecdc4" />
                          </Animated.View>
                          <Animated.View 
                            style={[
                              styles.gestureIndicator,
                              styles.indicator2,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.4, 0.7, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -25]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="keyboard-arrow-up" size={16} color="#4ecdc4" />
                          </Animated.View>
                          <Animated.View 
                            style={[
                              styles.gestureIndicator,
                              styles.indicator3,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 0.8, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -30]
                                  })
                                }]
                              }
                            ]}
                          >
                            <Icon name="keyboard-arrow-up" size={16} color="#4ecdc4" />
                          </Animated.View>
                        </Animated.View>
                        
                        {/* Upload status text */}
                        <Animated.View 
                          style={[
                            styles.uploadStatus,
                            {
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 1, 0.8]
                              })
                            }
                          ]}
                        >
                          <Text style={styles.uploadStatusText}>Uploading...</Text>
                          <View style={styles.uploadProgressContainer}>
                            <Animated.View 
                              style={[
                                styles.uploadProgressBar,
                                {
                                  transform: [{
                                    scaleX: floatAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0, 1]
                                    })
                                  }]
                                }
                              ]}
                            />
                          </View>
                        </Animated.View>
                      </View>
                    )}
                    
                    {index === 3 && (
                      <View style={styles.dashboardContainer}>
                        {/* Central mobile device with bug tracker */}
                        <Animated.View 
                          style={[
                            styles.centralDevice,
                            {
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [1, 1.05, 1]
                                })
                              }]
                            }
                          ]}
                        >
                          <View style={styles.deviceScreen}>
                            <Icon name="smartphone" size={60} color="#4ecdc4" />
                            <Animated.View 
                              style={[
                                styles.bugIcon,
                                {
                                  transform: [{
                                    scale: floatAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [1, 1.2]
                                    })
                                  }]
                                }
                              ]}
                            >
                              <Icon name="bug-report" size={24} color="#ff6b6b" />
                            </Animated.View>
                          </View>
                          
                          {/* Device glow effect */}
                          <Animated.View 
                            style={[
                              styles.deviceGlow,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.3, 0.7]
                                })
                              }
                            ]}
                          />
                        </Animated.View>
                        
                        {/* Quick access points radiating outward */}
                        <Animated.View 
                          style={[
                            styles.accessPoint,
                            styles.point1,
                            {
                              transform: [{
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -40]
                                })
                              }, {
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -40]
                                })
                              }, {
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.3, 1],
                                  outputRange: [0, 1, 1]
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.2, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Icon name="laptop" size={20} color="#96ceb4" />
                          <View style={styles.accessLine1} />
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.accessPoint,
                            styles.point2,
                            {
                              transform: [{
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 50]
                                })
                              }, {
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -30]
                                })
                              }, {
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.4, 1],
                                  outputRange: [0, 1, 1]
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.3, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Icon name="tablet" size={20} color="#ffb74d" />
                          <View style={styles.accessLine2} />
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.accessPoint,
                            styles.point3,
                            {
                              transform: [{
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 30]
                                })
                              }, {
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 45]
                                })
                              }, {
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: [0, 1, 1]
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.4, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Icon name="desktop-windows" size={20} color="#87ceeb" />
                          <View style={styles.accessLine3} />
                        </Animated.View>
                        
                        <Animated.View 
                          style={[
                            styles.accessPoint,
                            styles.point4,
                            {
                              transform: [{
                                translateX: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -50]
                                })
                              }, {
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 30]
                                })
                              }, {
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.6, 1],
                                  outputRange: [0, 1, 1]
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Icon name="watch" size={20} color="#ff9999" />
                          <View style={styles.accessLine4} />
                        </Animated.View>
                        
                        {/* Cloud connectivity indicator */}
                        <Animated.View 
                          style={[
                            styles.cloudConnectivity,
                            {
                              transform: [{
                                translateY: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -70]
                                })
                              }, {
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 0.7, 1],
                                  outputRange: [0, 1, 1]
                                })
                              }],
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.6, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Icon name="cloud-sync" size={24} color="#dda0dd" />
                          
                          {/* Sync indicators */}
                          <Animated.View 
                            style={[
                              styles.syncIndicator,
                              styles.sync1,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.3, 0.6, 1],
                                  outputRange: [0, 1, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 15]
                                  })
                                }]
                              }
                            ]}
                          />
                          <Animated.View 
                            style={[
                              styles.syncIndicator,
                              styles.sync2,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.4, 0.7, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 20]
                                  })
                                }]
                              }
                            ]}
                          />
                          <Animated.View 
                            style={[
                              styles.syncIndicator,
                              styles.sync3,
                              {
                                opacity: floatAnim.interpolate({
                                  inputRange: [0, 0.5, 0.8, 1],
                                  outputRange: [0, 0, 1, 0]
                                }),
                                transform: [{
                                  translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 25]
                                  })
                                }]
                              }
                            ]}
                          />
                        </Animated.View>
                        
                        {/* WiFi signal waves */}
                        <Animated.View 
                          style={[
                            styles.wifiWaves,
                            {
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.4, 0.8]
                              }),
                              transform: [{
                                scale: floatAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.1]
                                })
                              }]
                            }
                          ]}
                        >
                          <View style={[styles.wifiRing, styles.ring1]} />
                          <View style={[styles.wifiRing, styles.ring2]} />
                          <View style={[styles.wifiRing, styles.ring3]} />
                        </Animated.View>
                        
                        {/* Access anywhere text */}
                        <Animated.View 
                          style={[
                            styles.accessText,
                            {
                              opacity: floatAnim.interpolate({
                                inputRange: [0, 0.8, 1],
                                outputRange: [0, 1, 1]
                              })
                            }
                          ]}
                        >
                          <Text style={styles.accessTextLabel}>Access Anywhere</Text>
                        </Animated.View>
                      </View>
                    )}
                  </View>
                </Animated.View>

                {/* Text Content */}
                <Animated.View 
                  style={[
                    styles.textContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                </Animated.View>
              </View>
            ))}
          </ScrollView>

          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.indicator,
                  currentSlide === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={signInWithGoogle}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#666666" />
              ) : (
                <>
                  <AntDesign name="google" size={20} color="#f46042ff" />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  slideContainer: {
    width: width,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginTop: 40,
  },
  mainIllustration: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Screen 1: Bug Report with Magnifying Glass
  bugReportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 200,
    height: 200,
  },
  magnifyingGlass: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  magnifyingLens: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#333333',
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  magnifyingHandle: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 40,
    height: 8,
    backgroundColor: '#666666',
    borderRadius: 4,
    transform: [{rotate: '45deg'}],
  },
  codeSnippets: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  codeBlock: {
    position: 'absolute',
    width: 30,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  floatingShape: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#ff6b6b',
    opacity: 0.3,
  },
  shape1: {
    top: 30,
    right: 20,
    borderRadius: 10,
  },
  shape2: {
    bottom: 50,
    left: 10,
    borderRadius: 4,
  },
  
  // Screen 2: Team Collaboration Styles
  teamCollabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 300,
    height: 300,
  },
  centralBugCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#1a1a1a',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ff6b6b',
    elevation: 8,
    zIndex: 10,
  },
  glowingBug: {
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  developer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  devAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#333333',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#4ecdc4',
    elevation: 4,
  },
  taskIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#222222',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#555555',
  },
  dev1: {
    top: 40,
    left: 30,
  },
  dev2: {
    top: 40,
    right: 30,
  },
  dev3: {
    bottom: 60,
    left: '50%',
    marginLeft: -25,
  },
  connectionLine: {
    position: 'absolute',
    backgroundColor: '#4ecdc4',
    opacity: 0.6,
    height: 2,
    borderRadius: 1,
  },
  line1: {
    width: 80,
    top: 30,
    left: 45,
    transform: [{ rotate: '25deg' }],
  },
  line2: {
    width: 80,
    top: 30,
    right: 45,
    transform: [{ rotate: '-25deg' }],
  },
  line3: {
    width: 60,
    top: -20,
    left: 25,
    transform: [{ rotate: '90deg' }],
  },
  // Chat bubble animations
  chatBubble: {
    position: 'absolute',
    width: 16,
    height: 12,
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    elevation: 2,
  },
  bubble1: {
    top: -25,
    left: 60,
  },
  bubble2: {
    top: -35,
    left: 70,
    width: 12,
    height: 10,
  },
  // Checkmark animations
  checkmark: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#222222',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#96ceb4',
    elevation: 3,
  },
  check1: {
    top: -30,
    right: 55,
  },
  check2: {
    top: -45,
    right: 70,
  },
  // Spark/fix animations
  spark: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#ffb74d',
    borderRadius: 4,
    elevation: 2,
  },
  spark1: {
    top: -20,
    left: 60,
  },
  spark2: {
    top: -25,
    left: 45,
  },
  // Enhanced glow rings
  glowRing1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    opacity: 0.6,
  },
  glowRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    opacity: 0.3,
  },
  
  // Screen 3: Upload & Attachments Styles
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 300,
    height: 300,
  },
  cloudIcon: {
    position: 'absolute',
    top: 20,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudGlow: {
    position: 'absolute',
    width: 120,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    opacity: 0.2,
    top: 5,
    left: -15,
  },
  uploadProgress: {
    position: 'absolute',
    top: 15,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4ecdc4',
    borderStyle: 'dashed',
    zIndex: 4,
  },
  floatingFile: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fileTypeLabel: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#222222',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#444444',
  },
  fileTypeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  file1: {
    bottom: 120,
    left: 60,
  },
  file2: {
    bottom: 130,
    left: 100,
  },
  file3: {
    bottom: 125,
    right: 80,
  },
  file4: {
    bottom: 140,
    right: 110,
  },
  file5: {
    bottom: 135,
    left: 120,
  },
  file6: {
    bottom: 115,
    right: 60,
  },
  handContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureIndicator: {
    position: 'absolute',
    bottom: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator1: {
    left: -10,
  },
  indicator2: {
    left: 0,
  },
  indicator3: {
    left: 10,
  },
  uploadStatus: {
    position: 'absolute',
    bottom: -10,
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#444444',
  },
  uploadStatusText: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  uploadProgressContainer: {
    width: 80,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: '#4ecdc4',
    borderRadius: 2,
    width: '100%',
    transformOrigin: 'left',
  },
  
  // Screen 4: Dashboard/Quick Access Styles
  dashboardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 300,
    height: 300,
  },
  centralDevice: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deviceScreen: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#4ecdc4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    position: 'relative',
  },
  bugIcon: {
    position: 'absolute',
    top: 15,
    backgroundColor: '#222222',
    borderRadius: 15,
    padding: 3,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  deviceGlow: {
    position: 'absolute',
    width: 100,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  accessPoint: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#555555',
    elevation: 5,
    zIndex: 5,
  },
  point1: {
    top: 60,
    left: 60,
  },
  point2: {
    top: 80,
    right: 40,
  },
  point3: {
    bottom: 80,
    right: 80,
  },
  point4: {
    bottom: 60,
    left: 40,
  },
  accessLine1: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: '#96ceb4',
    opacity: 0.6,
    bottom: -35,
    right: -35,
    transform: [{ rotate: '45deg' }],
  },
  accessLine2: {
    position: 'absolute',
    width: 70,
    height: 2,
    backgroundColor: '#ffb74d',
    opacity: 0.6,
    bottom: -40,
    left: -40,
    transform: [{ rotate: '-30deg' }],
  },
  accessLine3: {
    position: 'absolute',
    width: 65,
    height: 2,
    backgroundColor: '#87ceeb',
    opacity: 0.6,
    top: -40,
    left: -35,
    transform: [{ rotate: '-45deg' }],
  },
  accessLine4: {
    position: 'absolute',
    width: 75,
    height: 2,
    backgroundColor: '#ff9999',
    opacity: 0.6,
    top: -35,
    right: -40,
    transform: [{ rotate: '30deg' }],
  },
  cloudConnectivity: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#dda0dd',
    elevation: 6,
  },
  syncIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#dda0dd',
    borderRadius: 3,
  },
  sync1: {
    top: 35,
    left: -5,
  },
  sync2: {
    top: 40,
    left: 0,
  },
  sync3: {
    top: 45,
    left: 5,
  },
  wifiWaves: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  wifiRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    borderRadius: 100,
    opacity: 0.4,
  },
  ring1: {
    width: 160,
    height: 160,
  },
  ring2: {
    width: 200,
    height: 200,
  },
  ring3: {
    width: 240,
    height: 240,
  },
  accessText: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#444444',
  },
  accessTextLabel: {
    color: '#4ecdc4',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Text Styles
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Indicators
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ff6b6b',
    width: 24,
  },
  
  // Button Styles
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  googleButton: {
    backgroundColor: '#111111',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 12,
    minWidth: 280,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
