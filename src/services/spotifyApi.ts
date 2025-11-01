import { SPOTIFY_CONFIG } from './spotify.config';

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
}

export interface CurrentlyPlaying {
  is_playing: boolean;
  item: {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
  } | null;
}

class SpotifyApiService {
  private accessToken: string | null = null;
  private userVolume: number | null = null; // Store the user's preferred volume
  private tokenRefreshCallback: (() => Promise<boolean>) | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setTokenRefreshCallback(callback: () => Promise<boolean>) {
    this.tokenRefreshCallback = callback;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && retryCount === 0 && this.tokenRefreshCallback) {
      console.log('Received 401 Unauthorized - attempting token refresh...');
      const refreshed = await this.tokenRefreshCallback();

      if (refreshed) {
        // Retry the request with the new token
        console.log('Token refreshed, retrying request...');
        return this.fetchWithAuth(endpoint, options, retryCount + 1);
      } else {
        console.error('Token refresh failed - user needs to reconnect');
      }
    }

    if (!response.ok) {
      // Try to get detailed error message
      let errorMessage = `Spotify API error: ${response.status} ${response.statusText}`;
      try {
        // Check if response has JSON content before trying to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log('Spotify API Error Details:', errorData);
          if (errorData.error?.message) {
            errorMessage = `Spotify API error: ${response.status} - ${errorData.error.message}`;
          }
        } else {
          // Try to read as text for non-JSON errors
          const errorText = await response.text();
          if (errorText) {
            console.log('Spotify API Error (non-JSON):', errorText);
            errorMessage = `Spotify API error: ${response.status} - ${errorText.substring(0, 100)}`;
          }
        }
      } catch (e) {
        // If we can't parse error, just use status
        console.log('Could not parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    // Some endpoints return 204 No Content or empty body
    if (response.status === 204) {
      return null;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    return null;
  }

  // Get user's available devices
  async getDevices(): Promise<SpotifyDevice[]> {
    const data = await this.fetchWithAuth('/me/player/devices');
    const devices = data?.devices || [];

    // Log device details for debugging
    devices.forEach(device => {
      const isRestricted = (device as any).is_restricted;
      console.log('Device:', {
        name: device.name,
        type: device.type,
        is_active: device.is_active,
        is_restricted: isRestricted,
        supports_volume: (device as any).supports_volume
      });

      if (isRestricted) {
        console.warn(`⚠️ Device "${device.name}" has restrictions and cannot be controlled remotely`);
        console.log('💡 Try using Spotify Desktop App or Web Player instead');
      }
    });

    // Filter out restricted devices
    const controllableDevices = devices.filter(device => !(device as any).is_restricted);

    if (controllableDevices.length === 0 && devices.length > 0) {
      console.warn('⚠️ No controllable devices found. All available devices have restrictions.');
      console.log('💡 Please open Spotify on your computer or web player (open.spotify.com)');
    }

    return controllableDevices;
  }

  // Get user's playlists
  async getUserPlaylists(limit = 20): Promise<SpotifyPlaylist[]> {
    const data = await this.fetchWithAuth(`/me/playlists?limit=${limit}`);
    return data?.items || [];
  }

  // Get currently playing track
  async getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
    try {
      return await this.fetchWithAuth('/me/player/currently-playing');
    } catch (error) {
      // 204 means nothing is playing
      return null;
    }
  }

  // Play a specific playlist
  async playPlaylist(playlistUri: string, deviceId?: string) {
    const body: any = {
      context_uri: playlistUri,
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    return this.fetchWithAuth('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Resume playback
  async play(deviceId?: string) {
    const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
    return this.fetchWithAuth(endpoint, {
      method: 'PUT',
    });
  }

  // Pause playback
  async pause() {
    return this.fetchWithAuth('/me/player/pause', {
      method: 'PUT',
    });
  }

  // Skip to next track
  async skipToNext() {
    return this.fetchWithAuth('/me/player/next', {
      method: 'POST',
    });
  }

  // Skip to previous track
  async skipToPrevious() {
    return this.fetchWithAuth('/me/player/previous', {
      method: 'POST',
    });
  }

  // Set volume (0-100)
  async setVolume(volumePercent: number) {
    return this.fetchWithAuth(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT',
    });
  }

  // Get current playback state (includes volume)
  async getPlaybackState() {
    try {
      return await this.fetchWithAuth('/me/player');
    } catch (error) {
      return null;
    }
  }

  // Capture user's current volume without affecting playback
  async captureUserVolume() {
    try {
      const state = await this.getPlaybackState();
      if (state?.device?.volume_percent !== undefined && this.userVolume === null) {
        this.userVolume = state.device.volume_percent;
        console.log(`Remembering user volume: ${this.userVolume}%`);
      }
    } catch (error) {
      console.log('Could not capture user volume:', error);
    }
  }

  // Fade out volume gradually then pause
  async fadeOutAndPause(durationMs: number = 2000) {
    try {
      const state = await this.getPlaybackState();
      if (!state || !state.is_playing) return;

      const startVolume = state.device.volume_percent || 100;

      // Store user's volume if we haven't already
      if (this.userVolume === null) {
        this.userVolume = startVolume;
        console.log(`Remembering user volume: ${this.userVolume}%`);
      }

      const steps = 20; // Number of volume steps
      const stepDuration = durationMs / steps;
      const volumeStep = startVolume / steps;

      // Gradually decrease volume
      for (let i = 1; i <= steps; i++) {
        const newVolume = Math.max(0, Math.round(startVolume - (volumeStep * i)));
        await this.setVolume(newVolume);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      // Pause (don't restore volume here - we'll restore when playing again)
      await this.pause();
    } catch (error) {
      console.error('Error during fade out:', error);
      // Fallback to immediate pause if fade fails
      try {
        await this.pause();
      } catch (pauseError) {
        console.error('Could not pause playback:', pauseError);
      }
    }
  }

  // Fade in volume gradually after play
  async playAndFadeIn(durationMs: number = 1000, deviceId?: string) {
    try {
      const state = await this.getPlaybackState();

      // If no active playback state, just try to resume playback normally
      if (!state) {
        console.log('No active playback state - trying to resume playback');
        console.log('Make sure Spotify is open and playing on a device');
        await this.play(deviceId);
        return;
      }

      console.log('Playback state:', {
        is_playing: state.is_playing,
        device: state.device?.name,
        track: state.item?.name
      });

      // Check if device is restricted
      const isRestricted = (state.device as any)?.is_restricted;
      if (isRestricted) {
        console.warn(`⚠️ Cannot control device "${state.device?.name}" - device has restrictions`);
        console.log('💡 Please switch to Spotify Desktop App or Web Player (open.spotify.com)');
        return;
      }

      // Use stored user volume, or get from current state, or default to 100
      let targetVolume = this.userVolume;
      if (targetVolume === null) {
        targetVolume = state.device?.volume_percent || 100;
        this.userVolume = targetVolume;
        console.log(`Remembering user volume: ${this.userVolume}%`);
      } else {
        console.log(`Using remembered user volume: ${this.userVolume}%`);
      }

      const supportsVolume = state.device?.supports_volume !== false;

      if (!supportsVolume) {
        console.log('Device does not support volume control - playing without fade');
        await this.play(deviceId);
        return;
      }

      // Try to fade in volume
      try {
        // Test if volume control works by trying to set to current volume first
        // This way we don't accidentally mute if control is restricted
        const currentVolume = state.device?.volume_percent || targetVolume;
        await this.setVolume(currentVolume);

        // If that worked, now we can safely fade
        await this.setVolume(0);
        await this.play(deviceId);

        const steps = 20;
        const stepDuration = durationMs / steps;
        const volumeStep = targetVolume / steps;

        // Gradually increase volume to user's preferred level
        for (let i = 1; i <= steps; i++) {
          const newVolume = Math.min(targetVolume, Math.round(volumeStep * i));
          await this.setVolume(newVolume);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      } catch (volumeError: any) {
        // If volume control fails, restore volume and throw error to caller
        console.log('Volume control not available - playing without fade');

        // Try to restore volume to what it was
        try {
          const currentVolume = state.device?.volume_percent || targetVolume;
          await this.setVolume(currentVolume);
        } catch (restoreError) {
          // If restore fails too, just throw the original error
        }

        // Throw error so caller knows control failed
        throw volumeError;
      }
    } catch (error: any) {
      // Check if it's a restriction violation
      if (error?.message?.includes('Restriction violated')) {
        console.warn('⚠️ Device restrictions prevent playback control');
        console.log('💡 Please open Spotify on your computer or at open.spotify.com');
        return;
      }

      console.error('Error during fade in:', error);
      // Fallback to immediate play if fade fails (will fail silently if no devices)
      try {
        await this.play(deviceId);
      } catch (playError) {
        console.log('Could not start playback - make sure Spotify is active on a device');
      }
    }
  }
}

export const spotifyApi = new SpotifyApiService();
