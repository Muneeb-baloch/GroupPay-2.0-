import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Pressable,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DepositsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { groupName = 'Chichory', groupId, groupData } = route?.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('history');

  // Sample deposit data with more realistic structure and dummy receipts
  const [deposits, setDeposits] = useState([
    {
      id: 1,
      type: 'deposit',
      from: 'Muhammad Yousuf',
      to: 'Muneeb ur Rehman',
      amount: 1000.00,
      date: '2026-04-11T10:30:00Z',
      status: 'completed',
      method: 'bank_transfer',
      note: 'Monthly contribution',
      category: 'Group Fund',
      icon: 'card',
      color: '#10b981',
      receipt: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=800&fit=crop'
    },
    {
      id: 2,
      type: 'withdrawal',
      from: 'Muneeb ur Rehman',
      to: 'Group Fund',
      amount: 600.00,
      date: '2026-04-08T14:15:00Z',
      status: 'completed',
      method: 'cash',
      note: 'Expense reimbursement',
      category: 'Reimbursement',
      icon: 'cash',
      color: '#f59e0b',
      receipt: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=800&fit=crop'
    },
    {
      id: 3,
      type: 'request',
      from: 'Ahmad Hassan',
      to: 'Group Members',
      amount: 500.00,
      date: '2026-04-05T09:20:00Z',
      status: 'pending',
      method: 'bank_transfer',
      note: 'Upcoming trip expenses',
      category: 'Travel',
      icon: 'airplane',
      color: '#8b5cf6',
      receipt: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=800&fit=crop'
    },
    {
      id: 4,
      type: 'deposit',
      from: 'Sarah Khan',
      to: 'Group Fund',
      amount: 750.00,
      date: '2026-04-03T16:45:00Z',
      status: 'completed',
      method: 'digital_wallet',
      note: 'Event contribution',
      category: 'Events',
      icon: 'wallet',
      color: '#06b6d4',
      receipt: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=800&fit=crop'
    }
  ]);

  // Handle new deposit from CreateDepositScreen
  React.useEffect(() => {
    if (route.params?.newDeposit) {
      const newDeposit = {
        ...route.params.newDeposit,
        icon: getIconForMethod(route.params.newDeposit.method),
        color: getColorForType(route.params.newDeposit.type)
      };
      
      setDeposits(prevDeposits => [newDeposit, ...prevDeposits]);
      
      // Clear the parameter to avoid re-adding on subsequent renders
      navigation.setParams({ newDeposit: undefined });
    }
  }, [route.params?.newDeposit, navigation]);

  const getIconForMethod = (method) => {
    switch (method) {
      case 'bank_transfer': return 'card';
      case 'cash': return 'cash';
      case 'digital_wallet': return 'wallet';
      case 'check': return 'document';
      default: return 'card';
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'deposit': return '#10b981';
      case 'withdrawal': return '#ef4444';
      case 'request': return '#f59e0b';
      default: return '#06b6d4';
    }
  };

  // Balance summary
  const balanceSummary = {
    totalDeposits: 2250.00,
    totalWithdrawals: 600.00,
    netBalance: 1650.00,
    pendingRequests: 500.00
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

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

  const filteredDeposits = deposits.filter(deposit => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'history') return deposit.status === 'completed';
    if (selectedTab === 'requests') return deposit.type === 'request';
    if (selectedTab === 'pending') return deposit.status === 'pending';
    return true;
  });

  const renderBalanceCard = useCallback(() => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceTitle}>
          <Ionicons name="wallet" size={20} color="#06b6d4" />
          <Text style={styles.balanceHeaderText}>Deposit Summary</Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert('Balance Details', 'Detailed deposit breakdown coming soon!')}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#06b6d4" />
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
        count: deposits.length 
      },
      { 
        key: 'history', 
        label: 'Completed', 
        icon: 'checkmark-circle', 
        count: deposits.filter(d => d.status === 'completed').length 
      },
      { 
        key: 'requests', 
        label: 'Requests', 
        icon: 'mail', 
        count: deposits.filter(d => d.type === 'request').length 
      },
      { 
        key: 'pending', 
        label: 'Pending', 
        icon: 'time', 
        count: deposits.filter(d => d.status === 'pending').length 
      }
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContainer}
        style={styles.filterScrollView}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedTab === filter.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedTab(filter.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={filter.icon} 
              size={16} 
              color={selectedTab === filter.key ? '#ffffff' : '#64748b'} 
            />
            <Text style={[
              styles.filterChipText,
              selectedTab === filter.key && styles.activeFilterChipText
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterChipBadge,
              selectedTab === filter.key && styles.activeFilterChipBadge
            ]}>
              <Text style={[
                styles.filterChipBadgeText,
                selectedTab === filter.key && styles.activeFilterChipBadgeText
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
            {item.from} → {item.to}
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
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReceiptView', { deposit: item })}
        >
          <Ionicons name="receipt" size={16} color="#06b6d4" />
          <Text style={styles.actionButtonText}>Receipt</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [formatDate, formatAmount, getStatusColor]);

  const renderListHeader = useCallback(() => (
    <View>
      {renderBalanceCard()}
      {renderFilterChips()}
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
            color="#9ca3af" 
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Deposits</Text>
          <View style={styles.groupInfo}>
            {groupData && (
              <View style={[styles.groupIndicator, { backgroundColor: groupData.color || '#06b6d4' }]} />
            )}
            <Text style={styles.subtitle}>{groupName}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {groupData && (
            <View style={styles.memberCount}>
              <Ionicons name="people" size={14} color="#64748b" />
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
        ListEmptyComponent={renderEmptyState}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  groupIndicator: {
    width: 3,
    height: 12,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  memberCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  itemSeparator: {
    height: 12,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },
  balanceGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  balanceItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    flexShrink: 1,
  },
  depositAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: -0.3,
    flexWrap: 'wrap',
  },
  withdrawalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: -0.3,
    flexWrap: 'wrap',
  },
  netAmount: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
    flexWrap: 'wrap',
  },

  // Filter Chips - Horizontal Scrolling
  filterScrollView: {
    marginBottom: 12,
  },
  filterScrollContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginRight: 12,
  },
  activeFilterChip: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  filterChipBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterChipBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  activeFilterChipBadgeText: {
    color: '#ffffff',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  depositCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Deposit Card - Improved Design
  depositCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  depositCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },
  
  // Header Row - Icon, Title, Amount
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  depositIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  depositInfo: {
    flex: 1,
    marginRight: 12,
  },
  depositTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    lineHeight: 20,
  },
  depositCategory: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  // Details Row - From/To, Date, Method
  depositDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
  },
  detailsLeft: {
    flex: 1,
  },
  detailsRight: {
    alignItems: 'flex-end',
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  depositDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  methodLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
  },
  
  // Action Row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearFilterButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default DepositsScreen;