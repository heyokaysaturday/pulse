// Spotify API Configuration
// Created at: https://developer.spotify.com/dashboard
import { SPOTIFY_CLIENT_ID } from '@env';

export const SPOTIFY_CONFIG = {
  CLIENT_ID: SPOTIFY_CLIENT_ID,
  // Note: Client Secret is not needed for PKCE flow (used in mobile apps)
  // It's only required for server-side authentication

  // Scopes define what permissions we're requesting from the user
  SCOPES: [
    'user-read-playback-state',     // Read current playback state
    'user-modify-playback-state',   // Control playback (play/pause/skip)
    'user-read-currently-playing',  // See what's currently playing
    'playlist-read-private',        // Access user's private playlists
    'playlist-read-collaborative',  // Access collaborative playlists
  ],

  // Spotify API endpoints
  AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
  TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
  API_BASE_URL: 'https://api.spotify.com/v1',
};
