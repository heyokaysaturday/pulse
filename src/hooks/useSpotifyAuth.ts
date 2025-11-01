import { useState, useEffect } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPOTIFY_CONFIG } from '../services/spotify.config';
import { spotifyApi } from '../services/spotifyApi';

// Required for web-based authentication to work properly
WebBrowser.maybeCompleteAuthSession();

// Spotify discovery document for OAuth
const discovery = {
  authorizationEndpoint: SPOTIFY_CONFIG.AUTH_ENDPOINT,
  tokenEndpoint: SPOTIFY_CONFIG.TOKEN_ENDPOINT,
};

const TOKEN_STORAGE_KEY = '@spotify_access_token';
const REFRESH_TOKEN_STORAGE_KEY = '@spotify_refresh_token';
const TOKEN_EXPIRY_KEY = '@spotify_token_expiry';

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const redirectUri = makeRedirectUri({
    scheme: 'pulse',
    path: 'redirect',
  });

  // Log the redirect URI for debugging
  console.log('Spotify Redirect URI:', redirectUri);

  // Load saved token on mount and check if it needs refresh
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const expiryTimeStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

        if (savedToken) {
          // Check if token is expired or about to expire (within 5 minutes)
          const now = Date.now();
          const expiryTime = expiryTimeStr ? parseInt(expiryTimeStr) : 0;
          const timeUntilExpiry = expiryTime - now;

          if (timeUntilExpiry < 5 * 60 * 1000) {
            // Token expired or expiring soon, try to refresh
            console.log('Token expired or expiring soon, attempting refresh...');
            const refreshed = await refreshAccessToken();

            if (!refreshed) {
              // Refresh failed, clear tokens and require re-authentication
              console.log('Token refresh failed - user needs to reconnect');
              await disconnect();
            }
          } else {
            // Token still valid
            console.log('Token still valid for', Math.floor(timeUntilExpiry / 1000 / 60), 'minutes');
            setAccessToken(savedToken);
            setIsConnected(true);
            spotifyApi.setAccessToken(savedToken);
          }
        }
      } catch (error) {
        console.error('Error loading saved token:', error);
      }
    };

    loadToken();
  }, []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: SPOTIFY_CONFIG.CLIENT_ID,
      scopes: SPOTIFY_CONFIG.SCOPES,
      usePKCE: true, // Use Proof Key for Code Exchange for security
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      // Exchange the authorization code for an access token
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const codeVerifier = request?.codeVerifier;
      if (!codeVerifier) {
        throw new Error('No code verifier found');
      }

      const tokenResponse = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
          code_verifier: codeVerifier,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      const { access_token, refresh_token, expires_in } = tokenData;

      // Calculate expiry time (current time + expires_in seconds)
      const expiryTime = Date.now() + expires_in * 1000;

      // Save token, refresh token, and expiry to AsyncStorage
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      await AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      setAccessToken(access_token);
      setIsConnected(true);
      spotifyApi.setAccessToken(access_token);

      console.log('Stored access token with refresh token, expires in:', expires_in, 'seconds')
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  const connect = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Refreshing access token...');

      const tokenResponse = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to refresh token:', tokenResponse.status);
        return false;
      }

      const tokenData = await tokenResponse.json();
      const { access_token, expires_in } = tokenData;

      // Calculate new expiry time
      const expiryTime = Date.now() + expires_in * 1000;

      // Save new access token and expiry
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      setAccessToken(access_token);
      spotifyApi.setAccessToken(access_token);

      console.log('Access token refreshed successfully, expires in:', expires_in, 'seconds');
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  };

  const disconnect = async () => {
    // Clear all saved tokens
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);

    setAccessToken(null);
    setIsConnected(false);
    spotifyApi.setAccessToken('');
  };

  return {
    connect,
    disconnect,
    refreshAccessToken,
    isConnected,
    accessToken,
  };
}
