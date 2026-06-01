import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, FlatList, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DashboardCard from '../components/DashboardCard';
import { homeStyles } from '../styles/homeStyles';
import { groupsService } from '../services/groupsService';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Fetch favorite groups — re-runs every time Home tab is focused
  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        if (!token) return;
        try {
          const result = await groupsService.fetchGroups(token, user?.person_id || user?.id || null);
          const starred = result.all.filter(g => g.isFavorite);
          setFavoriteGroups(starred.slice(0, 1));
        } catch (error) {
          console.log('Fetch favorites error:', error.message);
        } finally {
          setLoadingFavorites(false);
        }
      };
      fetchFavorites();
    }, [token, user])
  );

  // Recent scenes - 2 latest
  const recentScenes = [
    {
      id: 1,
      title: 'Tummy Cafe',
      group: 'Chichory',
      location: 'Downtown Cafe',
      date: 'May 11, 2026',
      totalBill: 924,
      yourShare: 231,
      participants: 4,
    },
    {
      id: 2,
      title: 'Office Lunch',
      group: 'Chichory',
      location: 'Office Cafeteria',
      date: 'May 7, 2026',
      totalBill: 280,
      yourShare: 140,
      participants: 2,
    },
  ];

  // Recent expenses - 2 latest
  const recentExpenses = [
    {
      id: 1,
      title: 'Monthly Salary',
      type: 'Income',
      amount: 85000,
      category: 'Salary',
      date: '01/05/2026',
      icon: 'cash-outline',
      color: '#10b981',
    },
    {
      id: 2,
      title: 'Tummy Cafe Diner',
      type: 'Expense',
      amount: 2450,
      category: 'Food',
      date: '21/05/2026',
      icon: 'fast-food-outline',
      color: '#f59e0b',
    },
  ];

  // Toggle favorite from HomeScreen
  const toggleFavorite = useCallback(async (groupId) => {
    const group = favoriteGroups.find(g => g.id === groupId);
    if (!group) return;
    const newStarred = !group.isFavorite;

    // Optimistic update
    setFavoriteGroups(prev =>
      newStarred
        ? prev.map(g => g.id === groupId ? { ...g, isFavorite: newStarred } : g)
        : prev.filter(g => g.id !== groupId) // Remove from list if unstarred
    );

    try {
      await groupsService.toggleStar(token, groupId, newStarred);
    } catch (error) {
      // Revert on failure
      setFavoriteGroups(prev => [...prev, group]);
    }
  }, [favoriteGroups, token]);

  const handleGroupPress = useCallback((group) => {
    navigation.navigate('Groups', {
      screen: 'Transactions',
      params: { groupName: group.name, groupId: group.id, groupData: group }
    });
  }, [navigation]);

  const formatBalance = useCallback((balance) => {
    const isNegative = balance < 0;
    const formatted = Math.abs(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isNegative ? '-' : '+'}Rs ${formatted}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = { active: '#10b981', inactive: '#6b7280', pending: '#f59e0b' };
    return colors[status] || colors.inactive;
  }, []);

  const handleGroupAction = useCallback((action, group) => {
    const actions = {
      transactions: () => navigation.navigate('Groups', {
        screen: 'Transactions',
        params: { groupName: group.name, groupId: group.id, groupData: group }
      }),
      deposits: () => navigation.navigate('Groups', {
        screen: 'Deposits',
        params: { groupName: group.name, groupId: group.id, groupData: group }
      }),
      manage: () => navigation.navigate('Groups', {
        screen: 'ManageGroup',
        params: { groupName: group.name, groupId: group.id, groupData: group }
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
                setFavoriteGroups(prev => prev.filter(g => g.id !== group.id));
              } catch (error) {
                Alert.alert('Error', error.message || 'Could not leave group.');
              }
            }
          }
        ]
      )
    };
    actions[action]?.();
  }, [navigation]);

  const renderFavoriteGroup = useCallback(({ item }) => (
    <Pressable
      style={({ pressed }) => [homeStyles.groupCard, pressed && homeStyles.groupCardPressed]}
      onPress={() => handleGroupPress(item)}
    >
      <View style={homeStyles.cardHeader}>
        <View style={homeStyles.groupMainInfo}>
          <View style={homeStyles.groupTitleRow}>
            <View style={[homeStyles.groupIndicator, { backgroundColor: item.color }]} />
            <Text style={homeStyles.groupName}>{item.name}</Text>
            <View style={homeStyles.statusContainer}>
              <View style={[homeStyles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[homeStyles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={homeStyles.groupMetadata}>
            <View style={homeStyles.roleContainer}>
              <Ionicons name={item.role === 'admin' ? 'shield-checkmark' : 'person'} size={12} color="#6b7280" />
              <Text style={homeStyles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
            <Text style={homeStyles.lastActivity}>{item.lastActivity}</Text>
          </View>
        </View>
        <TouchableOpacity style={homeStyles.favoriteButton} onPress={() => toggleFavorite(item.id)} activeOpacity={0.7}>
          <Ionicons name={item.isFavorite ? "star" : "star-outline"} size={18} color={item.isFavorite ? "#f59e0b" : "#9ca3af"} />
        </TouchableOpacity>
      </View>

      <View style={homeStyles.balanceSection}>
        <View style={homeStyles.balanceInfo}>
          <Text style={homeStyles.balanceLabel}>Balance</Text>
          <Text style={[homeStyles.balanceAmount, { color: item.totalBalance >= 0 ? '#10b981' : '#ef4444' }]}>
            {formatBalance(item.totalBalance)}
          </Text>
        </View>
        <View style={homeStyles.membersInfo}>
          <View style={homeStyles.membersCount}>
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text style={homeStyles.membersText}>{item.members} member{item.members !== 1 ? 's' : ''}</Text>
          </View>
          <View style={homeStyles.memberAvatars}>
            {item.memberInitials.slice(0, 3).map((initial, index) => (
              <View key={index} style={[homeStyles.avatar, { backgroundColor: item.color }, index > 0 && homeStyles.avatarOverlap]}>
                <Text style={homeStyles.avatarText}>{initial}</Text>
              </View>
            ))}
            {item.members > 3 && (
              <View style={[homeStyles.avatar, homeStyles.avatarMore, homeStyles.avatarOverlap]}>
                <Text style={homeStyles.avatarMoreText}>+{item.members - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={homeStyles.actionsSection}>
        <TouchableOpacity style={homeStyles.actionButton} onPress={() => handleGroupAction('transactions', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="receipt" size={16} color="#2563eb" />
          </View>
          <Text style={homeStyles.actionLabel}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={homeStyles.actionButton} onPress={() => handleGroupAction('deposits', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="wallet" size={16} color="#16a34a" />
          </View>
          <Text style={homeStyles.actionLabel}>Deposits</Text>
        </TouchableOpacity>
        {item.role === 'admin' && (
          <TouchableOpacity style={homeStyles.actionButton} onPress={() => handleGroupAction('manage', item)} activeOpacity={0.7}>
            <View style={[homeStyles.actionIconContainer, { backgroundColor: '#f0f9ff' }]}>
              <Ionicons name="people" size={16} color="#06b6d4" />
            </View>
            <Text style={[homeStyles.actionLabel, { color: '#06b6d4' }]}>Manage</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={homeStyles.actionButton} onPress={() => handleGroupAction('leave', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="exit-outline" size={16} color="#dc2626" />
          </View>
          <Text style={[homeStyles.actionLabel, { color: '#dc2626' }]}>Leave</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [handleGroupPress, formatBalance, navigation, getStatusColor, handleGroupAction, toggleFavorite]);

  const renderFavoriteHeader = useCallback(() => (
    <View style={homeStyles.sectionHeader}>
      <View style={homeStyles.sectionHeaderLeft}>
        <Ionicons name="star" size={18} color="#f59e0b" />
        <Text style={homeStyles.sectionTitle}>Favorite Groups</Text>
      </View>
      <TouchableOpacity style={homeStyles.viewAllButton} onPress={() => navigation.navigate('Groups')} activeOpacity={0.7}>
        <Text style={homeStyles.viewAllText}>View All</Text>
        <Ionicons name="chevron-forward" size={16} color="#06b6d4" />
      </TouchableOpacity>
    </View>
  ), [navigation]);

  const renderEmptyFavorites = useCallback(() => (
    <View style={homeStyles.emptyFavorites}>
      <View style={homeStyles.emptyFavoritesIcon}>
        <Ionicons name="star-outline" size={32} color="#9ca3af" />
      </View>
      <Text style={homeStyles.emptyFavoritesTitle}>No Favorite Groups</Text>
      <Text style={homeStyles.emptyFavoritesSubtitle}>Star your frequently used groups to see them here</Text>
      <TouchableOpacity style={homeStyles.browseGroupsButton} onPress={() => navigation.navigate('Groups')} activeOpacity={0.8}>
        <Text style={homeStyles.browseGroupsText}>Browse Groups</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  return (
    <ScrollView style={homeStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={homeStyles.scrollContent}>
      <DashboardCard />

      {/* Favorite Groups Section */}
      <View style={homeStyles.section}>
        {renderFavoriteHeader()}
        {loadingFavorites ? (
          <View style={homeStyles.skeletonCard}>
            <View style={homeStyles.skeletonRow}>
              <View style={homeStyles.skeletonIndicator} />
              <View style={homeStyles.skeletonTitle} />
              <View style={homeStyles.skeletonBadge} />
            </View>
            <View style={homeStyles.skeletonBalance} />
            <View style={homeStyles.skeletonActions}>
              <View style={homeStyles.skeletonAction} />
              <View style={homeStyles.skeletonAction} />
              <View style={homeStyles.skeletonAction} />
            </View>
          </View>
        ) : (
          <FlatList
            data={favoriteGroups.slice(0, 1)}
            renderItem={renderFavoriteGroup}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyFavorites}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Recent Scenes Section */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <View style={homeStyles.sectionHeaderLeft}>
            <Ionicons name="receipt-outline" size={18} color="#06b6d4" />
            <Text style={homeStyles.sectionTitle}>Recent Scenes</Text>
          </View>
          <TouchableOpacity style={homeStyles.viewAllButton} onPress={() => navigation.navigate('Scenes')} activeOpacity={0.7}>
            <Text style={homeStyles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {recentScenes.map((scene) => (
          <TouchableOpacity key={scene.id} style={homeStyles.recentCard} activeOpacity={0.7}>
            <View style={homeStyles.recentCardLeft}>
              <View style={[homeStyles.recentIconBox, { backgroundColor: '#f0fdfa' }]}>
                <Ionicons name="restaurant-outline" size={18} color="#06b6d4" />
              </View>
              <View style={homeStyles.recentCardInfo}>
                <Text style={homeStyles.recentCardTitle}>{scene.title}</Text>
                <View style={homeStyles.recentCardMeta}>
                  <Ionicons name="location-outline" size={12} color="#94a3b8" />
                  <Text style={homeStyles.recentCardSubtitle}>{scene.location}</Text>
                  <Text style={homeStyles.recentCardDot}>·</Text>
                  <Text style={homeStyles.recentCardSubtitle}>{scene.date}</Text>
                </View>
              </View>
            </View>
            <View style={homeStyles.recentCardRight}>
              <Text style={homeStyles.recentCardAmount}>Rs {scene.totalBill}</Text>
              <Text style={homeStyles.recentCardShare}>Your share: Rs {scene.yourShare}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Expenses Section */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <View style={homeStyles.sectionHeaderLeft}>
            <Ionicons name="wallet-outline" size={18} color="#8b5cf6" />
            <Text style={homeStyles.sectionTitle}>Recent Expenses</Text>
          </View>
          <TouchableOpacity style={homeStyles.viewAllButton} onPress={() => navigation.navigate('Expenses')} activeOpacity={0.7}>
            <Text style={homeStyles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {recentExpenses.map((expense) => (
          <TouchableOpacity key={expense.id} style={homeStyles.recentCard} activeOpacity={0.7}>
            <View style={homeStyles.recentCardLeft}>
              <View style={[homeStyles.recentIconBox, { backgroundColor: `${expense.color}15` }]}>
                <Ionicons name={expense.icon} size={18} color={expense.color} />
              </View>
              <View style={homeStyles.recentCardInfo}>
                <Text style={homeStyles.recentCardTitle}>{expense.title}</Text>
                <View style={homeStyles.recentCardMeta}>
                  <View style={[homeStyles.categoryBadge, { backgroundColor: `${expense.color}15` }]}>
                    <Text style={[homeStyles.categoryBadgeText, { color: expense.color }]}>{expense.category}</Text>
                  </View>
                  <Text style={homeStyles.recentCardDot}>·</Text>
                  <Text style={homeStyles.recentCardSubtitle}>{expense.date}</Text>
                </View>
              </View>
            </View>
            <View style={homeStyles.recentCardRight}>
              <Text style={[homeStyles.recentCardAmount, { color: expense.type === 'Income' ? '#10b981' : '#ef4444' }]}>
                {expense.type === 'Income' ? '+' : '-'}Rs {expense.amount.toLocaleString()}
              </Text>
              <Text style={[homeStyles.expenseType, { color: expense.type === 'Income' ? '#10b981' : '#ef4444' }]}>
                {expense.type}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Split Bill Button */}
        <TouchableOpacity
          style={homeStyles.splitBillButton}
          onPress={() => navigation.navigate('Expenses')}
          activeOpacity={0.8}
        >
          <Ionicons name="git-branch-outline" size={18} color="#ffffff" />
          <Text style={homeStyles.splitBillButtonText}>Create Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={homeStyles.bottomPadding} />
    </ScrollView>
  );
};

export default HomeScreen;
