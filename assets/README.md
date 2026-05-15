# GroupPay Assets

This folder contains all the assets used in the GroupPay application.

## Folder Structure

### 📱 **Root Assets** (Current Expo defaults)
- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon
- `splash-icon.png` - Splash screen icon

### 🎯 **icons/** 
Place custom icons and UI elements here:
- Navigation icons
- Action buttons icons
- Status indicators
- Custom UI icons

### 🖼️ **images/**
Place general images here:
- Background images
- Profile pictures
- Card images
- General UI images

### 🏷️ **logos/**
Place brand logos and branding assets here:
- GroupPay logo variations
- Partner logos
- Brand elements

### 🎨 **illustrations/**
Place illustrations and graphics here:
- Empty state illustrations
- Onboarding graphics
- Feature illustrations
- Decorative elements

## App Icon Guidelines

### Main App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Design**: Should represent GroupPay's brand
- **Colors**: Use your app's primary colors (#06b6d4 cyan theme)

### Suggested Icon Concept
For GroupPay, consider an icon that combines:
- 💰 Wallet/Money symbol
- 👥 Group/People element
- 🔄 Exchange/Transfer element

### Icon Sizes Needed
- **iOS**: 1024x1024 (App Store), 180x180 (iPhone), 167x167 (iPad Pro), 152x152 (iPad), 120x120 (iPhone)
- **Android**: 1024x1024 (Play Store), 192x192 (xxxhdpi), 144x144 (xxhdpi), 96x96 (xhdpi), 72x72 (hdpi), 48x48 (mdpi)

## Usage in Code

```javascript
// Import assets in your React Native components
import AppIcon from '../assets/icons/app-icon.png';
import Logo from '../assets/logos/grouppay-logo.png';

// Use in Image component
<Image source={AppIcon} style={styles.icon} />
```

## Asset Optimization

- **PNG**: For icons with transparency
- **JPG**: For photos and complex images
- **SVG**: For scalable vector graphics (with react-native-svg)
- **WebP**: For optimized web images

## Tools for Icon Creation

- **Figma**: Free design tool
- **Canva**: Easy icon creation
- **Adobe Illustrator**: Professional vector graphics
- **Sketch**: Mac-only design tool
- **Icon generators**: Online tools for app icon generation

---

**Note**: Replace the default Expo icons with your custom GroupPay branding for a professional look!