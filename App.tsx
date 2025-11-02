import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Easing,
  useWindowDimensions,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useFonts, Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { useSpotifyAuth } from './src/hooks/useSpotifyAuth';
import { spotifyApi } from './src/services/spotifyApi';
import { soundService } from './src/services/soundService';
import { Header, Timer, Controls, TaskPanel, SettingsModal } from './src/components';
import { Task, Mode } from './src/types';
import { getThemeColors } from './src/utils/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
    LCD: require('./assets/fonts/LCD.ttf'),
  });

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Spotify integration
  const {
    connect: connectSpotify,
    disconnect: disconnectSpotify,
    refreshAccessToken,
    isConnected: isSpotifyConnected,
  } = useSpotifyAuth();

  // Set up token refresh callback for Spotify API
  useEffect(() => {
    if (refreshAccessToken) {
      spotifyApi.setTokenRefreshCallback(refreshAccessToken);
    }
  }, [refreshAccessToken]);

  // Load sounds on mount
  useEffect(() => {
    soundService.loadSounds();
    return () => {
      soundService.unloadSounds();
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('focus');
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [customFocus, setCustomFocus] = useState('');
  const [customBreak, setCustomBreak] = useState('');
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTriggeredRef = useRef(false);
  const deviceSupportsControlRef = useRef(true); // Assume true until proven false
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const FOCUS_TIME = focusDuration * 60;
  const BREAK_TIME = breakDuration * 60;

  // Get theme colors
  const themeColors = getThemeColors(mode, isDark);
  const {
    backgroundColor,
    textColor,
    modeColor,
    modeTextColor,
    taskPanelBg,
    inputBg,
    inputBorder,
    secondaryButtonBg,
    secondaryButtonBorder,
    secondaryButtonText,
    ringBackgroundColor,
  } = themeColors;

  // Update timeLeft when durations change and timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    }
  }, [focusDuration, breakDuration, mode, FOCUS_TIME, BREAK_TIME]);

  // Capture user's volume when they start the timer (without controlling playback)
  useEffect(() => {
    if (isSpotifyConnected && isActive) {
      spotifyApi.captureUserVolume();
    }
  }, [isSpotifyConnected, isActive]);

  // Update currently playing track
  useEffect(() => {
    if (!isSpotifyConnected) return;

    const updateCurrentTrack = async () => {
      try {
        const playback = await spotifyApi.getPlaybackState();
        if (playback?.item) {
          const track = `${playback.item.name} - ${playback.item.artists[0]?.name}`;
          setCurrentTrack(track);
          setIsPlaying(playback.is_playing);
        } else {
          setCurrentTrack(null);
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error getting current track:', error);
      }
    };

    updateCurrentTrack();
    const interval = setInterval(updateCurrentTrack, 5000);

    return () => clearInterval(interval);
  }, [isSpotifyConnected]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      const maxTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
      const progress = (maxTime - timeLeft) / maxTime;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (timeLeft === 0) {
      // Play ding sound when timer completes
      soundService.playDing();

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_TIME);
      }
      // Keep timer running when switching modes
      setIsActive(true);
      progressAnim.setValue(0);
      fadeTriggeredRef.current = false;
    }
  }, [isActive, timeLeft, mode, FOCUS_TIME, BREAK_TIME, progressAnim, scaleAnim]);

  // Spotify control: Handle mode transitions
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (!isSpotifyConnected || !isActive) return;

    const prevMode = previousModeRef.current;
    const currentMode = mode;

    // Just entered focus mode from break
    const justEnteredFocus = currentMode === 'focus' && prevMode === 'break';
    // Just left focus mode to break
    const justLeftFocus = currentMode === 'break' && prevMode === 'focus';

    const handleModeTransition = async () => {
      if (!deviceSupportsControlRef.current) {
        console.log('⏭️ Skipping playback control - device does not support control');
        return;
      }

      if (justEnteredFocus) {
        // Starting focus mode - fade in music
        console.log('🎵 Entering focus mode - fading in music');
        try {
          await spotifyApi.playAndFadeIn(1000);
        } catch (error: any) {
          if (error?.message?.includes('Restriction violated')) {
            console.log('🚫 Device cannot be controlled - disabling playback control for this session');
            deviceSupportsControlRef.current = false;
          }
        }
      } else if (justLeftFocus) {
        // Leaving focus mode - fade out music
        console.log('🎵 Leaving focus mode - fading out music');
        try {
          await spotifyApi.fadeOutAndPause(2000);
        } catch (error: any) {
          if (error?.message?.includes('Restriction violated')) {
            console.log('🚫 Device cannot be controlled - disabling playback control for this session');
            deviceSupportsControlRef.current = false;
          }
        }
      }
    };

    if (justEnteredFocus || justLeftFocus) {
      handleModeTransition();
    }

    // Update previous mode reference
    previousModeRef.current = mode;
  }, [mode, isActive, isSpotifyConnected]);

  const handleStartPause = async () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    // Control Spotify playback based on timer state and mode
    if (isSpotifyConnected && mode === 'focus') {
      try {
        if (newIsActive) {
          // Starting timer in focus mode - start/resume music
          console.log('▶️ Starting timer - resuming music');
          await spotifyApi.playAndFadeIn(500); // Quick 500ms fade
        } else {
          // Pausing timer in focus mode - pause music
          console.log('⏸️ Pausing timer - pausing music');
          await spotifyApi.pause();
        }
      } catch (error) {
        console.log('Could not control Spotify playback:', error);
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    progressAnim.setValue(0);
    fadeTriggeredRef.current = false;
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }
    progressAnim.setValue(0);
    fadeTriggeredRef.current = false;
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
      setNewTaskText('');
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    console.log('Toggle task:', { id, completed: task?.completed });
    if (task && !task.completed) {
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

  const clearCompletedTasks = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };

  const applyPreset = (focusMin: number, breakMin: number) => {
    setFocusDuration(focusMin);
    setBreakDuration(breakMin);
    setCustomFocus('');
    setCustomBreak('');
    setIsActive(false);
    setMode('focus');
    setTimeLeft(focusMin * 60);
  };

  const applyCustomTimer = () => {
    const focus = parseInt(customFocus);
    const breakTime = parseInt(customBreak);
    if (!isNaN(focus) && focus > 0 && !isNaN(breakTime) && breakTime > 0) {
      setFocusDuration(focus);
      setBreakDuration(breakTime);
      setIsActive(false);
      setMode('focus');
      setTimeLeft(focus * 60);
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View
          style={[
            styles.container,
            { backgroundColor },
          ]}
        >
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

          <Header
            modeColor={modeColor}
            textColor={textColor}
            secondaryButtonBg={secondaryButtonBg}
            secondaryButtonBorder={secondaryButtonBorder}
            showTasks={showTasks}
            isLandscape={isLandscape}
            onSettingsPress={() => {
              setShowSettings(true);
              setShowTasks(false);
            }}
            onToggleTasks={() => setShowTasks(!showTasks)}
          />

          <View style={[styles.mainContent, isLandscape && styles.landscapeContent]}>
            <Timer
              timeLeft={timeLeft}
              mode={mode}
              textColor={textColor}
              modeColor={modeColor}
              ringBackgroundColor={ringBackgroundColor}
              progressAnim={progressAnim}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isSpotifyConnected={isSpotifyConnected}
              isLandscape={isLandscape}
            />

            <Controls
              isActive={isActive}
              modeColor={modeColor}
              secondaryButtonBg={secondaryButtonBg}
              secondaryButtonBorder={secondaryButtonBorder}
              secondaryButtonText={secondaryButtonText}
              isLandscape={isLandscape}
              onStartPause={handleStartPause}
              onReset={handleReset}
              onSkip={handleSkip}
            />
          </View>

          {showSettings && (
            <SettingsModal
              focusDuration={focusDuration}
              breakDuration={breakDuration}
              customFocus={customFocus}
              customBreak={customBreak}
              isSpotifyConnected={isSpotifyConnected}
              textColor={textColor}
              modeColor={modeColor}
              modeTextColor={modeTextColor}
              taskPanelBg={taskPanelBg}
              inputBg={inputBg}
              inputBorder={inputBorder}
              secondaryButtonBg={secondaryButtonBg}
              secondaryButtonBorder={secondaryButtonBorder}
              secondaryButtonText={secondaryButtonText}
              onClose={closeSettings}
              onApplyPreset={applyPreset}
              onCustomFocusChange={setCustomFocus}
              onCustomBreakChange={setCustomBreak}
              onApplyCustom={applyCustomTimer}
              onConnectSpotify={connectSpotify}
              onDisconnectSpotify={disconnectSpotify}
            />
          )}

          {showTasks && (
            <TaskPanel
              tasks={tasks}
              newTaskText={newTaskText}
              modeColor={modeColor}
              textColor={textColor}
              modeTextColor={modeTextColor}
              taskPanelBg={taskPanelBg}
              inputBg={inputBg}
              inputBorder={inputBorder}
              secondaryButtonText={secondaryButtonText}
              secondaryButtonBg={secondaryButtonBg}
              secondaryButtonBorder={secondaryButtonBorder}
              onTaskTextChange={setNewTaskText}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onClearCompleted={clearCompletedTasks}
              onClose={() => setShowTasks(false)}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  landscapeContent: {
    flex: 1,
    flexDirection: 'row',
  },
});
