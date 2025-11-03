import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { soundService } from "../services/soundService";

interface HeaderProps {
  modeColor: string;
  textColor: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  showTasks: boolean;
  isLandscape: boolean;
  onSettingsPress: () => void;
  onToggleTasks: () => void;
  onHelpPress: () => void;
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
  onHelpPress,
}) => {
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;
  const isDesktopWeb = Platform.OS === 'web' && width >= 768;

  const handleSettingsPress = () => {
    soundService.playClick();
    onSettingsPress();
  };

  const handleToggleTasks = () => {
    soundService.playClick();
    onToggleTasks();
  };

  const handleHelpPress = () => {
    soundService.playClick();
    onHelpPress();
  };

  // Calculate responsive top position
  const getButtonTopPosition = () => {
    if (isLandscape) {
      return 32; // Landscape mode
    }
    if (Platform.OS === 'web') {
      return isDesktopWeb ? 30 : 50; // Web desktop/mobile
    }
    return 110; // Native portrait mode
  };

  return (
    <View style={[styles.header, isLandscape && styles.headerLandscape]}>
      <View style={[styles.leftButtons, { top: getButtonTopPosition() }]}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            isLandscape && styles.settingsButtonLandscape,
            {
              backgroundColor: secondaryButtonBg,
              borderColor: secondaryButtonBorder,
            },
          ]}
          onPress={handleSettingsPress}
        >
          <Text style={[styles.icon, { color: textColor }]}>⚙</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            isLandscape && styles.helpButtonLandscape,
            {
              backgroundColor: secondaryButtonBg,
              borderColor: secondaryButtonBorder,
              marginLeft: 10,
            },
          ]}
          onPress={handleHelpPress}
        >
          <Text style={[styles.icon, { color: textColor }]}>?</Text>
        </TouchableOpacity>
      </View>

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
          { top: Platform.OS === 'web' ? (isDesktopWeb ? 52 : 53) : 112 },
          isLandscape && styles.toggleTasksButtonLandscape,
          {
            backgroundColor: secondaryButtonBg,
            borderColor: secondaryButtonBorder,
          },
        ]}
        onPress={handleToggleTasks}
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
    paddingTop: Platform.OS === "web" ? 40 : 100,
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
  leftButtons: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  settingsButtonLandscape: {
    // Position handled by leftButtons container
  },
  helpButtonLandscape: {
    // Position handled by leftButtons container
  },
  icon: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 20,
    marginTop: -2,
    fontWeight: "600",
  },
  toggleTasksButton: {
    position: "absolute",
    right: 20,
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
