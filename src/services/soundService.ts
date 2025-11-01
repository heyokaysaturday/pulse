import { Audio } from 'expo-av';

class SoundService {
  private checkSound: Audio.Sound | null = null;
  private dingSound: Audio.Sound | null = null;

  async loadSounds() {
    try {
      // Set audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load check sound (scribble)
      const { sound: check } = await Audio.Sound.createAsync(
        require('../../assets/sounds/scribble-6144.mp3')
      );
      this.checkSound = check;

      // Load ding sound (timer complete)
      const { sound: ding } = await Audio.Sound.createAsync(
        require('../../assets/sounds/minimal-ding-sfx-383725.mp3')
      );
      this.dingSound = ding;

      console.log('Sounds loaded successfully');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async playCheck() {
    try {
      if (this.checkSound) {
        console.log('Playing check sound...');
        await this.checkSound.setPositionAsync(0);
        await this.checkSound.playAsync();
      } else {
        console.warn('Check sound not loaded');
      }
    } catch (error) {
      console.error('Error playing check sound:', error);
    }
  }

  async playDing() {
    try {
      if (this.dingSound) {
        console.log('Playing ding sound...');
        await this.dingSound.setPositionAsync(0);
        await this.dingSound.playAsync();
      } else {
        console.warn('Ding sound not loaded');
      }
    } catch (error) {
      console.error('Error playing ding sound:', error);
    }
  }

  async unloadSounds() {
    try {
      if (this.checkSound) {
        await this.checkSound.unloadAsync();
      }
      if (this.dingSound) {
        await this.dingSound.unloadAsync();
      }
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
}

export const soundService = new SoundService();
