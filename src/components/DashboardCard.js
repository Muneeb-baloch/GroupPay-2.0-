import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { dashboardStyles } from '../styles/dashboardStyles';

const { width } = Dimensions.get('window');

const DashboardCard = () => {
  const navigation = useNavigation();
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(['all']);
  const [totalBalance, setTotalBalance] = useState(72829.62);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Sample groups data - in real app, this would come from context/state management
  const [availableGroups] = useState([
    { id: 'all', name: 'All Groups', balance: 72829.62, color: '#06b6d4' },
    { id: 1, name: 'Chichory', balance: 25430.50, color: '#06b6d4' },
    { id: 2, name: 'Family Trip', balance: 18750.25, color: '#10b981' },
    { id: 3, name: 'Office Lunch', balance: 12500.00, color: '#f59e0b' },
    { id: 4, name: 'Weekend Plans', balance: 16148.87, color: '#8b5cf6' }
  ]);

  // Calculate total balance based on selected groups
  useEffect(() => {
    if (selectedGroups.includes('all')) {
      setTotalBalance(availableGroups.find(g => g.id === 'all')?.balance || 0);
    } else {
      const total = availableGroups
        .filter(group => selectedGroups.includes(group.id))
        .reduce((sum, group) => sum + group.balance, 0);
      setTotalBalance(total);
    }
  }, [selectedGroups, availableGroups]);

  const handleCreateGroup = () => {
    navigation.navigate('Groups', { screen: 'CreateGroup' });
  };

  const handleDeposit = () => {
    if (selectedGroups.includes('all') || selectedGroups.length === 0) {
      // If "All Groups" is selected or no specific group, show group selection
      Alert.alert(
        'Select Group',
        'Please select a specific group to make a deposit',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose Group', onPress: () => setShowGroupFilter(true) }
        ]
      );
    } else if (selectedGroups.length === 1) {
      // Navigate to deposit screen for the selected group
      const selectedGroup = availableGroups.find(g => g.id === selectedGroups[0]);
      navigation.navigate('Groups', { 
        screen: 'CreateDeposit',
        params: {
          groupName: selectedGroup?.name,
          groupId: selectedGroup?.id,
          groupData: selectedGroup
        }
      });
    } else {
      // Multiple groups selected, let user choose
      Alert.alert(
        'Multiple Groups Selected',
        'Please select one group to make a deposit',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleGroupSelection = (groupId) => {
    if (groupId === 'all') {
      setSelectedGroups(['all']);
    } else {
      setSelectedGroups(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(groupId)) {
          const filtered = newSelection.filter(id => id !== groupId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, groupId];
        }
      });
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const getSelectedGroupsText = () => {
    if (selectedGroups.includes('all')) {
      return 'All Groups';
    } else if (selectedGroups.length === 1) {
      const group = availableGroups.find(g => g.id === selectedGroups[0]);
      return group?.name || 'Unknown Group';
    } else {
      return `${selectedGroups.length} Groups Selected`;
    }
  };

  const renderGroupFilterItem = ({ item }) => {
    const isSelected = selectedGroups.includes(item.id);
    
    return (
      <Pressable
        style={[
          dashboardStyles.groupFilterItem,
          isSelected && dashboardStyles.groupFilterItemSelected
        ]}
        onPress={() => toggleGroupSelection(item.id)}
      >
        <View style={dashboardStyles.groupFilterInfo}>
          <View style={[dashboardStyles.groupFilterIndicator, { backgroundColor: item.color }]} />
          <View style={dashboardStyles.groupFilterDetails}>
            <Text style={[
              dashboardStyles.groupFilterName,
              isSelected && dashboardStyles.groupFilterNameSelected
            ]}>
              {item.name}
            </Text>
            <Text style={[
              dashboardStyles.groupFilterBalance,
              isSelected && dashboardStyles.groupFilterBalanceSelected
            ]}>
              {balanceVisible 
                ? `Rs ${item.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                : 'Rs ••••••••'
              }
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#06b6d4" />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <View style={dashboardStyles.unifiedCard}>
        <LinearGradient
          colors={['#06b6d4', '#0891b2', '#0e7490']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dashboardStyles.cardGradient}
        >
          {/* Header Section */}
          <View style={dashboardStyles.cardHeader}>
            <View style={dashboardStyles.profileContainer}>
              <View style={dashboardStyles.profileImage}>
                <Text style={dashboardStyles.profileInitial}>M</Text>
              </View>
              <Text style={dashboardStyles.profileName}>Muneeb</Text>
            </View>
            <TouchableOpacity style={dashboardStyles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              <View style={dashboardStyles.notificationBadge}>
                <Text style={dashboardStyles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={dashboardStyles.balanceSection}>
            <View style={dashboardStyles.balanceHeader}>
              <TouchableOpacity 
                style={dashboardStyles.balanceLabelContainer}
                onPress={() => setShowGroupFilter(true)}
                activeOpacity={0.7}
              >
                <Text style={dashboardStyles.balanceLabel}>
                  {getSelectedGroupsText()}
                </Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={dashboardStyles.eyeButton}
                onPress={toggleBalanceVisibility}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="rgba(255,255,255,0.8)" 
                />
              </TouchableOpacity>
            </View>
            <Text style={dashboardStyles.balanceAmount}>
              {balanceVisible 
                ? `Rs ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                : 'Rs ••••••••'
              }
            </Text>
            
            {/* Action Buttons */}
            <View style={dashboardStyles.actionButtonsContainer}>
              <TouchableOpacity 
                style={dashboardStyles.actionButton}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={dashboardStyles.actionButton}
                onPress={handleDeposit}
                activeOpacity={0.8}
              >
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="wallet" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={dashboardStyles.actionButton}>
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="arrow-down" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={dashboardStyles.actionButton}>
                <View style={dashboardStyles.actionButtonCircle}>
                  <Ionicons name="swap-horizontal" size={24} color="#ffffff" />
                </View>
                <Text style={dashboardStyles.actionButtonText}>Split Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Group Filter Modal */}
      <Modal
        visible={showGroupFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupFilter(false)}
      >
        <View style={dashboardStyles.modalOverlay}>
          <View style={dashboardStyles.modalContainer}>
            {/* Modal Header */}
            <View style={dashboardStyles.modalHeader}>
              <Text style={dashboardStyles.modalTitle}>Select Groups</Text>
              <TouchableOpacity 
                style={dashboardStyles.modalCloseButton}
                onPress={() => setShowGroupFilter(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Groups List */}
            <FlatList
              data={availableGroups}
              renderItem={renderGroupFilterItem}
              keyExtractor={(item) => item.id.toString()}
              style={dashboardStyles.groupsList}
              showsVerticalScrollIndicator={false}
            />

            {/* Modal Footer */}
            <View style={dashboardStyles.modalFooter}>
              <TouchableOpacity
                style={dashboardStyles.applyButton}
                onPress={() => setShowGroupFilter(false)}
                activeOpacity={0.8}
              >
                <Text style={dashboardStyles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};


export default DashboardCard;