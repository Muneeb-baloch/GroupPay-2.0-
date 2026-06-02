// ─────────────────────────────────────────────────────────────────────────────
// FavoriteGroupCard Styles
// Used by: src/components/home/FavoriteGroupCard.js
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet } from 'react-native';

export const favoriteGroupCardStyles = StyleSheet.create({
  // ── Card container ─────────────────────────────────────────────────────────
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  groupCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },

  // ── Card header (name + status + star) ────────────────────────────────────
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
    color: '#0f172a',
    flex: 1,
    letterSpacing: -0.3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    color: '#6b7280',
  },
  lastActivity: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    marginLeft: 8,
  },

  // ── Balance section ────────────────────────────────────────────────────────
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
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
    color: '#64748b',
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
    borderColor: '#ffffff',
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
    backgroundColor: '#64748b',
  },
  avatarMoreText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },

  // ── Quick actions row ──────────────────────────────────────────────────────
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
    color: '#374151',
    textAlign: 'center',
  },

  // ── Empty state (no favourites) ────────────────────────────────────────────
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyFavoritesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyFavoritesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyFavoritesSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  browseGroupsButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  browseGroupsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
