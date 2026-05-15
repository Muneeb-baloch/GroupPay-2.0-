import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScenesScreen from '../screens/ScenesScreen';
import SceneDetailScreen from '../screens/SceneDetailScreen';

const Stack = createStackNavigator();

const ScenesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ScenesList" component={ScenesScreen} />
      <Stack.Screen name="SceneDetail" component={SceneDetailScreen} />
    </Stack.Navigator>
  );
};

export default ScenesStackNavigator;