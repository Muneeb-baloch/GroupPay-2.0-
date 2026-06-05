import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, RefreshControl, Alert, Pressable, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { transactionsService } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { cache } from '../utils/cache';
import { useTheme } from '../context/ThemeContext';

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = memo(() => {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);
  return (
    <Animated.View style={[{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }, { opacity: pulse }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.skeleton }} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ backgroundColor: colors.skeleton, borderRadius: 6, height: 14, width: '55%' }} />
          <View style={{ backgroundColor: colors.skeleton, borderRadius: 6, height: 11, width: '35%' }} />
        </View>
        <View style={{ backgroundColor: colors.skeleton, borderRadius: 6, height: 18, width: 70 }} />
      </View>
      <View style={{ backgroundColor: colors.skeleton, borderRadius: 8, height: 40, marginTop: 10 }} />
    </Animated.View>
  );
});

const TransactionsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { groupName = 'Group', groupId, groupData } = route?.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('mine');
  const [dateFilter, setDateFilter] = useState('all');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const myPersonId = String(user?.person_id || user?.id || '');

  const fetchTransactions = useCallback(async (silent = false) => {
    if (!token) return;
    const cacheKey = `transactions_${groupId || 'all'}`;

    if (!silent) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setTransactions(cached.transactions || []);
        setSummary(cached.summary || null);
        setLoading(false);
      }
      // still fetch fresh data below
    }

    try {
      // Fire transactions and summary simultaneously — no serial waiting
      const [data, summaryData] = await Promise.all([
        transactionsService.getTransactions(token, { groupId }),
        groupId
          ? transactionsService.getGroupSummary(token, groupId).catch(() => null)
          : Promise.resolve(null),
      ]);

      const raw = data?.data?.data || data?.data?.transactions || data?.data || data?.transactions || [];
      const list = Array.isArray(raw) ? raw : [];

      const normalized = list.map((t, i) => {
        const isCredit = t.type?.toLowerCase() === 'credit';
        const personId = String(t.person_id || t.person?.id || '');
        return {
          id: t.transaction_id || t.id || i,
          transaction_id: t.transaction_id || t.id,
          person_id: personId,
          name: t.person?.fullname || t.person?.username || t.description || 'Transaction',
          type: isCredit ? 'payment' : 'expense',
          category: t.scene?.location || t.scene?.scene_name || t.description || 'Transaction',
          description: t.description || t.scene?.scene_name || t.scene?.location || '',
          amount: parseFloat(t.amount || 0),
          shareAmount: parseFloat(t.share_amount || t.amount || 0),
          date: t.created_at || t.createdAt || new Date().toISOString(),
          status: t.status || 'completed',
          icon: isCredit ? 'card' : 'receipt',
          color: isCredit ? '#10b981' : '#f59e0b',
          groupId: t.group_id || groupId,
          sceneId: t.scene_id || t.scene?.scene_id || t.scene?.id || null,
          sceneImageUrl: t.scene?.image_url || t.scene?.receipt_url || t.image_url || t.receipt_url || null,
          sceneParticipants: t.scene?.participants || t.scene?.scene_participants || [],
          totalBill: parseFloat(t.scene?.total_amount || 0),
          location: t.scene?.location || '',
          sceneDate: t.scene?.scene_timestamptz || null,
          sceneDescription: t.scene?.description || '',
          groupName: t.group?.name || groupName,
          paidAmount: parseFloat(t.paid_amount || 0),
        };
      });

      setTransactions(normalized);

      // Resolve summary — try API response first, then compute locally
      let resolvedSummary = null;
      if (summaryData) {
        console.log('RAW summary response:', JSON.stringify(summaryData));
        const s =
          summaryData?.data?.summary || summaryData?.data?.data ||
          summaryData?.summary       || summaryData?.data || summaryData;
        if (s && typeof s === 'object') resolvedSummary = s;
      }

      if (
        !resolvedSummary ||
        (!resolvedSummary.total_credits && !resolvedSummary.totalCredits &&
         !resolvedSummary.total_debits  && !resolvedSummary.totalDebits)
      ) {
        const credits = normalized.filter(t => t.type === 'payment').reduce((s, t) => s + t.amount, 0);
        const debits  = normalized.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        resolvedSummary = { total_credits: credits, total_debits: debits, net_balance: credits - debits, _computed: true };
      }

      setSummary(resolvedSummary);
      await cache.set(cacheKey, { transactions: normalized, summary: resolvedSummary });
    } catch (error) {
      console.warn('Fetch transactions error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const balanceSummary = {
    totalCredits:
      summary?.total_credits    ??
      summary?.totalCredits     ??
      summary?.credits          ??
      summary?.total_credit     ??
      summary?.creditAmount     ??
      0,
    totalDebits:
      summary?.total_debits     ??
      summary?.totalDebits      ??
      summary?.debits           ??
      summary?.total_debit      ??
      summary?.debitAmount      ??
      0,
    netBalance:
      summary?.net_balance      ??
      summary?.netBalance       ??
      summary?.balance          ??
      summary?.net              ??
      groupData?.totalBalance   ??
      0,
    isComputed: summary?._computed ?? false,
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions(true);
    setRefreshing(false);
  }, [fetchTransactions]);

  const formatAmount = useCallback((amount, type) => {
    const formatted = (amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    return type === 'payment' ? `+Rs ${formatted}` : `-Rs ${formatted}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending':   return '#f59e0b';
      case 'failed':    return '#ef4444';
      default:          return '#6b7280';
    }
  }, []);

  const filterByDate = useCallback((list, df) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (df) {
      case 'today':
        return list.filter(t => {
          const d = new Date(t.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === today.getTime();
        });
      case 'week': {
        const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 7);
        return list.filter(t => new Date(t.date) >= cutoff);
      }
      case 'month': {
        const cutoff = new Date(today); cutoff.setMonth(cutoff.getMonth() - 1);
        return list.filter(t => new Date(t.date) >= cutoff);
      }
      case 'year': {
        const cutoff = new Date(today); cutoff.setFullYear(cutoff.getFullYear() - 1);
        return list.filter(t => new Date(t.date) >= cutoff);
      }
      default: return list;
    }
  }, []);

  // My transactions: rows where I am the participant (person_id matches me)
  // Group members transactions: all others
  const myTransactions    = transactions.filter(t => t.person_id === myPersonId);
  const memberTransactions = transactions.filter(t => t.person_id !== myPersonId);

  const getBaseList = () => {
    switch (selectedFilter) {
      case 'mine':    return myTransactions;
      case 'members': return memberTransactions;
      case 'expenses': return transactions.filter(t => t.type === 'expense');
      case 'payments': return transactions.filter(t => t.type === 'payment');
      case 'pending':  return transactions.filter(t => t.status === 'pending');
      default: return transactions;
    }
  };

  const finalList = filterByDate(getBaseList(), dateFilter);

  const openReceipt = useCallback((item) => {
    navigation.navigate('ReceiptView', { transaction: item, groupName });
  }, [navigation, groupName]);

  const renderBalanceCard = useCallback(() => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceTitle}>
          <Ionicons name="wallet" size={20} color="#06b6d4" />
          <Text style={styles.balanceHeaderText}>Balance Overview</Text>
        </View>
        {balanceSummary.isComputed && (
          <Text style={styles.computedLabel}>from transactions</Text>
        )}
      </View>
      <View style={styles.balanceGrid}>
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.balanceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditAmount}>
            Rs {balanceSummary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-down" size={14} color="#ef4444" />
            <Text style={styles.balanceLabel}>Debits</Text>
          </View>
          <Text style={styles.debitAmount}>
            Rs {balanceSummary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="calculator" size={14} color="#06b6d4" />
            <Text style={styles.balanceLabel}>Net Balance</Text>
          </View>
          <Text style={[styles.netAmount,
            { color: balanceSummary.netBalance >= 0 ? '#10b981' : '#ef4444' }]}>
            {balanceSummary.netBalance >= 0 ? '+' : '-'}Rs{' '}
            {Math.abs(balanceSummary.netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  ), [balanceSummary]);

  const isAdmin = (groupData?.role || 'member') === 'admin';

  const renderFilterChips = useCallback(() => {
    const opts = [
      { key: 'mine',    label: 'My Transactions', icon: 'person',  count: myTransactions.length },
      ...(isAdmin ? [{ key: 'members', label: 'Group Members', icon: 'people', count: memberTransactions.length }] : []),
    ];
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContainer} style={styles.filterScrollView}>
        {opts.map(f => (
          <TouchableOpacity key={f.key}
            style={[styles.filterChip, selectedFilter === f.key && styles.activeFilterChip]}
            onPress={() => setSelectedFilter(f.key)} activeOpacity={0.7}>
            <Ionicons name={f.icon} size={14}
              color={selectedFilter === f.key ? '#ffffff' : '#64748b'} />
            <Text style={[styles.filterChipText,
              selectedFilter === f.key && styles.activeFilterChipText]}>{f.label}</Text>
            <View style={[styles.filterChipBadge,
              selectedFilter === f.key && styles.activeFilterChipBadge]}>
              <Text style={[styles.filterChipBadgeText,
                selectedFilter === f.key && styles.activeFilterChipBadgeText]}>{f.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }, [selectedFilter, transactions, myTransactions, memberTransactions]);

  const renderTransactionItem = useCallback(({ item }) => (
    <Pressable style={({ pressed }) => [styles.transactionCard,
        pressed && styles.transactionCardPressed]}
      onPress={() => openReceipt(item)}>
      <View style={styles.transactionHeader}>
        <View style={[styles.transactionIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.transactionCategory} numberOfLines={1}>{item.category}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.transactionAmount,
            { color: item.type === 'payment' ? '#10b981' : '#ef4444' }]}>
            {formatAmount(item.amount, item.type)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailsLeft}>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          {item.location ? (
            <Text style={styles.locationText} numberOfLines={1}>
              <Ionicons name="location-outline" size={11} color="#94a3b8" /> {item.location}
            </Text>
          ) : null}
        </View>
        <View style={styles.detailsRight}>
          <Text style={styles.splitLabel}>Your share</Text>
          <Text style={styles.splitAmount}>
            Rs {item.shareAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={() => openReceipt(item)} activeOpacity={0.7}>
          <Ionicons name="receipt" size={16} color="#06b6d4" />
          <Text style={styles.actionButtonText}>
            {item.sceneImageUrl ? 'View Receipt' : 'Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [formatDate, formatAmount, getStatusColor, openReceipt]);

  const renderListHeader = useCallback(() => (
    <View>
      {renderBalanceCard()}
      {renderFilterChips()}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedFilter === 'mine'    ? 'My Transactions'    :
           selectedFilter === 'members' ? 'Group Member Transactions' :
           selectedFilter === 'expenses'? 'Expenses' :
           selectedFilter === 'payments'? 'Payments' : 'Pending'}
        </Text>
        <Text style={styles.transactionCount}>
          {finalList.length} {finalList.length === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>
    </View>
  ), [renderBalanceCard, renderFilterChips, finalList.length, selectedFilter]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'mine'
          ? "You haven't been part of any transactions yet."
          : selectedFilter === 'members'
          ? 'No transactions from other group members yet.'
          : 'No transactions match the current filter.'}
      </Text>
      {selectedFilter !== 'mine' && (
        <TouchableOpacity style={styles.clearFilterButton}
          onPress={() => setSelectedFilter('mine')} activeOpacity={0.7}>
          <Text style={styles.clearFilterText}>Show My Transactions</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [selectedFilter]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}
          onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Transactions</Text>
          <View style={styles.groupInfo}>
            {groupData && (
              <View style={[styles.groupIndicator,
                { backgroundColor: groupData.color || '#06b6d4' }]} />
            )}
            <Text style={styles.subtitle}>{groupName}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {groupData && (
            <View style={styles.memberCount}>
              <Ionicons name="people" size={16} color={colors.textSecondary} />
              <Text style={styles.memberCountText}>{groupData.members}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}
            onPress={() => Alert.alert('Filter by Date', 'Choose a date range:', [
              { text: 'All Time',    onPress: () => setDateFilter('all') },
              { text: 'Today',       onPress: () => setDateFilter('today') },
              { text: 'Last 7 Days', onPress: () => setDateFilter('week') },
              { text: 'Last 30 Days',onPress: () => setDateFilter('month') },
              { text: 'Last Year',   onPress: () => setDateFilter('year') },
              { text: 'Cancel', style: 'cancel' },
            ])}>
            <Ionicons name="filter" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={loading ? [1, 2, 3, 4, 5] : finalList}
        renderItem={loading ? () => <SkeletonRow /> : renderTransactionItem}
        keyExtractor={(item, i) => loading ? `sk-${i}` : (item?.transaction_id || item?.id || i).toString()}
        ListHeaderComponent={loading ? null : renderListHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}
            tintColor="#06b6d4" colors={['#06b6d4']} />
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
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

export default TransactionsScreen;
