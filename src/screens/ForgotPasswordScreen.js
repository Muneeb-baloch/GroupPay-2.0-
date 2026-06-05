import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getAuthStyles } from '../styles/authStyles';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const authStyles = useMemo(() => getAuthStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setLoading(false);
      // Navigate to reset password screen with email
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Could not send reset link. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={isDark ? [colors.background, colors.surface, colors.background] : ['#f8fffe', '#ecfeff', '#cffafe']}
        style={authStyles.gradient}
      >
        <ScrollView 
          contentContainerStyle={authStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={authStyles.header}>
            {/* Back Button */}
            <TouchableOpacity 
              style={authStyles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#06b6d4" />
            </TouchableOpacity>

            {/* Logo */}
            <View style={authStyles.logoContainer}>
              <View style={authStyles.logoWrapper}>
                <Image 
                  source={require('../../assets/logos/main_wallet_logo.png')}
                  style={authStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title Text */}
            <Text style={authStyles.welcomeTitle}>Forgot Password?</Text>
            <Text style={authStyles.welcomeSubtitle}>
              No worries! Enter your email address and we'll send you a reset link
            </Text>
          </View>

          {/* Form Section */}
          <View style={authStyles.formContainer}>
            {/* Email Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Email Address</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[authStyles.loginButton, loading && authStyles.loginButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#9ca3af', '#6b7280'] : ['#06b6d4', '#0891b2']}
                style={authStyles.loginButtonGradient}
              >
                {loading ? (
                  <View style={authStyles.loadingContainer}>
                    <View style={authStyles.loadingSpinner} />
                    <Text style={authStyles.loginButtonText}>Sending Reset Link...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.loginButtonText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Help Text */}
            <View style={authStyles.helpContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#64748b" />
              <Text style={authStyles.helpText}>
                Remember your password?{' '}
                <Text 
                  style={authStyles.helpLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Need more help? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={authStyles.footerLink}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;