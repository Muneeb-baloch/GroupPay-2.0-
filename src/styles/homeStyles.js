import { StyleSheet } from 'react-native';

export const getHomeStyles = (colors) => StyleSheet.create({
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

  // Section wrapper
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  // Section Header
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

  // Group Card Styles
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  groupCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupMainInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupIndicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
    marginRight: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  groupMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lastActivity: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    marginLeft: 8,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  membersInfo: {
    alignItems: 'flex-end',
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  membersText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarMore: {
    backgroundColor: colors.textSecondary,
  },
  avatarMoreText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
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

  // Recent Cards (Scenes & Expenses)
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recentCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  recentCardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  recentCardDot: {
    fontSize: 12,
    color: colors.skeleton,
  },
  recentCardRight: {
    alignItems: 'flex-end',
  },
  recentCardAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  recentCardShare: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Category badge for expenses
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseType: {
    fontSize: 11,
    fontWeight: '600',
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

  // Split Bill / Create Expense Button
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
});
