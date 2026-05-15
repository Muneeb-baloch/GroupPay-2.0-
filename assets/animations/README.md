# Animations Folder

This folder contains Lottie animation files for the GroupPay app.

## 📁 **Place Your Lottie Files Here:**

### **Splash Screen Animation:**
- `splash-loading.json` - Main splash screen loading animation
- `logo-animation.json` - Animated logo for splash
- `wallet-animation.json` - Wallet-related animations

### **Loading Animations:**
- `button-loading.json` - Button loading states
- `page-loading.json` - Page transition loading
- `success-animation.json` - Success confirmations

### **UI Animations:**
- `empty-state.json` - Empty state illustrations
- `error-animation.json` - Error state animations
- `celebration.json` - Success celebrations

## 🎯 **Usage in Code:**

```javascript
import LottieView from 'lottie-react-native';

// Use your animation
<LottieView
  source={require('../assets/animations/splash-loading.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>
```

## 📱 **Recommended Animation Specs:**

- **Format**: JSON (exported from After Effects)
- **Size**: Keep under 500KB for performance
- **Dimensions**: Design for 375x812 (iPhone X) as base
- **Duration**: 2-3 seconds for splash, 1-2 seconds for UI
- **Colors**: Match your app theme (#06b6d4 cyan)

## 🎨 **Animation Guidelines:**

1. **Splash Screen**: 2-3 second loop, smooth and professional
2. **Loading States**: Subtle, 1-2 second loops
3. **Success/Error**: One-time animations, 1-2 seconds
4. **Empty States**: Gentle loops, engaging but not distracting

---

**📥 PLACE YOUR DOWNLOADED LOTTIE FILE HERE:**
Drop your `splash-loading.json` (or whatever you named it) directly in this folder!