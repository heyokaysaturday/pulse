import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { soundService } from "../services/soundService";

interface ControlsProps {
  isActive: boolean;
  modeColor: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  isLandscape: boolean;
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
  isLandscape,
  onStartPause,
  onReset,
  onSkip,
}) => {
  const handleStartPause = () => {
    soundService.playClick();
    onStartPause();
  };

  const handleReset = () => {
    soundService.playClick();
    onReset();
  };

  const handleSkip = () => {
    soundService.playClick();
    onSkip();
  };

  return (
    <View style={[styles.controls, isLandscape && styles.controlsLandscape]}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          { backgroundColor: modeColor },
        ]}
        onPress={handleStartPause}
      >
        <Text style={styles.primaryButtonText}>
          {isActive ? "Pause" : "Start"}
        </Text>
      </TouchableOpacity>

      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: secondaryButtonBg,
              borderColor: secondaryButtonBorder,
            },
          ]}
          onPress={handleReset}
        >
          <Text
            style={[styles.secondaryButtonText, { color: secondaryButtonText }]}
          >
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: secondaryButtonBg,
              borderColor: secondaryButtonBorder,
            },
          ]}
          onPress={handleSkip}
        >
          <Text
            style={[styles.secondaryButtonText, { color: secondaryButtonText }]}
          >
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
    gap: 20,
  },
  controlsLandscape: {
    flex: 0.4,
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
