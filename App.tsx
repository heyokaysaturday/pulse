import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Easing,
  useWindowDimensions,
  useColorScheme,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import {
  useFonts,
  Caveat_400Regular,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";
import { useSpotifyAuth } from "./src/hooks/useSpotifyAuth";
import { spotifyApi } from "./src/services/spotifyApi";
import { soundService } from "./src/services/soundService";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function App() {
  const [fontsLoaded] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
    LCD: require('./assets/fonts/LCD.ttf'),
  });

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Spotify integration
  const {
    connect: connectSpotify,
    disconnect: disconnectSpotify,
    isConnected: isSpotifyConnected,
  } = useSpotifyAuth();

  // Load sounds on mount
  useEffect(() => {
    soundService.loadSounds();
    return () => {
      soundService.unloadSounds();
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [customFocus, setCustomFocus] = useState("");
  const [customBreak, setCustomBreak] = useState("");
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const FOCUS_TIME = focusDuration * 60;
  const BREAK_TIME = breakDuration * 60;

  // Update timeLeft when durations change and timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
    }
  }, [focusDuration, breakDuration, mode, isActive, FOCUS_TIME, BREAK_TIME]);

  // Handle Spotify playback when manually starting/resuming
  useEffect(() => {
    if (!isSpotifyConnected || !isActive) return;

    const handleMusicPlayback = async () => {
      if (mode === "focus") {
        // Manually started/resumed focus mode - fade in music
        await spotifyApi.playAndFadeIn(1000);
      }
      // Note: Manual break mode doesn't auto-start, handled by timer completion
    };

    handleMusicPlayback();
  }, [isActive, isSpotifyConnected]); // Only trigger on isActive change, not mode

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            soundService.playDing();

            const newMode = mode === "focus" ? "break" : "focus";

            // Handle Spotify fade based on what mode we're ENTERING
            if (isSpotifyConnected) {
              if (newMode === "break") {
                // Entering break - fade out music
                spotifyApi.fadeOutAndPause(2000);
              } else {
                // Entering focus - fade in music
                spotifyApi.playAndFadeIn(1000);
              }
            }

            // Keep timer active (don't setIsActive(false)) and switch to new mode
            setMode(newMode);
            return newMode === "focus" ? FOCUS_TIME : BREAK_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, mode]);

  // Poll for currently playing track
  useEffect(() => {
    if (!isSpotifyConnected) {
      setCurrentTrack(null);
      return;
    }

    const fetchCurrentTrack = async () => {
      try {
        const playing = await spotifyApi.getCurrentlyPlaying();
        if (playing?.item) {
          const artists = playing.item.artists.map(a => a.name).join(', ');
          setCurrentTrack(`${playing.item.name} - ${artists}`);
        } else {
          setCurrentTrack(null);
        }
      } catch (error) {
        console.log('Could not fetch current track:', error);
      }
    };

    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isSpotifyConnected]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const handleSkip = () => {
    setIsActive(false);
    const newMode = mode === "focus" ? "break" : "focus";
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          text: newTaskText.trim(),
          completed: false,
        },
      ]);
      setNewTaskText("");
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    console.log('Toggle task:', { id, completed: task?.completed });
    if (task && !task.completed) {
      // Play sound only when completing (not uncompleting)
      console.log('Playing check sound for task completion');
      soundService.playCheck();
    }
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const applyPreset = (focusMin: number, breakMin: number) => {
    setFocusDuration(focusMin);
    setBreakDuration(breakMin);
    setCustomFocus("");
    setCustomBreak("");
    // Reset and stop timer
    setIsActive(false);
    setMode("focus");
    setTimeLeft(focusMin * 60);
  };

  const applyCustomTimer = () => {
    const focus = parseInt(customFocus);
    const breakTime = parseInt(customBreak);
    if (!isNaN(focus) && focus > 0 && !isNaN(breakTime) && breakTime > 0) {
      setFocusDuration(focus);
      setBreakDuration(breakTime);
      // Reset and stop timer
      setIsActive(false);
      setMode("focus");
      setTimeLeft(focus * 60);
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
    setCustomFocus("");
    setCustomBreak("");
  };

  // Generate wavy path for strikethrough based on width
  const generateWavyPath = (width: number) => {
    const y = 12; // Vertical center position
    const amplitude = 2; // Wave height
    const frequency = 10; // Distance between wave peaks
    let path = `M 0,${y}`;

    for (let x = frequency; x <= width; x += frequency) {
      const y1 = y + amplitude;
      const y2 = y;
      path += ` Q ${x - frequency/2},${y1} ${x},${y2}`;
    }

    return path;
  };

  const progress = 1 - timeLeft / (mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  const modeColor = mode === "focus" ? "#8AB4D5" : "#C8A68A";

  // Theme colors
  const backgroundColor = isDark ? "#1A1A1A" : "#F5F5F5";
  const circleColor = isDark ? "#2A2A2A" : "#FFFFFF";
  const shadowColor = isDark ? "#000000" : "#E0E0E0";
  const textColor = isDark ? "#E5E5E5" : "#333333";
  const modeTextColor = isDark ? "#999999" : "#666666";
  const ringBackgroundColor = isDark ? "#3A3A3A" : "#E8E8E8";
  const secondaryButtonBg = isDark ? "#2A2A2A" : "#FFFFFF";
  const secondaryButtonBorder = isDark ? "#3A3A3A" : "#E0E0E0";
  const secondaryButtonText = isDark ? "#999999" : "#666666";
  const taskPanelBg = isDark ? "#2A2A2A" : "#FFFFFF";
  const inputBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const inputBorder = isDark ? "#3A3A3A" : "#E0E0E0";
  const taskBorder = isDark ? "#3A3A3A" : "#E8E8E8";

  // Animate progress smoothly
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  const size = 280;
  const strokeWidth = 60;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => showTasks && setShowTasks(false)}>
        <View
          style={[
            styles.container,
            { backgroundColor },
            isLandscape && styles.containerLandscape,
          ]}
        >
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <View style={[styles.header, isLandscape && styles.headerLandscape]}>
          <TouchableOpacity
            style={[
              styles.settingsButton,
              {
                backgroundColor: secondaryButtonBg,
                borderColor: secondaryButtonBorder,
              },
            ]}
            onPress={() => {
              setShowSettings(true);
              setShowTasks(false);
            }}
          >
            <Text style={[styles.settingsIcon, { color: textColor }]}>⚙</Text>
          </TouchableOpacity>

          <Svg width="60" height="60" viewBox="0 0 200 200" fill="none">
            {/* Outer circle */}
            <Circle cx="100" cy="100" r="85" stroke={modeColor} strokeWidth="12" fill="none"/>
            {/* Inner circle */}
            <Circle cx="100" cy="100" r="65" stroke={modeColor} strokeWidth="12" fill="none"/>
            {/* Pulse/heartbeat waveform */}
            <Path d="M 35,100 L 60,100 L 75,65 L 85,135 L 95,100 L 165,100"
                  stroke={modeColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"/>
          </Svg>

          <TouchableOpacity
            style={[
              styles.toggleTasksButton,
              {
                backgroundColor: secondaryButtonBg,
                borderColor: secondaryButtonBorder,
              },
            ]}
            onPress={() => setShowTasks(!showTasks)}
          >
            <Text style={[styles.toggleTasksButtonText, { color: textColor }]}>
              {showTasks ? "Hide Tasks" : "Show Tasks"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.timerContainer,
            isLandscape && styles.timerContainerLandscape,
          ]}
        >
          <Animated.View
            style={[
              styles.circleContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View
              style={[styles.shadowCircle, { backgroundColor: shadowColor }]}
            />
            <View style={[styles.circle, { backgroundColor: circleColor }]}>
              {/* SVG Circular Progress */}
              <Svg width={size} height={size} style={styles.svg}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                  {/* Background circle */}
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={ringBackgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress circle */}
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
            </View>
          </Animated.View>
          {currentTrack && isSpotifyConnected && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, alignSelf: 'center', maxWidth: '80%' }}>
              <Svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 8, flexShrink: 0 }}>
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
        <View style={styles.controls}>
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
                style={[
                  styles.secondaryButtonText,
                  { color: secondaryButtonText },
                ]}
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
                style={[
                  styles.secondaryButtonText,
                  { color: secondaryButtonText },
                ]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Modal */}
        {showSettings && (
          <View style={styles.modalOverlay}>
            <View
              style={[styles.settingsModal, { backgroundColor: taskPanelBg }]}
            >
              <View style={styles.settingsHeader}>
                <Text style={[styles.settingsTitle, { color: textColor }]}>
                  Timer Settings
                </Text>
                <TouchableOpacity onPress={closeSettings}>
                  <Text
                    style={[styles.closeButton, { color: secondaryButtonText }]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: modeTextColor }]}>
                Presets
              </Text>

              <View style={styles.presetButtons}>
                <TouchableOpacity
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: secondaryButtonBg,
                      borderColor: secondaryButtonBorder,
                    },
                    focusDuration === 25 &&
                      breakDuration === 5 && {
                        borderColor: modeColor,
                        borderWidth: 2,
                      },
                  ]}
                  onPress={() => applyPreset(25, 5)}
                >
                  <Text style={[styles.presetButtonText, { color: textColor }]}>
                    Classic
                  </Text>
                  <Text
                    style={[styles.presetSubtext, { color: modeTextColor }]}
                  >
                    25 / 5 min
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: secondaryButtonBg,
                      borderColor: secondaryButtonBorder,
                    },
                    focusDuration === 50 &&
                      breakDuration === 10 && {
                        borderColor: modeColor,
                        borderWidth: 2,
                      },
                  ]}
                  onPress={() => applyPreset(50, 10)}
                >
                  <Text style={[styles.presetButtonText, { color: textColor }]}>
                    Extended
                  </Text>
                  <Text
                    style={[styles.presetSubtext, { color: modeTextColor }]}
                  >
                    50 / 10 min
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: secondaryButtonBg,
                      borderColor: secondaryButtonBorder,
                    },
                    focusDuration === 15 &&
                      breakDuration === 3 && {
                        borderColor: modeColor,
                        borderWidth: 2,
                      },
                  ]}
                  onPress={() => applyPreset(15, 3)}
                >
                  <Text style={[styles.presetButtonText, { color: textColor }]}>
                    Short
                  </Text>
                  <Text
                    style={[styles.presetSubtext, { color: modeTextColor }]}
                  >
                    15 / 3 min
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  { color: modeTextColor, marginTop: 24 },
                ]}
              >
                Custom Timer
              </Text>

              <View style={styles.customInputRow}>
                <View style={styles.customInputGroup}>
                  <Text style={[styles.inputLabel, { color: modeTextColor }]}>
                    Focus (min)
                  </Text>
                  <TextInput
                    style={[
                      styles.customInput,
                      {
                        backgroundColor: inputBg,
                        color: textColor,
                        borderColor: inputBorder,
                      },
                    ]}
                    placeholder={focusDuration.toString()}
                    placeholderTextColor={modeTextColor}
                    value={customFocus}
                    onChangeText={setCustomFocus}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.customInputGroup}>
                  <Text style={[styles.inputLabel, { color: modeTextColor }]}>
                    Break (min)
                  </Text>
                  <TextInput
                    style={[
                      styles.customInput,
                      {
                        backgroundColor: inputBg,
                        color: textColor,
                        borderColor: inputBorder,
                      },
                    ]}
                    placeholder={breakDuration.toString()}
                    placeholderTextColor={modeTextColor}
                    value={customBreak}
                    onChangeText={setCustomBreak}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: modeColor }]}
                onPress={() => {
                  applyCustomTimer();
                  closeSettings();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>

              {/* Spotify Section */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: modeTextColor, marginTop: 24 },
                ]}
              >
                Spotify
              </Text>

              {isSpotifyConnected ? (
                <View style={styles.spotifyConnected}>
                  <View style={styles.spotifyStatusRow}>
                    <Text
                      style={[styles.spotifyStatusText, { color: textColor }]}
                    >
                      ✓ Connected
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.spotifyDisconnectButton,
                        { borderColor: secondaryButtonBorder },
                      ]}
                      onPress={disconnectSpotify}
                    >
                      <Text
                        style={[
                          styles.spotifyDisconnectText,
                          { color: secondaryButtonText },
                        ]}
                      >
                        Disconnect
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.spotifyHint, { color: modeTextColor }]}>
                    Music will play during focus sessions
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.spotifyConnectButton,
                    { backgroundColor: "#1DB954", borderColor: "#1DB954" },
                  ]}
                  onPress={connectSpotify}
                >
                  <Text style={styles.spotifyConnectText}>Connect Spotify</Text>
                </TouchableOpacity>
              )}

              {/* Support Development Section */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: modeTextColor, marginTop: 24 },
                ]}
              >
                Support Development
              </Text>
              <View style={styles.supportSection}>
                <Text
                  style={[styles.supportDescription, { color: modeTextColor }]}
                >
                  Pulse is completely free with no ads. If you find it helpful,
                  consider supporting development!
                </Text>
                <View style={styles.supportButtons}>
                  <TouchableOpacity
                    style={[
                      styles.supportButton,
                      { backgroundColor: "#FFDD00", borderColor: "#FFDD00" },
                    ]}
                    onPress={() =>
                      Linking.openURL(
                        "https://buymeacoffee.com/heyokaysaturday"
                      )
                    }
                  >
                    <Text style={styles.supportButtonText}>
                      ☕ Buy Me a Coffee
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Task Panel */}
        {showTasks && (
          <View style={[styles.taskPanel, { backgroundColor: taskPanelBg }]}>
            <ScrollView style={styles.taskList}>
              {tasks.map((task) => {
                const TaskItem = () => {
                  const [textWidth, setTextWidth] = useState(0);
                  const strikeAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

                  useEffect(() => {
                    if (task.completed) {
                      Animated.timing(strikeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                      }).start();
                    } else {
                      Animated.timing(strikeAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start();
                    }
                  }, [task.completed]);

                  const animatedOpacity = strikeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  });

                  const AnimatedPath = Animated.createAnimatedComponent(Path);

                  return (
                    <View
                      key={task.id}
                      style={[styles.taskItem, { borderColor: taskBorder }]}
                    >
                      <TouchableOpacity
                        style={styles.taskCheckbox}
                        onPress={() => toggleTask(task.id)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            { borderColor: modeColor },
                            task.completed && { backgroundColor: modeColor },
                          ]}
                        />
                      </TouchableOpacity>
                      <View style={styles.taskTextContainer}>
                        <View style={{ position: 'relative' }}>
                          <Text
                            onLayout={(e) => {
                              const { width } = e.nativeEvent.layout;
                              setTextWidth(width);
                            }}
                            style={[
                              styles.taskText,
                              { color: textColor },
                              task.completed && styles.taskTextCompleted,
                            ]}
                          >
                            {task.text}
                          </Text>
                          {textWidth > 0 && (
                            <Svg
                              height="100%"
                              width={textWidth}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                              }}
                            >
                              <AnimatedPath
                                d={generateWavyPath(textWidth)}
                                stroke={modeColor}
                                strokeWidth="1.5"
                                fill="none"
                                opacity={animatedOpacity}
                              />
                            </Svg>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Text
                          style={[
                            styles.deleteButtonText,
                            { color: secondaryButtonText },
                          ]}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                };

                return <TaskItem key={task.id} />;
              })}
            </ScrollView>

            <View
              style={[styles.taskInputContainer, { borderColor: inputBorder }]}
            >
              <TextInput
                style={[
                  styles.taskInput,
                  {
                    backgroundColor: inputBg,
                    color: textColor,
                    borderColor: inputBorder,
                  },
                ]}
                placeholder="Add a task..."
                placeholderTextColor={modeTextColor}
                value={newTaskText}
                onChangeText={setNewTaskText}
                onSubmitEditing={addTask}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: modeColor }]}
                onPress={addTask}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  containerLandscape: {
    flexDirection: "row",
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 20,
    position: "relative",
  },
  headerLandscape: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    paddingTop: 0,
    paddingBottom: 0,
    zIndex: 10,
  },
  modeText: {
    fontSize: 20,
    fontWeight: "400",
    color: "#666666",
    letterSpacing: 0.5,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainerLandscape: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  circleContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  shadowCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  svg: {
    position: "absolute",
  },
  timerText: {
    fontSize: 48,
    fontFamily: "LCD",
    color: "#333333",
    letterSpacing: 2,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 1,
  },
  currentlyPlaying: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.8,
  },
  controls: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  button: {
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    height: 56,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  secondaryControls: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666666",
    letterSpacing: 0.2,
  },
  toggleTasksButton: {
    position: "absolute",
    right: 20,
    top: 80,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  toggleTasksButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  taskPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  taskList: {
    maxHeight: 200,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
  },
  taskTextContainer: {
    flex: 1,
    position: "relative",
  },
  taskText: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Caveat_400Regular",
    lineHeight: 24,
  },
  taskTextCompleted: {
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  taskInputContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  taskInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  settingsButton: {
    position: "absolute",
    left: 20,
    top: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  settingsIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  settingsModal: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "300",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: "row",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
  },
  presetButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  presetSubtext: {
    fontSize: 12,
  },
  customInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  customInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  customInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1.5,
  },
  applyButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  spotifyConnectButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  spotifyConnectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  spotifyConnected: {
    paddingVertical: 12,
  },
  spotifyStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  spotifyStatusText: {
    fontSize: 15,
    fontWeight: "500",
  },
  spotifyDisconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  spotifyDisconnectText: {
    fontSize: 13,
    fontWeight: "500",
  },
  spotifyHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
  supportSection: {
    marginTop: 12,
  },
  supportDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButtons: {
    gap: 12,
  },
  supportButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  githubButton: {
    backgroundColor: "transparent",
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  supportButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "600",
  },
});
