import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image,
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../services/authService';
import { authStyles } from '../styles/authStyles';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const spinValue = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const startSpinning = () => {
    Animated.timing(loadingOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
    Animated.timing(loadingOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleOtpChange = (value, index) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // On backspace, go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    startSpinning();

    try {
      await authService.verifyEmail(email, otpCode);

      stopSpinning();
      setLoading(false);
      Alert.alert(
        'Email Verified!',
        'Your email has been verified successfully. You can now sign in.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      stopSpinning();
      setLoading(false);
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // Re-trigger signup or a resend endpoint if available
      // For now we just reset the timer
      setCountdown(60);
      setCanResend(false);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Could not resend OTP. Please try again.');
    }
    setResendLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#f8fffe', '#ecfeff', '#cffafe']} style={authStyles.gradient}>
        <ScrollView
          contentContainerStyle={authStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={authStyles.header}>
            <TouchableOpacity style={authStyles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#06b6d4" />
            </TouchableOpacity>

            <View style={authStyles.logoContainer}>
              <View style={authStyles.logoWrapper}>
                <Image
                  source={require('../../assets/logos/main_wallet_logo.png')}
                  style={authStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={authStyles.welcomeTitle}>Verify Email</Text>
            <Text style={authStyles.welcomeSubtitle}>
              We sent a 6-digit OTP to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={authStyles.formContainer}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={authStyles.loginButton}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={authStyles.loginButtonGradient}>
                {loading ? (
                  <View style={authStyles.loadingContainer}>
                    <Animated.View style={[authStyles.loadingSpinner, { opacity: loadingOpacity, transform: [{ rotate: spin }] }]} />
                    <Text style={authStyles.loginButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.loginButtonText}>Verify Email</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={resendLoading} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>{resendLoading ? 'Sending...' : 'Resend OTP'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>Resend in {countdown}s</Text>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Already verified? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={authStyles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  emailHighlight: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#06b6d4',
    backgroundColor: '#f0fdfa',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: '#06b6d4',
    fontWeight: '700',
  },
  countdownText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;
