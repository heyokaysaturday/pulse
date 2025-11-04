import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

interface SpotifyBetaFormProps {
  modeColor: string;
  backgroundColor: string;
  textColor: string;
  inputBg: string;
  inputBorder: string;
}

export const SpotifyBetaForm: React.FC<SpotifyBetaFormProps> = ({
  modeColor,
  backgroundColor,
  textColor,
  inputBg,
  inputBorder,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Using Formspree - free form backend service
      const response = await fetch('https://formspree.io/f/xwpwdwnq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: 'Spotify Beta Access Request - Pulse App',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setName('');
        setEmail('');
        Alert.alert(
          'Success!',
          'Your request has been submitted. We\'ll add you to the beta list and send you an email confirmation.'
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit. Please email support@pulsetimer.dev directly with your name and email.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={[styles.successText, { color: modeColor }]}>
          ✓ Request submitted! Check your email for confirmation.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        Request Spotify Beta Access
      </Text>
      <Text style={[styles.description, { color: textColor, opacity: 0.7 }]}>
        We're limited to 25 beta testers during development. Enter your details to request access:
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: inputBg,
            borderColor: inputBorder,
            color: textColor,
          },
        ]}
        placeholder="Your Name"
        placeholderTextColor={textColor + '80'}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: inputBg,
            borderColor: inputBorder,
            color: textColor,
          },
        ]}
        placeholder="your.email@example.com"
        placeholderTextColor={textColor + '80'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: modeColor,
            opacity: isSubmitting ? 0.5 : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Request</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.note, { color: textColor, opacity: 0.6 }]}>
        Note: You'll need to use this exact email when connecting to Spotify
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  successContainer: {
    padding: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
