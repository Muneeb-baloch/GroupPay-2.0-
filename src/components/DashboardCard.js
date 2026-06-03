import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, Modal, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { dashboardStyles } from '../styles/dashboardStyles';
import { useAuth } from '../context/AuthContext';
import { groupsService } from '../services/groupsService';
import { transactionsService } from '../services/transactionsService';
import { formatCurrency } from '../utils/helpers';

const { width } = Dimensions.get('window');

const DashboardCard = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const fullName = user?.fullname || user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0];
  const profileInitial = firstName.charAt(0).toUpperCase();
  const profilePicUrl = user?.profile_picture_url || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(['all']);
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Real groups from API
  const [availableGroups, setAvailableGroups] = useState([
    { id: 'all', name: 'All Groups', balance: 0, color: '#06b6d4' },
  ]);

  // ── Helper: extract net_balance from any summary response shape ────────────
  const extractNetBalance = (summaryData) => {
    if (!summaryData) return null;
    const s =
      summaryData?.data?.summary ||
      summaryData?.data?.data    ||
      summaryData?.summary       ||
      summaryData?.data          ||
      summaryData;
    const val =
      s?.net_balance   ??
      s?.netBalance    ??
      s?.balance       ??
      s?.net           ??
      s?.my_balance    ??
      s?.user_balance  ??
      null;
    return val !== null ? parseFloat(val) : null;
  };

  // ── Fetch groups then fetch each group's summary in parallel ───────────────
  useEffect(() => {
    const fetchGroups = async () => {
      if (!token) return;
      setBalanceLoading(true);
      try {
        const result = await groupsService.fetchGroups(token, user?.person_id || user?.id || null);
        const groups = result.all || [];
        const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];

        // Fetch all group summaries in parallel
        const summaryResults = await Promise.all(
          groups.map(g =>
            transactionsService.getGroupSummary(token, g.id).catch(() => null)
          )
        );

        const normalized = groups.map((g, i) => {
          // First try balance from the summary endpoint
          let balance = extractNetBalance(summaryResults[i]);
          // Fall back to whatever the groups endpoint returned
          if (balance === null) {
            balance = parseFloat(
              g.totalBalance ?? g.total_balance ?? g.balance ??
              g.net_balance  ?? g.my_balance   ?? 0
            );
          }
          return {
            id: g.id,
            name: g.name || 'Unnamed Group',
            balance,
            color: g.color || colors[i % colors.length],
          };
        });

        const totalAll = normalized.reduce((sum, g) => sum + g.balance, 0);
        const allGroupsEntry = { id: 'all', name: 'All Groups', balance: totalAll, color: '#06b6d4' };
        setAvailableGroups([allGroupsEntry, ...normalized]);
        setTotalBalance(totalAll);
      } catch (error) {
        console.log('DashboardCard fetch groups error:', error.message);
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchGroups();
  }, [token, user]);

  const getGroupMemberCount = (group) => {
    if (!group) return 0;
    if (typeof group.members === 'number') return group.members;
    if (Array.isArray(group.members)) return group.members.length;
    const candidate = group?.participant_count ?? group?.participants_count ?? group?.member_count ?? group?.members_count ?? group?.memberCount;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))) return Number(candidate);
    const participants = group?.participants || group?.group?.participants || group?.members || [];
    if (Array.isArray(participants)) return participants.length;
    return 0;
  };

  // Calculate total balance based on selected groups
  useEffect(() => {
    if (selectedGroups.includes('all')) {
      setTotalBalance(availableGroups.find(g => g.id === 'all')?.balance || 0);
    } else {
      const total = availableGroups
        .filter(group => selectedGroups.includes(group.id))
        .reduce((sum, group) => sum + group.balance, 0);
      setTotalBalance(total);
    }
  }, [selectedGroups, availableGroups]);

  const handleCreateGroup = () => {
    navigation.navigate('Groups', { screen: 'CreateGroup' });
  };

  const handleDeposit = () => {
    if (selectedGroups.includes('all') || selectedGroups.length === 0) {
      // If "All Groups" is selected or no specific group, show group selection
      Alert.alert(
        'Select Group',
        'Please select a specific group to make a deposit',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose Group', onPress: () => setShowGroupFilter(true) }
        ]
      );
    } else if (selectedGroups.length === 1) {
      // Navigate to deposit screen for the selected group
      const selectedGroup = availableGroups.find(g => g.id === selectedGroups[0]);
      navigation.navigate('Groups', { 
        screen: 'CreateDeposit',
        params: {
          groupName: selectedGroup?.name,
          groupId: selectedGroup?.id,
          groupData: selectedGroup
        }
      });
    } else {
      // Multiple groups selected, let user choose
      Alert.alert(
        'Multiple Groups Selected',
        'Please select one group to make a deposit',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCreateScene = async () => {
    // Open CreateScene; enforce permissions inside CreateSceneScreen on submit.
    navigation.navigate('Scenes', { screen: 'CreateScene' });
  };

  const handleCreateExpense = () => {
    navigation.navigate('Expenses', { openAddSheet: true });
  };

  const toggleGroupSelection = (groupId) => {
    if (groupId === 'all') {
      setSelectedGroups(['all']);
    } else {
      setSelectedGroups(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(groupId)) {
          const filtered = newSelection.filter(id => id !== groupId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, groupId];
        }
      });
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const getSelectedGroupsText = () => {
    if (selectedGroups.includes('all')) {
      return 'All Groups';
    } else if (selectedGroups.length === 1) {
      const group = availableGroups.find(g => g.id === selectedGroups[0]);
      return group?.name || 'Unknown Group';
    } else {
      return `${selectedGroups.length} Groups Selected`;
    }
  };

  const renderGroupFilterItem = ({ item }) => {
    const isSelected = selectedGroups.includes(item.id);
    
    return (
      <Pressable
        style={[
          dashboardStyles.groupFilterItem,
          isSelected && dashboardStyles.groupFilterItemSelected
        ]}
        onPress={() => toggleGroupSelection(item.id)}
      >
        <View style={dashboardStyles.groupFilterInfo}>
          <View style={[dashboardStyles.groupFilterIndicator, { backgroundColor: item.color }]} />
          <View style={dashboardStyles.groupFilterDetails}>
            <Text style={[
              dashboardStyles.groupFilterName,
              isSelected && dashboardStyles.groupFilterNameSelected
            ]}>
              {item.name}
            </Text>
            <Text style={[
              dashboardStyles.groupFilterBalance,
              isSelected && dashboardStyles.groupFilterBalanceSelected,
              { color: item.id !== 'all'
                  ? (item.balance >= 0 ? '#10b981' : '#ef4444')
                  : undefined
              }
            ]}>
              {balanceVisible
                ? `${item.balance >= 0 ? '+' : '-'}Rs ${Math.abs(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : 'Rs ••••••••'
              }
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#06b6d4" />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <View style={dashboardStyles.unifiedCard}>
        <LinearGradient
          colors={['#06b6d4', '#0891b2', '#0e7490']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dashboardStyles.cardGradient}
        >
          {/* Header Section */}
          <View style={dashboardStyles.cardHeader}>
            <TouchableOpacity
              style={dashboardStyles.profileContainer}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <View style={dashboardStyles.profileImage}>
                {profilePicUrl ? (
                  <Image
                    source={{ uri: profilePicUrl }}
                    style={dashboardStyles.profileImagePhoto}
                  />
                ) : (
                  <Text style={dashboardStyles.profileInitial}>{profileInitial}</Text>
                )}
              </View>
              <View>
                <Text style={dashboardStyles.profileGreeting}>{getGreeting()}</Text>
                <Text style={dashboardStyles.profileName}>{firstName}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={dashboardStyles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              <View style={dashboardStyles.notificationBadge}>
                <Text style={dashboardStyles.badgeText}>!</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={dashboardStyles.balanceSection}>
            <View style={dashboardStyles.balanceHeader}>
              <TouchableOpacity 
                style={dashboardStyles.balanceLabelContainer}
                onPress={() => setShowGroupFilter(true)}
                activeOpacity={0.7}
              >
                <Text style={dashboardStyles.balanceLabel}>
                  {getSelectedGroupsText()}
                </Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={dashboardStyles.eyeButton}
                onPress={toggleBalanceVisibility}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="rgba(255,255,255,0.8)" 
                />
              </TouchableOpacity>
            </View>
            <Text style={[
              dashboardStyles.balanceAmount,
              { color: totalBalance >= 0 ? '#ffffff' : '#fca5a5' }
            ]}>
              {!balanceVisible
                ? 'Rs ••••••••'
                : balanceLoading
                  ? '---'
                  : `${totalBalance >= 0 ? '+' : '-'}Rs ${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              }
            </Text>
            
            {/* Action Buttons */}
            <View style={dashboardStyles.actionButtonsContainer}>
              <TouchableOpacity 
                style={dashboardStyles.actionButton}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={dashboardStyles.actionButton}
                onPress={handleDeposit}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="wallet" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={dashboardStyles.actionButton}
                onPress={handleCreateScene}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="arrow-up" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Scenes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={dashboardStyles.actionButton}
                onPress={handleCreateExpense}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="receipt" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Group Filter Modal */}
      <Modal
        visible={showGroupFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupFilter(false)}
      >
        <View style={dashboardStyles.modalOverlay}>
          <View style={dashboardStyles.modalContainer}>
            {/* Modal Header */}
            <View style={dashboardStyles.modalHeader}>
              <Text style={dashboardStyles.modalTitle}>Select Groups</Text>
              <TouchableOpacity 
                style={dashboardStyles.modalCloseButton}
                onPress={() => setShowGroupFilter(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Groups List */}
            <FlatList
              data={availableGroups}
              renderItem={renderGroupFilterItem}
              keyExtractor={(item) => item.id.toString()}
              style={dashboardStyles.groupsList}
              showsVerticalScrollIndicator={false}
            />

            {/* Modal Footer */}
            <View style={dashboardStyles.modalFooter}>
              <TouchableOpacity
                style={dashboardStyles.applyButton}
                onPress={() => setShowGroupFilter(false)}
                activeOpacity={0.8}
              >
                <Text style={dashboardStyles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};


export default DashboardCard;