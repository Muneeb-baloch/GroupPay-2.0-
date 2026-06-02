import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../styles/homeStyles';

const RecentSceneCard = ({ scene, onPress }) => (
  <TouchableOpacity style={homeStyles.recentCard} onPress={() => onPress?.(scene)} activeOpacity={0.7}>
    <View style={homeStyles.recentCardLeft}>
      <View style={[homeStyles.recentIconBox, { backgroundColor: '#f0fdfa' }]}>
        <Ionicons name="restaurant-outline" size={18} color="#06b6d4" />
      </View>
      <View style={homeStyles.recentCardInfo}>
        <Text style={homeStyles.recentCardTitle}>{scene.title}</Text>
        <View style={homeStyles.recentCardMeta}>
          <Ionicons name="location-outline" size={12} color="#94a3b8" />
          <Text style={homeStyles.recentCardSubtitle}>{scene.location}</Text>
          <Text style={homeStyles.recentCardDot}>·</Text>
          <Text style={homeStyles.recentCardSubtitle}>{scene.date}</Text>
        </View>
      </View>
    </View>
    <View style={homeStyles.recentCardRight}>
      <Text style={homeStyles.recentCardAmount}>Rs {scene.totalBill}</Text>
      <Text style={homeStyles.recentCardShare}>Your share: Rs {scene.yourShare}</Text>
    </View>
  </TouchableOpacity>
);

export default RecentSceneCard;
