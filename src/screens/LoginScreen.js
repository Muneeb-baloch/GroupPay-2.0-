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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import { authStyles } from '../styles/authStyles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    startSpinning();

    // Simulate API call
    setTimeout(() => {
      // Hardcoded credentials: admin/admin
      if (formData.username.toLowerCase() === 'admin' && formData.password === 'admin') {
        stopSpinning();
        setLoading(false);
        // Use auth context to login
        login();
      } else {
        stopSpinning();
        setLoading(false);
        Alert.alert('Login Failed', 'Invalid email or password. Try: admin/admin');
      }
    }, 1500);
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
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

            {/* Welcome Text */}
            <Text style={authStyles.welcomeTitle}>Welcome Back</Text>
            <Text style={authStyles.welcomeSubtitle}>
              Sign in to continue managing your group payments
            </Text>
          </View>

          {/* Form Section */}
          <View style={authStyles.formContainer}>
            {/* Email Field */}
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Email</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  keyboardType="email-address"
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity 
              style={authStyles.forgotPassword} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={authStyles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={authStyles.loginButton}
              onPress={handleLogin}
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
                    <Text style={authStyles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={authStyles.divider}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>or</Text>
              <View style={authStyles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
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
            <Text style={authStyles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToSignup} activeOpacity={0.7}>
              <Text style={authStyles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;