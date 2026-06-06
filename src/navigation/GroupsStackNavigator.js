import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import GroupsScreen from '../screens/groups/GroupsScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import TransactionsScreen from '../screens/groups/TransactionsScreen';
import DepositsScreen from '../screens/groups/DepositsScreen';
import CreateDepositScreen from '../screens/groups/CreateDepositScreen';
import ReceiptViewScreen from '../screens/groups/ReceiptViewScreen';
import ManageGroupScreen from '../screens/groups/ManageGroupScreen';

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
      <Stack.Screen name="ReceiptView" component={ReceiptViewScreen} />
      <Stack.Screen name="ManageGroup" component={ManageGroupScreen} />
    </Stack.Navigator>
  );
};

export default GroupsStackNavigator;