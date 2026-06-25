import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {COLORS} from '../utils/constants';

const {width, height} = Dimensions.get('window');


const Loader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.videoBlock, {opacity}]} />

      <View style={styles.rightRail}>
        {[0, 1, 2].map(i => (
          <Animated.View key={i} style={[styles.railDot, {opacity}]} />
        ))}
      </View>

      <View style={styles.bottomInfo}>
        <Animated.View style={[styles.line, {width: '40%', opacity}]} />
        <Animated.View
          style={[styles.line, {width: '70%', opacity, marginTop: 8}]}
        />
        <Animated.View
          style={[styles.line, {width: '55%', opacity, marginTop: 8}]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-end',
  },
  videoBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: COLORS.shimmer,
  },
  rightRail: {
    position: 'absolute',
    right: 12,
    bottom: 140,
    alignItems: 'center',
  },
  railDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.shimmerHighlight,
    marginBottom: 22,
  },
  bottomInfo: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.shimmerHighlight,
  },
});

export default Loader;
