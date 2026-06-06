import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../../services/authService';
import { getAuthStyles } from '../../styles/authStyles';
import { resetPasswordStyles as styles } from '../../styles/auth/resetPasswordStyles';
import { useTheme } from '../../context/ThemeContext';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const authStyles = useMemo(() => getAuthStyles(colors), [colors]);
  const { email } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const spinValue = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

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
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleReset = async () => {
    const token = otp.join('');
    if (token.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your email');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    startSpinning();

    try {
      await authService.resetPassword(token, newPassword);

      stopSpinning();
      setLoading(false);
      Alert.alert(
        'Password Reset!',
        'Your password has been reset successfully.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      stopSpinning();
      setLoading(false);
      Alert.alert('Reset Failed', error.message || 'Invalid or expired code. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior="padding"
    >
      <LinearGradient colors={isDark ? [colors.background, colors.surface, colors.background] : ['#f8fffe', '#ecfeff', '#cffafe']} style={authStyles.gradient}>
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
                  source={require('../../../assets/logos/main_wallet_logo.png')}
                  style={authStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={authStyles.welcomeTitle}>Reset Password</Text>
            <Text style={authStyles.welcomeSubtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={authStyles.formContainer}>

            {/* OTP Input */}
            <Text style={styles.otpLabel}>Reset Code</Text>
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
                />
              ))}
            </View>

            {/* New Password */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>New Password</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={authStyles.eyeButton} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Confirm Password</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={authStyles.eyeButton} onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
                  <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={authStyles.loginButton}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={authStyles.loginButtonGradient}>
                {loading ? (
                  <View style={authStyles.loadingContainer}>
                    <Animated.View style={[authStyles.loadingSpinner, { opacity: loadingOpacity, transform: [{ rotate: spin }] }]} />
                    <Text style={authStyles.loginButtonText}>Resetting...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.loginButtonText}>Reset Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={authStyles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
