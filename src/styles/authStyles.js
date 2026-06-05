import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getAuthStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    position: 'absolute',
    top: -15,
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoWrapper: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  logoImage: {
    width: 55,
    height: 55,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    fontWeight: '500',
  },

  // Form Section
  formContainer: {
    flex: 1,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.inputText,
    fontWeight: '500',
    paddingVertical: 0,
    height: 20,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Terms and Conditions
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRightColor: '#ffffff',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: 20,
    fontWeight: '500',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
  },

  // Social Buttons
  socialContainer: {
    gap: 12,
    marginBottom: 22,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.cardBorderMedium,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 48,
  },
  socialButtonGoogle: {
    borderColor: colors.cardBorderMedium,
    backgroundColor: colors.surface,
  },
  socialButtonApple: {
    borderColor: colors.isDark ? colors.cardBorderMedium : '#000000',
    backgroundColor: colors.surface,
  },
  socialButtonIcon: {
    width: 20,
    height: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  socialButtonTextGoogle: {
    color: colors.text,
  },
  socialButtonTextApple: {
    color: colors.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },

  // Help Container
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    gap: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  helpLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
