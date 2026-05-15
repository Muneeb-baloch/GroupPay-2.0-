import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { appStyles } from './src/styles/appStyles';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={appStyles.container} edges={['top']}>
        <StatusBar style="dark" backgroundColor="#f8fffe" />
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
