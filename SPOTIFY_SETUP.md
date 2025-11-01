# Spotify Integration Setup

## Prerequisites
- A Spotify Premium account (required for playback control)
- A Spotify Developer account

## Setup Steps

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the details:
   - **App name**: Pulse Timer
   - **App description**: Pomodoro timer with Spotify integration
   - **Redirect URI**: Add ALL of these (click "Add" after each):
     - `pulse://redirect`
     - `exp://localhost:8081/--/redirect`
     - `exp://127.0.0.1:8081/--/redirect`
   - **API**: Check "Web API"
5. Click "Save"

**Note**: When using Expo Go during development, the redirect URI will be different from production. Adding all three URIs above ensures authentication works in both development and production environments.

### 2. Get Your Client ID

1. On your app's dashboard, you'll see your **Client ID**
2. Copy this Client ID

### 3. Configure the App

1. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Client ID:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   ```

**Note**: The `.env` file is already in `.gitignore`, so your credentials won't be committed to version control.

### 4. Test the Integration

1. Rebuild your app (stop and restart the Expo dev server)
2. Open the app
3. Go to Settings (⚙ icon)
4. Scroll to the Spotify section
5. Click "Connect to Spotify"
6. You should be redirected to Spotify's login page
7. After logging in and authorizing, you'll be redirected back to the app

##How It Works

The integration uses **Spotify Web API** to control playback on your existing Spotify devices:

- **No audio streaming in the app** - it controls Spotify on your phone, computer, or smart speakers
- **Remote control** - play/pause, skip tracks, select playlists
- **Timer integration** - automatically starts/pauses music based on focus/break sessions

## Requirements

- **Spotify Premium** account (free accounts can't control playback)
- An active Spotify device (phone app, desktop app, web player, or smart speaker)

## Troubleshooting

**"No devices available"**
- Make sure Spotify is open and playing on at least one device
- Try playing a song manually first, then refresh devices

**Authentication fails / "Invalid redirect URI" error**
- Check the console logs for "Spotify Redirect URI:" to see what URI your app is using
- In your Spotify Developer Dashboard, go to your app's settings
- Under "Redirect URIs", make sure you have added the exact URI from the console logs
- Common URIs to add:
  - `pulse://redirect` (production/development builds)
  - `exp://localhost:8081/--/redirect` (Expo Go on iOS simulator)
  - `exp://127.0.0.1:8081/--/redirect` (Expo Go alternative)
  - If on a physical device with Expo Go, you may need `exp://YOUR_IP:8081/--/redirect`
- Restart the Expo dev server after changing Spotify settings

**Can't control playback / "Restriction violated" error**
- Ensure you have Spotify Premium
- **Some devices have restrictions and cannot be controlled remotely**
- The most reliable devices for remote control are:
  - Spotify Desktop App (Windows/Mac)
  - Spotify Web Player (open.spotify.com in a browser)
  - Some mobile devices (but not all)
- If you see "Restriction violated" errors, try switching to a different device
- Check the console logs to see which devices are restricted

## Security Note

The Client ID is safe to commit to version control as it's a public identifier. The actual authentication happens through Spotify's OAuth flow, and access tokens are never stored in code.
