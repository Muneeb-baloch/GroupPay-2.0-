import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import LottieView from 'lottie-react-native'; // Uncomment when you have wallet.json

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const walletTranslateY = useRef(new Animated.Value(50)).current;
  const walletRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  
  // Floating dots animations
  const floatingDot1 = useRef(new Animated.Value(0)).current;
  const floatingDot2 = useRef(new Animated.Value(0)).current;
  const floatingDot3 = useRef(new Animated.Value(0)).current;
  const floatingDot4 = useRef(new Animated.Value(0)).current;
  
  // Background circles animations
  const backgroundCircle1 = useRef(new Animated.Value(0)).current;
  const backgroundCircle2 = useRef(new Animated.Value(0)).current;
  const backgroundCircle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations in sequence
    startAnimationSequence();
    
    // Auto-finish splash after animations complete with fade out
    const timer = setTimeout(() => {
      // Start fade out animation
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3500); // Start fade out 500ms earlier

    return () => clearTimeout(timer);
  }, [onFinish, fadeOut]);

  const startAnimationSequence = () => {
    // 1. Logo entrance animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Wallet animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(walletTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(walletRotate, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // 3. Title animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // 4. Loading section (delayed)
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Progress bar animation
      Animated.timing(progressWidth, {
        toValue: 100,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 1200);

    // 5. Continuous animations
    startContinuousAnimations();
    startBackgroundAnimations();
  };

  const startContinuousAnimations = () => {
    // Spinning loader
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating dots
    const createFloatingAnimation = (animatedValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatingAnimation(floatingDot1, 0).start();
    createFloatingAnimation(floatingDot2, 500).start();
    createFloatingAnimation(floatingDot3, 1000).start();
    createFloatingAnimation(floatingDot4, 1500).start();
  };

  const startBackgroundAnimations = () => {
    const createBackgroundAnimation = (animatedValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createBackgroundAnimation(backgroundCircle1, 0).start();
    createBackgroundAnimation(backgroundCircle2, 1000).start();
    createBackgroundAnimation(backgroundCircle3, 2000).start();
  };

  // Animation interpolations
  const walletRotateInterpolate = walletRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidthInterpolate = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Floating dots interpolations
  const floatingDot1Y = floatingDot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const floatingDot2Y = floatingDot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const floatingDot3Y = floatingDot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const floatingDot4Y = floatingDot4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  // Background circles interpolations
  const backgroundCircle1Scale = backgroundCircle1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const backgroundCircle2Scale = backgroundCircle2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const backgroundCircle3Scale = backgroundCircle3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0891b2', '#06b6d4', '#cffafe']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Decorative Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle1,
              {
                transform: [{ scale: backgroundCircle1Scale }],
                opacity: backgroundCircle1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.1],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle2,
              {
                transform: [{ scale: backgroundCircle2Scale }],
                opacity: backgroundCircle2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.08],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle3,
              {
                transform: [{ scale: backgroundCircle3Scale }],
                opacity: backgroundCircle3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.12],
                }),
              }
            ]} 
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }]
              }
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../../assets/logos/main_wallet_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Animation Section */}
          <Animated.View 
            style={[
              styles.animationContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: walletTranslateY }
                ]
              }
            ]}
          >
            {/* 
              YOUR WALLET LOTTIE ANIMATION:
              
              SOLUTION FOR .LOTTIE FILES:
              React Native's lottie-react-native only supports .json format, not .lottie files.
              
              CONVERSION OPTIONS:
              1. LottieFiles.com: Upload your wallet.lottie → Download as JSON
              2. After Effects: Re-export as Lottie JSON
              3. Online converters: Search "lottie to json converter"
              
              Once you have wallet.json, replace this section with:
              
              <LottieView
                source={require('../../assets/animations/wallet.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              
              And uncomment the LottieView import at the top.
            */}
            
            {/* Beautiful Wallet Animation (Temporary - Universal Currency Theme) */}
            <View style={styles.walletAnimationContainer}>
              <Animated.View 
                style={[
                  styles.walletIcon,
                  { transform: [{ rotate: walletRotateInterpolate }] }
                ]}
              >
                <View style={styles.walletBody}>
                  <View style={styles.walletTop} />
                  <View style={styles.walletCards}>
                    <View style={[styles.card, styles.card1]} />
                    <View style={[styles.card, styles.card2]} />
                    <View style={[styles.card, styles.card3]} />
                  </View>
                </View>
                <View style={styles.walletShadow} />
              </Animated.View>
              
              {/* Universal Payment Symbols floating around */}
              <Animated.View 
                style={[
                  styles.paymentSymbol,
                  styles.symbol1,
                  { transform: [{ translateY: floatingDot1Y }, { rotate: '45deg' }] }
                ]}
              >
                <Text style={styles.symbolText}>PKR</Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.paymentSymbol,
                  styles.symbol2,
                  { transform: [{ translateY: floatingDot2Y }, { rotate: '-30deg' }] }
                ]}
              >
                <Text style={styles.symbolText}>$</Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.paymentSymbol,
                  styles.symbol3,
                  { transform: [{ translateY: floatingDot3Y }, { rotate: '60deg' }] }
                ]}
              >
                <Text style={styles.symbolText}>€</Text>
              </Animated.View>
            </View>
            
            {/* Floating Elements */}
            <View style={styles.floatingElements}>
              <Animated.View 
                style={[
                  styles.floatingDot, 
                  styles.floatingDot1,
                  { transform: [{ translateY: floatingDot1Y }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.floatingDot, 
                  styles.floatingDot2,
                  { transform: [{ translateY: floatingDot2Y }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.floatingDot, 
                  styles.floatingDot3,
                  { transform: [{ translateY: floatingDot3Y }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.floatingDot, 
                  styles.floatingDot4,
                  { transform: [{ translateY: floatingDot4Y }] }
                ]} 
              />
            </View>
          </Animated.View>

          {/* App Title */}
          <Animated.View 
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }]
              }
            ]}
          >
            <Text style={styles.appTitle}>GroupPay</Text>
            <Text style={styles.appSubtitle}>Split. Track. Settle.</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.taglineDot} />
              <Text style={styles.taglineText}>Simplifying Group Payments</Text>
              <View style={styles.taglineDot} />
            </View>
          </Animated.View>

          {/* Loading Text */}
          <Animated.View 
            style={[
              styles.loadingContainer,
              { opacity: loadingOpacity }
            ]}
          >
            <View style={styles.loadingTextContainer}>
              <Animated.View 
                style={[
                  styles.loadingSpinner,
                  { transform: [{ rotate: spinInterpolate }] }
                ]}
              />
              <Text style={styles.loadingText}>Loading your wallet...</Text>
            </View>
            
            {/* Animated Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: progressWidthInterpolate }
                  ]} 
                />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by GroupPay</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Background Elements
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '40%',
    right: 20,
  },

  // Main Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // Logo Section
  logoContainer: {
    marginBottom: 40,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 80,
    height: 80,
  },

  // Animation Section
  animationContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
  },
  lottieAnimation: {
    width: 180,
    height: 180,
  },
  
  // Wallet Animation (Custom)
  walletAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    position: 'relative',
  },
  walletIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBody: {
    width: 80,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  walletTop: {
    width: '100%',
    height: 8,
    backgroundColor: '#06b6d4',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  walletCards: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  card: {
    height: 8,
    borderRadius: 2,
    marginVertical: 1,
  },
  card1: {
    backgroundColor: '#06b6d4', // Cyan - matches app theme
    width: '90%',
  },
  card2: {
    backgroundColor: '#0ea5e9', // Blue - matches app theme
    width: '75%',
  },
  card3: {
    backgroundColor: '#0891b2', // Darker cyan - matches app theme
    width: '85%',
  },
  walletShadow: {
    position: 'absolute',
    bottom: -8,
    left: 4,
    right: 4,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    transform: [{ scaleX: 0.8 }],
  },
  
  // Payment Symbols
  paymentSymbol: {
    position: 'absolute',
    minWidth: 36,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  symbol1: {
    top: 20,
    left: 20,
  },
  symbol2: {
    top: 40,
    right: 15,
  },
  symbol3: {
    bottom: 30,
    left: 25,
  },
  symbolText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Floating Elements (around Lottie)
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  floatingDot1: {
    width: 8,
    height: 8,
    top: 30,
    left: 20,
  },
  floatingDot2: {
    width: 12,
    height: 12,
    top: 50,
    right: 15,
  },
  floatingDot3: {
    width: 6,
    height: 6,
    bottom: 40,
    left: 25,
  },
  floatingDot4: {
    width: 10,
    height: 10,
    bottom: 20,
    right: 30,
  },

  // Title Section
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  taglineText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // Loading Section
  loadingContainer: {
    alignItems: 'center',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Progress Bar
  progressContainer: {
    marginTop: 20,
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
});

export default SplashScreen;