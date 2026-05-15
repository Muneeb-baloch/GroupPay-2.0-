import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { screenStyles } from '../styles/screenStyles';

const ScenesScreen = () => {
  return (
    <ScrollView style={screenStyles.container}>
      <View style={screenStyles.content}>
        <Text style={screenStyles.title}>Scenes</Text>
        <Text style={screenStyles.subtitle}>Browse and manage payment scenes</Text>
        
        <View style={screenStyles.placeholderCard}>
          <Text style={screenStyles.placeholderText}>Your scenes will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ScenesScreen;