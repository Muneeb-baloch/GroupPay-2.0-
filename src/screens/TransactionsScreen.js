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

const TransactionsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { groupName = 'Chichory', groupId, groupData } = route?.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // New date filter state

  // Sample transaction data with more realistic structure - filtered by group
  const [transactions] = useState([
    {
      id: 1,
      name: 'Muneeb ur Rehman',
      type: 'expense',
      category: 'Food & Dining',
      description: 'Dinner at Tummy Cafe',
      amount: 231.00,
      date: '2026-05-13T12:11:00Z',
      status: 'completed',
      participants: ['MU', 'AH'],
      splitAmount: 115.50,
      icon: 'restaurant',
      color: '#f59e0b',
      groupId: groupId || 1
    },
    {
      id: 2,
      name: 'Ahmad Hassan',
      type: 'payment',
      category: 'Settlement',
      description: 'Payment received',
      amount: 150.00,
      date: '2026-05-12T09:30:00Z',
      status: 'completed',
      participants: ['AH'],
      splitAmount: 150.00,
      icon: 'card',
      color: '#10b981',
      groupId: groupId || 1
    },
    {
      id: 3,
      name: 'Sarah Khan',
      type: 'expense',
      category: 'Transportation',
      description: 'Uber ride to mall',
      amount: 45.75,
      date: '2026-05-11T16:45:00Z',
      status: 'pending',
      participants: ['SK', 'MU', 'AH'],
      splitAmount: 15.25,
      icon: 'car',
      color: '#8b5cf6',
      groupId: groupId || 1
    },
    {
      id: 4,
      name: 'Muneeb ur Rehman',
      type: 'expense',
      category: 'Entertainment',
      description: 'Movie tickets',
      amount: 120.00,
      date: '2026-05-10T19:20:00Z',
      status: 'completed',
      participants: ['MU', 'SK'],
      splitAmount: 60.00,
      icon: 'film',
      color: '#ef4444',
      groupId: groupId || 1
    },
    {
      id: 5,
      name: 'Group Expense',
      type: 'expense',
      category: 'Groceries',
      description: 'Weekly grocery shopping',
      amount: 89.50,
      date: '2026-05-09T14:15:00Z',
      status: 'completed',
      participants: ['MU', 'AH', 'SK'],
      splitAmount: 29.83,
      icon: 'basket',
      color: '#06b6d4',
      groupId: groupId || 1
    }
  ]);

  // Balance summary - could be derived from groupData
  const balanceSummary = {
    totalCredits: 1250.50,
    totalDebits: 367.75,
    netBalance: groupData?.totalBalance || 882.75,
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
    
    if (type === 'payment') return `+Rs ${formatted}`;
    return `-Rs ${formatted}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  const filterByDate = useCallback((transactions, dateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
          return transactionDay.getTime() === today.getTime();
        });
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= weekAgo && transactionDate <= now;
        });
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= monthAgo && transactionDate <= now;
        });
      
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= yearAgo && transactionDate <= now;
        });
      
      default:
        return transactions;
    }
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    // First apply type filter
    let typeFiltered = true;
    switch (selectedFilter) {
      case 'all':
        typeFiltered = true;
        break;
      case 'expenses':
        typeFiltered = transaction.type === 'expense';
        break;
      case 'payments':
        typeFiltered = transaction.type === 'payment';
        break;
      case 'pending':
        typeFiltered = transaction.status === 'pending';
        break;
      default:
        typeFiltered = true;
    }
    
    return typeFiltered;
  });

  // Then apply date filter
  const finalFilteredTransactions = filterByDate(filteredTransactions, dateFilter);

  const renderBalanceCard = useCallback(() => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceTitle}>
          <Ionicons name="wallet" size={20} color="#06b6d4" />
          <Text style={styles.balanceHeaderText}>Balance Overview</Text>
        </View>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert('Balance Details', 'Detailed balance breakdown coming soon!')}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#06b6d4" />
        </TouchableOpacity>
      </View>

      {/* Three Balance Cards */}
      <View style={styles.balanceGrid}>
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.balanceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditAmount}>Rs {balanceSummary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="trending-down" size={14} color="#ef4444" />
            <Text style={styles.balanceLabel}>Debits</Text>
          </View>
          <Text style={styles.debitAmount}>Rs {balanceSummary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        
        <View style={styles.balanceItem}>
          <View style={styles.balanceItemHeader}>
            <Ionicons name="calculator" size={14} color="#06b6d4" />
            <Text style={styles.balanceLabel}>Balance</Text>
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
        count: transactions.length 
      },
      { 
        key: 'expenses', 
        label: 'Expenses', 
        icon: 'remove-circle', 
        count: transactions.filter(t => t.type === 'expense').length 
      },
      { 
        key: 'payments', 
        label: 'Payments', 
        icon: 'add-circle', 
        count: transactions.filter(t => t.type === 'payment').length 
      },
      { 
        key: 'pending', 
        label: 'Pending', 
        icon: 'time', 
        count: transactions.filter(t => t.status === 'pending').length 
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
              selectedFilter === filter.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedFilter(filter.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={filter.icon} 
              size={16} 
              color={selectedFilter === filter.key ? '#ffffff' : '#64748b'} 
            />
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.activeFilterChipText
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterChipBadge,
              selectedFilter === filter.key && styles.activeFilterChipBadge
            ]}>
              <Text style={[
                styles.filterChipBadgeText,
                selectedFilter === filter.key && styles.activeFilterChipBadgeText
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }, [selectedFilter, transactions]);

  const renderTransactionItem = useCallback(({ item }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.transactionCard,
        pressed && styles.transactionCardPressed
      ]}
      onPress={() => Alert.alert('Transaction Details', `View details for ${item.description}`)}
    >
      {/* Header Row - Icon, Title, Amount */}
      <View style={styles.transactionHeader}>
        <View style={[styles.transactionIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.description}
          </Text>
          <Text style={styles.transactionCategory} numberOfLines={1}>
            {item.category}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'payment' ? '#10b981' : '#ef4444' }
          ]}>
            {formatAmount(item.amount, item.type)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      {/* Details Row - Name, Date, Split */}
      <View style={styles.transactionDetails}>
        <View style={styles.detailsLeft}>
          <Text style={styles.personName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.detailsRight}>
          <Text style={styles.splitLabel}>Your share</Text>
          <Text style={styles.splitAmount}>
            Rs {item.splitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Participants Row */}
      <View style={styles.participantsRow}>
        <Text style={styles.participantsLabel}>Participants:</Text>
        <View style={styles.participantsList}>
          {item.participants.slice(0, 4).map((participant, index) => (
            <View 
              key={index} 
              style={[
                styles.participantChip,
                { backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }
              ]}
            >
              <Text style={[styles.participantName, { color: item.color }]}>
                {participant}
              </Text>
            </View>
          ))}
          {item.participants.length > 4 && (
            <View style={[styles.participantChip, styles.moreParticipants]}>
              <Text style={styles.moreParticipantsText}>
                +{item.participants.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  ), [formatDate, formatAmount, getStatusColor]);

  const renderListHeader = useCallback(() => (
    <View>
      {renderBalanceCard()}
      {renderFilterChips()}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedFilter === 'all' ? 'Recent Transactions' : 
           selectedFilter === 'expenses' ? 'Expense Transactions' :
           selectedFilter === 'payments' ? 'Payment Transactions' :
           'Pending Transactions'}
        </Text>
        <View style={styles.headerRight}>
          {dateFilter !== 'all' && (
            <Text style={styles.dateFilterText}>
              {dateFilter === 'today' ? 'Today' :
               dateFilter === 'week' ? 'Last 7 days' :
               dateFilter === 'month' ? 'Last 30 days' :
               dateFilter === 'year' ? 'Last year' : ''}
            </Text>
          )}
          <Text style={styles.transactionCount}>
            {finalFilteredTransactions.length} {finalFilteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </Text>
        </View>
      </View>
    </View>
  ), [renderBalanceCard, renderFilterChips, finalFilteredTransactions.length, selectedFilter, dateFilter]);

  const renderEmptyState = useCallback(() => {
    const getEmptyStateContent = () => {
      switch (selectedFilter) {
        case 'expenses':
          return {
            title: 'No expenses found',
            subtitle: 'No expense transactions match your current filter. Try selecting a different filter or add some expenses.'
          };
        case 'payments':
          return {
            title: 'No payments found',
            subtitle: 'No payment transactions match your current filter. Payments will appear here once they are made.'
          };
        case 'pending':
          return {
            title: 'No pending transactions',
            subtitle: 'All transactions have been completed. Pending transactions will appear here when they need attention.'
          };
        default:
          return {
            title: 'No transactions found',
            subtitle: 'Start adding expenses and payments to see your transaction history here.'
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons 
            name={
              selectedFilter === 'expenses' ? 'remove-circle-outline' :
              selectedFilter === 'payments' ? 'add-circle-outline' :
              selectedFilter === 'pending' ? 'time-outline' :
              'receipt-outline'
            } 
            size={48} 
            color="#9ca3af" 
          />
        </View>
        <Text style={styles.emptyTitle}>{content.title}</Text>
        <Text style={styles.emptySubtitle}>{content.subtitle}</Text>
        
        {selectedFilter !== 'all' && (
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={() => setSelectedFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFilterText}>Show All Transactions</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [selectedFilter]);

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
          <Text style={styles.title}>Transactions</Text>
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
            style={styles.headerAction}
            onPress={() => {
              Alert.alert(
                'Filter by Date',
                'Choose a date range:',
                [
                  { text: 'All Time', onPress: () => setDateFilter('all') },
                  { text: 'Today', onPress: () => setDateFilter('today') },
                  { text: 'Last 7 Days', onPress: () => setDateFilter('week') },
                  { text: 'Last 30 Days', onPress: () => setDateFilter('month') },
                  { text: 'Last Year', onPress: () => setDateFilter('year') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={finalFilteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
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
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
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
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberCountText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
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

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  itemSeparator: {
    height: 12,
  },

  // Balance Card - Updated
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  balanceAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
    flexWrap: 'wrap',
  },
  creditAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: -0.3,
    flexWrap: 'wrap',
  },
  debitAmount: {
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
    marginBottom: 20,
  },
  filterScrollContainer: {
    paddingHorizontal: 0,
    gap: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateFilterText: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Transaction Card - Improved Design
  transactionCard: {
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
  transactionCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },
  
  // Header Row - Icon, Title, Amount
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    lineHeight: 20,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  
  // Details Row - Name, Date, Split
  transactionDetails: {
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
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  splitLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
  },
  
  // Participants Row
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 8,
    minWidth: 80,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  participantChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  participantName: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreParticipants: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  moreParticipantsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
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

export default TransactionsScreen;