import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, Share, ScrollView, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { scenesService } from '../services/scenesService';
import { formatDate } from '../utils/helpers';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
const memberColor = (id) => COLORS[Math.abs(Number(id) || 0) % COLORS.length];

// ─── component ───────────────────────────────────────────────────────────────
const ReceiptViewScreen = ({ navigation, route }) => {
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  // TransactionsScreen passes `transaction`; deposits still pass `deposit`
  const transaction = route?.params?.transaction || null;
  const deposit     = route?.params?.deposit     || null;
  const passedGroupName = route?.params?.groupName || '';

  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [sceneDetail, setSceneDetail]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [imageError, setImageError]     = useState(false);

  // ── Fetch full scene if we have a sceneId ──────────────────────────────────
  useEffect(() => {
    const sceneId = transaction?.sceneId;
    if (!sceneId || !token) return;
    setLoading(true);
    scenesService.getSceneById(token, sceneId)
      .then(res => {
        const s = scenesService.extractScene(res) || res?.data || res;
        if (s) setSceneDetail(s);
      })
      .catch(() => {/* best-effort */})
      .finally(() => setLoading(false));
  }, [transaction?.sceneId, token]);

  // ── Derive display data ────────────────────────────────────────────────────
  const myId = String(user?.person_id || user?.id || '');

  // Prefer freshly-fetched detail, fall back to what was passed in the transaction
  const scene = sceneDetail || null;

  const receiptImageUrl =
    scene?.image_url || scene?.receipt_url ||
    transaction?.sceneImageUrl ||
    deposit?.receipt || null;

  const totalBill   = Number(scene?.total_amount || transaction?.totalBill || deposit?.amount || 0);
  const location    = scene?.location   || transaction?.location   || deposit?.location   || '—';
  const description = scene?.description || transaction?.sceneDescription || deposit?.note || '';
  const groupName   = scene?.group?.name || passedGroupName || transaction?.groupName || deposit?.groupName || '—';
  const sceneDate   = scene?.scene_timestamptz || transaction?.sceneDate || deposit?.date || null;
  const displayDate = sceneDate
    ? new Date(sceneDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : formatDate(transaction?.date || deposit?.date || new Date().toISOString());

  // Participants from freshly-fetched scene or the passed-in array
  const rawParticipants =
    scene?.participants || scene?.scene_participants ||
    transaction?.sceneParticipants || [];

  // Per-person share maths (same logic as SceneDetailScreen)
  const sumAdditional = rawParticipants.reduce((s, p) => s + Number(p.additional_amount || 0), 0);
  const perShare = rawParticipants.length > 0
    ? (totalBill - sumAdditional) / rawParticipants.length
    : 0;

  const participants = rawParticipants.map(p => {
    const pid   = String(p.person_id || p.id || '');
    const paid  = Number(p.paid_amount || 0);
    const extra = Number(p.additional_amount || 0);
    const share = perShare + extra;
    const bal   = paid - share;
    return {
      id:       pid,
      name:     p.person?.fullname || p.person?.username || p.name || 'Unknown',
      imageUrl: p.person?.profile_picture_url || p.person?.avatar_url || null,
      paid,
      share,
      balance: bal,
      status: bal >= -0.01 ? 'paid' : 'owes',
      isMe:   pid === myId,
      color:  memberColor(pid),
    };
  });

  const me = participants.find(p => p.isMe);
  const myShare  = me?.share  ?? Number(transaction?.shareAmount || 0);
  const myPaid   = me?.paid   ?? Number(transaction?.paidAmount  || 0);
  const myBalance = me?.balance ?? (myPaid - myShare);

  const totalPaid = participants.reduce((s, p) => s + p.paid, 0);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Receipt – ${location} | Total: Rs ${totalBill.toLocaleString()} | ${displayDate}`,
        title: 'Scene Receipt',
      });
    } catch { Alert.alert('Error', 'Failed to share receipt'); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn}
            onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt</Text>
          <TouchableOpacity style={styles.headerBtn}
            onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* ── Receipt Image ── */}
          {loading ? (
            <View style={styles.imageBox}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : receiptImageUrl && !imageError ? (
            <TouchableOpacity style={styles.imageBox}
              onPress={() => setFullScreenVisible(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: receiptImageUrl }}
                style={styles.receiptImage}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
              <View style={styles.zoomBadge}>
                <Ionicons name="expand-outline" size={14} color="#ffffff" />
                <Text style={styles.zoomText}>Tap to expand</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noReceiptBox}>
              <Ionicons name="image-outline" size={40} color={colors.textMuted} />
              <Text style={styles.noReceiptText}>No receipt photo attached</Text>
            </View>
          )}

          {/* ── Scene Summary Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scene Summary</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Total Bill</Text>
                <Text style={styles.summaryValue}>Rs {totalBill.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Your Share</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  Rs {myShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{displayDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Group</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{groupName}</Text>
            </View>
            {description ? (
              <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} style={{ marginTop: 1 }} />
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={[styles.detailValue, { flex: 1 }]}>{description}</Text>
              </View>
            ) : null}
          </View>

          {/* ── My Expense Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Expense</Text>
            <View style={styles.myExpenseGrid}>
              <View style={styles.expenseBlock}>
                <Text style={styles.expenseBlockLabel}>I Paid</Text>
                <Text style={[styles.expenseBlockValue, { color: '#10b981' }]}>
                  Rs {myPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.expenseDivider} />
              <View style={styles.expenseBlock}>
                <Text style={styles.expenseBlockLabel}>My Share</Text>
                <Text style={[styles.expenseBlockValue, { color: colors.text }]}>
                  Rs {myShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.expenseDivider} />
              <View style={styles.expenseBlock}>
                <Text style={styles.expenseBlockLabel}>Balance</Text>
                <Text style={[styles.expenseBlockValue,
                  { color: myBalance >= -0.01 ? '#10b981' : colors.error }]}>
                  {myBalance > 0.01 ? '+' : ''}Rs{' '}
                  {Math.abs(myBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
            <View style={[styles.statusPill,
              { backgroundColor: myBalance >= -0.01 ? colors.successLight : colors.errorLight }]}>
              <Ionicons
                name={myBalance >= -0.01 ? 'checkmark-circle' : 'alert-circle'}
                size={14}
                color={myBalance >= -0.01 ? '#166534' : colors.error}
              />
              <Text style={[styles.statusPillText,
                { color: myBalance >= -0.01 ? '#166534' : colors.error }]}>
                {myBalance >= -0.01
                  ? myBalance > 0.01
                    ? `You get back Rs ${myBalance.toFixed(2)}`
                    : 'All settled'
                  : `You owe Rs ${Math.abs(myBalance).toFixed(2)}`}
              </Text>
            </View>
          </View>

          {/* ── All Participants ── */}
          {participants.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>All Participants</Text>
                <Text style={styles.cardSubtitle}>
                  {participants.length} people · Rs {totalPaid.toLocaleString()} paid
                </Text>
              </View>
              {participants.map(p => (
                <View key={p.id} style={styles.participantRow}>
                  <View style={[styles.avatar, { backgroundColor: p.imageUrl ? 'transparent' : p.color }]}>
                    {p.imageUrl
                      ? <Image source={{ uri: p.imageUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                      : <Text style={styles.avatarText}>{getInitials(p.name)}</Text>
                    }
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {p.name}{p.isMe ? ' (You)' : ''}
                    </Text>
                    <Text style={styles.participantSub}>
                      Paid Rs {p.paid.toLocaleString()} · Share Rs {p.share.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.participantRight}>
                    <Text style={[styles.participantBalance,
                      { color: p.balance >= -0.01 ? '#10b981' : colors.error }]}>
                      {p.balance > 0.01 ? '+' : ''}Rs {p.balance.toFixed(2)}
                    </Text>
                    <View style={[styles.badge,
                      { backgroundColor: p.status === 'paid' ? colors.successLight : colors.errorLight }]}>
                      <Text style={[styles.badgeText,
                        { color: p.status === 'paid' ? '#166634' : colors.error }]}>
                        {p.status === 'paid' ? 'Settled' : 'Owes'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Full-screen image modal */}
      <Modal visible={fullScreenVisible} transparent={false}
        animationType="slide" onRequestClose={() => setFullScreenVisible(false)}
        presentationStyle="fullScreen">
        <SafeAreaView style={styles.fsContainer} edges={['bottom']}>
          <View style={styles.fsHeader}>
            <TouchableOpacity style={styles.headerBtn}
              onPress={() => setFullScreenVisible(false)} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Receipt</Text>
            <TouchableOpacity style={styles.headerBtn}
              onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.fsImageContainer}>
            <Image
              source={{ uri: receiptImageUrl }}
              style={styles.fsImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const getStyles = (colors) => StyleSheet.create({
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

  // Image
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

  // Cards
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

  // Summary
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  summaryBlock: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 10, padding: 12 },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },

  // Details
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', width: 68 },
  detailValue: { fontSize: 13, color: colors.text, fontWeight: '600', flex: 1 },

  // My expense
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

  // Participants
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

  // Full screen
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

export default ReceiptViewScreen;
