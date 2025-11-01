import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TimerCircleProps {
  progress: number;
  mode: 'focus' | 'break';
}

const CIRCLE_SIZE = 280;

export const TimerCircle: React.FC<TimerCircleProps> = ({ progress, mode }) => {
  const focusColor = '#8AB4D5';
  const breakColor = '#C8A68A';
  const activeColor = mode === 'focus' ? focusColor : breakColor;

  return (
    <View style={styles.container}>
      {/* Outer shadow */}
      <View style={styles.shadowCircle} />

      {/* Main circle */}
      <View style={styles.circle}>
        {/* Progress indicator - simple version */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                height: `${progress * 100}%`,
                backgroundColor: activeColor,
              },
            ]}
          />
        </View>

        {/* Center white circle */}
        <View style={styles.centerCircle} />

        {/* Top indicator dot */}
        <View style={styles.indicatorDot} />
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
  shadowCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE + 10,
    height: CIRCLE_SIZE + 10,
    borderRadius: (CIRCLE_SIZE + 10) / 2,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#F0F0F0',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  progressBar: {
    width: '100%',
    opacity: 0.6,
  },
  centerCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorDot: {
    position: 'absolute',
    top: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
  },
});
