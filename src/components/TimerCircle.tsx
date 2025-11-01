import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface TimerCircleProps {
  progress: number;
  mode: 'focus' | 'break';
}

const CIRCLE_SIZE = 320;

export const TimerCircle: React.FC<TimerCircleProps> = ({ progress, mode }) => {
  const focusColor = '#8AB4D5'; // Soft blue from timer
  const breakColor = '#C8A68A'; // Soft tan/beige for break
  const activeColor = mode === 'focus' ? focusColor : breakColor;

  const center = CIRCLE_SIZE / 2;
  const radius = 130;

  // Calculate the path for the circular progress (pie chart style)
  const angle = progress * 360;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = center + radius * Math.cos(radians);
  const y = center + radius * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;

  const pathData = angle > 0
    ? `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`
    : '';

  return (
    <View style={styles.container}>
      {/* Outer shadow circle */}
      <View style={styles.shadowCircle} />

      {/* Main timer circle */}
      <View style={styles.timerCircle}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
          {/* Background circle (light gray) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="#F0F0F0"
          />

          {/* Progress fill (pie chart) */}
          {progress > 0 && (
            <Path
              d={pathData}
              fill={activeColor}
            />
          )}

          {/* Center white circle */}
          <Circle
            cx={center}
            cy={center}
            r={70}
            fill="#FFFFFF"
          />

          {/* Small top indicator dot */}
          <Circle
            cx={center}
            cy={20}
            r={5}
            fill="#666666"
          />
        </Svg>
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  timerCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  svg: {
    position: 'absolute',
  },
});
