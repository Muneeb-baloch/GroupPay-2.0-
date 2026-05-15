import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SceneDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { scene } = route.params;

  // Simplified mobile-focused data
  const [participants] = useState([
    {
      id: 1,
      name: 'Muhammad Yousuf',
      avatar: 'MY',
      color: '#06b6d4',
      paid: 500,
      share: 231,
      status: 'paid',
      balance: +269 // owes or gets back
    },
    {
      id: 2,
      name: 'Muneeb ur Rehman',
      avatar: 'MU',
      color: '#8b5cf6',
      paid: 0,
      share: 231,
      status: 'owes',
      balance: -231
    },
    {
      id: 3,
      name: 'Ubaid Javaid',
      avatar: 'UJ',
      color: '#f59e0b',
      paid: 0,
      share: 231,
      status: 'owes',
      balance: -231
    },
    {
      id: 4,
      name: 'Hammad Noon',
      avatar: 'HN',
      color: '#10b981',
      paid: 424,
      share: 231,
      status: 'paid',
      balance: +193
    }
  ]);

  const renderParticipant = (participant) => (
    <View key={participant.id} style={styles.participantCard}>
      <View style={styles.participantLeft}>
        <View style={[styles.avatar, { backgroundColor: participant.color }]}>
          <Text style={styles.avatarText}>{participant.avatar}</Text>
        </View>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{participant.name}</Text>
          <Text style={styles.participantShare}>Share: Rs {participant.share}</Text>
        </View>
      </View>
      
      <View style={styles.participantRight}>
        <Text style={[
          styles.balanceAmount,
          { color: participant.balance >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          {participant.balance >= 0 ? '+' : ''}Rs {participant.balance}
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
          <Text style={styles.title}>{scene.title}</Text>
          <Text style={styles.subtitle}>{scene.location}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compact Scene Summary Card - No duplications */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryLeft}>
              <Text style={styles.totalLabel}>Total Bill</Text>
              <Text style={styles.totalAmount}>Rs {scene.totalBill}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.shareLabel}>Your Share</Text>
              <Text style={styles.shareAmount}>Rs {scene.yourShare}</Text>
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
                <Text style={styles.fieldValue}>{scene.group}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="calendar" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Date</Text>
                </View>
                <Text style={styles.fieldValue}>{scene.date}</Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="time" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Time</Text>
                </View>
                <Text style={styles.fieldValue}>{scene.time}</Text>
              </View>
              
              <View style={styles.detailField}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="people" size={14} color="#64748b" />
                  <Text style={styles.fieldLabel}>Participants</Text>
                </View>
                <Text style={styles.fieldValue}>{scene.participants}</Text>
              </View>
            </View>
          </View>

          {/* Description section - Compact */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{scene.description}</Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.participantsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="person-add" size={16} color="#06b6d4" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.participantsList}>
            {participants.map(renderParticipant)}
          </View>
        </View>

        {/* Settlement Summary - Enhanced with detailed breakdown */}
        <View style={styles.settlementCard}>
          <Text style={styles.settlementTitle}>Settlement Summary</Text>
          
          {/* Detailed breakdown like the reference */}
          <View style={styles.settlementBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Bill:</Text>
              <Text style={styles.breakdownValue}>Rs {scene.totalBill}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Sharing Additional Costs:</Text>
              <Text style={[styles.breakdownValue, { color: '#f59e0b' }]}>Rs 0</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Shareable Amount:</Text>
              <Text style={styles.breakdownValue}>Rs {scene.totalBill}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Per Person Share ({participants.length}):</Text>
              <Text style={styles.breakdownValue}>Rs {scene.yourShare}</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid:</Text>
              <Text style={styles.totalPaidValue}>Rs {scene.totalBill}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.settleButton} activeOpacity={0.8}>
            <Text style={styles.settleButtonText}>Settle All Balances</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  moreButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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

  // Participants Section - Now standalone with proper bottom spacing
  participantsSection: {
    marginBottom: 60, // Added proper bottom spacing since it's now the last element
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
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
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
    marginBottom: 2,
  },
  participantShare: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
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

  // Settlement Card - Enhanced with detailed breakdown and proper spacing
  settlementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 60, // Added proper bottom spacing
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  settlementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  settlementBreakdown: {
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '700',
  },
  totalPaidValue: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '800',
  },
  settleButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  settleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SceneDetailScreen;