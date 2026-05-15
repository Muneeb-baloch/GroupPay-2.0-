import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DashboardCard from '../components/DashboardCard';
import { homeStyles } from '../styles/homeStyles';

const HomeScreen = () => {
  const navigation = useNavigation();

  // Sample favorite groups data - in real app, this would come from context/state management
  // Updated to match the GroupsScreen data structure and show only favorite groups
  const [favoriteGroups] = useState([
    {
      id: 2,
      name: 'Chichory',
      balance: -367.75,
      color: '#8b5cf6',
      members: 4,
      memberInitials: ['MU', 'YU', 'AH', 'SK'],
      lastActivity: '1 day ago',
      status: 'active',
      role: 'member',
      isFavorite: true,
      totalBalance: -367.75
    }
  ]);

  const handleGroupPress = useCallback((group) => {
    navigation.navigate('Groups', {
      screen: 'Transactions',
      params: {
        groupName: group.name,
        groupId: group.id,
        groupData: group
      }
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
    const colors = {
      active: '#10b981',
      inactive: '#6b7280',
      pending: '#f59e0b'
    };
    return colors[status] || colors.inactive;
  }, []);

  const handleGroupAction = useCallback((action, group) => {
    const actions = {
      transactions: () => navigation.navigate('Groups', {
        screen: 'Transactions',
        params: { 
          groupName: group.name,
          groupId: group.id,
          groupData: group
        }
      }),
      deposits: () => navigation.navigate('Groups', {
        screen: 'Deposits',
        params: {
          groupName: group.name,
          groupId: group.id,
          groupData: group
        }
      }),
      manage: () => navigation.navigate('Groups', {
        screen: 'ManageGroup',
        params: {
          groupName: group.name,
          groupId: group.id,
          groupData: group
        }
      })
    };
    
    actions[action]?.();
  }, [navigation]);

  const renderFavoriteGroup = useCallback(({ item }) => (
    <Pressable 
      style={({ pressed }) => [
        homeStyles.groupCard,
        pressed && homeStyles.groupCardPressed
      ]}
      onPress={() => handleGroupPress(item)}
    >
      {/* Header Section - Same as GroupsScreen */}
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
              <Ionicons 
                name={item.role === 'admin' ? 'shield-checkmark' : 'person'} 
                size={12} 
                color="#6b7280" 
              />
              <Text style={homeStyles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
            <Text style={homeStyles.lastActivity}>{item.lastActivity}</Text>
          </View>
        </View>

        <TouchableOpacity style={homeStyles.favoriteButton} activeOpacity={0.7}>
          <Ionicons 
            name={item.isFavorite ? "star" : "star-outline"} 
            size={18} 
            color={item.isFavorite ? "#f59e0b" : "#9ca3af"} 
          />
        </TouchableOpacity>
      </View>

      {/* Balance & Members - Same as GroupsScreen */}
      <View style={homeStyles.balanceSection}>
        <View style={homeStyles.balanceInfo}>
          <Text style={homeStyles.balanceLabel}>Balance</Text>
          <Text style={[
            homeStyles.balanceAmount,
            { color: item.totalBalance >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {formatBalance(item.totalBalance)}
          </Text>
        </View>
        
        <View style={homeStyles.membersInfo}>
          <View style={homeStyles.membersCount}>
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text style={homeStyles.membersText}>
              {item.members} member{item.members !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={homeStyles.memberAvatars}>
            {item.memberInitials.slice(0, 3).map((initial, index) => (
              <View 
                key={index} 
                style={[
                  homeStyles.avatar, 
                  { backgroundColor: item.color },
                  index > 0 && homeStyles.avatarOverlap
                ]}
              >
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

      {/* Actions Section - Same as GroupsScreen */}
      <View style={homeStyles.actionsSection}>
        <TouchableOpacity 
          style={homeStyles.actionButton}
          onPress={() => handleGroupAction('transactions', item)}
          activeOpacity={0.7}
        >
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="receipt" size={16} color="#2563eb" />
          </View>
          <Text style={homeStyles.actionLabel}>Transactions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={homeStyles.actionButton}
          onPress={() => handleGroupAction('deposits', item)}
          activeOpacity={0.7}
        >
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="wallet" size={16} color="#16a34a" />
          </View>
          <Text style={homeStyles.actionLabel}>Deposits</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={homeStyles.actionButton}
          onPress={() => handleGroupAction(item.role === 'admin' ? 'manage' : 'leave', item)}
          activeOpacity={0.7}
        >
          <View style={[
            homeStyles.actionIconContainer, 
            { backgroundColor: item.role === 'admin' ? '#f0f9ff' : '#fef2f2' }
          ]}>
            <Ionicons 
              name={item.role === 'admin' ? 'people' : 'exit'} 
              size={16} 
              color={item.role === 'admin' ? '#06b6d4' : '#dc2626'} 
            />
          </View>
          <Text style={[
            homeStyles.actionLabel,
            item.role === 'admin' && { color: '#06b6d4' },
            item.role !== 'admin' && { color: '#dc2626' }
          ]}>
            {item.role === 'admin' ? 'Manage' : 'Leave'}
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ), [handleGroupPress, formatBalance, navigation, getStatusColor, handleGroupAction]);

  const renderFavoriteHeader = useCallback(() => (
    <View style={homeStyles.favoriteHeader}>
      <View style={homeStyles.favoriteHeaderContent}>
        <Ionicons name="star" size={20} color="#f59e0b" />
        <Text style={homeStyles.favoriteHeaderTitle}>Favorite Groups</Text>
      </View>
      <TouchableOpacity 
        style={homeStyles.viewAllButton}
        onPress={() => navigation.navigate('Groups')}
        activeOpacity={0.7}
      >
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
  ), [navigation]);

  return (
    <ScrollView style={homeStyles.scrollView} showsVerticalScrollIndicator={false}>
      <DashboardCard />
      
      {/* Favorite Groups Section */}
      <View style={homeStyles.favoriteSection}>
        {renderFavoriteHeader()}
        <FlatList
          data={favoriteGroups.slice(0, 1)} // Show only 1 latest favorite group
          renderItem={renderFavoriteGroup}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={renderEmptyFavorites}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      <View style={homeStyles.bottomPadding} />
    </ScrollView>
  );
};

export default HomeScreen;