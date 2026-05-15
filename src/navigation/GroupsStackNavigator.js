import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import GroupsScreen from '../screens/GroupsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import DepositsScreen from '../screens/DepositsScreen';
import CreateDepositScreen from '../screens/CreateDepositScreen';

const Stack = createStackNavigator();

const GroupsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Deposits" component={DepositsScreen} />
      <Stack.Screen name="CreateDeposit" component={CreateDepositScreen} />
    </Stack.Navigator>
  );
};

export default GroupsStackNavigator;