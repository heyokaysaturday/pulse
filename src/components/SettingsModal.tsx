import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';

interface SettingsModalProps {
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
  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={[styles.settingsModal, { backgroundColor: taskPanelBg }]}>
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
          <TouchableOpacity
            style={[
              styles.spotifyConnectButton,
              { backgroundColor: '#1DB954', borderColor: '#1DB954' },
            ]}
            onPress={onConnectSpotify}
          >
            <Text style={styles.spotifyConnectText}>Connect Spotify</Text>
          </TouchableOpacity>
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
                { backgroundColor: '#FFDD00', borderColor: '#FFDD00' },
              ]}
              onPress={() =>
                Linking.openURL('https://buymeacoffee.com/heyokaysaturday')
              }
            >
              <Text style={styles.supportButtonText}>☕ Buy Me a Coffee</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    color: '#FFFFFF',
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
});
