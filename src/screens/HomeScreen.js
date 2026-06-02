import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import DashboardCard from '../components/DashboardCard';
import FavoriteGroupCard from '../components/home/FavoriteGroupCard';
import RecentSceneCard from '../components/home/RecentSceneCard';
import RecentExpenseCard from '../components/home/RecentExpenseCard';

import { homeScreenStyles as homeStyles } from '../styles/home/homeScreenStyles';
import { groupsService } from '../services/groupsService';
import { useAuth } from '../context/AuthContext';

// ─── Static demo data (replace with API when available) ───────────────────────
const RECENT_SCENES = [
  {
    id: 1,
    title: 'Tummy Cafe',
    group: 'Chichory',
    location: 'Downtown Cafe',
    date: 'May 11, 2026',
    totalBill: 924,
    yourShare: 231,
  },
  {
    id: 2,
    title: 'Office Lunch',
    group: 'Chichory',
    location: 'Office Cafeteria',
    date: 'May 7, 2026',
    totalBill: 280,
    yourShare: 140,
  },
];

const RECENT_EXPENSES = [
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
// ──────────────────────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // ── Fetch favourite groups whenever Home tab is focused ──────────────────
  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        if (!token) return;
        try {
          const result = await groupsService.fetchGroups(token);
          const starred = result.all.filter(g => g.isFavorite);
          setFavoriteGroups(starred.slice(0, 1));
        } catch (error) {
          console.log('Fetch favorites error:', error.message);
        } finally {
          setLoadingFavorites(false);
        }
      };
      fetchFavorites();
    }, [token])
  );

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatBalance = useCallback((balance) => {
    const isNegative = balance < 0;
    const formatted = Math.abs(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : '+'}Rs ${formatted}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    const map = { active: '#10b981', inactive: '#6b7280', pending: '#f59e0b' };
    return map[status] || map.inactive;
  }, []);

  // ── Favorite group actions ────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (groupId) => {
    const group = favoriteGroups.find(g => g.id === groupId);
    if (!group) return;
    const newStarred = !group.isFavorite;

    setFavoriteGroups(prev =>
      newStarred
        ? prev.map(g => g.id === groupId ? { ...g, isFavorite: newStarred } : g)
        : prev.filter(g => g.id !== groupId)
    );

    try {
      await groupsService.toggleStar(token, groupId, newStarred);
    } catch {
      setFavoriteGroups(prev => [...prev, group]); // revert
    }
  }, [favoriteGroups, token]);

  const handleGroupPress = useCallback((group) => {
    navigation.navigate('Groups', {
      screen: 'Transactions',
      params: { groupName: group.name, groupId: group.id, groupData: group },
    });
  }, [navigation]);

  const handleGroupAction = useCallback((action, group) => {
    const navigate = (screen) =>
      navigation.navigate('Groups', {
        screen,
        params: { groupName: group.name, groupId: group.id, groupData: group },
      });

    const actions = {
      transactions: () => navigate('Transactions'),
      deposits:     () => navigate('Deposits'),
      manage:       () => navigate('ManageGroup'),
      leave: () =>
        Alert.alert('Leave Group', `Leave "${group.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              try {
                await groupsService.leaveGroup(token, group.id);
                setFavoriteGroups(prev => prev.filter(g => g.id !== group.id));
              } catch (e) {
                Alert.alert('Error', e.message || 'Could not leave group.');
              }
            },
          },
        ]),
    };

    actions[action]?.();
  }, [navigation, token]);

  // ── Sub-renders ───────────────────────────────────────────────────────────
  const renderSectionHeader = (icon, iconColor, title, onViewAll) => (
    <View style={homeStyles.sectionHeader}>
      <View style={homeStyles.sectionHeaderLeft}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={homeStyles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={homeStyles.viewAllButton} onPress={onViewAll} activeOpacity={0.7}>
        <Text style={homeStyles.viewAllText}>View All</Text>
        <Ionicons name="chevron-forward" size={16} color="#06b6d4" />
      </TouchableOpacity>
    </View>
  );

  const renderFavoriteSkeleton = () => (
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
  );

  const renderEmptyFavorites = () => (
    <View style={homeStyles.emptyFavorites}>
      <View style={homeStyles.emptyFavoritesIcon}>
        <Ionicons name="star-outline" size={32} color="#9ca3af" />
      </View>
      <Text style={homeStyles.emptyFavoritesTitle}>No Favorite Groups</Text>
      <Text style={homeStyles.emptyFavoritesSubtitle}>
        Star your frequently used groups to see them here
      </Text>
      <TouchableOpacity
        style={homeStyles.browseGroupsButton}
        onPress={() => navigation.navigate('Groups')}
        activeOpacity={0.8}
      >
        <Text style={homeStyles.browseGroupsText}>Browse Groups</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={homeStyles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={homeStyles.scrollContent}
    >
      {/* Dashboard Card */}
      <DashboardCard />

      {/* ── Favourite Groups ─────────────────────────────────────────────── */}
      <View style={homeStyles.section}>
        {renderSectionHeader('star', '#f59e0b', 'Favorite Groups', () => navigation.navigate('Groups'))}

        {loadingFavorites ? renderFavoriteSkeleton() : (
          <FlatList
            data={favoriteGroups.slice(0, 1)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <FavoriteGroupCard
                item={item}
                onPress={handleGroupPress}
                onToggleFavorite={toggleFavorite}
                onAction={handleGroupAction}
                formatBalance={formatBalance}
                getStatusColor={getStatusColor}
              />
            )}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyFavorites}
          />
        )}
      </View>

      {/* ── Recent Scenes ─────────────────────────────────────────────────── */}
      <View style={homeStyles.section}>
        {renderSectionHeader('receipt-outline', '#06b6d4', 'Recent Scenes', () => navigation.navigate('Scenes'))}
        {RECENT_SCENES.map(scene => (
          <RecentSceneCard key={scene.id} scene={scene} />
        ))}
      </View>

      {/* ── Recent Expenses ───────────────────────────────────────────────── */}
      <View style={homeStyles.section}>
        {renderSectionHeader('wallet-outline', '#8b5cf6', 'Recent Expenses', () => navigation.navigate('Expenses'))}
        {RECENT_EXPENSES.map(expense => (
          <RecentExpenseCard key={expense.id} expense={expense} />
        ))}

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
