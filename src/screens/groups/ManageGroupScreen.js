import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { getManageGroupStyles } from '../../styles/groups/manageGroupStyles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { groupsService } from '../../services/groupsService';
import { invitesService } from '../../services/invitesService';
import { usersService } from '../../services/usersService';
import { queuedInvitesService } from '../../services/queuedInvitesService';
import { createUniqueId, formatDate, getInitials } from '../../utils/helpers';

const ManageGroupScreen = ({ navigation, route }) => {
  const { groupName = 'Group', groupData } = route?.params || {};
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getManageGroupStyles(colors), [colors]);
  const groupId = route?.params?.groupId || groupData?.id;
  const isGroupAdmin = (groupData?.role || 'member') === 'admin';

  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const [fetchingInvites, setFetchingInvites] = useState(false);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Spinner for send invite button
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const spinAnim = React.useRef(null);

  const startSpinner = () => {
    spinAnim.current = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    spinAnim.current.start();
  };

  const stopSpinner = () => {
    spinAnim.current?.stop();
    spinValue.setValue(0);
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Fetch group members from API
  const fetchGroupData = useCallback(async () => {
    if (!token || !groupId) return;
    setFetchingMembers(true);
    try {
      const data = await groupsService.getGroup(token, groupId);
      const raw = data?.data?.data || data?.data?.group || data?.group || data?.data || data;
      const participants =
        raw?.participants ||
        raw?.members ||
        raw?.group?.participants ||
        raw?.group?.members ||
        [];

      const activeStatuses = new Set(['ACTIVE', 'ACCEPTED', 'JOINED', 'OWNER', 'ADMIN']);
      const visibleParticipants = participants.filter((p) => {
        const status = (p?.status || p?.membership_status || p?.role || '').toString().toUpperCase();
        if (!status) return true;
        return activeStatuses.has(status) || activeStatuses.has(p?.role?.toString().toUpperCase());
      });

      setMembers(visibleParticipants.map(p => {
        const pid = p.person_id || p.person?.id || p.id;
        const role = (p.role || '').toString().toLowerCase();
        return {
          id: pid,
          personId: pid,
          name: p.person?.fullname || p.person?.username || p.fullname || p.name || 'Unknown',
          email: p.person?.email || p.email || '',
          role: role === 'admin' || role === 'owner' || p.is_admin ? 'admin' : 'member',
          isYou: String(pid) === String(user?.person_id || user?.id),
          joinedDate: p.joined_at || p.accepted_at || p.created_at,
          avatar: getInitials(p.person?.fullname || p.person?.username || p.fullname || p.name || 'U'),
          color: groupData?.color || colors.primary,
        };
      }));
    } catch (error) {
      console.warn('Fetch group members error:', error.message);
    } finally {
      setFetchingMembers(false);
    }
  }, [token, groupId, user, groupData]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const refreshPendingInvites = useCallback(async () => {
    if (!token || !groupId) return;
    setFetchingInvites(true);
    try {
      const queuedBefore = await queuedInvitesService.getAll();
      await queuedInvitesService.processQueue(token);
      const queuedAfter = await queuedInvitesService.getAll();

      const sentResp = await invitesService.getSentInvites(token, { page: 1, pageSize: 200 });
      const sentList = toArray(sentResp?.data || sentResp)
        .map(normalizeInvite)
        .filter((invite) => String(invite?.group_id || '') === String(groupId));

      const queuedList = (queuedAfter || queuedBefore || [])
        .map(normalizeInvite)
        .filter((invite) => String(invite?.group_id || '') === String(groupId));

      setPendingInvites(dedupeInvites([...sentList, ...queuedList]));
    } catch (err) {
      console.warn('Fetch sent invites error:', err.message);
    } finally {
      setFetchingInvites(false);
    }
  }, [token, groupId]);

  useEffect(() => {
    refreshPendingInvites();
  }, [refreshPendingInvites]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const normalizeEmail = (email) => (email || '').trim().toLowerCase();

  const normalizeInvite = (invite) => {
    const serverInviteId = invite?.serverInviteId || invite?.id || invite?.invite_id || invite?.invitation_id || null;
    const statusRaw = (invite?.status || 'PENDING').toString().toUpperCase();
    const status =
      statusRaw === 'PENDING' || statusRaw === 'QUEUED'
        ? 'pending'
        : statusRaw === 'ACCEPTED'
          ? 'accepted'
          : statusRaw === 'DECLINED'
            ? 'declined'
            : statusRaw.toLowerCase();

    return {
      ...invite,
      serverInviteId,
      uiKey: invite?.uiKey || (serverInviteId ? `server-invite-${serverInviteId}` : createUniqueId('invite')),
      id: invite?.id || serverInviteId || createUniqueId('invite'),
      email: normalizeEmail(invite?.email || invite?.receiver?.email || invite?.user?.email || ''),
      invitedDate: invite?.invitedDate || invite?.created_at || invite?.createdAt || invite?.invited_at || invite?.sent_at || new Date().toISOString(),
      status,
      group_id: invite?.group_id || invite?.groupId || invite?.group?.id || groupId,
    };
  };

  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.invites)) return value.invites;
    if (Array.isArray(value?.items)) return value.items;
    if (value?.data && typeof value.data === 'object') return toArray(value.data);
    return [];
  };

  const dedupeInvites = (items) => {
    const seen = new Set();
    return items.filter((invite) => {
      const fingerprint = `${invite?.id || ''}|${normalizeEmail(invite?.email)}|${invite?.status || ''}|${invite?.group_id || ''}`;
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return true;
    });
  };

  const findMemberByEmail = (email) => {
    const normalizedEmail = normalizeEmail(email);
    return members.find(member => normalizeEmail(member.email) === normalizedEmail);
  };

  const displayMembers = React.useMemo(() => {
    const byKey = new Map();
    const groupRole = (groupData?.role || '').toString().toLowerCase();
    const isCurrentUserAdmin = groupRole === 'admin' || groupRole === 'owner';

    members.forEach((member, index) => {
      const key = normalizeEmail(member?.email) || `member-${member?.personId || member?.id || index}`;
      byKey.set(key, {
        ...member,
        role: ((member?.role || '').toString().toLowerCase() === 'admin' || (member?.role || '').toString().toLowerCase() === 'owner')
          ? 'admin'
          : 'member',
      });
    });

    pendingInvites
      .filter((invite) => invite?.status === 'accepted' && normalizeEmail(invite?.email))
      .forEach((invite) => {
        const emailKey = normalizeEmail(invite.email);
        if (byKey.has(emailKey)) return;

        const localName = invite.email.split('@')[0] || 'Member';
        byKey.set(emailKey, {
          id: `accepted-${emailKey}`,
          personId: `accepted-${emailKey}`,
          name: localName,
          email: invite.email,
          role: (invite?.is_admin || (invite?.role || '').toString().toLowerCase() === 'admin') ? 'admin' : 'member',
          isYou: normalizeEmail(user?.email) === emailKey,
          joinedDate: invite?.updated_at || invite?.invitedDate || new Date().toISOString(),
          avatar: getInitials(localName),
          color: groupData?.color || colors.primary,
        });
      });

    // Ensure current signed-in user appears in member list even if backend participants are delayed.
    const myEmailKey = normalizeEmail(user?.email);
    if (myEmailKey && !byKey.has(myEmailKey)) {
      const myName = user?.fullname || user?.name || user?.username || user?.email?.split('@')[0] || 'You';
      byKey.set(myEmailKey, {
        id: user?.person_id || user?.id || `me-${myEmailKey}`,
        personId: user?.person_id || user?.id || `me-${myEmailKey}`,
        name: myName,
        email: user?.email || '',
        role: isCurrentUserAdmin ? 'admin' : 'member',
        isYou: true,
        joinedDate: new Date().toISOString(),
        avatar: getInitials(myName),
        color: groupData?.color || colors.primary,
      });
    }

    return Array.from(byKey.values());
  }, [members, pendingInvites, user, groupData]);

  const visibleSentInvites = React.useMemo(
    () => pendingInvites.filter((invite) => invite?.status !== 'accepted'),
    [pendingInvites]
  );

  const sendInviteByEmail = async (email) => {
    const userLookup = await usersService.getUserByEmail(token, email);
    const found = (userLookup?.data && userLookup.data.length > 0) ? userLookup.data[0] : null;
    if (!found || !found.id) {
      throw new Error(`No account was found for ${email}.`);
    }
    await invitesService.sendInvite(token, groupId, found.id);
  };

  const handleInviteUser = async () => {
    const email = normalizeEmail(searchEmail);

    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const alreadyMember = findMemberByEmail(email);
    if (alreadyMember) {
      Alert.alert(
        'Already a Member',
        `${alreadyMember.name || alreadyMember.email || 'This user'} is already in this group.`
      );
      return;
    }

    const alreadyInvited = pendingInvites.find(
      (i) => normalizeEmail(i.email) === email && (i.status === 'pending' || i.status === 'queued')
    );
    if (alreadyInvited) {
      Alert.alert('Error', 'Invitation already sent to this email');
      return;
    }

    setLoading(true);
    startSpinner();

    try {
      await sendInviteByEmail(email);

      const newInvite = {
        id: createUniqueId('invite'),
        uiKey: createUniqueId('invite'),
        email,
        invitedDate: new Date().toISOString(),
        status: 'pending',
      };
      setPendingInvites(prev => [newInvite, ...prev]);
      setSearchEmail('');
      await refreshPendingInvites();
      stopSpinner();
      setLoading(false);
      Alert.alert('Invitation Sent!', `An invitation has been sent to ${email}`);
    } catch (error) {
      // If backend doesn't expose the lookup route, fall back to a simulated invite
      const msg = (error && error.message) ? error.message : String(error);
      if (msg.toLowerCase().includes('pending invite already exists')) {
        await refreshPendingInvites();
        stopSpinner();
        setLoading(false);
        Alert.alert('Already Invited', 'A pending invite already exists and is shown below.');
        return;
      }

      if (msg.toLowerCase().includes('no account was found')) {
        stopSpinner();
        setLoading(false);
        Alert.alert('User not found', msg);
        return;
      }

      if (msg.includes('Route not found') || msg.includes('Not Found') || msg.includes('404')) {
        const newInvite = {
          id: createUniqueId('invite'),
          uiKey: createUniqueId('invite'),
          email,
          invitedDate: new Date().toISOString(),
          status: 'queued',
          group_id: groupId,
        };
        // persist queued invite
        try {
          await queuedInvitesService.add(newInvite);
        } catch (e) {
          console.warn('Failed to persist queued invite', e.message);
        }
        setPendingInvites(prev => [newInvite, ...prev]);
        await refreshPendingInvites();
        setSearchEmail('');
        stopSpinner();
        setLoading(false);
        Alert.alert('Invitation Saved Locally', `Backend lookup unavailable. Invitation queued for ${email}.`);
        return;
      }

      stopSpinner();
      setLoading(false);
      Alert.alert('Error', error.message || 'Could not send invitation. Please try again.');
    }
  };

  const handleRemoveMember = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (member?.isYou) {
      Alert.alert('Error', 'You cannot remove yourself from the group');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member?.name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMembers(prev => prev.filter(m => m.id !== memberId));
          }
        }
      ]
    );
  };

  const handleCancelInvite = (invite) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const toRemove = invite;
            if (toRemove?.status === 'queued') {
              try { await queuedInvitesService.remove(toRemove.id); } catch (e) { console.warn('Failed to remove queued invite:', e.message); }
            } else if (toRemove?.serverInviteId) {
              try {
                await invitesService.cancelSentInvite(token, toRemove.serverInviteId);
              } catch (e) {
                Alert.alert('Error', e.message || 'Could not cancel invite.');
                return;
              }
            }
            await refreshPendingInvites();
          }
        }
      ]
    );
  };

  const handleResendInvite = async (invite) => {
    const email = normalizeEmail(invite?.email);
    if (!email) {
      Alert.alert('Error', 'Invite email is missing.');
      return;
    }

    setLoading(true);
    startSpinner();
    try {
      await sendInviteByEmail(email);
      await refreshPendingInvites();
      Alert.alert('Invite Sent', `Invitation was re-sent to ${email}.`);
    } catch (error) {
      const msg = (error && error.message) ? error.message : String(error);
      if (msg.toLowerCase().includes('pending invite already exists')) {
        await refreshPendingInvites();
        Alert.alert('Already Invited', 'A pending invite already exists and is shown below.');
      } else {
        Alert.alert('Error', msg || 'Could not resend invite.');
      }
    } finally {
      stopSpinner();
      setLoading(false);
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={[styles.memberAvatar, { backgroundColor: item.color || colors.primary }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.memberDetails}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>
              {item.name} {item.isYou && '(You)'}
            </Text>
            {item.role === 'admin' ? (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            ) : (
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>MEMBER</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberJoined}>
            Joined {formatDate(item.joinedDate)}
          </Text>
        </View>
      </View>
      
      {!item.isYou && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMember(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPendingInvite = ({ item }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteInfo}>
        <View style={styles.inviteIcon}>
          <Ionicons name="mail" size={20} color="#f59e0b" />
        </View>
        <View style={styles.inviteDetails}>
          <Text style={styles.inviteEmail}>{item.email}</Text>
          <Text style={styles.inviteStatus}>
            Invited {new Date(item.invitedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} • {item.status === 'queued' ? 'Queued' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.inviteActions}>
        {(item.status === 'pending' || item.status === 'queued') && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelInvite(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>
        )}

        {item.status === 'declined' && (
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => handleResendInvite(item)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="refresh" size={14} color="#06b6d4" />
            <Text style={styles.resendButtonText}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Group</Text>
          <View style={styles.groupInfo}>
            {groupData && (
              <View style={[styles.groupIndicator, { backgroundColor: groupData.color || '#06b6d4' }]} />
            )}
            <Text style={styles.headerSubtitle}>{groupName}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => Alert.alert('Edit Group', 'Group editing functionality will be implemented')}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Current Members Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  Current Members ({displayMembers.length})
                </Text>
              </View>
            </View>
            
            {fetchingMembers ? (
              <ActivityIndicator color="#06b6d4" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={displayMembers}
                renderItem={renderMemberItem}
                keyExtractor={(item, index) => (
                  item?.personId
                    ? `member-${item.personId}-${item.email || index}`
                    : item?.id
                      ? `member-${item.id}-${item.email || index}`
                      : `member-${index}`
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
              />
            )}
          </View>

          {/* Pending Invites Section */}
          {visibleSentInvites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="mail" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>
                    Sent Invites ({visibleSentInvites.length})
                  </Text>
                </View>
              </View>

              {fetchingInvites && <ActivityIndicator color="#f59e0b" style={{ marginBottom: 10 }} />}
              
              <FlatList
                data={visibleSentInvites}
                renderItem={renderPendingInvite}
                keyExtractor={(item, index) => item?.uiKey || `invite-${item?.id || index}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
              />
            </View>
          )}

          {/* Invite Users Section — admin only */}
          {isGroupAdmin && <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-add" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Invite Users</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Send invitations via email to add new members
              </Text>
            </View>

            <View style={styles.inviteForm}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter email address..."
                  placeholderTextColor={colors.textMuted}
                  value={searchEmail}
                  onChangeText={setSearchEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleInviteUser}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.inviteButton,
                  (!searchEmail.trim() || loading) && styles.inviteButtonDisabled
                ]}
                onPress={handleInviteUser}
                disabled={!searchEmail.trim() || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]} />
                    <Text style={styles.inviteButtonText}>Sending...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#ffffff" />
                    <Text style={styles.inviteButtonText}>Send Invite</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageGroupScreen;
