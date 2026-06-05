import { StyleSheet } from 'react-native';

export const getHomeScreenStyles = (colors) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bottomPadding: {
    height: 20,
  },

  // ── Section wrapper ────────────────────────────────────────────────────────
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  // ── Section header (title + View All) ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Create Expense / Split Bill button ─────────────────────────────────────
  splitBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  splitBillButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Skeleton loading styles
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  skeletonIndicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.skeleton,
  },
  skeletonTitle: {
    flex: 1,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.skeleton,
  },
  skeletonBadge: {
    width: 60,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.skeleton,
  },
  skeletonBalance: {
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.skeleton,
  },

  // Empty State
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyFavoritesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyFavoritesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptyFavoritesSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  browseGroupsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  browseGroupsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },

  // recentCard used by SkeletonRow in HomeScreen
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
