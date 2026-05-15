import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customTabStyles } from '../styles/customTabStyles';

const { width } = Dimensions.get('window');

const CustomBottomTab = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;
  const tabScales = useRef(
    Array(4).fill(0).map(() => new Animated.Value(1))
  ).current;

  const tabs = [
    { name: 'Home', icon: 'home', activeIcon: 'home' },
    { name: 'Groups', icon: 'people', activeIcon: 'people' },
    { name: 'Scenes', icon: 'search', activeIcon: 'search' },
    { name: 'Expenses', icon: 'receipt', activeIcon: 'receipt' },
  ];

const tabBarWidth = width - 32;
  const tabWidth = tabBarWidth / tabs.length;
  const dynamicBottom = Math.max((insets.bottom || 0) - 20, 2);

  useEffect(() => {
    const indicatorOffset = state.index * tabWidth + (tabWidth - 50) / 2;

    Animated.spring(translateX, {
      toValue: indicatorOffset,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();

    tabScales.forEach((scale, index) => {
      Animated.spring(scale, {
        toValue: state.index === index ? 1.05 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    });
  }, [state.index, tabWidth]);

  const renderTab = (tab, index) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(state.routes[index].name);
      }
    };

    return (
      <TouchableOpacity
        key={index}
        onPress={onPress}
        style={customTabStyles.tabButton}
        activeOpacity={0.75}
      >
        <Animated.View
          style={[
            isFocused ? customTabStyles.activeTabContainer : customTabStyles.tabIconContainer,
            { transform: [{ scale: tabScales[index] }] },
          ]}
        >
          <Ionicons
            name={tab.icon}
            size={isFocused ? 22 : 20}
            color={isFocused ? '#ffffff' : '#64748b'}
          />
        </Animated.View>
        <Text
          style={[
            customTabStyles.tabLabel,
            { color: isFocused ? '#0b7285' : '#64748b' },
          ]}
        >
          {tab.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[customTabStyles.container, { bottom: dynamicBottom }]}> 
      <View style={[customTabStyles.tabBar, { width: tabBarWidth }]}> 
        <Animated.View
          style={[
            customTabStyles.indicator,
            { transform: [{ translateX }] },
          ]}
        />
        {tabs.map((tab, index) => renderTab(tab, index))}
      </View>
    </View>
  );
};

export default CustomBottomTab;