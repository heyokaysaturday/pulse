import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface PrivacyModalProps {
  textColor: string;
  modeTextColor: string;
  taskPanelBg: string;
  secondaryButtonText: string;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  textColor,
  modeTextColor,
  taskPanelBg,
  secondaryButtonText,
  onClose,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={[styles.privacyModal, { backgroundColor: taskPanelBg }]}>
            <View style={styles.privacyHeader}>
              <Text style={[styles.privacyTitle, { color: textColor }]}>
                Privacy Policy
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
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={[styles.dateText, { color: modeTextColor }]}>
                Last updated: November 3, 2025
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                The Short Version:
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                Pulse stores your tasks and timer settings locally on your device. We don't collect,
                store, or sell your personal data. If you connect Spotify, we only access what's
                needed to control playback - we don't store your listening history.
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                What Data We Collect
              </Text>

              <Text style={[styles.subheading, { color: textColor }]}>
                Stored Locally on Your Device:
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                • Your task lists and completion status{'\n'}
                • Timer preferences (work/break durations){'\n'}
                • App settings and preferences
              </Text>
              <Text style={[styles.emphasis, { color: textColor }]}>
                This data never leaves your device. We can't see it, access it, or share it.
              </Text>

              <Text style={[styles.subheading, { color: textColor }]}>
                Spotify Integration (Optional):
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                When you connect Spotify, we:{'\n'}
                • Request permission to control playback (play/pause, volume){'\n'}
                • Access your current playback state{'\n'}
                • Do NOT store your listening history, playlists, or personal Spotify data{'\n'}
                • Only communicate directly between your device and Spotify's servers
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                What We Don't Collect:
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                • No analytics or tracking{'\n'}
                • No email addresses or account creation{'\n'}
                • No location data{'\n'}
                • No usage statistics{'\n'}
                • No advertising identifiers
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Third-Party Services
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                Spotify: If you choose to connect Spotify, your use of Spotify is governed by
                Spotify's Privacy Policy.
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Data Storage and Security
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                All app data is stored locally on your device using standard secure storage
                mechanisms. We do not operate servers that store your information.
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Children's Privacy
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                Pulse does not knowingly collect information from children under 13. The app
                does not require any personal information to use.
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Changes to This Policy
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor }]}>
                We may update this privacy policy occasionally. Changes will be posted at
                pulsetimer.dev/privacy with an updated date.
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Contact
              </Text>
              <Text style={[styles.bodyText, { color: modeTextColor, marginBottom: 20 }]}>
                Questions about this privacy policy? Contact support@pulsetimer.dev
              </Text>
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
  privacyModal: {
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
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 10,
    paddingRight: 10,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  emphasis: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
});
