import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StatusBar, RefreshControl, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { depositsService } from '../../services/depositsService';
import PillSelector from '../../components/common/PillSelector';
import { cache } from '../../utils/cache';
import { getDepositsStyles } from '../../styles/groups/depositsStyles';
const DepositsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { groupName = 'Chichory', groupId, groupData } = route?.params || {};
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getDepositsStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [deposits, setDeposits] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const isAdmin = (groupData?.role || 'member') === 'admin';
  const myPersonId = String(user?.person_id || user?.id || '');

  const getIconForMethod = useCallback((method) => {
    switch (method) {
      case 'bank_transfer': return 'card';
      case 'cash': return 'cash';
      case 'digital_wallet': return 'wallet';
      case 'check': return 'document';
      default: return 'card';
    }
  }, []);

  const getColorForType = useCallback((type) => {
    switch (type) {
      case 'deposit': return '#10b981';
      case 'withdrawal': return '#ef4444';
      case 'request': return '#f59e0b';
      default: return '#06b6d4';
    }
  }, []);

  const normalizeDeposit = useCallback((item) => {
    // deposit_type from API (CASH, BANK_TRANSFER, etc.) maps to method
    const rawDepositType = (item?.deposit_type || '').toUpperCase();
    const method = rawDepositType
      ? rawDepositType.toLowerCase()
      : (item?.method || 'bank_transfer').toLowerCase();

    // derive display type from description prefix or fallback to 'request'
    const desc = (item?.description || '').toUpperCase();
    let type = 'request';
    if (desc.startsWith('DEPOSIT:')) type = 'deposit';
    else if (desc.startsWith('WITHDRAWAL:')) type = 'withdrawal';

    // map API status APPROVED → completed, REJECTED → failed
    const rawStatus = (item?.status || 'pending').toUpperCase();
    const status =
      rawStatus === 'APPROVED' ? 'completed' :
      rawStatus === 'REJECTED' ? 'failed' :
      rawStatus.toLowerCase();

    const senderName =
      item?.sender?.fullname || item?.sender?.username ||
      item?.sender?.person?.fullname || item?.sender?.person?.username ||
      item?.sender_person?.fullname || item?.sender_person?.username ||
      item?.sender_name || item?.created_by_name ||
      item?.from || 'You';

    const receiverName =
      item?.receiver?.fullname || item?.receiver?.username ||
      item?.receiver?.person?.fullname || item?.receiver?.person?.username ||
      item?.receiver_person?.fullname || item?.receiver_person?.username ||
      item?.receiver_name || item?.to ||
      (type === 'withdrawal' ? 'Member' : 'Group Admin');

    return {
      id: item?.id ?? item?.deposit_id ?? item?.request_id ?? null,
      type,
      from: senderName,
      to: receiverName,
      amount: Number(item?.amount || 0),
      date: item?.date || item?.created_at || item?.createdAt || new Date().toISOString(),
      status,
      method,
      note: (item?.description || item?.note || 'Deposit request').replace(/^(DEPOSIT|WITHDRAWAL|REQUEST|DEPOSIT_REQUEST):\s*/i, ''),
      category: item?.category || 'General',
      icon: getIconForMethod(method),
      color: getColorForType(type),
      receipt: item?.attachment_url || item?.receipt || null,
      senderId: String(item?.sender_id || item?.created_by || item?.sender?.id || item?.user_id || ''),
      receiverId: String(item?.receiver_id || item?.receiver?.id || ''),
    };
  }, [getColorForType, getIconForMethod]);

  const fetchDeposits = useCallback(async (silent = false) => {
    if (!token) return;
    const cacheKey = `deposits_${groupId || 'all'}`;

    if (!silent) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setDeposits(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }

    try {
      const data = await depositsService.getDeposits(token, { groupId });
      const raw = data?.data?.deposits || data?.data || data?.deposits || data?.rows || [];
      const normalized = Array.isArray(raw) ? raw.map(normalizeDeposit) : [];
      setDeposits(normalized);
      await cache.set(cacheKey, normalized);
    } catch (error) {
      if (!silent) Alert.alert('Error', 'Could not load deposits right now.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [groupId, normalizeDeposit, token]);

  // Handle new deposit from CreateDepositScreen
  useEffect(() => {
    if (route.params?.newDeposit) {
      const newDeposit = normalizeDeposit(route.params.newDeposit);
      
      setDeposits(prevDeposits => [newDeposit, ...prevDeposits]);
      
      // Clear the parameter to avoid re-adding on subsequent renders
      navigation.setParams({ newDeposit: undefined });
    }
  }, [navigation, normalizeDeposit, route.params?.newDeposit]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Members can only see their own deposits; admins see all
  const visibleDeposits = isAdmin
    ? deposits
    : deposits.filter(d => d.senderId === myPersonId || d.receiverId === myPersonId);

  const balanceSummary = visibleDeposits.reduce((summary, deposit) => {
    if (deposit.type === 'deposit') {
      summary.totalDeposits += deposit.amount;
    } else if (deposit.type === 'withdrawal') {
      summary.totalWithdrawals += deposit.amount;
    } else if (deposit.type === 'request' && deposit.status === 'pending') {
      summary.pendingRequests += deposit.amount;
    }

    summary.netBalance = summary.totalDeposits - summary.totalWithdrawals;
    return summary;
  }, { totalDeposits: 0, totalWithdrawals: 0, netBalance: 0, pendingRequests: 0 });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeposits(true);
    setRefreshing(false);
  }, [fetchDeposits]);

  const handleDepositStatusUpdate = useCallback(async (depositId, newStatus) => {
    if (!depositId) {
      Alert.alert('Error', 'Invalid deposit — cannot update status. Please refresh and try again.');
      return;
    }
    setActionLoading(depositId);
    try {
      await depositsService.updateDepositStatus(token, depositId, newStatus);
      setDeposits(prev => prev.map(d => {
        if (String(d.id) !== String(depositId)) return d;
        return {
          ...d,
          status: newStatus === 'APPROVED' ? 'completed' : 'failed',
        };
      }));
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('not found')) {
        Alert.alert(
          'Cannot Update',
          'This deposit could not be found. It may have been created with an incorrect receiver. Ask the member to resubmit the deposit.',
        );
      } else {
        Alert.alert('Error', msg || 'Could not update deposit status.');
      }
    } finally {
      setActionLoading(null);
    }
  }, [token]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }, []);

  const formatAmount = useCallback((amount, type) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (type === 'deposit') return `+Rs ${formatted}`;
    if (type === 'withdrawal') return `-Rs ${formatted}`;
    return `Rs ${formatted}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  const filteredDeposits = visibleDeposits.filter(deposit => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'history') return deposit.status === 'completed' || deposit.status === 'failed';
    if (selectedTab === 'requests') return deposit.type === 'request';
    if (selectedTab === 'pending') return deposit.status === 'pending';
    return true;
  });

  const renderLoadingState = () => (
    <View style={styles.emptyState}>
      <ActivityIndicator size="large" color="#06b6d4" />
      <Text style={styles.emptyTitle}>Loading deposits...</Text>
      <Text style={styles.emptySubtitle}>Fetching the latest deposit requests and history.</Text>
    </View>
  );

  const renderBalanceCard = useCallback(() => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceTitle}>
          <Ionicons name="wallet" size={20} color={colors.primary} />
          <Text style={styles.balanceHeaderText}>Deposit Summary</Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert('Balance Details', 'Detailed deposit breakdown coming soon!')}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Balance Grid */}
      <View style={styles.balanceGrid}>
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.balanceLabel}>Total In</Text>
          </View>
          <Text style={styles.depositAmount}>Rs {balanceSummary.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-down" size={14} color="#ef4444" />
            <Text style={styles.balanceLabel}>Total Out</Text>
          </View>
          <Text style={styles.withdrawalAmount}>Rs {balanceSummary.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="calculator" size={14} color="#06b6d4" />
            <Text style={styles.balanceLabel}>Net Balance</Text>
          </View>
          <Text style={[
            styles.netAmount,
            { color: balanceSummary.netBalance >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {balanceSummary.netBalance >= 0 ? '+' : '-'}Rs {Math.abs(balanceSummary.netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  ), [balanceSummary]);

  const renderFilterChips = useCallback(() => {
    const filterOptions = [
      {
        key: 'all',
        label: 'All',
        icon: 'list',
        count: visibleDeposits.length
      },
      {
        key: 'history',
        label: 'Completed',
        icon: 'checkmark-circle',
        count: visibleDeposits.filter(d => d.status === 'completed').length
      },
      {
        key: 'requests',
        label: 'Requests',
        icon: 'mail',
        count: visibleDeposits.filter(d => d.type === 'request').length
      },
      {
        key: 'pending',
        label: 'Pending',
        icon: 'time',
        count: visibleDeposits.filter(d => d.status === 'pending').length
      }
    ];

    return (
      <PillSelector
        selectedKey={selectedTab}
        onSelect={setSelectedTab}
        containerStyle={styles.filterScrollContainer}
        items={filterOptions}
      />
    );
  }, [selectedTab, deposits]);

  const renderDepositItem = useCallback(({ item }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.depositCard,
        pressed && styles.depositCardPressed
      ]}
      onPress={() => Alert.alert('Deposit Details', `View details for ${item.note}`)}
    >
      {/* Header Row - Icon, Title, Amount */}
      <View style={styles.depositHeader}>
        <View style={[styles.depositIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        
        <View style={styles.depositInfo}>
          <Text style={styles.depositTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.note}
          </Text>
          <Text style={styles.depositCategory} numberOfLines={1}>
            {item.category}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.depositAmount,
            { color: item.type === 'deposit' ? '#10b981' : item.type === 'withdrawal' ? '#ef4444' : '#f59e0b' }
          ]}>
            {formatAmount(item.amount, item.type)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      {/* Details Row - From/To, Date, Method */}
      <View style={styles.depositDetails}>
        <View style={styles.detailsLeft}>
          <Text style={styles.personName} numberOfLines={1}>
            {item.senderId === myPersonId ? 'You' : item.from} → {item.receiverId === myPersonId ? 'You' : item.to}
          </Text>
          <Text style={styles.depositDate}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.detailsRight}>
          <Text style={styles.methodLabel}>Method</Text>
          <Text style={styles.methodText}>
            {item.method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {isAdmin && item.status === 'pending' && item.id && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                onPress={() => handleDepositStatusUpdate(item.id, 'APPROVED')}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id
                  ? <ActivityIndicator size="small" color="#10b981" />
                  : <><Ionicons name="checkmark" size={16} color="#10b981" /><Text style={[styles.actionButtonText, { color: '#10b981' }]}>Approve</Text></>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                onPress={() => handleDepositStatusUpdate(item.id, 'REJECTED')}
                disabled={actionLoading === item.id}
              >
                <Ionicons name="close" size={16} color="#ef4444" />
                <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReceiptView', { deposit: item })}
          >
            <Ionicons name="receipt" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  ), [formatDate, formatAmount, getStatusColor, isAdmin, actionLoading, handleDepositStatusUpdate]);

  const renderListHeader = useCallback(() => (
    <View>
      {renderBalanceCard()}
      <View style={{ marginBottom: 12 }}>
        {renderFilterChips()}
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedTab === 'all' ? 'All Deposits' : 
           selectedTab === 'history' ? 'Completed Deposits' :
           selectedTab === 'requests' ? 'Deposit Requests' :
           'Pending Deposits'}
        </Text>
        <Text style={styles.depositCount}>
          {filteredDeposits.length} {filteredDeposits.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </View>
  ), [renderBalanceCard, renderFilterChips, filteredDeposits.length, selectedTab]);


  const renderEmptyState = useCallback(() => {
    const getEmptyStateContent = () => {
      switch (selectedTab) {
        case 'history':
          return {
            title: 'No completed deposits',
            subtitle: 'Completed deposits will appear here once transactions are processed.'
          };
        case 'requests':
          return {
            title: 'No deposit requests',
            subtitle: 'Deposit requests will appear here when members request funds.'
          };
        case 'pending':
          return {
            title: 'No pending deposits',
            subtitle: 'All deposits have been processed. Pending items will appear here when they need attention.'
          };
        default:
          return {
            title: 'No deposits found',
            subtitle: 'Start making deposits to see your deposit history here.'
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons 
            name={
              selectedTab === 'history' ? 'checkmark-circle-outline' :
              selectedTab === 'requests' ? 'mail-outline' :
              selectedTab === 'pending' ? 'time-outline' :
              'wallet-outline'
            } 
            size={48}
            color={colors.textMuted}
          />
        </View>
        <Text style={styles.emptyTitle}>{content.title}</Text>
        <Text style={styles.emptySubtitle}>{content.subtitle}</Text>
        
        {selectedTab !== 'all' && (
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={() => setSelectedTab('all')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFilterText}>Show All Deposits</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [selectedTab]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Deposits</Text>
          <View style={styles.groupInfo}>
            {groupData && (
              <View style={[styles.groupIndicator, { backgroundColor: groupData.color || colors.primary }]} />
            )}
            <Text style={styles.subtitle}>{groupName}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {groupData && (
            <View style={styles.memberCount}>
              <Ionicons name="people" size={14} color={colors.textSecondary} />
              <Text style={styles.memberCountText}>{groupData.members}</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateDeposit', { groupName, groupId, groupData })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Deposits List */}
      <FlatList
        data={filteredDeposits}
        renderItem={renderDepositItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={loading ? renderLoadingState : renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#06b6d4"
            colors={['#06b6d4']}
          />
        }
      />
    </SafeAreaView>
  );
};

export default DepositsScreen;