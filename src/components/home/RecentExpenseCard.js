import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../styles/homeStyles';

const RecentExpenseCard = ({ expense, onPress }) => (
  <TouchableOpacity style={homeStyles.recentCard} onPress={() => onPress?.(expense)} activeOpacity={0.7}>
    <View style={homeStyles.recentCardLeft}>
      <View style={[homeStyles.recentIconBox, { backgroundColor: `${expense.color}15` }]}>
        <Ionicons name={expense.icon} size={18} color={expense.color} />
      </View>
      <View style={homeStyles.recentCardInfo}>
        <Text style={homeStyles.recentCardTitle}>{expense.title}</Text>
        <View style={homeStyles.recentCardMeta}>
          <View style={[homeStyles.categoryBadge, { backgroundColor: `${expense.color}15` }]}>
            <Text style={[homeStyles.categoryBadgeText, { color: expense.color }]}>{expense.category}</Text>
          </View>
          <Text style={homeStyles.recentCardDot}>·</Text>
          <Text style={homeStyles.recentCardSubtitle}>{expense.date}</Text>
        </View>
      </View>
    </View>
    <View style={homeStyles.recentCardRight}>
      <Text style={[homeStyles.recentCardAmount, { color: expense.type === 'Income' ? '#10b981' : '#ef4444' }]}>
        {expense.type === 'Income' ? '+' : '-'}Rs {expense.amount.toLocaleString()}
      </Text>
      <Text style={[homeStyles.expenseType, { color: expense.type === 'Income' ? '#10b981' : '#ef4444' }]}>
        {expense.type}
      </Text>
    </View>
  </TouchableOpacity>
);

export default RecentExpenseCard;
