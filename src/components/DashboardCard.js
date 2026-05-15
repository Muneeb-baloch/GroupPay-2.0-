import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { dashboardStyles } from '../styles/dashboardStyles';

const { width } = Dimensions.get('window');

const DashboardCard = () => {
  const navigation = useNavigation();

  const handleCreateGroup = () => {
    // Navigate to Groups tab first, then to CreateGroup screen
    navigation.navigate('Groups', { screen: 'CreateGroup' });
  };

  return (
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
            <Text style={dashboardStyles.balanceLabel}>Total balance</Text>
            <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={dashboardStyles.balanceAmount}>Rs 72,829.62</Text>
          
          {/* Action Buttons */}
          <View style={dashboardStyles.actionButtonsContainer}>
            <TouchableOpacity 
              style={dashboardStyles.actionButton}
              onPress={handleCreateGroup}
              activeOpacity={0.8}
            >
              <View style={dashboardStyles.actionButtonCircle}>
                <Ionicons name="add" size={24} color="#ffffff" />
              </View>
              <Text style={dashboardStyles.actionButtonText}>Create Group</Text>
            </TouchableOpacity>

            <TouchableOpacity style={dashboardStyles.actionButton}>
              <View style={dashboardStyles.actionButtonCircle}>
                <Ionicons name="arrow-up" size={24} color="#ffffff" />
              </View>
              <Text style={dashboardStyles.actionButtonText}>Send Money</Text>
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
  );
};


export default DashboardCard;