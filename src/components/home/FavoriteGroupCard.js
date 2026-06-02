import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../styles/homeStyles';
import { favoriteGroupCardStyles as styles } from '../../styles/home/favoriteGroupCardStyles';

const FavoriteGroupCard = ({ item, onPress, onToggleFavorite, onAction, formatBalance, getStatusColor }) => (
  <Pressable
    style={({ pressed }) => [homeStyles.groupCard, pressed && homeStyles.groupCardPressed]}
    onPress={() => onPress(item)}
  >
    {/* Header */}
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
      <TouchableOpacity style={homeStyles.favoriteButton} onPress={() => onToggleFavorite(item.id)} activeOpacity={0.7}>
        <Ionicons name={item.isFavorite ? 'star' : 'star-outline'} size={18} color={item.isFavorite ? '#f59e0b' : '#9ca3af'} />
      </TouchableOpacity>
    </View>

    {/* Balance */}
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
          {(item.memberInitials || []).slice(0, 3).map((initial, index) => (
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

    {/* Actions */}
    <View style={homeStyles.actionsSection}>
      <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('transactions', item)} activeOpacity={0.7}>
        <View style={[homeStyles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
          <Ionicons name="receipt" size={16} color="#2563eb" />
        </View>
        <Text style={homeStyles.actionLabel}>Transactions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('deposits', item)} activeOpacity={0.7}>
        <View style={[homeStyles.actionIconContainer, { backgroundColor: '#f0fdf4' }]}>
          <Ionicons name="wallet" size={16} color="#16a34a" />
        </View>
        <Text style={homeStyles.actionLabel}>Deposits</Text>
      </TouchableOpacity>

      {item.role === 'admin' && (
        <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('manage', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: '#f0f9ff' }]}>
            <Ionicons name="people" size={16} color="#06b6d4" />
          </View>
          <Text style={[homeStyles.actionLabel, { color: '#06b6d4' }]}>Manage</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('leave', item)} activeOpacity={0.7}>
        <View style={[homeStyles.actionIconContainer, { backgroundColor: '#fef2f2' }]}>
          <Ionicons name="exit-outline" size={16} color="#dc2626" />
        </View>
        <Text style={[homeStyles.actionLabel, { color: '#dc2626' }]}>Leave</Text>
      </TouchableOpacity>
    </View>
  </Pressable>
);

export default FavoriteGroupCard;
