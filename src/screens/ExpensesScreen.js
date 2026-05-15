import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { screenStyles } from '../styles/screenStyles';

const ExpensesScreen = () => {
  return (
    <ScrollView style={screenStyles.container}>
      <View style={screenStyles.content}>
        <Text style={screenStyles.title}>Expenses</Text>
        <Text style={screenStyles.subtitle}>Track your spending and transactions</Text>
        
        <View style={screenStyles.placeholderCard}>
          <Text style={screenStyles.placeholderText}>Your expenses will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ExpensesScreen;