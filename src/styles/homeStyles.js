import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingBottom: 40, // Reduced since safe area is handled dynamically
    backgroundColor: '#f8fffe',
  },
  bottomPadding: {
    height: 20,
  },
});