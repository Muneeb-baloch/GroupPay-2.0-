# Lottie File Conversion Guide

## Problem
React Native's `lottie-react-native` library only supports `.json` format, not `.lottie` files.

## Solution: Convert wallet.lottie to wallet.json

### Method 1: LottieFiles.com (Recommended)
1. Go to [lottiefiles.com](https://lottiefiles.com)
2. Click "Upload" or drag your `wallet.lottie` file
3. Once uploaded, click "Download" 
4. Select "Lottie JSON" format
5. Save as `wallet.json` in this folder

### Method 2: Online Converters
1. Search "lottie to json converter" in Google
2. Upload your `wallet.lottie` file
3. Download the converted `.json` file
4. Rename to `wallet.json` and place in this folder

### Method 3: After Effects (If you have the source)
1. Open your original After Effects project
2. Go to Window > Extensions > Bodymovin
3. Select your composition
4. Set destination to this folder
5. Name it `wallet.json`
6. Click "Render"

## After Conversion
Once you have `wallet.json`, the splash screen will automatically use it. The code is already prepared to load:
```
assets/animations/wallet.json
```

## Current Status
- ✅ Splash screen with beautiful fallback animation
- ❌ wallet.lottie (not supported by React Native)
- ⏳ wallet.json (needed for your custom animation)

The app currently shows a beautiful custom wallet animation as a fallback. Once you convert your file to JSON format, it will use your custom Lottie animation instead.