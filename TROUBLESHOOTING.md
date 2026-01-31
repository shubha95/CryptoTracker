# Troubleshooting Guide

## 🚨 Emulator Not Launching

If the emulator is not launching, follow these steps:

---

## Step 1: Install Dependencies

**CRITICAL:** You must install dependencies first!

```bash
npm install
```

This installs:
- `zustand` - State management
- `react-native-reanimated` - Animations
- `@shopify/flash-list` - Optimized lists
- `@types/node` - TypeScript definitions

**Wait for completion** (may take 2-5 minutes)

---

## Step 2: Platform-Specific Setup

### iOS Setup

```bash
cd ios
pod install
cd ..
```

If pod install fails:
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
```

### Android Setup

No additional setup needed. Gradle handles it automatically.

---

## Step 3: Clear Cache

```bash
# Clear Metro cache
npm start -- --reset-cache
```

Or manually:
```bash
rm -rf node_modules
rm -rf ios/Pods
rm -rf android/build
rm -rf android/app/build
npm install
cd ios && pod install && cd ..
```

---

## Step 4: Start Metro Bundler

```bash
npm start
```

Wait for:
```
 WELCOME TO METRO
  ....
  press r to restart
```

---

## Step 5: Launch Emulator

### iOS

**Option 1: Command Line**
```bash
npm run ios
```

**Option 2: Xcode**
1. Open `ios/CryptoTracker.xcworkspace` (NOT .xcodeproj)
2. Select simulator (iPhone 15 Pro recommended)
3. Press Play button

**Common iOS Issues:**

**"Unable to boot simulator"**
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```

**"Build failed"**
```bash
cd ios
xcodebuild clean
cd ..
npm run ios
```

### Android

**Option 1: Command Line**
```bash
npm run android
```

**Option 2: Android Studio**
1. Open `android` folder
2. Start AVD (Android Virtual Device)
3. Run app

**Common Android Issues:**

**"SDK location not found"**
Create `android/local.properties`:
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

**"Gradle build failed"**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## Common Error Messages

### Error: "Cannot find module 'zustand'"

**Solution:** Dependencies not installed
```bash
npm install
```

### Error: "Unable to resolve module 'react-native-reanimated'"

**Solution:** 
1. Install dependencies: `npm install`
2. Clear cache: `npm start -- --reset-cache`
3. For iOS: `cd ios && pod install && cd ..`

### Error: "Cannot find module '@shopify/flash-list'"

**Solution:** Same as above - dependencies not installed

### Error: TypeScript errors about NodeJS

**Solution:** Already fixed in latest code. Run:
```bash
npm install
```

### Error: "Metro bundler not running"

**Solution:**
```bash
npm start -- --reset-cache
```

In new terminal:
```bash
npm run ios
# OR
npm run android
```

### Error: "WebSocket connection failed"

**Causes:**
1. No internet connection
2. Binance blocked in your region
3. Firewall blocking WebSocket

**Test:**
```bash
# Test in browser console
const ws = new WebSocket('wss://stream.binance.com:9443/ws');
ws.onopen = () => console.log('Connected!');
```

---

## Verification Checklist

Before running the app, ensure:

- [ ] Node.js >= 20 installed (`node -v`)
- [ ] npm dependencies installed (`node_modules` folder exists)
- [ ] For iOS: Pods installed (`ios/Pods` folder exists)
- [ ] Metro bundler is running (separate terminal)
- [ ] Emulator/Simulator is available
- [ ] Internet connection active

---

## Step-by-Step First Run

**Terminal 1:**
```bash
# Install everything
npm install

# iOS only
cd ios && pod install && cd ..

# Start Metro
npm start
```

**Terminal 2 (after Metro starts):**
```bash
# iOS
npm run ios

# OR Android
npm run android
```

**Expected behavior:**
1. Metro bundler compiles JavaScript (30-60 seconds first time)
2. Emulator opens
3. App installs
4. App launches showing "Crypto Tracker"
5. Within 2-3 seconds, "Connected" status appears
6. Tickers start appearing with price updates

---

## Still Not Working?

### Check Metro Logs

Look for errors in Metro bundler terminal. Common issues:
- Syntax errors
- Missing modules
- TypeScript errors

### Check Native Logs

**iOS:**
```bash
npx react-native log-ios
```

**Android:**
```bash
npx react-native log-android
```

### Check Build Logs

**iOS:**
```bash
cd ios
xcodebuild -workspace CryptoTracker.xcworkspace \
  -scheme CryptoTracker \
  -configuration Debug \
  -sdk iphonesimulator
```

**Android:**
```bash
cd android
./gradlew assembleDebug --info
```

---

## Quick Reset (Nuclear Option)

If nothing works, start fresh:

```bash
# Stop all processes
# Kill Metro, stop emulators

# Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf android/build
rm -rf android/app/build
rm -rf ~/.gradle/caches

# Reinstall
npm install
cd ios && pod install && cd ..

# Clear cache and start
npm start -- --reset-cache

# In new terminal
npm run ios
# OR
npm run android
```

---

## Platform-Specific Requirements

### iOS Requirements
- macOS only
- Xcode 15+ installed
- Xcode Command Line Tools
- CocoaPods installed (`sudo gem install cocoapods`)
- iOS Simulator installed

### Android Requirements
- Android Studio installed
- Android SDK (API 31+)
- Android AVD created
- Environment variables:
  - `ANDROID_HOME`
  - `JAVA_HOME`

---

## Performance Issues After Launch

If app launches but is slow:

1. **Enable Hermes:** Check `android/app/build.gradle`:
   ```gradle
   hermesEnabled: true
   ```

2. **Disable Remote Debugging:** 
   - Dev Menu > Disable Remote JS Debugging

3. **Check Connection:**
   - Look for "Connected" status with green dot
   - Check console for WebSocket logs

4. **Monitor Performance:**
   - Dev Menu > Show Perf Monitor
   - Should show ~60 FPS for both JS and UI

---

## Contact & Resources

If you're still stuck:

1. Check **[README.md](./README.md)** for setup instructions
2. Check **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for quick start
3. Review React Native docs: https://reactnative.dev/docs/troubleshooting
4. Check package issues:
   - [React Native](https://github.com/facebook/react-native/issues)
   - [Zustand](https://github.com/pmndrs/zustand/issues)
   - [Reanimated](https://github.com/software-mansion/react-native-reanimated/issues)
   - [FlashList](https://github.com/Shopify/flash-list/issues)

---

## Success Indicators

You'll know it's working when:
- ✅ App opens without errors
- ✅ "Connected" status with green dot appears
- ✅ 10 cryptocurrency tickers appear
- ✅ Prices update every ~1 second
- ✅ Green/red animations on price changes
- ✅ Smooth 60 FPS scrolling
- ✅ Console shows WebSocket connection logs

---

**Last Resort:** Create a fresh React Native project and copy the `src` folder to it.
