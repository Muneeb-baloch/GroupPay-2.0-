import { StyleSheet } from 'react-native';

export const getSceneDetailStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header - Fixed to match other screens
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  editHeaderButton: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Same as other screens - Account for bottom tab
  },

  // Summary Card - Much more compact, no duplications
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  summaryHeader: {
    flexDirection: 'row',
    marginBottom: 16, // Reduced from 24
  },
  summaryLeft: {
    flex: 1,
    marginRight: 16, // Reduced from 20
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  shareLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  shareAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // Details Grid - More compact
  detailsGrid: {
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 10, // Reduced from 16
  },
  detailField: {
    flex: 1,
    marginRight: 16, // Reduced from 20
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Reduced from 6
    gap: 4, // Reduced from 6
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },

  // Description Section - Much more compact
  descriptionSection: {
    paddingTop: 12, // Reduced from 16
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Participants Section - Now the final section with proper bottom spacing
  participantsSection: {
    marginBottom: 0, // Removed margin since ScrollView contentContainerStyle handles bottom spacing
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  participantsList: {
    gap: 12,
  },

  // Participant Card
  participantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  participantDetails: {
    gap: 2,
  },
  participantShare: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  participantPaid: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  participantRight: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyParticipants: {
    padding: 20,
    alignItems: 'center',
  },
  emptyParticipantsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Appeals Section
  appealsSection: {
    marginTop: 24,
  },
  appealSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  appealSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyAppeals: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyAppealsText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyAppealsSubtext: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  appealsList: {
    gap: 12,
  },
  appealCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  appealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appealStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appealStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appealDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  appealMessage: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  adminCommentBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  adminCommentLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  adminCommentText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  appealActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  appealActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  appealCancelBtn: {
    backgroundColor: colors.errorLight,
  },
  appealActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  appealTextInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.inputText,
    minHeight: 100,
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  adminResponseBtns: {
    flexDirection: 'row',
    marginTop: 12,
  },
});

