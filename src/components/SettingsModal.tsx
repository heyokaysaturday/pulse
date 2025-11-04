import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Linking,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SpotifyBetaForm } from './SpotifyBetaForm';

interface SettingsModalProps {
  visible: boolean;
  focusDuration: number;
  breakDuration: number;
  customFocus: string;
  customBreak: string;
  isSpotifyConnected: boolean;
  textColor: string;
  modeColor: string;
  modeTextColor: string;
  taskPanelBg: string;
  inputBg: string;
  inputBorder: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  onClose: () => void;
  onApplyPreset: (focus: number, breakTime: number) => void;
  onCustomFocusChange: (text: string) => void;
  onCustomBreakChange: (text: string) => void;
  onApplyCustom: () => void;
  onConnectSpotify: () => void;
  onDisconnectSpotify: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  focusDuration,
  breakDuration,
  customFocus,
  customBreak,
  isSpotifyConnected,
  textColor,
  modeColor,
  modeTextColor,
  taskPanelBg,
  inputBg,
  inputBorder,
  secondaryButtonBg,
  secondaryButtonBorder,
  secondaryButtonText,
  onClose,
  onApplyPreset,
  onCustomFocusChange,
  onCustomBreakChange,
  onApplyCustom,
  onConnectSpotify,
  onDisconnectSpotify,
}) => {
  const [dndEnabled, setDndEnabled] = useState(false);
  const [hasDndPermission, setHasDndPermission] = useState(false);
  const [isDndAvailable, setIsDndAvailable] = useState(false);
  const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkDndAvailability();
    }
  }, []);

  const checkDndAvailability = async () => {
    try {
      // Try to require the module - will fail in Expo Go
      const VolumeManager = require('react-native-volume-manager').default;
      if (VolumeManager && VolumeManager.checkDndAccess) {
        setIsDndAvailable(true);
        const hasAccess = await VolumeManager.checkDndAccess();
        setHasDndPermission(hasAccess);
      }
    } catch (error) {
      // Module not available (Expo Go or not installed) - silently fail
      setIsDndAvailable(false);
    }
  };

  const requestDndPermission = async () => {
    if (Platform.OS === 'android' && isDndAvailable) {
      try {
        const VolumeManager = require('react-native-volume-manager').default;
        await VolumeManager.requestDndAccess();
        // Check again after user returns from settings
        setTimeout(checkDndAvailability, 1000);
      } catch (error) {
        console.log('Could not request DND permission:', error);
      }
    }
  };

  const toggleDnd = async (value: boolean) => {
    if (Platform.OS === 'android' && isDndAvailable) {
      if (!hasDndPermission) {
        Alert.alert(
          'Permission Required',
          'Pulse needs permission to manage Do Not Disturb mode. Would you like to grant it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestDndPermission },
          ]
        );
        return;
      }

      try {
        const VolumeManager = require('react-native-volume-manager').default;
        if (value) {
          await VolumeManager.setRingerMode('silent');
        } else {
          await VolumeManager.setRingerMode('normal');
        }
        setDndEnabled(value);
      } catch (error) {
        console.log('Error toggling DND:', error);
        Alert.alert('Error', 'Failed to change Do Not Disturb mode');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.modalOverlay} accessible={false} importantForAccessibility="no-hide-descendants">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[styles.settingsModal, { backgroundColor: taskPanelBg }]}
              accessibilityLabel="Timer Settings"
            >
              <View style={styles.settingsHeader}>
          <Text style={[styles.settingsTitle, { color: textColor }]}>
            Timer Settings
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: secondaryButtonText }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          bounces={true}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
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
            onPress={() => onApplyPreset(25, 5)}
          >
            <Text style={[styles.presetButtonText, { color: textColor }]}>
              Classic
            </Text>
            <Text style={[styles.presetSubtext, { color: modeTextColor }]}>
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
            onPress={() => onApplyPreset(50, 10)}
          >
            <Text style={[styles.presetButtonText, { color: textColor }]}>
              Extended
            </Text>
            <Text style={[styles.presetSubtext, { color: modeTextColor }]}>
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
            onPress={() => onApplyPreset(15, 3)}
          >
            <Text style={[styles.presetButtonText, { color: textColor }]}>
              Short
            </Text>
            <Text style={[styles.presetSubtext, { color: modeTextColor }]}>
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
              onChangeText={onCustomFocusChange}
              keyboardType="numeric"
              inputMode="numeric"
              editable={true}
              selectTextOnFocus={true}
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
              onChangeText={onCustomBreakChange}
              keyboardType="numeric"
              inputMode="numeric"
              editable={true}
              selectTextOnFocus={true}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: modeColor }]}
          onPress={() => {
            onApplyCustom();
            onClose();
          }}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>

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
              <Text style={[styles.spotifyStatusText, { color: textColor }]}>
                ✓ Connected
              </Text>
              <TouchableOpacity
                style={[
                  styles.spotifyDisconnectButton,
                  { borderColor: secondaryButtonBorder },
                ]}
                onPress={onDisconnectSpotify}
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
          <>
            <TouchableOpacity
              style={[
                styles.spotifyConnectButton,
                { backgroundColor: '#1DB954', borderColor: '#1DB954' },
              ]}
              onPress={onConnectSpotify}
            >
              <Text style={styles.spotifyConnectText}>Connect Spotify</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <View style={styles.betaFormContainer}>
                <SpotifyBetaForm
                  modeColor={modeColor}
                  backgroundColor={taskPanelBg}
                  textColor={textColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                />
              </View>
            )}
          </>
        )}

        {isNativeMobile && Platform.OS === 'android' && isDndAvailable && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: modeTextColor, marginTop: 24 },
              ]}
            >
              Do Not Disturb
            </Text>
            <View style={styles.dndContainer}>
              <View style={styles.dndRow}>
                <View style={styles.dndTextContainer}>
                  <Text style={[styles.dndTitle, { color: textColor }]}>
                    Enable DND Mode
                  </Text>
                  <Text style={[styles.dndDescription, { color: modeTextColor }]}>
                    Automatically enables Do Not Disturb during focus sessions
                  </Text>
                </View>
                <Switch
                  value={dndEnabled}
                  onValueChange={toggleDnd}
                  trackColor={{ false: inputBorder, true: modeColor }}
                  thumbColor={dndEnabled ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
            </View>
          </>
        )}

        <Text
          style={[
            styles.sectionTitle,
            { color: modeTextColor, marginTop: 24 },
          ]}
        >
          Support Development
        </Text>
        <View style={styles.supportSection}>
          <Text style={[styles.supportDescription, { color: modeTextColor }]}>
            Pulse is completely free with no ads. If you find it helpful,
            consider supporting development!
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={[
                styles.supportButton,
                { backgroundColor: '#FF5E5B', borderColor: '#FF5E5B' },
              ]}
              onPress={() =>
                Linking.openURL('https://ko-fi.com/heyokaysaturday')
              }
            >
              <Text style={styles.supportButtonText}>☕ Support on Ko-fi</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContentContainer: {
    paddingBottom: 10,
    paddingRight: 10,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetSubtext: {
    fontSize: 12,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  customInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotifyConnected: {
    marginBottom: 8,
  },
  spotifyStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotifyStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spotifyDisconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  spotifyDisconnectText: {
    fontSize: 14,
  },
  spotifyHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  spotifyConnectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  spotifyConnectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportSection: {
    marginTop: 8,
  },
  supportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  supportButtons: {
    gap: 8,
  },
  supportButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  betaFormContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 16,
  },
  dndContainer: {
    marginBottom: 8,
  },
  dndRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  dndTextContainer: {
    flex: 1,
  },
  dndTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dndDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});
