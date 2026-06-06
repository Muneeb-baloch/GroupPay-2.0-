import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardCard from '../../components/common/DashboardCard';
import FavoriteGroupCard from '../../components/home/FavoriteGroupCard';
import RecentSceneCard from '../../components/home/RecentSceneCard';
import RecentExpenseCard from '../../components/home/RecentExpenseCard';

import { getHomeScreenStyles } from '../../styles/home/homeScreenStyles';
import { useTheme } from '../../context/ThemeContext';
import { groupsService } from '../../services/groupsService';
import { scenesService } from '../../services/scenesService';
import { transactionsService } from '../../services/transactionsService';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { cache } from '../../utils/cache';

// ─── Skeleton row for recent lists ───────────────────────────────────────────
const SkeletonRow = () => {
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
    <Animated.View style={[{ backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }, { opacity: pulse, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.skeleton }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ height: 13, width: '60%', backgroundColor: colors.skeleton, borderRadius: 6 }} />
        <View style={{ height: 11, width: '40%', backgroundColor: colors.skeleton, borderRadius: 6 }} />
      </View>
      <View style={{ height: 14, width: 70, backgroundColor: colors.skeleton, borderRadius: 6 }} />
    </Animated.View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const homeStyles = useMemo(() => getHomeScreenStyles(colors), [colors]);

  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [adminGroupIds, setAdminGroupIds] = useState(new Set());

  const [recentScenes, setRecentScenes] = useState([]);
  const [loadingScenes, setLoadingScenes] = useState(true);

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // ── Fetch all home data whenever Home tab is focused ─────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      const currentUserId = user?.person_id || user?.id;

      // 1. Favourite groups
      const fetchFavorites = async () => {
        setLoadingFavorites(true);
        try {
          const result = await groupsService.fetchGroups(token, currentUserId);
          const starred = result.all.filter(
            g => g.isFavorite || g.is_starred || g.starred
          );
          setFavoriteGroups(starred.slice(0, 3));
          setAdminGroupIds(new Set((result.your || []).map(g => String(g.id))));
        } catch (error) {
          // Fetch favorites error
        } finally {
          setLoadingFavorites(false);
        }
      };

      // 2. Recent scenes (latest 3)
      const fetchRecentScenes = async () => {
        setLoadingScenes(true);
        try {
          const response = await scenesService.getScenes(token, { page: 1, pageSize: 5 });
          const raw = scenesService.toArray(response?.data || response);
          const normalized = raw.slice(0, 3).map(item => {
            const participants = item?.participants || item?.scene_participants || [];
            const totalBill = Number(item?.total_amount || 0);
            const sumAdditional = participants.reduce((s, p) => s + Number(p.additional_amount || 0), 0);
            const perShare = participants.length > 0 ? (totalBill - sumAdditional) / participants.length : 0;
            const me = participants.find(p => String(p.person_id || p.person?.id || p.id) === String(currentUserId));
            const myShare = me ? perShare + Number(me.additional_amount || 0) : 0;
            const d = new Date(item?.scene_timestamptz || item?.created_at || Date.now());
            return {
              id: item?.scene_id || item?.id,
              title: item?.scene_name || item?.title || item?.location || 'Scene',
              group: item?.group?.name || 'Group',
              location: item?.location || '—',
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              totalBill,
              yourShare: myShare.toFixed(2),
              raw: item,
            };
          });
          setRecentScenes(normalized);
        } catch (error) {
          // Fetch recent scenes error
        } finally {
          setLoadingScenes(false);
        }
      };

      // 3. Recent transactions as "expenses" (latest 3)
      const fetchRecentExpenses = async () => {
        setLoadingExpenses(true);
        try {
          const data = await transactionsService.getTransactions(token, { pageSize: 5 });
          const raw = data?.data?.data || data?.data?.transactions || data?.data || data?.transactions || [];
          const list = Array.isArray(raw) ? raw : [];
          const normalized = list.slice(0, 3).map((t, i) => {
            const isCredit = t.type?.toLowerCase() === 'credit';
            const d = new Date(t.created_at || t.createdAt || Date.now());
            return {
              id: t.transaction_id || t.id || i,
              title: t.person?.fullname || t.scene?.location || t.description || 'Transaction',
              type: isCredit ? 'Income' : 'Expense',
              amount: parseFloat(t.amount || 0),
              category: t.scene?.location || t.description || 'Transaction',
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              icon: isCredit ? 'cash-outline' : 'receipt-outline',
              color: isCredit ? '#10b981' : '#f59e0b',
            };
          });
          setRecentExpenses(normalized);
    } catch (error) {
      console.warn('Fetch recent expenses error:', error.message);
    } finally {
          setLoadingExpenses(false);
        }
      };

      // Fire all three in parallel
      Promise.all([fetchFavorites(), fetchRecentScenes(), fetchRecentExpenses()]);
    }, [token, user])
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
      // Invalidate GroupsScreen cache so it picks up the star change on next focus
      const userId = String(user?.person_id || user?.id || '');
      await cache.clear(`groups_${userId}`);
    } catch {
      setFavoriteGroups(prev => [...prev, group]); // revert
    }
  }, [favoriteGroups, token, user]);

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
      contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
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
        {loadingScenes ? (
          <><SkeletonRow /><SkeletonRow /></>
        ) : recentScenes.length === 0 ? (
          <View style={homeStyles.emptyFavorites}>
            <Text style={homeStyles.emptyFavoritesTitle}>No scenes yet</Text>
            <Text style={homeStyles.emptyFavoritesSubtitle}>Create your first scene outing to see it here</Text>
          </View>
        ) : (
          recentScenes.map(scene => (
            <RecentSceneCard key={scene.id} scene={scene}
              onPress={() => {
                const gId = String(scene.raw?.group_id || scene.raw?.group?.id || '');
                const role = adminGroupIds.has(gId) ? 'admin' : 'member';
                navigation.navigate('Scenes', { screen: 'SceneDetail', params: { scene: scene.raw, userRole: role } });
              }} />
          ))
        )}
      </View>

      {/* ── Recent Expenses ───────────────────────────────────────────────── */}
      <View style={homeStyles.section}>
        {renderSectionHeader('wallet-outline', '#8b5cf6', 'Recent Expenses', () => navigation.navigate('Groups'))}
        {loadingExpenses ? (
          <><SkeletonRow /><SkeletonRow /></>
        ) : recentExpenses.length === 0 ? (
          <View style={homeStyles.emptyFavorites}>
            <Text style={homeStyles.emptyFavoritesTitle}>No transactions yet</Text>
            <Text style={homeStyles.emptyFavoritesSubtitle}>Your recent transactions will appear here</Text>
          </View>
        ) : (
          recentExpenses.map(expense => (
            <RecentExpenseCard key={expense.id} expense={expense} />
          ))
        )}

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
