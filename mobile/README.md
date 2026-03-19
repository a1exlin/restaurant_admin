# Schedule – Mobile App

React Native (Expo) version of the schedule builder. Build for iOS and distribute via TestFlight.

## Prerequisites

- **Node.js 20.19+** (required for Expo SDK 55; install from [nodejs.org](https://nodejs.org))
- **Apple Developer account** ($99/year) for TestFlight
- **Expo account** (free at [expo.dev](https://expo.dev))

## Run locally

```bash
cd mobile
npm start
```

Then scan the QR code with Expo Go on your phone, or press `i` for iOS simulator.

## Build for TestFlight

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Log in to Expo

```bash
eas login
```

### 3. Configure the project

```bash
eas build:configure
```

### 4. Update eas.json

Edit `eas.json` and replace:

- `YOUR_APPLE_ID@email.com` – your Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` – your App Store Connect app ID (found in App Store Connect after creating the app)

### 5. Create iOS build

```bash
eas build --platform ios --profile production
```

This builds in the cloud. When it finishes, you’ll get a link to the `.ipa` file.

### 6. Submit to TestFlight

```bash
eas submit --platform ios --profile production
```

Or submit from the EAS dashboard:

1. Go to [expo.dev](https://expo.dev)
2. Open your project
3. Go to the build
4. Click **Submit to App Store Connect**

### 7. TestFlight

1. In App Store Connect, open your app
2. Go to **TestFlight**
3. Add internal testers (your team) or external testers
4. Testers install the app from the TestFlight app

## Notes

- Bundle ID: `com.restaurant.schedule` (change in `app.json` if needed)
- App name: **Schedule**
- Data is stored in AsyncStorage on the device
