import 'react-native-gesture-handler';
import React, { useState, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { appStyles } from './src/styles/appStyles';

const Stack = createStackNavigator();

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const handleSplashFinish = () => {
    // Simple delay for smoother transition
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <SafeAreaProvider>
        <SafeAreaView style={appStyles.container} edges={['top']}>
          <StatusBar style="dark" backgroundColor="#f8fffe" />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Screen name="MainApp" component={BottomTabNavigator} />
              ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
