import React, { useState, useRef } from 'react';
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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Loading animation
  const spinValue = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  // Start spinning animation
  const startSpinning = () => {
    // Fade in the spinner
    Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Start continuous spinning
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // Stop spinning animation
  const stopSpinning = () => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
    
    Animated.timing(loadingOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Spin interpolation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.username.trim() || formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    startSpinning();

    // Simulate API call
    setTimeout(() => {
      stopSpinning();
      setLoading(false);
      Alert.alert(
        'Success!', 
        'Account created successfully. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }, 2000);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#f8fffe', '#ecfeff', '#cffafe']}
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

            {/* Logo/Icon */}
            <View style={authStyles.logoContainer}>
              <View style={authStyles.logoWrapper}>
                <Image 
                  source={require('../../assets/logos/main_wallet_logo.png')}
                  style={authStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Welcome Text */}
            <Text style={authStyles.welcomeTitle}>Create Account</Text>
            <Text style={authStyles.welcomeSubtitle}>
              Join GroupPay and start managing group payments easily
            </Text>
          </View>

          {/* Form Section */}
          <View style={authStyles.formContainer}>
            {/* Full Name Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Full Name</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Email Address</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Username Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Username</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="at-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Choose a username"
                  placeholderTextColor="#9ca3af"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Password</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={authStyles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Confirm Password</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={authStyles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={authStyles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[authStyles.checkbox, acceptTerms && authStyles.checkboxChecked]}>
                {acceptTerms && <Ionicons name="checkmark" size={16} color="#ffffff" />}
              </View>
              <Text style={authStyles.termsText}>
                I agree to the{' '}
                <Text style={authStyles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={authStyles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
              style={authStyles.loginButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={authStyles.loginButtonGradient}
              >
                {loading ? (
                  <View style={authStyles.loadingContainer}>
                    <Animated.View 
                      style={[
                        authStyles.loadingSpinner,
                        {
                          opacity: loadingOpacity,
                          transform: [{ rotate: spin }]
                        }
                      ]} 
                    />
                    <Text style={authStyles.loginButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.loginButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={authStyles.divider}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>or</Text>
              <View style={authStyles.dividerLine} />
            </View>

            {/* Social Signup Buttons */}
            <View style={authStyles.socialContainer}>
              <TouchableOpacity 
                style={[authStyles.socialButton, authStyles.socialButtonGoogle]} 
                activeOpacity={0.8}
              >
                <View style={authStyles.googleIcon}>
                  <Text style={authStyles.googleG}>G</Text>
                </View>
                <Text style={[authStyles.socialButtonText, authStyles.socialButtonTextGoogle]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[authStyles.socialButton, authStyles.socialButtonApple]} 
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={[authStyles.socialButtonText, authStyles.socialButtonTextApple]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={authStyles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;