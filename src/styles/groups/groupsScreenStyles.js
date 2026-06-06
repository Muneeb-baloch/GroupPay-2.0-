import { StyleSheet } from 'react-native';

export const getGroupsScreenStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100, // Account for bottom tab
  },
  itemSeparator: {
    height: 12,
  },
  listFooter: {
    height: 20,
  },
  
  // Header Styles
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Filter Chips - Simplified
  filterSection: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderMedium,
  },
  activeFilterChip: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeChipText: {
    color: '#ffffff',
  },
  chipBadge: {
    backgroundColor: colors.skeleton,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeChipBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeChipBadgeText: {
    color: '#ffffff',
  },

  // Group Card Styles - More Compact
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

  // Card Header - Compact
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // Reduced from 16
  },
  groupMainInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  groupIndicator: {
    width: 3, // Reduced from 4
    height: 16, // Reduced from 20
    borderRadius: 2,
    marginRight: 10, // Reduced from 12
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
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 3, // Reduced from 4
    borderRadius: 6, // Reduced from 8
    marginLeft: 8,
  },
  statusDot: {
    width: 5, // Reduced from 6
    height: 5, // Reduced from 6
    borderRadius: 3,
    marginRight: 4, // Reduced from 6
  },
  statusText: {
    fontSize: 11, // Reduced from 12
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
    gap: 3, // Reduced from 4
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

  // Balance Section - No Borders, More Compact
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
    fontSize: 20, // Reduced from 24
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  membersInfo: {
    alignItems: 'flex-end',
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Reduced from 6
    marginBottom: 6, // Reduced from 8
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
    marginLeft: -10, // Reduced from -12
  },
  avatarText: {
    fontSize: 11, // Reduced from 12
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarMore: {
    backgroundColor: '#64748b',
  },
  avatarMoreText: {
    fontSize: 9, // Reduced from 10
    fontWeight: '700',
    color: '#ffffff',
  },

  // Actions Section - More Compact
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6, // Reduced from 8
  },
  actionIconContainer: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
    borderRadius: 18, // Reduced from 22
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // Reduced from 8
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Empty State - Clean simple design
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonIndicator: {
    width: 4,
    height: 20,
    backgroundColor: colors.skeleton,
    borderRadius: 2,
    marginRight: 12,
  },
  skeletonTitle: {
    flex: 1,
    height: 20,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
    marginRight: 12,
  },
  skeletonStatus: {
    width: 60,
    height: 16,
    backgroundColor: colors.skeleton,
    borderRadius: 8,
  },
  skeletonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonRole: {
    width: 80,
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  skeletonActivity: {
    width: 100,
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  skeletonBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  skeletonBalanceLabel: {
    width: 80,
    height: 14,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  skeletonBalanceAmount: {
    width: 100,
    height: 24,
    backgroundColor: colors.skeleton,
    borderRadius: 4,
  },
  skeletonAvatars: {
    flexDirection: 'row',
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
  },
  skeletonAvatarOverlap: {
    marginLeft: -12,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonAction: {
    width: 60,
    height: 60,
    backgroundColor: colors.skeleton,
    borderRadius: 30,
  },
});

