# 🎬 How to Add Your Lottie Animation

## 📁 **Current Status:**
- ✅ You have `Revenue.lottie` in `assets/illustrations/`
- ❌ React Native needs `.json` format, not `.lottie`

## 🔄 **Convert Your Animation:**

### **Method 1: LottieFiles Website**
1. Go to [lottiefiles.com](https://lottiefiles.com)
2. Click "Upload" and select your `Revenue.lottie` file
3. Once uploaded, click "Download" 
4. Choose "Lottie JSON" format
5. Save as `Revenue.json`
6. Place it in this folder (`assets/animations/`)

### **Method 2: After Effects (if you have the source)**
1. Open your animation in After Effects
2. Go to Window → Extensions → Bodymovin
3. Select your composition
4. Set destination to this folder
5. Click "Render" to export as JSON

## 🚀 **Update the Code:**

Once you have `Revenue.json` in this folder, update `SplashScreen.js`:

```javascript
// Replace the temporary animation with:
<LottieView
  ref={animationRef}
  source={require('../../assets/animations/Revenue.json')}
  autoPlay
  loop
  style={styles.lottieAnimation}
/>
```

## 📱 **Current Fallback:**
The app now shows a beautiful loading animation with:
- Pulsing circle with rupee symbol (₹)
- Loading dots
- Matches your app's cyan theme

This will work perfectly until you add your Lottie JSON file!

---
**💡 Tip:** The `.lottie` format is newer and more compressed, but React Native still primarily supports the older `.json` format.