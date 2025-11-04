# Spotify Beta Form Setup

The Spotify Beta Form in the Settings modal allows users to request beta access to your Spotify integration. Since Spotify Developer Mode is limited to 25 users during development, this form helps you collect and manage beta tester requests.

## Setup Instructions (5 minutes)

### 1. Create a Formspree Account (Free)

1. Visit [Formspree.io](https://formspree.io/)
2. Sign up for a free account (no credit card required)
3. Click "New Form" or "+ New Project"
4. Create a new form and name it "Pulse Spotify Beta"
5. You'll get a form endpoint URL like: `https://formspree.io/f/abc123xyz`

### 2. Configure Email Delivery

In your Formspree form settings:
1. Set the email address to **support@pulsetimer.dev** (where you want to receive submissions)
2. Optionally enable email notifications for new submissions
3. Optionally set up an auto-reply email to send to users

### 3. Add Your Form ID to the App

1. Copy the form ID from the URL (the part after `/f/`, e.g., `abc123xyz`)
2. Open [SpotifyBetaForm.tsx](src/components/SpotifyBetaForm.tsx#L58)
3. Replace `YOUR_FORM_ID` with your actual form ID:

```typescript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

Change to:

```typescript
const response = await fetch('https://formspree.io/f/abc123xyz', {
```

### 4. Deploy and Test

1. Export and deploy: `npm run deploy:web`
2. Visit your web app, open Settings
3. Test the form with your own email
4. Check that you receive the submission at support@pulsetimer.dev

## How It Works

1. **User fills out form** - User enters name and email on web version
2. **Form submits to Formspree** - Data is sent to Formspree's backend
3. **You receive email** - Formspree forwards submission to support@pulsetimer.dev
4. **Add user to Spotify** - You add their email to Spotify Developer Dashboard

## Benefits

- ✅ Free tier includes 50 submissions/month (plenty for beta testing)
- ✅ Spam protection built-in
- ✅ Email notifications
- ✅ Auto-reply emails (optional)
- ✅ Submission archive/dashboard
- ✅ GDPR compliant

## Adding Users to Spotify Developer Mode

When you receive a submission (via email or Formspree dashboard):

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your Pulse app
3. Click "Users and Access"
4. Add the beta tester's email address
5. Optionally reply to let them know they've been added
6. They can now authenticate with Spotify in your app

## Form Details

- Form only appears on **web version** of the app
- Only visible when Spotify is **not connected** in Settings
- Includes name and email fields with validation
- Submits directly to Formspree (no page reload)
- Shows success message after submission

## Privacy & Security

- Formspree is GDPR compliant
- Form has spam protection built-in
- No user data is stored in the app
- All submissions go to your Formspree account → support@pulsetimer.dev
