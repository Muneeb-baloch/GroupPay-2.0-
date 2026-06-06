import { StyleSheet } from 'react-native';

export const getPillSelectorStyles = (colors) => StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorderMedium,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 42,
  },
  segmentedPill: {
    flex: 1,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedPillActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedText: {
    textAlign: 'center',
    fontSize: 12.5,
  },
  textActive: {
    color: '#ffffff',
  },
  segmentedTextActive: {
    color: '#ffffff',
  },
  countBubble: {
    marginLeft: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBubbleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  countTextActive: {
    color: '#ffffff',
  },
});
