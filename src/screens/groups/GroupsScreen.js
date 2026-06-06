import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { groupsService } from '../../services/groupsService';
import { formatBalance, getStatusColor } from '../../utils/helpers';
import { cache } from '../../utils/cache';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGroupsScreenStyles } from '../../styles/groups/groupsScreenStyles';
const GroupsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getGroupsScreenStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState('your');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [groupsData, setGroupsData] = useState({ your: [], member: [] });
  const [groupBalances, setGroupBalances] = useState({});
  const [groupMemberCounts, setGroupMemberCounts] = useState({});

  const fetchGroupBalances = useCallback(async (groups) => {
    const all = [...(groups.your || []), ...(groups.member || [])];
    await Promise.all(all.map(async (group) => {
      try {
        const [balanceData, membersData] = await Promise.all([
          groupsService.getMyGroupBalance(token, group.id).catch(() => null),
          groupsService.getGroupMembers(token, group.id).catch(() => null),
        ]);

        if (balanceData) {
          const balance = parseFloat(
            balanceData?.data?.balance ?? balanceData?.data?.net_balance ?? balanceData?.data?.my_balance ??
            balanceData?.balance ?? balanceData?.net_balance ?? balanceData?.my_balance ?? 0
          );
          setGroupBalances(prev => ({ ...prev, [group.id]: balance }));
        }

        if (membersData) {
          const raw = membersData?.data?.members || membersData?.data?.participants ||
            (Array.isArray(membersData?.data) ? membersData.data : null) ||
            membersData?.members || membersData?.participants || membersData?.rows ||
            (Array.isArray(membersData) ? membersData : []);
          if (Array.isArray(raw) && raw.length > 0) {
            setGroupMemberCounts(prev => ({ ...prev, [group.id]: raw.length }));
          }
        }
      } catch {
        // leave defaults
      }
    }));
  }, [token]);

  const fetchGroups = useCallback(async (silent = false) => {
    const userId = String(user?.person_id || user?.id || '');
    const cacheKey = `groups_${userId}`;

    if (!silent) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setGroupsData(cached);
        setLoading(false);
      }
    }

    try {
      const result = await groupsService.fetchGroups(token, userId || null);
      const fresh = { your: result.your, member: result.member };
      setGroupsData(fresh);
      await cache.set(cacheKey, fresh);
      fetchGroupBalances(fresh);
    } catch (error) {
      // network failure — cached data is already showing
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, user, fetchGroupBalances]);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  // Handle new group from CreateGroupScreen - refresh from API
  React.useEffect(() => {
    if (route.params?.newGroup) {
      fetchGroups(); // Re-fetch from API to get fresh data
      navigation.setParams({ newGroup: undefined });
      setActiveTab('your');
    }
  }, [route.params?.newGroup, navigation, fetchGroups]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroups(true);
    setRefreshing(false);
  }, [fetchGroups]);
  const renderSkeletonCard = useCallback(() => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIndicator} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonStatus} />
      </View>
      <View style={styles.skeletonMeta}>
        <View style={styles.skeletonRole} />
        <View style={styles.skeletonActivity} />
      </View>
      <View style={styles.skeletonBalance}>
        <View style={styles.skeletonBalanceLabel} />
        <View style={styles.skeletonBalanceAmount} />
        <View style={styles.skeletonAvatars}>
          <View style={styles.skeletonAvatar} />
          <View style={[styles.skeletonAvatar, styles.skeletonAvatarOverlap]} />
        </View>
      </View>
      <View style={styles.skeletonActions}>
        <View style={styles.skeletonAction} />
        <View style={styles.skeletonAction} />
        <View style={styles.skeletonAction} />
      </View>
    </View>
  ), []);

  const renderSkeletonList = useCallback(() => (
    <View style={styles.groupsList}>
      {[1, 2].map((item) => (
        <View key={item}>
          {renderSkeletonCard()}
        </View>
      ))}
    </View>
  ), [renderSkeletonCard]);

  const handleGroupAction = useCallback((action, group) => {
    const actions = {
      transactions: () => navigation.navigate('Transactions', {
        groupName: group.name, groupId: group.id, groupData: group
      }),
      deposits: () => navigation.navigate('Deposits', {
        groupName: group.name, groupId: group.id, groupData: group
      }),
      manage: () => navigation.navigate('ManageGroup', {
        groupName: group.name, groupId: group.id, groupData: group
      }),
      leave: () => Alert.alert(
        'Leave Group',
        `Are you sure you want to leave "${group.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              try {
                await groupsService.leaveGroup(token, group.id);
                await fetchGroups();
                Alert.alert('Left Group', `You have left "${group.name}".`);
              } catch (error) {
                Alert.alert('Error', error.message || 'Could not leave group.');
              }
            }
          }
        ]
      )
    };
    actions[action]?.();
  }, [navigation, token, fetchGroups]);

  const toggleFavorite = useCallback(async (groupId) => {
    const currentGroup = [...groupsData.your, ...groupsData.member].find(g => g.id === groupId);
    const newStarred = !currentGroup?.isFavorite;

    // Optimistic update
    setGroupsData(prevData => {
      const newData = { ...prevData };
      Object.keys(newData).forEach(category => {
        const idx = newData[category].findIndex(g => g.id === groupId);
        if (idx !== -1) {
          newData[category][idx] = { ...newData[category][idx], isFavorite: newStarred };
        }
      });
      return newData;
    });

    try {
      await groupsService.toggleStar(token, groupId, newStarred);
      // Invalidate cache so HomeScreen reflects the updated star on next focus
      const userId = String(user?.person_id || user?.id || '');
      await cache.clear(`groups_${userId}`);
    } catch (error) {
      // Revert on failure
      setGroupsData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(category => {
          const idx = newData[category].findIndex(g => g.id === groupId);
          if (idx !== -1) {
            newData[category][idx] = { ...newData[category][idx], isFavorite: !newStarred };
          }
        });
        return newData;
      });
    }
  }, [groupsData, token, user]);

  // Skeleton Loading Component

  const renderGroupCard = useCallback((group) => {
    const liveBalance = groupBalances.hasOwnProperty(group.id)
      ? groupBalances[group.id]
      : group.totalBalance;
    const liveMembers = groupMemberCounts.hasOwnProperty(group.id)
      ? groupMemberCounts[group.id]
      : group.members;
    return (
    <Pressable 
      key={group.id} 
      style={({ pressed }) => [
        styles.groupCard,
        pressed && styles.groupCardPressed
      ]}
    >
      {/* Header Section - More Compact */}
      <View style={styles.cardHeader}>
        <View style={styles.groupMainInfo}>
          <View style={styles.groupTitleRow}>
            <View style={[styles.groupIndicator, { backgroundColor: group.color }]} />
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(group.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(group.status) }]}>
                {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.groupMetadata}>
            <View style={styles.roleContainer}>
              <Ionicons
                name={group.role === 'admin' ? 'shield-checkmark' : 'person'}
                size={12}
                color={colors.textSecondary}
              />
              <Text style={styles.roleText}>{group.role.toUpperCase()}</Text>
            </View>
            <Text style={styles.lastActivity}>{group.lastActivity}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.favoriteButton} 
          activeOpacity={0.7}
          onPress={() => toggleFavorite(group.id)}
        >
          <Ionicons
            name={group.isFavorite ? "star" : "star-outline"}
            size={18}
            color={group.isFavorite ? "#f59e0b" : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Balance & Members - Inline Layout */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[
            styles.balanceAmount,
            { color: liveBalance >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {formatBalance(liveBalance)}
          </Text>
        </View>

        <View style={styles.membersInfo}>
          <View style={styles.membersCount}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={styles.membersText}>
              {liveMembers} member{liveMembers !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.memberAvatars}>
            {group.memberInitials.slice(0, 3).map((initial, index) => (
              <View
                key={index}
                style={[
                  styles.avatar,
                  { backgroundColor: group.color },
                  index > 0 && styles.avatarOverlap
                ]}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            ))}
            {liveMembers > 3 && (
              <View style={[styles.avatar, styles.avatarMore, styles.avatarOverlap]}>
                <Text style={styles.avatarMoreText}>+{liveMembers - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleGroupAction('transactions', group)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.isDark ? 'rgba(37,99,235,0.18)' : '#eff6ff' }]}>
            <Ionicons name="receipt" size={16} color="#2563eb" />
          </View>
          <Text style={styles.actionLabel}>Transactions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleGroupAction('deposits', group)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.isDark ? 'rgba(22,163,74,0.18)' : '#f0fdf4' }]}>
            <Ionicons name="wallet" size={16} color="#16a34a" />
          </View>
          <Text style={styles.actionLabel}>Deposits</Text>
        </TouchableOpacity>

        {group.role === 'admin' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleGroupAction('manage', group)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.isDark ? 'rgba(6,182,212,0.18)' : '#f0f9ff' }]}>
              <Ionicons name="people" size={16} color="#06b6d4" />
            </View>
            <Text style={[styles.actionLabel, { color: '#06b6d4' }]}>Manage</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleGroupAction('leave', group)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.isDark ? 'rgba(239,68,68,0.18)' : '#fef2f2' }]}>
            <Ionicons name="exit-outline" size={16} color="#dc2626" />
          </View>
          <Text style={[styles.actionLabel, { color: '#dc2626' }]}>Leave</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
    );
  }, [handleGroupAction, formatBalance, getStatusColor, toggleFavorite, groupBalances, groupMemberCounts]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={activeTab === 'your' ? 'people-outline' : 'person-add-outline'}
          size={56}
          color="#06b6d4"
        />
      </View>

      <Text style={styles.emptyTitle}>
        {activeTab === 'your' ? 'No Groups Yet' : 'No Member Groups'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'your'
          ? 'Create your first group to start splitting bills and tracking shared expenses.'
          : "You haven't joined any groups yet. Ask a friend to invite you."}
      </Text>

      {activeTab === 'your' && (
        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.emptyButtonText}>Create Group</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [activeTab, navigation]);

  const currentGroups = groupsData[activeTab] || [];

  // FlatList render functions
  const renderGroupItem = useCallback(({ item }) => {
    if (!item?.id) return null;
    return renderGroupCard(item);
  }, [renderGroupCard]);

  const renderListHeader = useCallback(() => (
    <View>
      {/* Header with Create Button */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Groups</Text>
          <Text style={styles.subtitle}>Manage your group Payments</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Group Filter Chips */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, activeTab === 'your' && styles.activeFilterChip]}
            onPress={() => setActiveTab('your')}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <Ionicons 
                name="shield-checkmark" 
                size={16} 
                color={activeTab === 'your' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.chipText, activeTab === 'your' && styles.activeChipText]}>
                Admin
              </Text>
              <View style={[styles.chipBadge, activeTab === 'your' && styles.activeChipBadge]}>
                <Text style={[styles.chipBadgeText, activeTab === 'your' && styles.activeChipBadgeText]}>
                  {groupsData.your?.length || 0}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeTab === 'member' && styles.activeFilterChip]}
            onPress={() => setActiveTab('member')}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <Ionicons 
                name="person" 
                size={16} 
                color={activeTab === 'member' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.chipText, activeTab === 'member' && styles.activeChipText]}>
                Member
              </Text>
              <View style={[styles.chipBadge, activeTab === 'member' && styles.activeChipBadge]}>
                <Text style={[styles.chipBadgeText, activeTab === 'member' && styles.activeChipBadgeText]}>
                  {groupsData.member?.length || 0}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [activeTab, groupsData, handleRefresh, navigation]);

  const renderListEmpty = useCallback(() => {
    if (loading) {
      return renderSkeletonList();
    }
    return renderEmptyState();
  }, [loading, renderSkeletonList, renderEmptyState]);

  const renderItemSeparator = useCallback(() => (
    <View style={styles.itemSeparator} />
  ), []);

  const renderListFooter = useCallback(() => (
    <View style={styles.listFooter} />
  ), []);

  const keyExtractor = useCallback((item, index) => (item?.id?.toString() || index.toString()), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={currentGroups}
        renderItem={renderGroupItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ItemSeparatorComponent={renderItemSeparator}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={[styles.flatListContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#06b6d4"
            colors={['#06b6d4']}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * index,
          index,
        })}
      />
    </View>
  );
};

export default GroupsScreen;