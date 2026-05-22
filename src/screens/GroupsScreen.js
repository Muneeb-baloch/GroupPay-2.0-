import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Pressable,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { groupsService } from '../services/groupsService';
import { formatBalance, getStatusColor } from '../utils/helpers';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../constants/theme';

const GroupsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('your');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [groupsData, setGroupsData] = useState({ your: [], member: [] });

  // Fetch groups from API
  const fetchGroups = useCallback(async () => {
    try {
      const result = await groupsService.fetchGroups(token);
      setGroupsData({ your: result.your, member: result.member });
    } catch (error) {
      console.log('Fetch groups error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
    await fetchGroups();
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
                setGroupsData(prev => ({
                  your: prev.your.filter(g => g.id !== group.id),
                  member: prev.member.filter(g => g.id !== group.id),
                }));
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
  }, [navigation, token]);

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
    } catch (error) {
      console.log('Toggle star error:', error.message);
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
  }, [groupsData, token]);

  // Skeleton Loading Component

  const renderGroupCard = useCallback((group) => (
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
                color="#6b7280" 
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
            color={group.isFavorite ? "#f59e0b" : "#9ca3af"} 
          />
        </TouchableOpacity>
      </View>

      {/* Balance & Members - Inline Layout */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[
            styles.balanceAmount,
            { color: group.totalBalance >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {formatBalance(group.totalBalance)}
          </Text>
        </View>
        
        <View style={styles.membersInfo}>
          <View style={styles.membersCount}>
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text style={styles.membersText}>
              {group.members} member{group.members !== 1 ? 's' : ''}
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
            {group.members > 3 && (
              <View style={[styles.avatar, styles.avatarMore, styles.avatarOverlap]}>
                <Text style={styles.avatarMoreText}>+{group.members - 3}</Text>
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
          <View style={[styles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="receipt" size={16} color="#2563eb" />
          </View>
          <Text style={styles.actionLabel}>Transactions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleGroupAction('deposits', group)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: '#f0fdf4' }]}>
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
            <View style={[styles.actionIconContainer, { backgroundColor: '#f0f9ff' }]}>
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
          <View style={[styles.actionIconContainer, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="exit-outline" size={16} color="#dc2626" />
          </View>
          <Text style={[styles.actionLabel, { color: '#dc2626' }]}>Leave</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [handleGroupAction, formatBalance, getStatusColor, toggleFavorite]);

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
        contentContainerStyle={styles.flatListContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100, // Account for bottom tab
  },
  itemSeparator: {
    height: 12,
  },
  listFooter: {
    height: 20,
  },
  
  // Header Styles
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Filter Chips - Simplified
  filterSection: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeChipText: {
    color: '#ffffff',
  },
  chipBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeChipBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeChipBadgeText: {
    color: '#ffffff',
  },

  // Group Card Styles - More Compact
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16, // Reduced from 20
    padding: 16, // Reduced from 20
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.04, // Lighter shadow
    shadowRadius: 8, // Reduced shadow radius
    elevation: 2, // Reduced elevation
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  groupCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },

  // Card Header - Compact
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // Reduced from 16
  },
  groupMainInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  groupIndicator: {
    width: 3, // Reduced from 4
    height: 16, // Reduced from 20
    borderRadius: 2,
    marginRight: 10, // Reduced from 12
  },
  groupName: {
    fontSize: 18, // Reduced from 20
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    letterSpacing: -0.3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 3, // Reduced from 4
    borderRadius: 6, // Reduced from 8
    marginLeft: 8,
  },
  statusDot: {
    width: 5, // Reduced from 6
    height: 5, // Reduced from 6
    borderRadius: 3,
    marginRight: 4, // Reduced from 6
  },
  statusText: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
  },
  groupMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3, // Reduced from 4
  },
  roleText: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
    color: '#6b7280',
  },
  lastActivity: {
    fontSize: 11, // Reduced from 12
    color: '#9ca3af',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 6, // Reduced from 8
    borderRadius: 6, // Reduced from 8
    backgroundColor: '#f8fafc',
    marginLeft: 8,
  },

  // Balance Section - No Borders, More Compact
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Reduced from 16
    marginBottom: 12, // Reduced from 16
    backgroundColor: '#f8fafc', // Light background instead of borders
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12, // Reduced from 14
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2, // Reduced from 4
  },
  balanceAmount: {
    fontSize: 20, // Reduced from 24
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  membersInfo: {
    alignItems: 'flex-end',
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Reduced from 6
    marginBottom: 6, // Reduced from 8
  },
  membersText: {
    fontSize: 12, // Reduced from 14
    color: '#64748b',
    fontWeight: '500',
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Reduced from 16
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarOverlap: {
    marginLeft: -10, // Reduced from -12
  },
  avatarText: {
    fontSize: 11, // Reduced from 12
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarMore: {
    backgroundColor: '#64748b',
  },
  avatarMoreText: {
    fontSize: 9, // Reduced from 10
    fontWeight: '700',
    color: '#ffffff',
  },

  // Actions Section - More Compact
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6, // Reduced from 8
  },
  actionIconContainer: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
    borderRadius: 18, // Reduced from 22
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // Reduced from 8
  },
  actionLabel: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // Empty State - Clean simple design
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginRight: 12,
  },
  skeletonTitle: {
    flex: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 12,
  },
  skeletonStatus: {
    width: 60,
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  skeletonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonRole: {
    width: 80,
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonActivity: {
    width: 100,
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  skeletonBalanceLabel: {
    width: 80,
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonBalanceAmount: {
    width: 100,
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  skeletonAvatars: {
    flexDirection: 'row',
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  skeletonAvatarOverlap: {
    marginLeft: -12,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonAction: {
    width: 60,
    height: 60,
    backgroundColor: '#e2e8f0',
    borderRadius: 30,
  },
});

export default GroupsScreen;