import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

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
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  bugCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
});

export default SkeletonLoader;