// ─────────────────────────────────────────────────────────────────────────────
// Recent Card Styles
// Shared by: RecentSceneCard.js and RecentExpenseCard.js
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet } from 'react-native';

export const recentCardStyles = StyleSheet.create({
  // ── Card container ─────────────────────────────────────────────────────────
  recentCard: {
    backgroundColor: '#ffffff',
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
    borderColor: '#f1f5f9',
  },

  // ── Left side (icon + info) ────────────────────────────────────────────────
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
    color: '#0f172a',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
  recentCardDot: {
    fontSize: 12,
    color: '#cbd5e1',
  },

  // ── Right side (amount) ────────────────────────────────────────────────────
  recentCardRight: {
    alignItems: 'flex-end',
  },
  recentCardAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  recentCardShare: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ── Expense-specific ───────────────────────────────────────────────────────
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
});
