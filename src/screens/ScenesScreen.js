import React, { useState, useCallback } from 'react';
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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ScenesScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchWidth = React.useRef(new Animated.Value(40)).current;
  const searchOpacity = React.useRef(new Animated.Value(0)).current;

  // Sample scenes data - simplified (all paid)
  const [scenes] = useState([
    {
      id: 1,
      title: 'Tummy Cafe',
      group: 'Chichory',
      description: 'Delicious tea scene with friends',
      date: 'May 11, 2026',
      time: '08:10 PM',
      totalBill: 924,
      participants: 4,
      participantAvatars: [
        { name: 'MY', color: '#06b6d4' },
        { name: 'MU', color: '#8b5cf6' },
        { name: 'UJ', color: '#f59e0b' },
        { name: 'HN', color: '#10b981' }
      ],
      location: 'Downtown Cafe',
      yourShare: 231
    },
    {
      id: 2,
      title: 'Office Lunch',
      group: 'Chichory',
      description: 'Samosa and cocoa bottle for the team',
      date: 'May 7, 2026',
      time: '06:59 PM',
      totalBill: 280,
      participants: 2,
      participantAvatars: [
        { name: 'MY', color: '#06b6d4' },
        { name: 'MU', color: '#8b5cf6' }
      ],
      location: 'Office Cafeteria',
      yourShare: 140
    },
    {
      id: 3,
      title: 'Team Dinner',
      group: 'Chichory',
      description: 'Biryani and samosa celebration',
      date: 'May 6, 2026',
      time: '03:23 PM',
      totalBill: 530,
      participants: 2,
      participantAvatars: [
        { name: 'MY', color: '#06b6d4' },
        { name: 'MU', color: '#8b5cf6' }
      ],
      location: 'Spice Garden',
      yourShare: 265
    }
  ]);

  const handleSearchPress = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 130, // Slightly smaller for better balance
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handleSearchBlur = () => {
    if (searchText.length === 0) {
      Animated.parallel([
        Animated.timing(searchWidth, {
          toValue: 40,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsSearchExpanded(false);
      });
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: 40,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsSearchExpanded(false);
    });
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleScenePress = (scene) => {
    navigation.navigate('SceneDetail', { scene });
  };

  const handleCreateScene = () => {
    console.log('Create new scene');
  };

  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = scene.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         scene.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         scene.location.toLowerCase().includes(searchText.toLowerCase());
    
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Recent') {
      const sceneDate = new Date(scene.date);
      const weekAgo = new Date(Date.now() - 7*24*60*60*1000);
      return matchesSearch && sceneDate > weekAgo;
    }
    return matchesSearch;
  });

  const renderSceneCard = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.sceneCard, { marginTop: index === 0 ? 0 : 12 }]}
      onPress={() => handleScenePress(item)}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.sceneTitle}>{item.title}</Text>
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={12} color="#06b6d4" />
            <Text style={styles.groupText}>{item.group}</Text>
          </View>
        </View>
        <View style={styles.amountSection}>
          <Text style={styles.totalAmount}>Rs {item.totalBill.toLocaleString()}</Text>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
      </View>

      {/* Location and Description */}
      <View style={styles.locationRow}>
        <Ionicons name="location" size={14} color="#64748b" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.dateTimeText}>{item.date}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.dateTimeText}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.participantsContainer}>
          <View style={styles.avatarStack}>
            {item.participantAvatars.slice(0, 3).map((avatar, index) => (
              <View 
                key={index}
                style={[
                  styles.avatar,
                  { backgroundColor: avatar.color },
                  index > 0 && styles.avatarOverlap
                ]}
              >
                <Text style={styles.avatarText}>{avatar.name}</Text>
              </View>
            ))}
            {item.participants > 3 && (
              <View style={[styles.avatar, styles.avatarMore, styles.avatarOverlap]}>
                <Text style={styles.avatarMoreText}>+{item.participants - 3}</Text>
              </View>
            )}
          </View>
          <Text style={styles.participantCount}>
            {item.participants} {item.participants === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </View>

      {/* Your Share */}
      <View style={styles.yourShareContainer}>
        <Text style={styles.yourShareLabel}>Your share: </Text>
        <Text style={styles.yourShareAmount}>
          Rs {item.yourShare}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Header with Search and Create Button */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Scenes</Text>
          <Text style={styles.subtitle}>View all shared expense events</Text>
        </View>
        <View style={styles.headerActions}>
          <Animated.View style={[styles.headerSearchContainer, { width: searchWidth }]}>
            {!isSearchExpanded ? (
              <TouchableOpacity 
                style={styles.searchIconButton}
                onPress={handleSearchPress}
                activeOpacity={0.6}
              >
                <Ionicons name="search" size={20} color="#6b7280" />
              </TouchableOpacity>
            ) : (
              <>
                <Animated.View style={[styles.searchIconContainer, { opacity: searchOpacity }]}>
                  <Ionicons name="search" size={16} color="#64748b" />
                </Animated.View>
                <Animated.View style={[styles.inputContainer, { opacity: searchOpacity }]}>
                  <TextInput
                    style={styles.headerSearchInput}
                    placeholder="Search..."
                    placeholderTextColor="#9ca3af"
                    value={searchText}
                    onChangeText={setSearchText}
                    onBlur={handleSearchBlur}
                    autoFocus={true}
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />
                </Animated.View>
                {searchText.length > 0 && (
                  <Animated.View style={[styles.clearButtonContainer, { opacity: searchOpacity }]}>
                    <TouchableOpacity onPress={handleClearSearch} style={styles.headerClearButton}>
                      <Ionicons name="close-circle" size={16} color="#64748b" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </>
            )}
          </Animated.View>
          <TouchableOpacity 
            style={styles.createButton} 
            activeOpacity={0.8}
            onPress={handleCreateScene}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'All' && styles.activeFilterChip]}
            onPress={() => setSelectedFilter('All')}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <Ionicons 
                name="apps" 
                size={16} 
                color={selectedFilter === 'All' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.chipText, selectedFilter === 'All' && styles.activeChipText]}>
                All
              </Text>
              <View style={[styles.chipBadge, selectedFilter === 'All' && styles.activeChipBadge]}>
                <Text style={[styles.chipBadgeText, selectedFilter === 'All' && styles.activeChipBadgeText]}>
                  {scenes.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'Recent' && styles.activeFilterChip]}
            onPress={() => setSelectedFilter('Recent')}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <Ionicons 
                name="time" 
                size={16} 
                color={selectedFilter === 'Recent' ? '#ffffff' : '#64748b'} 
              />
              <Text style={[styles.chipText, selectedFilter === 'Recent' && styles.activeChipText]}>
                Recent
              </Text>
              <View style={[styles.chipBadge, selectedFilter === 'Recent' && styles.activeChipBadge]}>
                <Text style={[styles.chipBadgeText, selectedFilter === 'Recent' && styles.activeChipBadgeText]}>
                  {scenes.filter(s => new Date(s.date) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#f0fdfa', '#ecfeff']}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="receipt-outline" size={48} color="#06b6d4" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {searchText ? 'No matching scenes' : 'No expense scenes yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText 
          ? 'Try adjusting your search terms or filters' 
          : 'Create your first shared expense scene to get started'
        }
      </Text>
      {!searchText && (
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleCreateScene}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#06b6d4', '#0891b2']}
            style={styles.emptyButtonGradient}
          >
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.emptyButtonText}>Create First Scene</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
      
      <FlatList
        data={filteredScenes}
        renderItem={renderSceneCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },

  // Header Styles - Following GroupsScreen pattern
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
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    height: 40,
    overflow: 'hidden',
  },
  searchIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconContainer: {
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  inputContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    paddingHorizontal: 2,
    height: 40,
  },
  clearButtonContainer: {
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerClearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Search Section
  searchSection: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Filter Section - Following GroupsScreen pattern
  filterSection: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterChip: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  activeChipBadgeText: {
    color: '#ffffff',
  },

  // Scene Cards - Simplified
  sceneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  groupText: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },

  // Location and Description
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  participantsContainer: {
    alignItems: 'flex-end',
  },
  avatarStack: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarMore: {
    backgroundColor: '#64748b',
  },
  avatarMoreText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  participantCount: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Your Share
  yourShareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  yourShareLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  yourShareAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 32,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ScenesScreen;