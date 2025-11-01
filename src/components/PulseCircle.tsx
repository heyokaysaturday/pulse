import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

interface PulseCircleProps {
  isActive: boolean;
  progress: number;
  mode: 'focus' | 'break';
}

const CIRCLE_SIZE = 280;

export const PulseCircle: React.FC<PulseCircleProps> = ({ isActive, progress, mode }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      // Create pulsing animation loop
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset to default state
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, scaleAnim, opacityAnim]);

  const focusColor = '#4A90E2'; // Deep blue
  const breakColor = '#F5A623'; // Warm orange
  const activeColor = mode === 'focus' ? focusColor : breakColor;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: activeColor,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={[styles.circle, { borderColor: activeColor }]}>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressFill,
              {
                height: `${progress * 100}%`,
                backgroundColor: activeColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  circle: {
    width: CIRCLE_SIZE - 40,
    height: CIRCLE_SIZE - 40,
    borderRadius: (CIRCLE_SIZE - 40) / 2,
    borderWidth: 4,
    backgroundColor: '#1a2332',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    opacity: 0.2,
  },
});
