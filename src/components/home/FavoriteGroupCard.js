import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHomeStyles } from '../../styles/homeStyles';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { groupsService } from '../../services/groupsService';

const FavoriteGroupCard = ({ item, onPress, onToggleFavorite, onAction, formatBalance, getStatusColor }) => {
  const { colors, isDark } = useTheme();
  const { token } = useAuth();
  const homeStyles = useMemo(() => getHomeStyles(colors), [colors]);
  const [liveBalance, setLiveBalance] = useState(item.totalBalance ?? 0);
  const [liveMembers, setLiveMembers] = useState(item.members ?? 0);

  useEffect(() => {
    if (!token || !item?.id) return;
    Promise.all([
      groupsService.getMyGroupBalance(token, item.id).catch(() => null),
      groupsService.getGroupMembers(token, item.id).catch(() => null),
    ]).then(([balanceData, membersData]) => {
      if (balanceData) {
        const balance = parseFloat(
          balanceData?.data?.balance ?? balanceData?.data?.net_balance ?? balanceData?.data?.my_balance ??
          balanceData?.balance ?? balanceData?.net_balance ?? balanceData?.my_balance ?? item.totalBalance ?? 0
        );
        setLiveBalance(balance);
      }
      if (membersData) {
        const raw = membersData?.data?.members || membersData?.data?.participants ||
          (Array.isArray(membersData?.data) ? membersData.data : null) ||
          membersData?.members || membersData?.participants || membersData?.rows ||
          (Array.isArray(membersData) ? membersData : []);
        if (Array.isArray(raw) && raw.length > 0) setLiveMembers(raw.length);
      }
    });
  }, [token, item.id]);

  return (
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
              <Ionicons name={item.role === 'admin' ? 'shield-checkmark' : 'person'} size={12} color={colors.textSecondary} />
              <Text style={homeStyles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
            <Text style={homeStyles.lastActivity}>{item.lastActivity}</Text>
          </View>
        </View>
        <TouchableOpacity style={homeStyles.favoriteButton} onPress={() => onToggleFavorite(item.id)} activeOpacity={0.7}>
          <Ionicons name={item.isFavorite ? 'star' : 'star-outline'} size={18} color={item.isFavorite ? '#f59e0b' : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={homeStyles.balanceSection}>
        <View style={homeStyles.balanceInfo}>
          <Text style={homeStyles.balanceLabel}>Balance</Text>
          <Text style={[homeStyles.balanceAmount, { color: liveBalance >= 0 ? '#10b981' : '#ef4444' }]}>
            {formatBalance(liveBalance)}
          </Text>
        </View>
        <View style={homeStyles.membersInfo}>
          <View style={homeStyles.membersCount}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={homeStyles.membersText}>{liveMembers} member{liveMembers !== 1 ? 's' : ''}</Text>
          </View>
          <View style={homeStyles.memberAvatars}>
            {(item.memberInitials || []).slice(0, 3).map((initial, index) => (
              <View key={index} style={[homeStyles.avatar, { backgroundColor: item.color }, index > 0 && homeStyles.avatarOverlap]}>
                <Text style={homeStyles.avatarText}>{initial}</Text>
              </View>
            ))}
            {liveMembers > 3 && (
              <View style={[homeStyles.avatar, homeStyles.avatarMore, homeStyles.avatarOverlap]}>
                <Text style={homeStyles.avatarMoreText}>+{liveMembers - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={homeStyles.actionsSection}>
        <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('transactions', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: isDark ? 'rgba(37,99,235,0.18)' : '#eff6ff' }]}>
            <Ionicons name="receipt" size={16} color="#2563eb" />
          </View>
          <Text style={homeStyles.actionLabel}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('deposits', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: isDark ? 'rgba(22,163,74,0.18)' : '#f0fdf4' }]}>
            <Ionicons name="wallet" size={16} color="#16a34a" />
          </View>
          <Text style={homeStyles.actionLabel}>Deposits</Text>
        </TouchableOpacity>

        {item.role === 'admin' && (
          <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('manage', item)} activeOpacity={0.7}>
            <View style={[homeStyles.actionIconContainer, { backgroundColor: isDark ? 'rgba(6,182,212,0.18)' : '#f0f9ff' }]}>
              <Ionicons name="people" size={16} color="#06b6d4" />
            </View>
            <Text style={[homeStyles.actionLabel, { color: '#06b6d4' }]}>Manage</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={homeStyles.actionButton} onPress={() => onAction('leave', item)} activeOpacity={0.7}>
          <View style={[homeStyles.actionIconContainer, { backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : '#fef2f2' }]}>
            <Ionicons name="exit-outline" size={16} color="#dc2626" />
          </View>
          <Text style={[homeStyles.actionLabel, { color: '#dc2626' }]}>Leave</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

export default FavoriteGroupCard;
