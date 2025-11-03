import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';

interface HelpModalProps {
  visible: boolean;
  textColor: string;
  modeColor: string;
  modeTextColor: string;
  taskPanelBg: string;
  secondaryButtonText: string;
  onClose: () => void;
  onPrivacyPress: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  textColor,
  modeColor,
  modeTextColor,
  taskPanelBg,
  secondaryButtonText,
  onClose,
  onPrivacyPress,
}) => {
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
              style={[styles.helpModal, { backgroundColor: taskPanelBg }]}
              accessibilityRole="dialog"
              accessibilityLabel="About Pulse"
            >
              <View style={styles.helpHeader}>
              <Text style={[styles.helpTitle, { color: textColor }]}>
                About Pulse
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
              <Text style={[styles.versionText, { color: modeTextColor }]}>
                Version 1.0.0
              </Text>

              <Text style={[styles.descriptionText, { color: textColor, marginTop: 16 }]}>
                A minimalist Pomodoro timer with Spotify integration to help you focus better.
              </Text>

              <View style={styles.linksSection}>
                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={onPrivacyPress}
                >
                  <Text style={[styles.linkText, { color: modeColor }]}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={() =>
                    Linking.openURL('mailto:support@pulsetimer.dev')
                  }
                >
                  <Text style={[styles.linkText, { color: modeColor }]}>
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.footerText, { color: modeTextColor, marginTop: 24 }]}>
                Made with focus and flow
              </Text>
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
  helpModal: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '60%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
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
  versionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  linksSection: {
    marginTop: 24,
    gap: 16,
  },
  linkItem: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
