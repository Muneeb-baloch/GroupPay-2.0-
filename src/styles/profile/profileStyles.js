import { StyleSheet } from 'react-native';

export const getProfileStyles = (colors) => StyleSheet.create({
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: colors.primaryBorder,
  },
  miniSpinner: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  avatarName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },

  // Field rows
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  fieldIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  fieldValueReadOnly: { fontSize: 15, color: colors.text, fontWeight: '500' },
  fieldInput: {
    fontSize: 15, color: colors.inputText, fontWeight: '500',
    paddingVertical: 0,
  },

  // Save button
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  saveButtonText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spinner: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },

  // Settings rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingText: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  toggleTrack: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: colors.skeleton,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleTrackActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
});

