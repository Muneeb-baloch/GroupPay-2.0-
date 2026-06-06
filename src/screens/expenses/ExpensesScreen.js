import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PillSelector from '../../components/common/PillSelector';
import ActionFooter from '../../components/common/ActionFooter';
import { createUniqueId } from '../../utils/helpers';
import { expensesService } from '../../services/expensesService';
import { filesService } from '../../services/filesService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getExpensesStyles } from '../../styles/expenses/expensesStyles';
const { width } = Dimensions.get('window');

// Normalize a raw API expense into the format the UI expects
const normalizeExpense = (e) => {
  const apiType = (e.type || '').toUpperCase();
  const d = new Date(e.date_time || e.created_at || Date.now());
  const pad = (n) => String(n).padStart(2, '0');
  const dateTime = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    id: e.id || e.expense_id,
    title: e.location || e.note || 'Expense',
    type: apiType === 'CREDIT' ? 'Income' : 'Expense',
    amount: parseFloat(e.amount || 0),
    category: 'Other',
    dateTime,
    dateStamp: d,
    note: e.note || '',
    attachment: (e.img_url && e.img_url.length > 0) ? e.img_url[0] : null,
  };
};

const CATEGORIES = [
  { name: 'Salary', icon: 'cash-outline', color: '#10b981' },
  { name: 'Freelance', icon: 'code-working-outline', color: '#06b6d4' },
  { name: 'Food', icon: 'fast-food-outline', color: '#f59e0b' },
  { name: 'Travel', icon: 'car-outline', color: '#3b82f6' },
  { name: 'Shopping', icon: 'cart-outline', color: '#ec4899' },
  { name: 'Other', icon: 'grid-outline', color: '#64748b' }
];

const _now = new Date();
const _pad = (n) => String(n).padStart(2, '0');
const _curMonth = _pad(_now.getMonth() + 1);
const _curYear  = String(_now.getFullYear());
const _lastDay  = _pad(new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate());

const ExpensesScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getExpensesStyles(colors), [colors]);
  const [transactions, setTransactions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('Monthly');
  const [filterType, setFilterType] = useState('All');

  // Filter Configuration Dates — default to current month
  const [fromDay,   setFromDay]   = useState('01');
  const [fromMonth, setFromMonth] = useState(_curMonth);
  const [fromYear,  setFromYear]  = useState(_curYear);

  const [toDay,   setToDay]   = useState(_lastDay);
  const [toMonth, setToMonth] = useState(_curMonth);
  const [toYear,  setToYear]  = useState(_curYear);

  // Modal Screen Triggers
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Form Input Elements State
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState('Expense');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[2]);
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Sub-modal Datetime states
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [expenseDateTime, setExpenseDateTime] = useState('');
  const [pickerDay, setPickerDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [pickerMonth, setPickerMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear().toString());
  const [pickerHour, setPickerHour] = useState('20');
  const [pickerMin, setPickerMin] = useState('45');

  const [apiUnavailable, setApiUnavailable] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const data = await expensesService.getExpenses(token, { pageSize: 100 });
      const raw =
        data?.data?.expenses ||
        data?.data?.data     ||
        data?.data           ||
        data?.expenses       ||
        data?.rows           ||
        [];
      setTransactions(Array.isArray(raw) ? raw.map(normalizeExpense) : []);
      setApiUnavailable(false);
    } catch {
      setApiUnavailable(true);
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    if (route?.params?.openAddSheet) {
      setAddModalVisible(true);
      navigation.setParams({ openAddSheet: false });
    }
  }, [navigation, route?.params?.openAddSheet]);

  // Compute Functional State List Processing
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (filterType !== 'All' && t.type !== filterType) return false;

      const txDate = new Date(t.dateStamp);
      const startBound = new Date(parseInt(fromYear), parseInt(fromMonth) - 1, parseInt(fromDay));
      const endBound = new Date(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay));

      txDate.setHours(0, 0, 0, 0);
      startBound.setHours(0, 0, 0, 0);
      endBound.setHours(0, 0, 0, 0);

      return txDate >= startBound && txDate <= endBound;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const [stats, setStats] = useState({ net: 0, income: 0, spent: 0 });

  useEffect(() => {
    let incomeSum = 0;
    let spentSum = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'Income') {
        incomeSum += t.amount;
      } else {
        spentSum += t.amount;
      }
    });

    setStats({
      income: incomeSum,
      spent: spentSum,
      net: incomeSum - spentSum
    });
  }, [transactions, filterType, fromDay, fromMonth, fromYear, toDay, toMonth, toYear]);

  useEffect(() => {
    const d = new Date();
    setExpenseDateTime(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
  }, []);

  const handleApplyDateTime = () => {
    setExpenseDateTime(`${pickerDay}/${pickerMonth}/${pickerYear}, ${pickerHour}:${pickerMin}`);
    setDateModalVisible(false);
  };

  const handleResetFilters = () => {
    setFromDay('01'); setFromMonth(_curMonth); setFromYear(_curYear);
    setToDay(_lastDay); setToMonth(_curMonth); setToYear(_curYear);
    setFilterType('All');
  };

  const handlePickImage = async () => {
    Alert.alert('Upload Receipt', 'Choose receipt source:', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status === 'granted') {
            const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
            if (!res.canceled) setAttachment(res.assets[0].uri);
          }
        }
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status === 'granted') {
            const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
            if (!res.canceled) setAttachment(res.assets[0].uri);
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleAddExpense = async () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) return Alert.alert('Error', 'Please enter a valid amount.');
    if (!title.trim()) return Alert.alert('Error', 'Please enter title/location.');

    // Build ISO datetime from picker values
    const [datePart, timePart] = expenseDateTime.split(', ');
    const [dd, mm, yyyy] = (datePart || '').split('/');
    const [hh, min] = (timePart || '00:00').split(':');
    const isoDate = `${yyyy}-${mm}-${dd}T${hh}:${min}:00.000Z`;

    try {
      let imgUrls = [];
      if (attachment) {
        try {
          const up = await filesService.uploadFile(token, { uri: attachment }, 'expenses');
          const url = up?.data?.url || up?.url || up?.file_url || up?.path || null;
          if (url) imgUrls = [url];
        } catch {
          // non-fatal — save without image
        }
      }

      const response = await expensesService.createExpense(token, {
        amount: amtNum,
        type: expenseType === 'Income' ? 'CREDIT' : 'DEBIT',
        location: title.trim(),
        note: note.trim(),
        date_time: isoDate,
        img_url: imgUrls,
      });

      const created = response?.data?.expense || response?.data || response?.expense || response;
      const newTx = normalizeExpense({ ...created, location: title.trim(), note: note.trim(), amount: amtNum });
      newTx.category = selectedCategory.name;

      setTransactions(prev => [newTx, ...prev]);
    } catch (err) {
      const msg = err?.message || '';
      const isServerTableBug = msg.toLowerCase().includes('table') || msg.toLowerCase().includes('schema');
      Alert.alert(
        'Server Error',
        isServerTableBug
          ? 'The expenses feature is not available yet on the server. Please contact support.'
          : msg || 'Could not save expense. Please try again.'
      );
      return;
    }

    setAddModalVisible(false);
    setAmount('');
    setTitle('');
    setNote('');
    setAttachment(null);
    setExpenseType('Expense');
    setSelectedCategory(CATEGORIES[2]);
  };

  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setTransactions(prev => prev.filter(t => t.id !== id));
            try {
              await expensesService.deleteExpense(token, id);
            } catch {
              // revert on failure
              fetchExpenses();
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (catName) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.color : '#06b6d4';
  };

  const getCategoryIcon = (catName) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.icon : 'wallet-outline';
  };

  const isFilterActive = filterType !== 'All' ||
    fromDay !== '01' || fromMonth !== _curMonth || fromYear !== _curYear ||
    toDay !== _lastDay || toMonth !== _curMonth || toYear !== _curYear;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- RESTORED ORIGINAL GREAT HEADER LAYOUT --- */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Expenses</Text>
            <Text style={styles.subtitle}>Track personal financial balances</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconActionButton, isFilterActive && styles.iconActionButtonActive]}
              onPress={() => {
                if (isFilterActive) {
                  handleResetFilters(); // Deselect/reset filters if already active
                } else {
                  setFilterModalVisible(true); // Open modal if no filter active
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFilterActive ? "funnel" : "funnel-outline"}
                size={19}
                color={isFilterActive ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => setAddModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TIME TIMEFRAME PILL ROW */}
        <View style={styles.pillControlRow}>
          <View style={styles.pillContainer}>
            {['Monthly', 'Quarterly', 'Yearly'].map((pill) => {
              const isActive = activeTimeframe === pill;
              return (
                <TouchableOpacity
                  key={pill}
                  style={[styles.pillItem, isActive && styles.pillItemActive]}
                  onPress={() => setActiveTimeframe(pill)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {pill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* BALANCES DASHBOARD */}
        <View style={styles.statsCard}>
          <View style={[styles.statBox, { borderRightWidth: 1, borderRightColor: colors.cardBorder }]}>
            <Text style={styles.statLabel}>Net Balance</Text>
            <Text style={[styles.statValue, { color: stats.net >= 0 ? '#10b981' : '#ef4444' }]}>
              {stats.net >= 0 ? '+' : ''}Rs {stats.net.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 1, borderRightColor: colors.cardBorder }]}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: '#06b6d4' }]}>
              Rs {stats.income.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>
              Rs {stats.spent.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* LIST ROW STRIP */}
        <View style={styles.transactionsHeaderRow}>
          <Text style={styles.transactionsTitle}>
            Transactions ({filteredTransactions.length})
          </Text>
          {isFilterActive && (
            <TouchableOpacity onPress={handleResetFilters}>
              <Text style={styles.resetTextLinkQuick}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingList ? (
          <View style={styles.emptyStateCard}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={[styles.emptyStateTitle, { marginTop: 12 }]}>Loading expenses...</Text>
          </View>
        ) : apiUnavailable ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIconCircle}>
              <Ionicons name="cloud-offline-outline" size={30} color="#f59e0b" />
            </View>
            <Text style={styles.emptyStateTitle}>Feature Unavailable</Text>
            <Text style={styles.emptyStateSubtitle}>
              Personal expenses are not available yet. Pull down to retry.
            </Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <View style={styles.emptyStateIconCircle}>
              <Ionicons name="wallet-outline" size={30} color="#06b6d4" />
            </View>
            <Text style={styles.emptyStateTitle}>No transactions found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Adjust parameters inside filter config popup or add entries to display dashboards.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {filteredTransactions.map((tx, idx) => (
              <TouchableOpacity
                key={tx.id}
                style={[styles.txRow, idx === filteredTransactions.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handleDeleteTransaction(tx.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.txAvatarCircle, { backgroundColor: `${getCategoryColor(tx.category)}12` }]}>
                  <Ionicons name={getCategoryIcon(tx.category)} size={16} color={getCategoryColor(tx.category)} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitleText} numberOfLines={1}>{tx.title}</Text>
                  <View style={styles.txMetaRow}>
                    <View style={[styles.txCatBadge, { backgroundColor: `${getCategoryColor(tx.category)}12` }]}>
                      <Text style={[styles.txCatBadgeText, { color: getCategoryColor(tx.category) }]}>{tx.category}</Text>
                    </View>
                    <Text style={styles.txDateText}>{tx.dateTime.split(',')[0]}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmountText, { color: tx.type === 'Income' ? '#10b981' : '#ef4444' }]}>
                    {tx.type === 'Income' ? '+' : '-'}Rs {tx.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.txTypeText}>{tx.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB TRIGGER */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* --- POPUP INTERACTIVE CONFIGURATIONS POPUP BOTTOM SHEET --- */}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addSheet}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Interactive Configurations</Text>
              <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.7}>
                <Text style={styles.resetTextLink}>Reset Filters</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <View style={styles.datesRow}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>From Date (DD/MM/YYYY)</Text>
                  <View style={styles.datePickerInputGroup}>
                    <TextInput style={styles.dateInlineInput} value={fromDay} onChangeText={setFromDay} keyboardType="numeric" maxLength={2} />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput style={styles.dateInlineInput} value={fromMonth} onChangeText={setFromMonth} keyboardType="numeric" maxLength={2} />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput style={[styles.dateInlineInput, { width: 44 }]} value={fromYear} onChangeText={setFromYear} keyboardType="numeric" maxLength={4} />
                  </View>
                </View>

                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>To Date (DD/MM/YYYY)</Text>
                  <View style={styles.datePickerInputGroup}>
                    <TextInput style={styles.dateInlineInput} value={toDay} onChangeText={setToDay} keyboardType="numeric" maxLength={2} />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput style={styles.dateInlineInput} value={toMonth} onChangeText={setToMonth} keyboardType="numeric" maxLength={2} />
                    <Text style={styles.dateSlash}>/</Text>
                    <TextInput style={[styles.dateInlineInput, { width: 44 }]} value={toYear} onChangeText={setToYear} keyboardType="numeric" maxLength={4} />
                  </View>
                </View>
              </View>

              <View style={styles.typesRow}>
                <Text style={styles.typeSelectorLabel}>Transaction Type</Text>
                <PillSelector
                  mode="segmented"
                  selectedKey={filterType}
                  onSelect={setFilterType}
                  containerStyle={styles.typeButtonsRow}
                  items={[
                    { key: 'All', label: 'All', icon: 'layers-outline' },
                    { key: 'Income', label: 'Income', icon: 'trending-up-outline' },
                    { key: 'Expense', label: 'Expense', icon: 'trending-down-outline' },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={styles.applyFilterButton}
                onPress={() => setFilterModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyFilterButtonText}>Apply Parameters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TRANSACTION INPUT MODAL SHEET */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View style={styles.addSheet}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setAddModalVisible(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Add Personal Transaction</Text>
                <View style={{ width: 32 }} />
              </View>

              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalAmountHeader}>
                  <Text style={styles.modalAmountLabel}>Transaction Amount</Text>
                  <View style={styles.modalAmountRow}>
                    <Text style={styles.modalAmountCurrency}>Rs</Text>
                    <TextInput
                      style={styles.modalAmountInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                </View>

                <PillSelector
                  mode="segmented"
                  selectedKey={expenseType}
                  onSelect={setExpenseType}
                  containerStyle={styles.modalPillContainer}
                  items={[
                    { key: 'Expense', label: 'Expense', icon: 'trending-down-outline' },
                    { key: 'Income', label: 'Income', icon: 'trending-up-outline' },
                  ]}
                />

                <View style={styles.modalFormCard}>
                  <View style={styles.modalFormRow}>
                    <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.modalRowLabel}>Title</Text>
                    <TextInput
                      style={styles.modalRowInput}
                      placeholder="e.g. Grocery Store, Pay"
                      placeholderTextColor={colors.textMuted}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  <View style={[styles.modalFormRow, { flexWrap: 'wrap', height: 'auto', paddingVertical: 12 }]}>
                    <Ionicons name="grid-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10, marginTop: 4 }} />
                    <Text style={styles.modalRowLabel}>Category</Text>
                    <PillSelector
                      selectedKey={selectedCategory.name}
                      onSelect={(key) => setSelectedCategory(CATEGORIES.find(cat => cat.name === key) || CATEGORIES[0])}
                      containerStyle={styles.catChipsContainer}
                      items={CATEGORIES.map(cat => ({
                        key: cat.name,
                        label: cat.name,
                        icon: cat.icon,
                      }))}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.modalFormRow}
                    onPress={() => setDateModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.modalRowLabel}>Date & Time</Text>
                    <Text style={styles.modalRowValue}>{expenseDateTime}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.modalFormRow, { borderBottomWidth: 0, alignItems: 'flex-start', paddingVertical: 12 }]}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notesLabel}>Note Description</Text>
                      <TextInput
                        style={styles.notesTextInput}
                        placeholder="Add specific description flags..."
                        placeholderTextColor={colors.textMuted}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Receipt Image</Text>
                    {!attachment ? (
                      <TouchableOpacity
                        style={styles.receiptAddBtn}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera-outline" size={14} color="#06b6d4" />
                        <Text style={styles.receiptAddText}>Add Photo</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.receiptThumbnailContainer}>
                        <Image source={{ uri: attachment }} style={styles.receiptThumbnail} />
                        <TouchableOpacity
                          style={styles.receiptRemoveBadge}
                          onPress={() => setAttachment(null)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close" size={10} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>

              <ActionFooter
                cancelLabel="Cancel"
                confirmLabel="Save Expense"
                onCancel={() => setAddModalVisible(false)}
                onConfirm={handleAddExpense}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* DATE SUBMODAL CONFIG */}
      <Modal visible={dateModalVisible} transparent animationType="slide" onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.dateSubOverlay}>
          <View style={styles.dateSubSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Expense Date</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSubLabel}>Day / Month / Year</Text>
              <View style={styles.pickerRow}>
                <TextInput style={styles.pickerInput} value={pickerDay} onChangeText={setPickerDay} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>/</Text>
                <TextInput style={styles.pickerInput} value={pickerMonth} onChangeText={setPickerMonth} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>/</Text>
                <TextInput style={[styles.pickerInput, { width: 64 }]} value={pickerYear} onChangeText={setPickerYear} keyboardType="numeric" maxLength={4} />
              </View>

              <Text style={styles.pickerSubLabel}>Time (Hour : Min)</Text>
              <View style={styles.pickerRow}>
                <TextInput style={styles.pickerInput} value={pickerHour} onChangeText={setPickerHour} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>:</Text>
                <TextInput style={styles.pickerInput} value={pickerMin} onChangeText={setPickerMin} keyboardType="numeric" maxLength={2} />
              </View>

              <ActionFooter
                cancelLabel="Cancel"
                confirmLabel="Apply Date"
                onCancel={() => setDateModalVisible(false)}
                onConfirm={handleApplyDateTime}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExpensesScreen;