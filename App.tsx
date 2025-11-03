import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
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
import { useSpotifyAuth } from './src/hooks/useSpotifyAuth';
import { spotifyApi } from './src/services/spotifyApi';
import { soundService } from './src/services/soundService';
import { Header, Timer, Controls, TaskPanel, SettingsModal, HelpModal, PrivacyModal, ErrorBoundary } from './src/components';
import { Task, Mode } from './src/types';
import { getThemeColors } from './src/utils/theme';

export default function App() {

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
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
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
      progressAnim.setValue(0); // Reset progress animation when changing durations
    }
  }, [focusDuration, breakDuration, mode, FOCUS_TIME, BREAK_TIME, progressAnim]);

  // Capture user's volume when they start the timer (without controlling playback)
  useEffect(() => {
    if (isSpotifyConnected && isActive) {
      spotifyApi.captureUserVolume();
    }
  }, [isSpotifyConnected, isActive]);

  // Update currently playing track with smart polling
  useEffect(() => {
    if (!isSpotifyConnected) return;

    let timeoutIds: NodeJS.Timeout[] = [];
    let currentTrackId: string | null = null;

    const updateCurrentTrack = async () => {
      try {
        const playback = await spotifyApi.getPlaybackState();
        if (playback?.item) {
          const track = `${playback.item.name} - ${playback.item.artists[0]?.name}`;
          const trackId = playback.item.id;

          // Check if track changed (user skipped)
          if (currentTrackId && trackId !== currentTrackId) {
            console.log('🎵 Track changed! User likely skipped');
          }
          currentTrackId = trackId;

          setCurrentTrack(track);
          setIsPlaying(playback.is_playing);

          // Calculate when to check again based on track duration
          if (playback.is_playing && playback.item.duration_ms && playback.progress_ms !== undefined) {
            const remainingMs = playback.item.duration_ms - playback.progress_ms;

            // For longer tracks (>90 sec), check at 33%, 66%, and end
            // For shorter tracks, just check at end
            if (remainingMs > 90000) {
              const checkAt33 = remainingMs * 0.33;
              const checkAt66 = remainingMs * 0.66;
              const checkAtEnd = remainingMs + 2000;

              console.log(`Track: ${Math.round(remainingMs / 1000)}s remaining. Checks at: 33% (${Math.round(checkAt33 / 1000)}s), 66% (${Math.round(checkAt66 / 1000)}s), end (${Math.round(checkAtEnd / 1000)}s)`);

              timeoutIds.push(setTimeout(updateCurrentTrack, checkAt33));
              timeoutIds.push(setTimeout(updateCurrentTrack, checkAt66));
              timeoutIds.push(setTimeout(updateCurrentTrack, checkAtEnd));
            } else {
              // Short track - just check at end
              const checkAtEnd = remainingMs + 2000;
              console.log(`Short track: ${Math.round(remainingMs / 1000)}s remaining. Check at end (${Math.round(checkAtEnd / 1000)}s)`);
              timeoutIds.push(setTimeout(updateCurrentTrack, checkAtEnd));
            }
          } else {
            // If paused or no duration info, fall back to checking every 30 seconds
            timeoutIds.push(setTimeout(updateCurrentTrack, 30000));
          }
        } else {
          setCurrentTrack(null);
          setIsPlaying(false);
          currentTrackId = null;
          // No track playing, check again in 30 seconds
          timeoutIds.push(setTimeout(updateCurrentTrack, 30000));
        }
      } catch (error) {
        console.error('Error getting current track:', error);
        // On error, try again in 30 seconds
        timeoutIds.push(setTimeout(updateCurrentTrack, 30000));
      }
    };

    updateCurrentTrack();

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
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

      // Fade out music 2 seconds before focus mode ends
      if (mode === 'focus' && timeLeft === 2 && !fadeTriggeredRef.current && isSpotifyConnected) {
        fadeTriggeredRef.current = true;
        console.log('🎵 Focus ending in 2s - starting fade out');
        if (deviceSupportsControlRef.current) {
          spotifyApi.fadeOutAndPause(2000).catch((error: any) => {
            if (error?.message?.includes('Restriction violated')) {
              console.log('🚫 Device cannot be controlled - disabling playback control for this session');
              deviceSupportsControlRef.current = false;
            }
          });
        }
      }

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
  }, [isActive, timeLeft, mode, FOCUS_TIME, BREAK_TIME, progressAnim, scaleAnim, isSpotifyConnected]);

  // Spotify control: Handle mode transitions
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (!isSpotifyConnected || !isActive) return;

    const prevMode = previousModeRef.current;
    const currentMode = mode;

    // Just entered focus mode from break
    const justEnteredFocus = currentMode === 'focus' && prevMode === 'break';

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
      }
      // Note: Fade out is handled 2 seconds before focus ends (see timer effect above)
    };

    if (justEnteredFocus) {
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

  return (
    <ErrorBoundary>
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
            onHelpPress={() => {
              setShowHelp(true);
              setShowTasks(false);
              setShowSettings(false);
            }}
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

          <SettingsModal
            visible={showSettings}
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

          <HelpModal
            visible={showHelp}
            textColor={textColor}
            modeColor={modeColor}
            modeTextColor={modeTextColor}
            taskPanelBg={taskPanelBg}
            secondaryButtonText={secondaryButtonText}
            onClose={() => setShowHelp(false)}
            onPrivacyPress={() => {
              setShowHelp(false);
              setShowPrivacy(true);
            }}
          />

          <PrivacyModal
            visible={showPrivacy}
            textColor={textColor}
            modeTextColor={modeTextColor}
            taskPanelBg={taskPanelBg}
            secondaryButtonText={secondaryButtonText}
            onClose={() => setShowPrivacy(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </ErrorBoundary>
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
