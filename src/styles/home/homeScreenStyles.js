// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen Layout Styles
// Covers the overall screen layout, section wrappers, and section headers.
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fffe',
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
    color: '#0f172a',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
  },

  // ── Create Expense / Split Bill button at bottom of Expenses section ───────
  splitBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
    gap: 8,
    shadowColor: '#06b6d4',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    backgroundColor: '#e2e8f0',
  },
  skeletonTitle: {
    flex: 1,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  skeletonBadge: {
    width: 60,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  skeletonBalance: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
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
    backgroundColor: '#e2e8f0',
  },

  // Empty State
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
