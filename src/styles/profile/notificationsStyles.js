import { StyleSheet } from 'react-native';

export const getNotificationsStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, flexGrow: 1 },

  listHeader: { marginBottom: 4 },
  markAllButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 8, marginBottom: 8,
  },
  markAllText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Notification card
  notifCard: {
    backgroundColor: colors.card,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 3 },
  notifTitleUnread: { color: colors.text, fontWeight: '700' },
  notifMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  inviteMetaText: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 6 },
  inviteStatusText: { fontSize: 12, color: '#16a34a', fontWeight: '700', marginBottom: 6 },
  inviteActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inviteActionButton: {
    minWidth: 92,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  declineButton: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButtonText: { fontSize: 13, fontWeight: '700', color: colors.error },
  acceptButtonText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  notifTime: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  // Empty state
  emptyContainer: {
    flex: 1, alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 32,
  },
  emptyIconOuter: {
    width: 120, height: 120,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, position: 'relative',
  },
  emptyIconInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primaryBorder,
    zIndex: 1,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  ring1: { width: 100, height: 100 },
  ring2: { width: 120, height: 120 },
  emptyTitle: {
    fontSize: 22, fontWeight: '800', color: colors.text,
    marginBottom: 10, letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 32,
  },
  emptyFeatures: { width: '100%', gap: 12 },
  emptyFeatureItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12, padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  emptyFeatureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyFeatureText: { fontSize: 14, fontWeight: '600', color: colors.labelText },
});

