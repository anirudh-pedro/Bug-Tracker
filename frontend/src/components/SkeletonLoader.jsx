import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '../theme/colors';

const SkeletonLoader = ({ style, children }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeleton, style, { opacity }]}>
      {children}
    </Animated.View>
  );
};

export const BugCardSkeleton = () => (
  <View style={styles.bugCardSkeleton}>
    <SkeletonLoader style={styles.titleSkeleton} />
    <SkeletonLoader style={styles.descriptionSkeleton} />
    <View style={styles.metaRow}>
      <SkeletonLoader style={styles.prioritySkeleton} />
      <SkeletonLoader style={styles.statusSkeleton} />
    </View>
    <SkeletonLoader style={styles.dateSkeleton} />
  </View>
);

export const BugListSkeleton = ({ count = 5 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <BugCardSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border.medium,
    borderRadius: 4,
  },
  bugCardSkeleton: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  titleSkeleton: {
    height: 20,
    marginBottom: 8,
    width: '80%',
  },
  descriptionSkeleton: {
    height: 16,
    marginBottom: 12,
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  prioritySkeleton: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
  statusSkeleton: {
    height: 24,
    width: 80,
    borderRadius: 12,
  },
  dateSkeleton: {
    height: 14,
    width: 100,
  },
  listContainer: {
    paddingTop: 8,
    backgroundColor: Colors.background.primary,
  },
});

export default SkeletonLoader;