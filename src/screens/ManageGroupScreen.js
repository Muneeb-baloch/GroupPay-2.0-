import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { groupsService } from '../services/groupsService';
import { invitesService } from '../services/invitesService';
import { formatDate, getInitials } from '../utils/helpers';

const ManageGroupScreen = ({ navigation, route }) => {
  const { groupName = 'Group', groupData } = route?.params || {};
  const { token, user } = useAuth();
  const groupId = route?.params?.groupId || groupData?.id;

  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
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
      const raw = data?.data || data;
      const participants = raw?.participants || raw?.members || [];
      setMembers(participants.map(p => ({
        id: p.person_id || p.id,
        name: p.person?.fullname || p.person?.username || p.name || 'Unknown',
        email: p.person?.email || p.email || '',
        role: p.status === 'ACTIVE' ? (p.is_admin ? 'admin' : 'member') : 'member',
        isYou: (p.person_id || p.id) === user?.person_id,
        joinedDate: p.joined_at || p.created_at,
        avatar: getInitials(p.person?.fullname || p.person?.username || 'U'),
        color: groupData?.color || '#06b6d4',
      })));
    } catch (error) {
      console.log('Fetch group members error:', error.message);
    } finally {
      setFetchingMembers(false);
    }
  }, [token, groupId, user, groupData]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInviteUser = async () => {
    if (!searchEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (!validateEmail(searchEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const alreadyMember = members.find(m => m.email.toLowerCase() === searchEmail.toLowerCase());
    if (alreadyMember) {
      Alert.alert('Error', 'This user is already a member of the group');
      return;
    }

    const alreadyInvited = pendingInvites.find(i => i.email.toLowerCase() === searchEmail.toLowerCase());
    if (alreadyInvited) {
      Alert.alert('Error', 'Invitation already sent to this email');
      return;
    }

    setLoading(true);
    startSpinner();

    try {
      // Note: API needs receiver_id (integer), but we only have email here.
      // For now we send the invite with email as a placeholder until user search API is available.
      // TODO: Add user search by email endpoint when available.
      await new Promise(resolve => setTimeout(resolve, 800)); // placeholder

      const newInvite = {
        id: Date.now(),
        email: searchEmail.toLowerCase(),
        invitedDate: new Date().toISOString(),
        status: 'pending',
      };
      setPendingInvites(prev => [newInvite, ...prev]);
      setSearchEmail('');
      stopSpinner();
      setLoading(false);
      Alert.alert('Invitation Sent!', `An invitation has been sent to ${searchEmail}`);
    } catch (error) {
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

  const handleCancelInvite = (inviteId) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
          }
        }
      ]
    );
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={[styles.memberAvatar, { backgroundColor: item.color || '#06b6d4' }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.memberDetails}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>
              {item.name} {item.isYou && '(You)'}
            </Text>
            {item.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
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
            })} • Pending
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelInvite(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={18} color="#64748b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
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
          <Ionicons name="create-outline" size={22} color="#06b6d4" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <Ionicons name="people" size={20} color="#06b6d4" />
                <Text style={styles.sectionTitle}>
                  Current Members ({members.length})
                </Text>
              </View>
            </View>
            
            {fetchingMembers ? (
              <ActivityIndicator color="#06b6d4" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item, index) => (item?.id?.toString() || index.toString())}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
              />
            )}
          </View>

          {/* Pending Invites Section */}
          {pendingInvites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="mail" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>
                    Pending Invites ({pendingInvites.length})
                  </Text>
                </View>
              </View>
              
              <FlatList
                data={pendingInvites}
                renderItem={renderPendingInvite}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
              />
            </View>
          )}

          {/* Invite Users Section */}
          <View style={styles.section}>
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
                <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter email address..."
                  placeholderTextColor="#9ca3af"
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  groupIndicator: {
    width: 3,
    height: 12,
    borderRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },

  // Keyboard Avoiding View
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Member Cards
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  adminBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  memberJoined: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  memberSeparator: {
    height: 12,
  },

  // Invite Cards
  inviteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#fef3c7',
    backgroundColor: '#fffbeb',
  },
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inviteDetails: {
    flex: 1,
  },
  inviteEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  inviteStatus: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },

  // Invite Form
  inviteForm: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    paddingVertical: 12,
    minHeight: 48,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.05,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },
});

export default ManageGroupScreen;