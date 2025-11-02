import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface HeaderProps {
  modeColor: string;
  textColor: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  showTasks: boolean;
  isLandscape: boolean;
  onSettingsPress: () => void;
  onToggleTasks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modeColor,
  textColor,
  secondaryButtonBg,
  secondaryButtonBorder,
  showTasks,
  isLandscape,
  onSettingsPress,
  onToggleTasks,
}) => {
  return (
    <View style={[styles.header, isLandscape && styles.headerLandscape]}>
      <TouchableOpacity
        style={[
          styles.settingsButton,
          isLandscape && styles.settingsButtonLandscape,
          {
            backgroundColor: secondaryButtonBg,
            borderColor: secondaryButtonBorder,
          },
        ]}
        onPress={onSettingsPress}
      >
        <Text style={[styles.settingsIcon, { color: textColor }]}>⚙</Text>
      </TouchableOpacity>

      <Svg width="60" height="60" viewBox="0 0 200 200" fill="none">
        {/* Outer circle */}
        <Circle
          cx="100"
          cy="100"
          r="85"
          stroke={modeColor}
          strokeWidth="12"
          fill="none"
        />
        {/* Inner circle */}
        <Circle
          cx="100"
          cy="100"
          r="65"
          stroke={modeColor}
          strokeWidth="12"
          fill="none"
        />
        {/* Pulse/heartbeat waveform */}
        <Path
          d="M 35,100 L 60,100 L 75,65 L 85,135 L 95,100 L 165,100"
          stroke={modeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>

      <TouchableOpacity
        style={[
          styles.toggleTasksButton,
          isLandscape && styles.toggleTasksButtonLandscape,
          {
            backgroundColor: secondaryButtonBg,
            borderColor: secondaryButtonBorder,
          },
        ]}
        onPress={onToggleTasks}
      >
        <Text style={[styles.toggleTasksButtonText, { color: textColor }]}>
          {showTasks ? "Hide Tasks" : "Show Tasks"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 20,
    position: "relative",
  },
  headerLandscape: {
    paddingTop: 20,
    paddingBottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  settingsButton: {
    position: "absolute",
    left: 20,
    top: 110,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  settingsButtonLandscape: {
    top: 32,
    left: 80,
  },
  settingsIcon: {
    fontSize: 20,
  },
  toggleTasksButton: {
    position: "absolute",
    right: 20,
    top: 112,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  toggleTasksButtonLandscape: {
    top: 34,
    right: 80,
  },
  toggleTasksButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
