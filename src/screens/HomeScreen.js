import React from 'react';
import { ScrollView, View } from 'react-native';
import DashboardCard from '../components/DashboardCard';
import { homeStyles } from '../styles/homeStyles';

const HomeScreen = () => {
  return (
    <ScrollView style={homeStyles.scrollView} showsVerticalScrollIndicator={false}>
      <DashboardCard />
      <View style={homeStyles.bottomPadding} />
    </ScrollView>
  );
};

export default HomeScreen;