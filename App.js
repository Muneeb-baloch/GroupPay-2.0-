import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/SplashScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { AuthContext } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { appStyles } from './src/styles/appStyles';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check for stored token on app start
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Error reading stored auth:', error);
      }
    };
    checkStoredAuth();
  }, []);

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Error storing auth:', error);
    }
  };

  // Update user data in context and AsyncStorage (e.g. after profile update)
  const updateUser = async (updatedFields) => {
    try {
      const updatedUser = { ...user, ...updatedFields };
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error updating user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
    } catch (error) {
      console.log('Error clearing auth:', error);
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, updateUser }}>
      <ThemeProvider>
        <AppShell
          isAuthenticated={isAuthenticated}
          showSplash={showSplash}
          handleSplashFinish={handleSplashFinish}
        />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

function AppShell({ isAuthenticated, showSplash, handleSplashFinish }) {
  const { colors } = useTheme();
  return (
      <SafeAreaProvider>
        <SafeAreaView style={[appStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <StatusBar style={colors.isDark ? 'light' : 'dark'} backgroundColor={colors.background} />

          {/* NavigationContainer always pre-rendered so it's ready when splash disappears */}
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <>
                  <Stack.Screen name="MainApp" component={BottomTabNavigator} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                </>
              ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>

        {/* Modal renders above native components (e.g. iOS bottom tab bar) */}
        <Modal visible={showSplash} transparent={false} animationType="none" statusBarTranslucent={true}>
          <SplashScreen onFinish={handleSplashFinish} />
        </Modal>
      </SafeAreaProvider>
  );
}
