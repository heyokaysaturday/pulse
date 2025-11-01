import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ControlsProps {
  isActive: boolean;
  modeColor: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  onStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isActive,
  modeColor,
  secondaryButtonBg,
  secondaryButtonBorder,
  secondaryButtonText,
  onStartPause,
  onReset,
  onSkip,
}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: modeColor }]}
        onPress={onStartPause}
      >
        <Text style={styles.primaryButtonText}>
          {isActive ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>

      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: secondaryButtonBg, borderColor: secondaryButtonBorder },
          ]}
          onPress={onReset}
        >
          <Text style={[styles.secondaryButtonText, { color: secondaryButtonText }]}>
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: secondaryButtonBg, borderColor: secondaryButtonBorder },
          ]}
          onPress={onSkip}
        >
          <Text style={[styles.secondaryButtonText, { color: secondaryButtonText }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
