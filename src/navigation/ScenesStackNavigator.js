import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScenesScreen from '../screens/scenes/ScenesScreen';
import SceneDetailScreen from '../screens/scenes/SceneDetailScreen';
import CreateSceneScreen from '../screens/scenes/CreateSceneScreen';

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
      <Stack.Screen name="CreateScene" component={CreateSceneScreen} />
    </Stack.Navigator>
  );
};

export default ScenesStackNavigator;