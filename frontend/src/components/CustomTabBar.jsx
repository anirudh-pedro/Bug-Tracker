import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const CustomTabBar = ({state, descriptors, navigation}) => {
  const insets = useSafeAreaInsets();

  const getTabIcon = (routeName) => {
    switch (routeName) {
      case 'Home': return 'home';
      case 'Bugs': return 'bug-report';
      case 'Projects': return 'folder';
      case 'Profile': return 'person';
      default: return 'help';
    }
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Home': return '🏠 Home';
      case 'Bugs': return '🐞 Bugs';
      case 'Projects': return '📂 Projects';
      case 'Profile': return '👤 Profile';
      default: return routeName;
    }
  };

  const getBadgeCount = (routeName) => {
    switch (routeName) {
      case 'Bugs': return 3; // Example: 3 new bugs
      default: return null;
    }
  };

  return (
    <View style={[styles.tabBar, {paddingBottom: insets.bottom + 10}]}>
      <LinearGradient
        colors={['#1a1a1a', '#0f0f0f']}
        style={styles.gradient}>
        <View style={styles.tabContainer}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;
            const badgeCount = getBadgeCount(route.name);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabItem,
                  isFocused && styles.tabItemActive,
                ]}
                activeOpacity={0.8}>
                
                {/* Active Background Indicator */}
                {isFocused && (
                  <View style={styles.activeIndicator}>
                    <LinearGradient
                      colors={['#667eea40', '#764ba240']}
                      style={styles.activeIndicatorGradient}
                    />
                  </View>
                )}

                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <Icon
                    name={getTabIcon(route.name)}
                    size={isFocused ? 26 : 22}
                    color={isFocused ? '#667eea' : '#888888'}
                    style={[
                      styles.tabIcon,
                      isFocused && styles.tabIconActive,
                    ]}
                  />
                  
                  {/* Badge */}
                  {badgeCount && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}>
                  {getTabLabel(route.name)}
                </Text>

                {/* Active Dot Indicator */}
                {isFocused && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gradient: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    marginHorizontal: 2,
    position: 'relative',
    minHeight: 60,
  },
  tabItemActive: {
    transform: [{scale: 1.05}],
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeIndicatorGradient: {
    flex: 1,
    borderRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    textAlign: 'center',
  },
  tabIconActive: {
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#667eea',
    fontWeight: '700',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  tabLabelInactive: {
    color: '#888888',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default CustomTabBar;
