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

  // Load saved token on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
          setAccessToken(savedToken);
          setIsConnected(true);
          spotifyApi.setAccessToken(savedToken);
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
      const { access_token } = tokenData;

      // Save token to AsyncStorage
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, access_token);

      setAccessToken(access_token);
      setIsConnected(true);
      spotifyApi.setAccessToken(access_token);

      // TODO: Store refresh token for token renewal
      // tokenData.refresh_token
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

  const disconnect = async () => {
    // Clear saved token
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);

    setAccessToken(null);
    setIsConnected(false);
    spotifyApi.setAccessToken('');
  };

  return {
    connect,
    disconnect,
    isConnected,
    accessToken,
  };
}
