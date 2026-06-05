import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { scenesService } from '../services/scenesService';
import { groupsService } from '../services/groupsService';
import { getInitials } from '../utils/helpers';
import { cache } from '../utils/cache';
import { useTheme } from '../context/ThemeContext';
import RecentSceneCard from '../components/home/RecentSceneCard';

const { width } = Dimensions.get('window');

// ─── Skeleton card shown while loading ───────────────────────────────────────
const SkeletonCard = memo(() => {
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
  const sk = { backgroundColor: colors.skeleton, borderRadius: 6, height: 14 };
  return (
    <Animated.View style={[{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder }, { opacity: pulse }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={[sk, { width: '60%', height: 18 }]} />
        <View style={[sk, { width: 60, height: 18 }]} />
      </View>
      <View style={[sk, { width: '40%', height: 13, marginTop: 8 }]} />
      <View style={[sk, { width: '90%', height: 13, marginTop: 10 }]} />
      <View style={[sk, { width: '70%', height: 13, marginTop: 6 }]} />
      <View style={[sk, { width: '50%', height: 28, marginTop: 14, borderRadius: 8 }]} />
    </Animated.View>
  );
});

const ScenesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // true = show skeletons immediately
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchWidth = React.useRef(new Animated.Value(40)).current;
  const searchOpacity = React.useRef(new Animated.Value(0)).current;

  const [scenes, setScenes] = useState([]);
  const [adminGroups, setAdminGroups] = useState([]);
  // groupsById cached as ref — no re-render needed when it updates
  const groupsByIdRef = useRef({});

  const toArray = useCallback((value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.scenes)) return value.scenes;
    if (value?.data && typeof value.data === 'object') return toArray(value.data);
    return [];
  }, []);

  const getSceneDate = useCallback((item) => {
    return item?.scene_timestamptz || item?.scene_timestamp || item?.date || item?.created_at || item?.updated_at || new Date().toISOString();
  }, []);

  const normalizeScene = useCallback((item, groupsById, currentUserId) => {
    const sceneId = item?.scene_id || item?.id;
    const rawDate = getSceneDate(item);
    const parsedDate = new Date(rawDate);
    const participants = toArray(item?.participants || item?.scene_participants || item?.members);
    const avatars = participants.slice(0, 3).map((participant, index) => {
      const name = participant?.person?.fullname || participant?.person?.username || participant?.name || `P${index + 1}`;
      return {
        name: getInitials(name),
        color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][index % 5],
      };
    });

    const totalBill = Number(item?.total_amount || item?.totalBill || 0);
    const sumAdditional = participants.reduce((sum, p) => sum + Number(p.additional_amount || 0), 0);
    const perPersonShare = participants.length > 0 ? (totalBill - sumAdditional) / participants.length : 0;

    const me = participants.find((participant) => {
      const personId = participant?.person_id || participant?.person?.id || participant?.id;
      return String(personId) === String(currentUserId);
    });

    const myShareRaw = me ? perPersonShare + Number(me.additional_amount || 0) : 0;
    const yourShare = myShareRaw.toFixed(2);

    return {
      id: sceneId,
      group_id: item?.group_id || item?.group?.id || null,
      title: item?.title || item?.scene_name || item?.location || `Scene #${sceneId}`,
      group: groupsById[String(item?.group_id)] || item?.group?.name || 'Group',
      description: item?.description || `Expenses at ${item?.location || 'Scene location'}`,
      date: Number.isNaN(parsedDate.getTime()) ? 'Unknown date' : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: Number.isNaN(parsedDate.getTime()) ? '—' : parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      totalBill: totalBill,
      participants: participants.length,
      participantAvatars: avatars,
      location: item?.location || 'Unknown location',
      yourShare,
      rawDate,
      raw: item,
    };
  }, [getInitials, getSceneDate, toArray]);

  const fetchScenes = useCallback(async (silent = false) => {
    if (!token) return;
    const currentUserId = String(user?.person_id || user?.id || '');
    const cacheKey = `scenes_${currentUserId}`;

    // Load from cache immediately so user sees data right away
    if (!silent) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        groupsByIdRef.current = cached.groupsById || {};
        setAdminGroups(cached.adminGroups || []);
        setScenes(cached.scenes || []);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }

    try {
      const [groupsData, response] = await Promise.all([
        groupsService.fetchGroups(token, currentUserId).catch(() => null),
        scenesService.getScenes(token, { page: 1, pageSize: 200 }),
      ]);

      const groupsById = ((groupsData?.all || groupsData?.your || []).reduce((acc, g) => {
        acc[String(g.id)] = g.name;
        return acc;
      }, {}));
      groupsByIdRef.current = groupsById;
      const adminGroupsList = groupsData?.your || [];
      setAdminGroups(adminGroupsList);

      const rawScenes = toArray(response?.data || response);
      const normalized = rawScenes.map((item) =>
        normalizeScene(item, groupsById, currentUserId)
      );
      setScenes(normalized);

      await cache.set(cacheKey, { groupsById, adminGroups: adminGroupsList, scenes: normalized });
    } catch (error) {
      console.warn('Fetch scenes error:', error.message);
      if (!silent) Alert.alert('Error', 'Could not load scenes right now.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [normalizeScene, toArray, token, user]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  useEffect(() => {
    if (route?.params?.shouldRefresh) {
      fetchScenes();
      navigation.setParams({ shouldRefresh: undefined });
    }
  }, [fetchScenes, navigation, route?.params?.shouldRefresh]);

  const handleSearchPress = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      Animated.parallel([
        Animated.timing(searchWidth, { toValue: 130, duration: 200, useNativeDriver: false }),
        Animated.timing(searchOpacity, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();
    }
  };

  const handleSearchBlur = () => {
    if (searchText.length === 0) {
      Animated.parallel([
        Animated.timing(searchWidth, { toValue: 40, duration: 180, useNativeDriver: false }),
        Animated.timing(searchOpacity, { toValue: 0, duration: 100, useNativeDriver: true })
      ]).start(() => setIsSearchExpanded(false));
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    Animated.parallel([
      Animated.timing(searchWidth, { toValue: 40, duration: 180, useNativeDriver: false }),
      Animated.timing(searchOpacity, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start(() => setIsSearchExpanded(false));
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchScenes(true);
    setRefreshing(false);
  }, [fetchScenes]);

  const handleScenePress = (scene) => {
    const sceneGroupId = String(scene.rawGroupId || scene.group_id || scene.raw?.group_id || '');
    const isAdmin = adminGroups.some(g => String(g.id) === sceneGroupId);
    navigation.navigate('SceneDetail', { scene, userRole: isAdmin ? 'admin' : 'member' });
  };

  const handleCreateScene = async () => {
    navigation.navigate('CreateScene');
  };

  const handleEditScene = (scene) => {
    navigation.navigate('CreateScene', { existingScene: scene.raw || scene, sceneId: scene.id });
  };

  const handleDeleteScene = (scene) => {
    Alert.alert(
      'Delete Scene',
      `Are you sure you want to delete "${scene.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            if (!token) return;
            try {
              await scenesService.deleteScene(token, scene.id);
              setScenes(prevScenes => prevScenes.filter(s => s.id !== scene.id));
            } catch (error) { Alert.alert('Error', error?.message || 'Failed to delete scene.'); }
          }
        }
      ]
    );
  };

  const renderRightActions = (scene) => {
    const sceneGroupId = String(scene.group_id || scene.raw?.group_id || '');
    const isAdminOfScene = adminGroups.some(g => String(g.id) === sceneGroupId);
    if (!isAdminOfScene) return null;
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditScene(scene)} activeOpacity={0.8}><Ionicons name="pencil" size={20} color="#ffffff" /><Text style={styles.actionButtonText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteScene(scene)} activeOpacity={0.8}><Ionicons name="trash" size={20} color="#ffffff" /><Text style={styles.actionButtonText}>Delete</Text></TouchableOpacity>
      </View>
    );
  };

  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = scene.title.toLowerCase().includes(searchText.toLowerCase()) || scene.description.toLowerCase().includes(searchText.toLowerCase()) || scene.location.toLowerCase().includes(searchText.toLowerCase());
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Recent') {
      const sceneDate = new Date(scene.rawDate || scene.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && sceneDate > weekAgo;
    }
    return matchesSearch;
  });

  const renderSceneCard = ({ item }) => (
    <GestureHandlerRootView>
      <Swipeable renderRightActions={() => renderRightActions(item)} rightThreshold={40}>
        <RecentSceneCard scene={item} onPress={() => handleScenePress(item)} />
      </Swipeable>
    </GestureHandlerRootView>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.headerSection}>
        <View style={styles.headerContent}><Text style={styles.title}>Scenes</Text><Text style={styles.subtitle}>View all shared expense events</Text></View>
        <View style={styles.headerActions}>
          <Animated.View style={[styles.headerSearchContainer, { width: searchWidth }]}>
            {!isSearchExpanded ? (
              <TouchableOpacity style={styles.searchIconButton} onPress={handleSearchPress} activeOpacity={0.6}><Ionicons name="search" size={20} color="#6b7280" /></TouchableOpacity>
            ) : (
              <>
                <Animated.View style={[styles.searchIconContainer, { opacity: searchOpacity }]}><Ionicons name="search" size={16} color="#64748b" /></Animated.View>
                <Animated.View style={[styles.inputContainer, { opacity: searchOpacity }]}><TextInput style={styles.headerSearchInput} placeholder="Search..." placeholderTextColor="#9ca3af" value={searchText} onChangeText={setSearchText} onBlur={handleSearchBlur} autoFocus={true} returnKeyType="search" blurOnSubmit={false} /></Animated.View>
                {searchText.length > 0 && <Animated.View style={[styles.clearButtonContainer, { opacity: searchOpacity }]}><TouchableOpacity onPress={handleClearSearch} style={styles.headerClearButton}><Ionicons name="close-circle" size={16} color="#64748b" /></TouchableOpacity></Animated.View>}
              </>
            )}
          </Animated.View>
          {adminGroups.length > 0 && <TouchableOpacity style={styles.createButton} activeOpacity={0.8} onPress={handleCreateScene}><Ionicons name="add" size={18} color="#ffffff" /><Text style={styles.createButtonText}>Create</Text></TouchableOpacity>}
        </View>
      </View>
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'All' && styles.activeFilterChip]} onPress={() => setSelectedFilter('All')} activeOpacity={0.7}><View style={styles.chipContent}><Ionicons name="apps" size={16} color={selectedFilter === 'All' ? '#ffffff' : colors.textSecondary} /><Text style={[styles.chipText, selectedFilter === 'All' && styles.activeChipText]}>All</Text><View style={[styles.chipBadge, selectedFilter === 'All' && styles.activeChipBadge]}><Text style={[styles.chipBadgeText, selectedFilter === 'All' && styles.activeChipBadgeText]}>{scenes.length}</Text></View></View></TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'Recent' && styles.activeFilterChip]} onPress={() => setSelectedFilter('Recent')} activeOpacity={0.7}><View style={styles.chipContent}><Ionicons name="time" size={16} color={selectedFilter === 'Recent' ? '#ffffff' : colors.textSecondary} /><Text style={[styles.chipText, selectedFilter === 'Recent' && styles.activeChipText]}>Recent</Text><View style={[styles.chipBadge, selectedFilter === 'Recent' && styles.activeChipBadge]}><Text style={[styles.chipBadgeText, selectedFilter === 'Recent' && styles.activeChipBadgeText]}>{scenes.filter(s => new Date(s.rawDate || s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</Text></View></View></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <FlatList
        data={loading ? [1, 2, 3, 4] : filteredScenes}
        renderItem={loading
          ? () => <SkeletonCard />
          : renderSceneCard
        }
        keyExtractor={(item, i) => loading ? `sk-${i}` : item.id.toString()}
        ListHeaderComponent={loading ? null : renderHeader}
        ListEmptyComponent={loading ? null : () => (
          <View style={styles.emptyContainer}>
            <LinearGradient colors={isDark ? ['rgba(6,182,212,0.15)', 'rgba(6,182,212,0.08)'] : ['#f0fdfa', '#ecfeff']} style={styles.emptyIconContainer}><Ionicons name="receipt-outline" size={48} color="#06b6d4" /></LinearGradient>
            <Text style={styles.emptyTitle}>{searchText ? 'No matching scenes' : 'No expense scenes yet'}</Text>
            <Text style={styles.emptySubtitle}>{searchText ? 'Try adjusting your search terms' : 'Create your first shared expense scene to get started'}</Text>
            {!searchText && adminGroups.length > 0 && <TouchableOpacity style={styles.emptyButton} onPress={handleCreateScene} activeOpacity={0.8}><Ionicons name="add-circle" size={20} color="#ffffff" /><Text style={styles.emptyButtonText}>Create First Scene</Text></TouchableOpacity>}
          </View>
        )}
        ListFooterComponent={() => <View style={styles.listFooter} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Performance props
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#06b6d4"
            colors={['#06b6d4']}
            progressViewOffset={200}
          />
        }
      />
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 20, height: 40, overflow: 'hidden' },
  searchIconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchIconContainer: { width: 28, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  inputContainer: { flex: 1, height: 40, justifyContent: 'center' },
  headerSearchInput: { flex: 1, fontSize: 14, color: colors.inputText, fontWeight: '500', paddingHorizontal: 2, height: 40 },
  clearButtonContainer: { width: 28, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerClearButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(100, 116, 139, 0.15)' },
  createButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  createButtonText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  filterSection: { marginBottom: 12 },
  filterContainer: { flexDirection: 'row', gap: 12 },
  filterChip: { backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 4, paddingVertical: 4, borderWidth: 1, borderColor: colors.cardBorderMedium },
  activeFilterChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  activeChipText: { color: '#ffffff' },
  chipBadge: { backgroundColor: colors.skeleton, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  activeChipBadge: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  chipBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  activeChipBadgeText: { color: '#ffffff' },
  sceneCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: colors.cardBorder },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleSection: { flex: 1, marginRight: 16 },
  sceneTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6, letterSpacing: -0.3 },
  groupBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', gap: 4 },
  groupText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  amountSection: { alignItems: 'flex-end' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  totalLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  locationText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  description: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  dateTimeContainer: { flex: 1 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  dateTimeText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  participantsContainer: { alignItems: 'flex-end' },
  avatarStack: { flexDirection: 'row', marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card },
  avatarOverlap: { marginLeft: -8 },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
  avatarMore: { backgroundColor: colors.textSecondary },
  avatarMoreText: { fontSize: 9, fontWeight: '700', color: '#ffffff' },
  participantCount: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  yourShareContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorderMedium },
  yourShareLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  yourShareAmount: { fontSize: 13, fontWeight: '600', color: colors.text },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 32 },
  emptyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  rightActionsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  actionButton: { width: 80, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 4 },
  editButton: { backgroundColor: '#f59e0b', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  deleteButton: { backgroundColor: '#ef4444', borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  actionButtonText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  listFooter: { height: 200 },
});

export default ScenesScreen;
