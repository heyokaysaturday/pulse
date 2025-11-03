import { createAudioPlayer, type AudioPlayer, type AudioSource } from "expo-audio";

class SoundService {
  private checkPlayer: AudioPlayer | null = null;
  private dingPlayer: AudioPlayer | null = null;
  private clickPlayer: AudioPlayer | null = null;

  private checkSource: AudioSource = require("../../assets/sounds/scribble-6144.mp3");
  private dingSource: AudioSource = require("../../assets/sounds/minimal-ding-sfx-383725.mp3");
  private clickSource: AudioSource = require("../../assets/sounds/mouse-click-290204.mp3");

  async loadSounds() {
    try {
      // Create audio players for each sound
      this.checkPlayer = createAudioPlayer(this.checkSource);
      this.dingPlayer = createAudioPlayer(this.dingSource);
      this.clickPlayer = createAudioPlayer(this.clickSource);

      // Set click sound to 80% volume
      if (this.clickPlayer) {
        this.clickPlayer.volume = 0.8;
      }

      console.log("Sounds loaded successfully");
    } catch (error) {
      console.error("Error loading sounds:", error);
    }
  }

  async playCheck() {
    try {
      if (this.checkPlayer) {
        console.log("Playing check sound...");
        this.checkPlayer.seekTo(0); // Reset to start
        this.checkPlayer.play();
      } else {
        console.warn("Check sound not loaded");
      }
    } catch (error) {
      console.error("Error playing check sound:", error);
    }
  }

  async playDing() {
    try {
      if (this.dingPlayer) {
        console.log("Playing ding sound...");
        this.dingPlayer.seekTo(0); // Reset to start
        this.dingPlayer.play();
      } else {
        console.warn("Ding sound not loaded");
      }
    } catch (error) {
      console.error("Error playing ding sound:", error);
    }
  }

  async playClick() {
    try {
      if (this.clickPlayer) {
        this.clickPlayer.seekTo(0); // Reset to start
        this.clickPlayer.play();
      }
    } catch (error) {
      console.error("Error playing click sound:", error);
    }
  }

  async unloadSounds() {
    try {
      if (this.checkPlayer) {
        this.checkPlayer.remove();
      }
      if (this.dingPlayer) {
        this.dingPlayer.remove();
      }
      if (this.clickPlayer) {
        this.clickPlayer.remove();
      }
    } catch (error) {
      console.error("Error unloading sounds:", error);
    }
  }
}

export const soundService = new SoundService();
