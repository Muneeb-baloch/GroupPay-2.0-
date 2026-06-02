// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Loading Styles
// Used while favourite groups are being fetched from the API.
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet } from 'react-native';

export const skeletonStyles = StyleSheet.create({
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
});
