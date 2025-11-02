import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { Mode } from '../types';
import { formatTime } from '../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerProps {
  timeLeft: number;
  mode: Mode;
  textColor: string;
  modeColor: string;
  ringBackgroundColor: string;
  progressAnim: Animated.Value;
  currentTrack: string | null;
  isPlaying: boolean;
  isSpotifyConnected: boolean;
  isLandscape: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  timeLeft,
  mode,
  textColor,
  modeColor,
  ringBackgroundColor,
  progressAnim,
  currentTrack,
  isPlaying,
  isSpotifyConnected,
  isLandscape,
}) => {
  const size = 260;
  const strokeWidth = 50;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.timerContainer, isLandscape && styles.timerContainerLandscape]}>
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[styles.circleContainer, { transform: [{ scale: 1 }], width: size, height: size }]}>
          <Svg width={size} height={size} style={styles.svg}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ringBackgroundColor}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={modeColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={animatedStrokeDashoffset}
                strokeLinecap="butt"
              />
            </G>
          </Svg>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.timerText, { color: textColor }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={[styles.modeLabel, { color: modeColor }]}>
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </Text>
          </View>
        </Animated.View>
        {currentTrack && isSpotifyConnected && (
          <View style={styles.nowPlayingContainer}>
            <Svg width="16" height="16" viewBox="0 0 24 24" style={styles.musicIcon}>
              <Path
                fill={textColor}
                d="M21.65 2.24a1 1 0 0 0-.8-.23l-13 2A1 1 0 0 0 7 5v10.35A3.45 3.45 0 0 0 5.5 15A3.5 3.5 0 1 0 9 18.5v-7.64l11-1.69v4.18a3.45 3.45 0 0 0-1.5-.35a3.5 3.5 0 1 0 3.5 3.5V3a1 1 0 0 0-.35-.76ZM5.5 20A1.5 1.5 0 1 1 7 18.5A1.5 1.5 0 0 1 5.5 20Zm13-2a1.5 1.5 0 1 1 1.5-1.5a1.5 1.5 0 0 1-1.5 1.5ZM20 7.14L9 8.83v-3l11-1.66Z"
              />
            </Svg>
            <Text style={[styles.currentlyPlaying, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {currentTrack}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerContainerLandscape: {
    flex: 0.6,
    paddingTop: 20,
    paddingBottom: 20,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timerText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 2,
  },
  nowPlayingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  musicIcon: {
    marginRight: 8,
    flexShrink: 0,
  },
  currentlyPlaying: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
    flexShrink: 1,
  },
});
