import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { invitesService } from '../services/invitesService';
import { notificationsService } from '../services/notificationsService';
import { formatRelativeTime } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const NOTIFICATION_ICONS_LIGHT = {
  invite:      { icon: 'person-add',           color: '#06b6d4', bg: '#f0fdfa' },
  payment:     { icon: 'wallet',               color: '#10b981', bg: '#f0fdf4' },
  group:       { icon: 'people',               color: '#8b5cf6', bg: '#f5f3ff' },
  transaction: { icon: 'receipt',              color: '#f59e0b', bg: '#fffbeb' },
  system:      { icon: 'notifications',        color: '#64748b', bg: '#f8fafc' },
  default:     { icon: 'notifications-outline', color: '#06b6d4', bg: '#f0fdfa' },
};
const NOTIFICATION_ICONS_DARK = {
  invite:      { icon: 'person-add',           color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  payment:     { icon: 'wallet',               color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  group:       { icon: 'people',               color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  transaction: { icon: 'receipt',              color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  system:      { icon: 'notifications',        color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  default:     { icon: 'notifications-outline', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
};

const getNotifStyle = (type, isDark) => {
  const map = isDark ? NOTIFICATION_ICONS_DARK : NOTIFICATION_ICONS_LIGHT;
  return map[type?.toLowerCase()] || map.default;
};

const pickFirst = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const getInviteMeta = (invite) => {
  const senderName = pickFirst(
    invite?.sender_name,
    invite?.senderName,
    invite?.created_by_name,
    invite?.createdByName,
    invite?.inviter_name,
    invite?.inviterName,
    invite?.sender?.fullname,
    invite?.sender?.name,
    invite?.sender?.username,
    invite?.created_by?.fullname,
    invite?.created_by?.name,
    invite?.created_by?.username
  );

  const groupName = pickFirst(
    invite?.group_name,
    invite?.groupName,
    invite?.group?.name,
    invite?.group?.group_name,
    invite?.group?.title,
    invite?.group?.group_title
  );

  return {
    senderName: senderName || null,
    groupName: groupName || null,
  };
};

const normalizeInviteStatus = (rawStatus) => {
  const status = (rawStatus || '').toString().toUpperCase();
  if (status === 'ACCEPTED' || status === 'DECLINED' || status === 'PENDING') return status;
  return 'PENDING';
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.invites)) return value.invites;
  if (value && Array.isArray(value.notifications)) return value.notifications;
  if (value && Array.isArray(value.items)) return value.items;
  if (value && Array.isArray(value.results)) return value.results;
  if (value.data && typeof value.data === 'object') return toArray(value.data);
  if (value.payload && typeof value.payload === 'object') return toArray(value.payload);
  return [];
};

const normalizeInviteNotification = (invite, index = 0) => {
  const inviteId = pickFirst(invite?.id, invite?.invite_id, invite?.invitation_id);
  const id = pickFirst(
    invite?.id,
    invite?.invite_id,
    invite?.invitation_id,
    invite?.notification_id,
    invite?.uuid,
    `invite-${invite?.group_id || invite?.group?.id || 'unknown'}-${invite?.email || invite?.receiver?.email || index}`
  );

  const createdAt = pickFirst(
    invite?.created_at,
    invite?.createdAt,
    invite?.invited_at,
    invite?.invitedAt,
    invite?.sent_at,
    invite?.sentAt,
    invite?.updated_at,
    invite?.updatedAt
  );

  const inviteStatus = normalizeInviteStatus(invite?.status);
  const isPending = inviteStatus === 'PENDING';
  const inviteMeta = getInviteMeta(invite);
  const metaParts = [];
  if (inviteMeta.senderName) metaParts.push(`From ${inviteMeta.senderName}`);
  if (inviteMeta.groupName) metaParts.push(`Group: ${inviteMeta.groupName}`);

  return {
    id: String(id),
    type: 'invite',
    title: invite?.title || invite?.subject || 'Group invite',
    message:
      invite?.message ||
      invite?.body ||
      invite?.content ||
      invite?.notification_text ||
      invite?.text ||
      (invite?.group_name
        ? `You have been invited to join ${invite.group_name}`
        : invite?.group?.name
          ? `You have been invited to join ${invite.group.name}`
          : invite?.group?.group_name
            ? `You have been invited to join ${invite.group.group_name}`
            : 'You have a new group invitation'),
      inviteMeta,
      inviteMetaText: metaParts.join(' • '),
    created_at: createdAt || new Date().toISOString(),
    is_read: invite?.is_read ?? invite?.read ?? !isPending,
    read: invite?.read ?? invite?.is_read ?? !isPending,
    inviteId: inviteId != null ? String(inviteId) : String(id),
    inviteStatus,
    source: 'invite',
    uiKey: `invite-${String(id)}`,
  };
};

const normalizeSystemNotification = (notification, index = 0) => {
  const rawType = (notification?.type || notification?.category || '').toString().toLowerCase();
  const rawMessage = (notification?.message || notification?.body || notification?.content || '').toString().toLowerCase();
  const rawTitle = (notification?.title || notification?.subject || '').toString().toLowerCase();
  const inviteId = pickFirst(
    notification?.invite_id,
    notification?.invitation_id,
    notification?.inviteId,
    notification?.meta?.invite_id,
    notification?.data?.invite_id
  );
  const looksLikeInvite =
    rawType.includes('invite') ||
    rawTitle.includes('invite') ||
    rawMessage.includes('invited you to join') ||
    rawMessage.includes('group invite') ||
    inviteId != null;
  // Use invite-specific status only. Generic notification status is unrelated (e.g. read/unread/updated).
  const inviteStatus = normalizeInviteStatus(
    notification?.invite_status || notification?.meta?.invite_status || notification?.data?.invite_status
  );
  const inviteMeta = getInviteMeta(notification);
  const metaParts = [];
  if (inviteMeta.senderName) metaParts.push(`From ${inviteMeta.senderName}`);
  if (inviteMeta.groupName) metaParts.push(`Group: ${inviteMeta.groupName}`);

  const id = pickFirst(
    notification?.id,
    notification?.notification_id,
    notification?.uuid,
    `notification-${index}`
  );

  return {
    ...notification,
    id: String(id),
    type: looksLikeInvite ? 'invite' : (notification?.type || notification?.category || 'system'),
    title: notification?.title || notification?.subject || 'Notification',
    message: notification?.message || notification?.body || notification?.content || '',
    inviteMeta,
    inviteMetaText: metaParts.join(' • '),
    created_at: pickFirst(notification?.created_at, notification?.createdAt, notification?.sent_at, notification?.sentAt, notification?.updated_at, notification?.updatedAt) || new Date().toISOString(),
    is_read: notification?.is_read ?? notification?.read ?? false,
    read: notification?.read ?? notification?.is_read ?? false,
    inviteId: inviteId != null ? String(inviteId) : null,
    inviteStatus: looksLikeInvite ? inviteStatus : null,
    source: looksLikeInvite ? 'invite' : (notification?.source || 'notification'),
    uiKey: `notification-${String(id)}`,
  };
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState({});

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const [notificationData, inviteData] = await Promise.all([
        notificationsService.getNotifications(token),
        invitesService.getReceivedInvites(token),
      ]);

      const notificationsList = toArray(notificationData?.data || notificationData);
      const invitesList = toArray(inviteData?.data || inviteData);

      const merged = [
        ...invitesList.map(normalizeInviteNotification),
        ...notificationsList.map(normalizeSystemNotification),
      ]
        .filter(item => item && item.id != null)
        .reduce((acc, item) => {
          const dedupeKey = item?.type === 'invite' && item?.inviteId ? `invite-${item.inviteId}` : `notification-${item.id}`;
          const existingIndex = acc.findIndex(existing => {
            const existingKey = existing?.type === 'invite' && existing?.inviteId ? `invite-${existing.inviteId}` : `notification-${existing.id}`;
            return existingKey === dedupeKey;
          });

          if (existingIndex === -1) {
            acc.push(item);
            return acc;
          }

          const existing = acc[existingIndex];
          // Prefer invite endpoint records for accurate status/actionability.
          if (existing?.source !== 'invite' && item?.source === 'invite') {
            acc[existingIndex] = item;
          }

          return acc;
        }, [])
        .sort((a, b) => {
          const aTime = new Date(a.created_at || a.createdAt || a.invited_at || a.invitedAt || 0).getTime();
          const bTime = new Date(b.created_at || b.createdAt || b.invited_at || b.invitedAt || 0).getTime();
          return bTime - aTime;
        });

      setNotifications(merged);
    } catch (error) {
      console.warn('Fetch notifications error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n)
    );
    try {
      await notificationsService.markAsRead(token, id);
    } catch {
      // Revert on failure
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: false, read: false } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
    try {
      await notificationsService.markAllAsRead(token);
    } catch (error) {
      Alert.alert('Error', 'Could not mark all as read.');
      await fetchNotifications(); // Revert
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationPress = useCallback(async (item) => {
    const isRead = item.is_read || item.read;
    if (!isRead) {
      handleMarkRead(item.id);
    }

    const type = (item.type || '').toLowerCase();
    const isInvite = type === 'invite' || item.source === 'invite' || !!item.inviteId;

    // Invites are handled inline (accept/decline) — no navigation needed
    if (isInvite) return;

    // Extract group_id from any field the API might use
    const groupId =
      item.group_id ??
      item.groupId ??
      item.meta?.group_id ??
      item.data?.group_id ??
      item.entity_id ??
      null;

    if (type === 'payment' || type === 'deposit') {
      if (groupId) {
        navigation.navigate('MainApp', {
          screen: 'Groups',
          params: { screen: 'Deposits', params: { groupId } },
        });
      } else {
        navigation.navigate('MainApp', { screen: 'Groups' });
      }
      return;
    }

    if (type === 'transaction') {
      if (groupId) {
        navigation.navigate('MainApp', {
          screen: 'Groups',
          params: { screen: 'Transactions', params: { groupId } },
        });
      } else {
        navigation.navigate('MainApp', { screen: 'Groups' });
      }
      return;
    }

    if (type === 'group') {
      navigation.navigate('MainApp', { screen: 'Groups' });
      return;
    }

    // system / default — nothing to navigate to
  }, [navigation]);

  const handleInviteAction = async (item, status) => {
    const inviteId = item?.inviteId;

    if (!inviteId) {
      Alert.alert('Error', 'Invite id is missing. Please refresh and try again.');
      return;
    }

    setInviteActionLoading(prev => ({ ...prev, [inviteId]: status }));

    if (status === 'DECLINED') {
      setNotifications(prev => prev.filter(n => n.id !== item.id));
    } else {
      setNotifications(prev =>
        prev.map(n =>
          n.id === item.id
            ? {
                ...n,
                inviteStatus: status,
                is_read: true,
                read: true,
              }
            : n
        )
      );
    }

    try {
      await invitesService.updateInviteStatus(token, inviteId, status);
      if (status === 'ACCEPTED') {
        Alert.alert('Invite accepted', 'You are now a member of this group.');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Could not update invite status.');
      await fetchNotifications();
    } finally {
      setInviteActionLoading(prev => {
        const next = { ...prev };
        delete next[inviteId];
        return next;
      });
    }
  };

  const renderNotification = ({ item }) => {
    const isRead = item.is_read || item.read;
    const style = getNotifStyle(item.type, isDark);
    const time = formatRelativeTime(item.created_at || item.createdAt);
    const actionInviteId = item?.inviteId || null;
    const isInvite = item.source === 'invite' || item.type === 'invite' || !!item.inviteId;
    const isPendingInvite = isInvite && !!actionInviteId && (item.inviteStatus || 'PENDING').toUpperCase() === 'PENDING';
    const actionLoading = inviteActionLoading[actionInviteId];

    return (
      <TouchableOpacity
        style={[styles.notifCard, !isRead && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.75}
      >
        {/* Unread dot */}
        {!isRead && <View style={styles.unreadDot} />}

        <View style={[styles.notifIcon, { backgroundColor: style.bg }]}>
          <Ionicons name={style.icon} size={20} color={style.color} />
        </View>

        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !isRead && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title || item.subject || 'Notification'}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message || item.body || item.content || ''}
          </Text>

          {!!item.inviteMetaText && (
            <Text style={styles.inviteMetaText} numberOfLines={1}>
              {item.inviteMetaText}
            </Text>
          )}

          {isInvite && !isPendingInvite && (
            <Text style={styles.inviteStatusText}>
              {(item.inviteStatus || '').toUpperCase() === 'ACCEPTED'
                ? 'Accepted'
                : (item.inviteStatus || '').toUpperCase() === 'DECLINED'
                  ? 'Declined'
                  : ''}
            </Text>
          )}

          {isPendingInvite && (
            <View style={styles.inviteActionsRow}>
              <TouchableOpacity
                style={[styles.inviteActionButton, styles.declineButton]}
                onPress={() => handleInviteAction(item, 'DECLINED')}
                disabled={!!actionLoading}
                activeOpacity={0.7}
              >
                {actionLoading === 'DECLINED' ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Text style={styles.declineButtonText}>Decline</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inviteActionButton, styles.acceptButton]}
                onPress={() => handleInviteAction(item, 'ACCEPTED')}
                disabled={!!actionLoading}
                activeOpacity={0.7}
              >
                {actionLoading === 'ACCEPTED' ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.notifTime}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconOuter}>
        <View style={styles.emptyIconInner}>
          <Ionicons name="notifications-off-outline" size={48} color="#06b6d4" />
        </View>
        {/* Decorative rings */}
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
      </View>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptySubtitle}>
        You have no notifications right now.{'\n'}We'll let you know when something happens.
      </Text>
      <View style={styles.emptyFeatures}>
        {[
          { icon: 'people-outline',  text: 'Group invites' },
          { icon: 'wallet-outline',  text: 'Payment updates' },
          { icon: 'receipt-outline', text: 'Transaction alerts' },
        ].map((f, i) => (
          <View key={i} style={styles.emptyFeatureItem}>
            <View style={styles.emptyFeatureIcon}>
              <Ionicons name={f.icon} size={16} color="#06b6d4" />
            </View>
            <Text style={styles.emptyFeatureText}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
          disabled={markingAll}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-done" size={16} color="#06b6d4" />
          <Text style={styles.markAllText}>
            {markingAll ? 'Marking...' : `Mark all read (${unreadCount})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => item?.uiKey || item?.id?.toString() || index.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#06b6d4" colors={['#06b6d4']} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },

  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, flexGrow: 1 },

  listHeader: { marginBottom: 4 },
  markAllButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 8, marginBottom: 8,
  },
  markAllText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Notification card
  notifCard: {
    backgroundColor: colors.card,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 3 },
  notifTitleUnread: { color: colors.text, fontWeight: '700' },
  notifMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  inviteMetaText: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 6 },
  inviteStatusText: { fontSize: 12, color: '#16a34a', fontWeight: '700', marginBottom: 6 },
  inviteActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inviteActionButton: {
    minWidth: 92,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  declineButton: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButtonText: { fontSize: 13, fontWeight: '700', color: colors.error },
  acceptButtonText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  notifTime: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  // Empty state
  emptyContainer: {
    flex: 1, alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 32,
  },
  emptyIconOuter: {
    width: 120, height: 120,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, position: 'relative',
  },
  emptyIconInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primaryBorder,
    zIndex: 1,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  ring1: { width: 100, height: 100 },
  ring2: { width: 120, height: 120 },
  emptyTitle: {
    fontSize: 22, fontWeight: '800', color: colors.text,
    marginBottom: 10, letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 32,
  },
  emptyFeatures: { width: '100%', gap: 12 },
  emptyFeatureItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12, padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  emptyFeatureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyFeatureText: { fontSize: 14, fontWeight: '600', color: colors.labelText },
});

export default NotificationsScreen;
