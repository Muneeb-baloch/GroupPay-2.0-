import { StyleSheet } from 'react-native';

export const getTransactionsStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.headerBg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  groupInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  groupIndicator: { width: 3, height: 12, borderRadius: 2 },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberCount: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surfaceAlt, padding: 8, borderRadius: 8,
  },
  memberCountText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  headerAction: { padding: 8, borderRadius: 8, backgroundColor: colors.surfaceAlt },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  itemSeparator: { height: 12 },

  // Balance Card
  balanceCard: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  balanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  balanceTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceHeaderText: { fontSize: 16, fontWeight: '700', color: colors.text },
  computedLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', fontStyle: 'italic' },
  balanceGrid: { flexDirection: 'row', gap: 8 },
  balanceItem: {
    flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, minHeight: 72,
  },
  balanceItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  balanceLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', flexShrink: 1 },
  creditAmount: { fontSize: 13, fontWeight: '800', color: '#10b981', letterSpacing: -0.3 },
  debitAmount:  { fontSize: 13, fontWeight: '800', color: '#ef4444', letterSpacing: -0.3 },
  netAmount:    { fontSize: 13, fontWeight: '800', letterSpacing: -0.3 },

  // Filter chips
  filterScrollView: { marginBottom: 12 },
  filterScrollContainer: { paddingHorizontal: 0, gap: 10 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: colors.surfaceAlt, borderRadius: 20,
    borderWidth: 1, borderColor: colors.cardBorderMedium, gap: 6, marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.primary, borderColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  activeFilterChipText: { color: '#ffffff' },
  filterChipBadge: {
    backgroundColor: colors.skeleton, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2, minWidth: 18, alignItems: 'center',
  },
  activeFilterChipBadge: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterChipBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  activeFilterChipBadgeText: { color: '#ffffff' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  transactionCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  // Transaction card
  transactionCard: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  transactionCardPressed: { transform: [{ scale: 0.98 }] },
  transactionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transactionIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  transactionInfo: { flex: 1, marginRight: 12 },
  transactionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  transactionCategory: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  amountContainer: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusIndicator: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
  transactionDetails: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: colors.surfaceAlt, borderRadius: 8, marginBottom: 12,
  },
  detailsLeft: { flex: 1 },
  detailsRight: { alignItems: 'flex-end' },
  transactionDate: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  locationText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  splitLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  splitAmount: { fontSize: 14, fontWeight: '700', color: colors.primary },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  typeTag: {
    backgroundColor: colors.labelBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  typeText: { fontSize: 11, color: colors.labelText, fontWeight: '700' },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.primaryLight, borderRadius: 8,
  },
  actionButtonText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceAlt, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  clearFilterButton: {
    backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  clearFilterText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});

