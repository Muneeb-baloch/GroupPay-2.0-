import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const getReceiptViewStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  headerBtn: {
    padding: 8, borderRadius: 8, backgroundColor: colors.inputBg,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  imageBox: {
    width: '100%', height: 280, backgroundColor: colors.card,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    marginBottom: 20, alignItems: 'center', justifyContent: 'center',
  },
  receiptImage: { width: '100%', height: '100%' },
  zoomBadge: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 12,
  },
  zoomText: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  noReceiptBox: {
    width: '100%', height: 140, backgroundColor: colors.surfaceAlt,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, gap: 8,
  },
  noReceiptText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  summaryBlock: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 10, padding: 12 },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', width: 68 },
  detailValue: { fontSize: 13, color: colors.text, fontWeight: '600', flex: 1 },
  myExpenseGrid: { flexDirection: 'row', marginBottom: 14 },
  expenseBlock: { flex: 1, alignItems: 'center' },
  expenseDivider: { width: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
  expenseBlockLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  expenseBlockValue: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  statusPillText: { fontSize: 13, fontWeight: '600' },
  participantRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  participantInfo: { flex: 1 },
  participantName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  participantSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  participantRight: { alignItems: 'flex-end', gap: 4 },
  participantBalance: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  fsContainer: { flex: 1, backgroundColor: colors.card },
  fsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  fsImageContainer: {
    flex: 1, backgroundColor: colors.inputBg,
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  fsImage: {
    width: SCREEN_W - 32,
    height: SCREEN_H - 160,
  },
});
