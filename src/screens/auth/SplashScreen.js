import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { splashStyles as styles } from '../../styles/auth/splashStyles';

const SplashScreen = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const walletTranslateY = useRef(new Animated.Value(50)).current;
  const walletRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(-200)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  const floatingDot1 = useRef(new Animated.Value(0)).current;
  const floatingDot2 = useRef(new Animated.Value(0)).current;
  const floatingDot3 = useRef(new Animated.Value(0)).current;
  const floatingDot4 = useRef(new Animated.Value(0)).current;

  const backgroundCircle1 = useRef(new Animated.Value(0)).current;
  const backgroundCircle2 = useRef(new Animated.Value(0)).current;
  const backgroundCircle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimationSequence();

    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (typeof onFinish === 'function') {
          onFinish();
        }
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const startAnimationSequence = () => {
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

    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

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

  const walletRotateInterpolate = walletRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatingDot1Y = floatingDot1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const floatingDot2Y = floatingDot2.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const floatingDot3Y = floatingDot3.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const floatingDot4Y = floatingDot4.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });

  const backgroundCircle1Scale = backgroundCircle1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const backgroundCircle2Scale = backgroundCircle2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const backgroundCircle3Scale = backgroundCircle3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
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
                source={require('../../../assets/logos/main_wallet_logo.png')}
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

export default SplashScreen;
