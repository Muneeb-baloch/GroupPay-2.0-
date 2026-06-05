import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, RefreshControl, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { scenesService } from '../services/scenesService';
import { appealsService } from '../services/appealsService';

const SceneDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { scene: initialScene, userRole = 'member' } = route.params;

  const [scene, setScene] = useState({ yourShare: initialScene?.yourShare || '0.00', ...(initialScene || {}) });
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Appeals state
  const [appeals, setAppeals] = useState([]);
  const [appealsLoading, setAppealsLoading] = useState(false);
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [adminResponseModal, setAdminResponseModal] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  const fetchSceneDetails = useCallback(async () => {
    if (!token || !initialScene?.id) return;
    setLoading(true);
    try {
      const response = await scenesService.getSceneById(token, initialScene.id);
      const fullScene = scenesService.extractScene(response) || response?.data || response;

      // Detail API often omits participants — fall back to the list-response raw data
      const rawParticipants =
        (fullScene?.participants?.length > 0 ? fullScene.participants : null) ||
        (fullScene?.scene_participants?.length > 0 ? fullScene.scene_participants : null) ||
        (fullScene?.members?.length > 0 ? fullScene.members : null) ||
        initialScene?.raw?.participants ||
        initialScene?.raw?.scene_participants ||
        initialScene?.raw?.members ||
        [];

      const totalBill = Number(
        fullScene?.total_amount || fullScene?.totalBill ||
        initialScene?.raw?.total_amount || initialScene?.totalBill || 0
      );
      const sumAdditional = rawParticipants.reduce((sum, p) => sum + Number(p.additional_amount || 0), 0);
      const participantCount = rawParticipants.length;
      const perPersonShare = participantCount > 0 ? (totalBill - sumAdditional) / participantCount : 0;

      const normalizedParticipants = rawParticipants.map(p => {
        const paid = Number(p.paid_amount || 0);
        const additional = Number(p.additional_amount || 0);
        const displayShare = perPersonShare + additional;
        const balance = paid - displayShare;

        return {
          id: String(p.person_id || p.person?.id || p.id),
          name: p.person?.fullname || p.person?.username || p.name || 'Unknown',
          avatar: p.person?.fullname
            ? p.person.fullname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : 'U',
          imageUrl: p.person?.profile_picture_url || p.person?.avatar_url || null,
          color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][Number(p.person_id || p.id || 0) % 5],
          paid,
          share: displayShare,
          status: balance >= -0.01 ? 'paid' : 'owes',
          balance,
        };
      });

      const currentUserId = String(user?.person_id || user?.id);
      const me = normalizedParticipants.find(p => p.id === currentUserId);
      // Preserve the pre-computed share from the list API when detail API has no participants
      const yourShare = me
        ? me.share.toFixed(2)
        : (initialScene?.yourShare && initialScene.yourShare !== '0.00'
            ? initialScene.yourShare
            : '0.00');

      setScene(prev => ({ ...prev, ...fullScene, yourShare }));
      setParticipants(
        userRole === 'admin'
          ? normalizedParticipants
          : normalizedParticipants.filter(p => p.id === currentUserId)
      );
    } catch (error) {
      console.warn('Fetch scene details error:', error.message);
      // Keep initialScene data on error — don't clear what we already know
    } finally {
      setLoading(false);
    }
  }, [token, initialScene, user]);

  useEffect(() => {
    fetchSceneDetails();
  }, [fetchSceneDetails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSceneDetails(), fetchAppeals()]);
    setRefreshing(false);
  };

  const getGroupId = useCallback(() => {
    return (
      scene?.group_id ||
      scene?.group?.id ||
      scene?.raw?.group_id ||
      initialScene?.group_id ||
      initialScene?.group?.id ||
      initialScene?.raw?.group_id ||
      route.params?.groupId ||
      null
    );
  }, [scene, initialScene, route.params]);

  const fetchAppeals = useCallback(async () => {
    if (!token) return;
    const groupId = getGroupId();
    if (!groupId) return;
    setAppealsLoading(true);
    try {
      const data = await appealsService.getAppeals(token, { groupId });
      const raw = data?.data?.appeals || data?.data || data?.appeals || data?.rows || [];
      setAppeals(Array.isArray(raw) ? raw : []);
    } catch {
      // silently ignore — appeals are secondary content
    } finally {
      setAppealsLoading(false);
    }
  }, [token, getGroupId]);

  useEffect(() => { fetchAppeals(); }, [fetchAppeals]);

  const handleSubmitAppeal = async () => {
    if (!appealMessage.trim()) {
      Alert.alert('Required', 'Please enter your appeal message.');
      return;
    }
    const groupId = getGroupId();
    if (!groupId) {
      Alert.alert('Error', 'Could not determine group for this scene.');
      return;
    }
    setSubmittingAppeal(true);
    try {
      await appealsService.createAppeal(token, { group_id: groupId, message: appealMessage.trim() });
      setAppealMessage('');
      setAppealModalVisible(false);
      await fetchAppeals();
      Alert.alert('Appeal Submitted', 'Your appeal has been submitted successfully.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit appeal.');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleAdminUpdateAppeal = async (appealId, status) => {
    try {
      await appealsService.updateAppeal(token, appealId, {
        status,
        admin_comment: adminComment.trim() || undefined,
      });
      setAdminResponseModal(null);
      setAdminComment('');
      await fetchAppeals();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update appeal.');
    }
  };

  const handleDeleteAppeal = (appealId) => {
    Alert.alert('Cancel Appeal', 'Are you sure you want to cancel this appeal?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await appealsService.deleteAppeal(token, appealId);
            await fetchAppeals();
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not cancel appeal.');
          }
        },
      },
    ]);
  };

  const appealStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'RESOLVED') return '#10b981';
    if (s === 'REJECTED') return colors.error;
    return '#f59e0b';
  };

  const currentUserId = String(user?.person_id || user?.id || '');

  const handleEdit = () => {
    // Pass raw API data — list endpoint has the actual participants array;
    // scene state has participants as a count number (from normalizeScene)
    navigation.navigate('CreateScene', {
      existingScene: initialScene?.raw || initialScene || scene,
      sceneId: initialScene?.id || scene?.id,
    });
  };

  const renderParticipant = (participant) => (
    <View key={participant.id} style={styles.participantCard}>
      <View style={styles.participantLeft}>
        <View style={[styles.avatar, { backgroundColor: participant.imageUrl ? 'transparent' : participant.color }]}>
          {participant.imageUrl
            ? <Image source={{ uri: participant.imageUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            : <Text style={styles.avatarText}>{participant.avatar}</Text>
          }
        </View>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{participant.name}</Text>
          <View style={styles.participantDetails}>
            <Text style={styles.participantShare}>Cost: Rs {participant.share.toLocaleString()}</Text>
            <Text style={styles.participantPaid}>Paid: Rs {participant.paid.toLocaleString()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.participantRight}>
        <Text style={[
          styles.balanceAmount,
          { color: participant.balance >= -0.01 ? '#10b981' : colors.error }
        ]}>
          {participant.balance > 0.01 ? '+' : ''}Rs {participant.balance.toLocaleString()}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: participant.status === 'paid' ? colors.successLight : colors.errorLight }
        ]}>
          <Text style={[
            styles.statusText,
            { color: participant.status === 'paid' ? '#166534' : colors.error }
          ]}>
            {participant.status === 'paid' ? 'Paid' : 'Owes'}
          </Text>
        </View>
      </View>
    </View>
  );

  const displayDate = scene.date || (scene.scene_timestamptz ? new Date(scene.scene_timestamptz).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
  const displayTime = scene.time || (scene.scene_timestamptz ? new Date(scene.scene_timestamptz).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—');

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header - Fixed to match other screens */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>{scene.title || scene.scene_name || scene.location || `Scene #${scene.id}`}</Text>
          <Text style={styles.subtitle}>{scene.location}</Text>
        </View>

        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.editHeaderButton}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        {userRole !== 'admin' && <View style={styles.editHeaderButton} />}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Compact Scene Summary Card - No duplications */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryLeft}>
              <Text style={styles.totalLabel}>Total Bill</Text>
              <Text style={styles.totalAmount}>Rs {(scene.total_amount || scene.totalBill || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.shareLabel}>Your Share</Text>
              <Text style={styles.shareAmount}>Rs {scene.yourShare || initialScene?.yourShare || '0.00'}</Text>
            </View>
          </View>
          
          {/* Compact Details Grid - Remove duplications */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailsRow}>
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="people" size={14} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>Group</Text>
                </View>
                <Text style={styles.fieldValue}>{scene.group?.name || scene.group_name || scene.group || 'Group'}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>Date</Text>
                </View>
                <Text style={styles.fieldValue}>{displayDate}</Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="time" size={14} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>Time</Text>
                </View>
                <Text style={styles.fieldValue}>{displayTime}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="people" size={14} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>Participants</Text>
                </View>
                <Text style={styles.fieldValue}>{participants.length}</Text>
              </View>
            </View>
          </View>

          {/* Description section - Compact */}
          {scene.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{scene.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Participants - Now the final section */}
        <View style={styles.participantsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
          </View>

          <View style={styles.participantsList}>
            {participants.length > 0 ? (
              participants.map(renderParticipant)
            ) : (
              <View style={styles.emptyParticipants}>
                <Text style={styles.emptyParticipantsText}>No participants found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Appeals Section */}
        <View style={styles.appealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appeals ({appeals.length})</Text>
            {userRole !== 'admin' && (
              <TouchableOpacity
                style={styles.appealSubmitBtn}
                onPress={() => setAppealModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={styles.appealSubmitBtnText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>

          {appealsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : appeals.length === 0 ? (
            <View style={styles.emptyAppeals}>
              <Ionicons name="flag-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyAppealsText}>No appeals yet.</Text>
              {userRole !== 'admin' && (
                <Text style={styles.emptyAppealsSubtext}>Submit an appeal if you have a concern about this group.</Text>
              )}
            </View>
          ) : (
            <View style={styles.appealsList}>
              {appeals.map((appeal) => {
                const isOwner = String(appeal.person_id || appeal.sender_id || appeal.created_by || '') === currentUserId;
                const status = (appeal.status || 'OPEN').toUpperCase();
                return (
                  <View key={appeal.id} style={styles.appealCard}>
                    <View style={styles.appealCardHeader}>
                      <View style={[styles.appealStatusBadge, { backgroundColor: `${appealStatusColor(status)}20` }]}>
                        <Text style={[styles.appealStatusText, { color: appealStatusColor(status) }]}>{status}</Text>
                      </View>
                      <Text style={styles.appealDate}>
                        {appeal.created_at ? new Date(appeal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </Text>
                    </View>

                    <Text style={styles.appealMessage}>{appeal.message}</Text>

                    {appeal.admin_comment ? (
                      <View style={styles.adminCommentBox}>
                        <Text style={styles.adminCommentLabel}>Admin response:</Text>
                        <Text style={styles.adminCommentText}>{appeal.admin_comment}</Text>
                      </View>
                    ) : null}

                    <View style={styles.appealActions}>
                      {userRole === 'admin' && status === 'OPEN' && (
                        <TouchableOpacity
                          style={styles.appealActionBtn}
                          onPress={() => { setAdminResponseModal(appeal); setAdminComment(''); }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.appealActionBtnText}>Respond</Text>
                        </TouchableOpacity>
                      )}
                      {isOwner && status === 'OPEN' && (
                        <TouchableOpacity
                          style={[styles.appealActionBtn, styles.appealCancelBtn]}
                          onPress={() => handleDeleteAppeal(appeal.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.appealActionBtnText, { color: colors.error }]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Appeal Modal */}
      <Modal visible={appealModalVisible} transparent animationType="slide" onRequestClose={() => setAppealModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Appeal</Text>
              <TouchableOpacity onPress={() => setAppealModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Describe your concern or reason for appeal.</Text>
            <TextInput
              style={styles.appealTextInput}
              placeholder="Enter your appeal message..."
              placeholderTextColor={colors.textMuted}
              value={appealMessage}
              onChangeText={setAppealMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, submittingAppeal && { opacity: 0.6 }]}
              onPress={handleSubmitAppeal}
              disabled={submittingAppeal}
              activeOpacity={0.8}
            >
              {submittingAppeal
                ? <ActivityIndicator size="small" color="#ffffff" />
                : <Text style={styles.modalSubmitBtnText}>Submit Appeal</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Admin Respond Modal */}
      <Modal visible={!!adminResponseModal} transparent animationType="slide" onRequestClose={() => setAdminResponseModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Respond to Appeal</Text>
              <TouchableOpacity onPress={() => setAdminResponseModal(null)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.appealMessage} numberOfLines={3}>{adminResponseModal?.message}</Text>
            <TextInput
              style={[styles.appealTextInput, { marginTop: 12 }]}
              placeholder="Add a comment (optional)..."
              placeholderTextColor={colors.textMuted}
              value={adminComment}
              onChangeText={setAdminComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.adminResponseBtns}>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#10b981', flex: 1, marginRight: 8 }]}
                onPress={() => handleAdminUpdateAppeal(adminResponseModal?.id, 'RESOLVED')}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitBtnText}>Resolve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.error, flex: 1 }]}
                onPress={() => handleAdminUpdateAppeal(adminResponseModal?.id, 'REJECTED')}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header - Fixed to match other screens
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  editHeaderButton: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Same as other screens - Account for bottom tab
  },

  // Summary Card - Much more compact, no duplications
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  summaryHeader: {
    flexDirection: 'row',
    marginBottom: 16, // Reduced from 24
  },
  summaryLeft: {
    flex: 1,
    marginRight: 16, // Reduced from 20
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  shareLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  shareAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // Details Grid - More compact
  detailsGrid: {
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 10, // Reduced from 16
  },
  detailField: {
    flex: 1,
    marginRight: 16, // Reduced from 20
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Reduced from 6
    gap: 4, // Reduced from 6
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },

  // Description Section - Much more compact
  descriptionSection: {
    paddingTop: 12, // Reduced from 16
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Participants Section - Now the final section with proper bottom spacing
  participantsSection: {
    marginBottom: 0, // Removed margin since ScrollView contentContainerStyle handles bottom spacing
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  participantsList: {
    gap: 12,
  },

  // Participant Card
  participantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  participantDetails: {
    gap: 2,
  },
  participantShare: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  participantPaid: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  participantRight: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyParticipants: {
    padding: 20,
    alignItems: 'center',
  },
  emptyParticipantsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Appeals Section
  appealsSection: {
    marginTop: 24,
  },
  appealSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  appealSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyAppeals: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyAppealsText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyAppealsSubtext: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  appealsList: {
    gap: 12,
  },
  appealCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  appealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appealStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appealStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appealDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  appealMessage: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  adminCommentBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  adminCommentLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  adminCommentText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  appealActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  appealActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  appealCancelBtn: {
    backgroundColor: colors.errorLight,
  },
  appealActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  appealTextInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.inputText,
    minHeight: 100,
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  adminResponseBtns: {
    flexDirection: 'row',
    marginTop: 12,
  },
});

export default SceneDetailScreen;
