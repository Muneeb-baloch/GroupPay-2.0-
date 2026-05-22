import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const walletTranslateY = useRef(new Animated.Value(50)).current;
  const walletRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  // Progress tracking via clean Native Driver TranslateX
  const progressAnim = useRef(new Animated.Value(-200)).current;
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
    startAnimationSequence();

    const timer = setTimeout(() => {
      // Fade out and immediately call onFinish without delay
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Call onFinish immediately when fade completes
        if (typeof onFinish === 'function') {
          onFinish();
        }
      });
    }, 3200); // Reduced from 3500 to 3200

    return () => clearTimeout(timer);
  }, [onFinish]);

  const startAnimationSequence = () => {
    // 1. Logo entrance animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.1),
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
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(walletRotate, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 250);

    // 3. Title animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 750);

    // 4. Loading section & Progress loading
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Move progress fill smoothly across the absolute container track natively
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 1100);

    startContinuousAnimations();
    startBackgroundAnimations();
  };

  const startContinuousAnimations = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const createFloatingAnimation = (animatedValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatingAnimation(floatingDot1, 0).start();
    createFloatingAnimation(floatingDot2, 400).start();
    createFloatingAnimation(floatingDot3, 800).start();
    createFloatingAnimation(floatingDot4, 1200).start();
  };

  const startBackgroundAnimations = () => {
    const createBackgroundAnimation = (animatedValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createBackgroundAnimation(backgroundCircle1, 0).start();
    createBackgroundAnimation(backgroundCircle2, 800).start();
    createBackgroundAnimation(backgroundCircle3, 1600).start();
  };

  // Rotation interpolations
  const walletRotateInterpolate = walletRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Dynamic float and scale configurations
  const floatingDot1Y = floatingDot1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const floatingDot2Y = floatingDot2.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const floatingDot3Y = floatingDot3.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const floatingDot4Y = floatingDot4.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });

  const backgroundCircle1Scale = backgroundCircle1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const backgroundCircle2Scale = backgroundCircle2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const backgroundCircle3Scale = backgroundCircle3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Non-translucent status bar to safeguard viewport boundaries */}
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />

      <LinearGradient
        colors={['#0891b2', '#06b6d4', '#cffafe']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Elements */}
        <View style={styles.backgroundElements}>
          <Animated.View
            style={[
              styles.circle, styles.circle1,
              {
                transform: [{ scale: backgroundCircle1Scale }],
                opacity: backgroundCircle1.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.12] }),
              }
            ]}
          />
          <Animated.View
            style={[
              styles.circle, styles.circle2,
              {
                transform: [{ scale: backgroundCircle2Scale }],
                opacity: backgroundCircle2.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.09] }),
              }
            ]}
          />
          <Animated.View
            style={[
              styles.circle, styles.circle3,
              {
                transform: [{ scale: backgroundCircle3Scale }],
                opacity: backgroundCircle3.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
              }
            ]}
          />
        </View>

        {/* Content Box */}
        <View style={styles.content}>

          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logos/main_wallet_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Icon/Coin Animations */}
          <Animated.View style={[styles.animationContainer, { opacity: logoOpacity, transform: [{ translateY: walletTranslateY }] }]}>
            <View style={styles.walletAnimationContainer}>
              <Animated.View style={[styles.walletIcon, { transform: [{ rotate: walletRotateInterpolate }] }]}>
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

              <Animated.View style={[styles.paymentSymbol, styles.symbol1, { transform: [{ translateY: floatingDot1Y }, { rotate: '15deg' }] }]}>
                <Text style={styles.symbolText}>PKR</Text>
              </Animated.View>

              <Animated.View style={[styles.paymentSymbol, styles.symbol2, { transform: [{ translateY: floatingDot2Y }, { rotate: '-15deg' }] }]}>
                <Text style={styles.symbolText}>$</Text>
              </Animated.View>

              <Animated.View style={[styles.paymentSymbol, styles.symbol3, { transform: [{ translateY: floatingDot3Y }, { rotate: '20deg' }] }]}>
                <Text style={styles.symbolText}>€</Text>
              </Animated.View>
            </View>

            <View style={styles.floatingElements}>
              <Animated.View style={[styles.floatingDot, styles.floatingDot1, { transform: [{ translateY: floatingDot1Y }] }]} />
              <Animated.View style={[styles.floatingDot, styles.floatingDot2, { transform: [{ translateY: floatingDot2Y }] }]} />
              <Animated.View style={[styles.floatingDot, styles.floatingDot3, { transform: [{ translateY: floatingDot3Y }] }]} />
              <Animated.View style={[styles.floatingDot, styles.floatingDot4, { transform: [{ translateY: floatingDot4Y }] }]} />
            </View>
          </Animated.View>

          {/* Titles */}
          <Animated.View style={[styles.titleContainer, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
            <Text style={styles.appTitle}>GroupPay</Text>
            <Text style={styles.appSubtitle}>Split. Track. Settle.</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.taglineDot} />
              <Text style={styles.taglineText}>Simplifying Group Payments</Text>
              <View style={styles.taglineDot} />
            </View>
          </Animated.View>

          {/* Loader indicator bar */}
          <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
            <View style={styles.loadingTextContainer}>
              <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spinInterpolate }] }]} />
              <Text style={styles.loadingText}>Loading your wallet...</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                {/* FIXED: Shift view position natively instead of modifying layout constraints directly */}
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      transform: [
                        { translateX: progressAnim }
                      ]
                    }
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        </View>

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
    ...StyleSheet.absoluteFillObject, // Changed to absolute positioning for overlay
    flex: 1,
    backgroundColor: '#0891b2', // Solid background fallback to keep transition smooth
    zIndex: 9999, // Ensure it's on top
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 240,
    height: 240,
    top: -60,
    right: -60,
  },
  circle2: {
    width: 180,
    height: 180,
    bottom: 120,
    left: -40,
  },
  circle3: {
    width: 120,
    height: 120,
    top: '42%',
    right: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    marginBottom: 25,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  animationContainer: {
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    width: '100%',
  },
  walletAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 160,
    position: 'relative',
  },
  walletIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  walletBody: {
    width: 84,
    height: 62,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  walletTop: {
    width: '100%',
    height: 10,
    backgroundColor: '#06b6d4',
  },
  walletCards: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    gap: 4,
  },
  card: {
    height: 6,
    borderRadius: 2,
  },
  card1: { backgroundColor: '#06b6d4', width: '85%' },
  card2: { backgroundColor: '#0ea5e9', width: '65%' },
  card3: { backgroundColor: '#0891b2', width: '75%' },
  walletShadow: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    marginTop: 8,
  },
  paymentSymbol: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  symbol1: { top: 10, left: 10 },
  symbol2: { top: 25, right: 10 },
  symbol3: { bottom: 20, left: 15 },
  symbolText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  floatingElements: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  floatingDot1: { width: 6, height: 6, top: 20, left: 30 },
  floatingDot2: { width: 8, height: 8, top: 40, right: 35 },
  floatingDot3: { width: 5, height: 5, bottom: 30, left: 40 },
  floatingDot4: { width: 7, height: 7, bottom: 15, right: 45 },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  taglineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    height: 60,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  loadingSpinner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderTopColor: '#ffffff',
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  progressContainer: {
    width: 200,
    height: 4,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: 200,
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default SplashScreen;