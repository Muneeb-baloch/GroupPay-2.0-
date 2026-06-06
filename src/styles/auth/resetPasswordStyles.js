import { StyleSheet } from 'react-native';

export const resetPasswordStyles = StyleSheet.create({
  emailHighlight: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
});
