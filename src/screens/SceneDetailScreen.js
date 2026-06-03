import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { scenesService } from '../services/scenesService';

const SceneDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = useAuth();
  const { scene: initialScene } = route.params;

  const [scene, setScene] = useState(initialScene || {});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSceneDetails = useCallback(async () => {
    if (!token || !initialScene?.id) return;
    setLoading(true);
    try {
      const response = await scenesService.getSceneById(token, initialScene.id);
      const fullScene = scenesService.extractScene(response) || response?.data || response;
      
      const rawParticipants = fullScene.participants || fullScene.scene_participants || fullScene.members || [];
      const totalBill = Number(fullScene?.total_amount || fullScene?.totalBill || 0);
      const sumAdditional = rawParticipants.reduce((sum, p) => sum + Number(p.additional_amount || 0), 0);
      const participantCount = rawParticipants.length;
      const perPersonShare = participantCount > 0 ? (totalBill - sumAdditional) / participantCount : 0;

      const normalizedParticipants = rawParticipants.map(p => {
        const paid = Number(p.paid_amount || 0);
        const additional = Number(p.additional_amount || 0);
        const isIndividual = p.participant_category === 'INDIVIDUAL';
        
        // Final display cost for the user
        // INDIVIDUAL: their entire cost is stored in additional_amount (which encodes individual_bill - perShare)
        // Wait, for display purposes, what is their cost? 
        // In CreateScene, if INDIVIDUAL, the displayShare = their exact personal bill.
        // Wait, the API might return `share_amount` if calculated correctly, but to be robust:
        // Actually, if we use the same math as ScenesScreen: displayShare = perPersonShare + additional
        const displayShare = perPersonShare + additional; 
        
        const balance = paid - displayShare; // Positive: gets back, Negative: owes
        
        return {
          id: String(p.person_id || p.id),
          name: p.person?.fullname || p.person?.username || p.name || 'Unknown',
          avatar: p.person?.fullname ? p.person.fullname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U',
          color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][Number(p.person_id || p.id || 0) % 5],
          paid: paid,
          share: displayShare,
          status: balance >= -0.01 ? 'paid' : 'owes',
          balance: balance
        };
      });

      const currentUserId = String(user?.person_id || user?.id);
      const me = normalizedParticipants.find(p => p.id === currentUserId);
      const yourShare = me ? me.share.toFixed(2) : '0.00';

      setScene(prev => ({ ...prev, ...fullScene, yourShare }));
      setParticipants(normalizedParticipants);
    } catch (error) {
      console.log('Fetch scene details error:', error.message);
      Alert.alert('Error', 'Could not load scene details.');
    } finally {
      setLoading(false);
    }
  }, [token, initialScene, user]);

  useEffect(() => {
    fetchSceneDetails();
  }, [fetchSceneDetails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSceneDetails();
    setRefreshing(false);
  };

  const handleEdit = () => {
    navigation.navigate('CreateScene', { existingScene: scene, sceneId: scene.id });
  };

  const renderParticipant = (participant) => (
    <View key={participant.id} style={styles.participantCard}>
      <View style={styles.participantLeft}>
        <View style={[styles.avatar, { backgroundColor: participant.color }]}>
          <Text style={styles.avatarText}>{participant.avatar}</Text>
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
          { color: participant.balance >= -0.01 ? '#10b981' : '#ef4444' }
        ]}>
          {participant.balance > 0.01 ? '+' : ''}Rs {participant.balance.toLocaleString()}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: participant.status === 'paid' ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: participant.status === 'paid' ? '#166534' : '#991b1b' }
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
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
      
      {/* Header - Fixed to match other screens */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>{scene.title || scene.scene_name || scene.location || `Scene #${scene.id}`}</Text>
          <Text style={styles.subtitle}>{scene.location}</Text>
        </View>

        <TouchableOpacity 
          style={styles.editHeaderButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={20} color="#06b6d4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />
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
                  <Ionicons name="people" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Group</Text>
                </View>
                <Text style={styles.fieldValue}>{scene.group?.name || scene.group_name || scene.group || 'Group'}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="calendar" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Date</Text>
                </View>
                <Text style={styles.fieldValue}>{displayDate}</Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="time" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Time</Text>
                </View>
                <Text style={styles.fieldValue}>{displayTime}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="people" size={14} color="#64748b" />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  editHeaderButton: {
    padding: 8,
    backgroundColor: '#ecfeff',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16, // Reduced from 20
    marginBottom: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0f2fe',
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
    fontSize: 13, // Reduced from 14
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 3, // Reduced from 4
  },
  totalAmount: {
    fontSize: 24, // Reduced from 28
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.6,
  },
  shareLabel: {
    fontSize: 13, // Reduced from 14
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 3, // Reduced from 4
  },
  shareAmount: {
    fontSize: 18, // Reduced from 20
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: -0.3,
  },

  // Details Grid - More compact
  detailsGrid: {
    paddingTop: 12, // Reduced from 20
    paddingBottom: 12, // Reduced from 20
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    fontSize: 11, // Reduced from 12
    color: '#64748b',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13, // Reduced from 14
    color: '#0f172a',
    fontWeight: '600',
  },

  // Description Section - Much more compact
  descriptionSection: {
    paddingTop: 12, // Reduced from 16
  },
  descriptionTitle: {
    fontSize: 13, // Reduced from 14
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4, // Reduced from 6
  },
  descriptionText: {
    fontSize: 14, // Reduced from 15
    color: '#0f172a',
    fontWeight: '500',
    lineHeight: 18, // Reduced from 20
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
    color: '#0f172a',
  },
  participantsList: {
    gap: 12,
  },

  // Participant Card
  participantCard: {
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
    marginBottom: 4,
  },
  participantDetails: {
    gap: 2,
  },
  participantShare: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  participantPaid: {
    fontSize: 13,
    color: '#06b6d4',
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
    color: '#64748b',
    fontSize: 14,
  }
});

export default SceneDetailScreen;
