import { StyleSheet } from 'react-native';

export const verifyEmailStyles = StyleSheet.create({
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
