import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService } from '../../services/groupsService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createUniqueId } from '../../utils/helpers';
import { getCreateGroupStyles } from '../../styles/groups/createGroupStyles';

const COLOR_OPTIONS = [
  '#06b6d4', '#10b981', '#f59e0b',
  '#8b5cf6', '#ef4444', '#3b82f6',
  '#ec4899', '#f97316',
];

const CreateGroupScreen = ({ navigation }) => {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getCreateGroupStyles(colors), [colors]);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#06b6d4');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef(null);

  const startSpinner = () => {
    spinAnimation.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.current.start();
  };

  const stopSpinner = () => {
    spinAnimation.current?.stop();
    spinValue.setValue(0);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    startSpinner();

    try {
      const data = await groupsService.createGroup(token, groupName.trim());
      stopSpinner();
      setLoading(false);

      const newGroup = data?.data || data?.group || {
        id: data?.id || createUniqueId('group'),
        name: groupName.trim(),
        status: 'active',
        role: 'admin',
        members: 1,
        totalBalance: 0,
        lastActivity: 'Just created',
        memberInitials: [],
        color: selectedColor,
        isFavorite: false,
      };

      navigation.navigate('GroupsList', { newGroup });
    } catch (error) {
      stopSpinner();
      setLoading(false);
      Alert.alert('Error', error.message || 'Could not create group. Please try again.');
    }
  };

  const initials = groupName.trim()
    ? groupName.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : null;

  const isValid = groupName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Preview */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarRing, { borderColor: 'rgba(6,182,212,0.18)' }]}>
                <View style={[styles.avatar, { backgroundColor: selectedColor || colors.primary }]}>
                  {initials ? (
                    <Text style={styles.avatarText}>{initials}</Text>
                  ) : (
                    <Ionicons name="people" size={32} color="#ffffff" />
                  )}
                </View>
              </View>
              <Text style={styles.avatarName} numberOfLines={1}>
                {groupName.trim() || 'Your Group'}
              </Text>
              <Text style={styles.avatarSub}>Live preview</Text>
            </View>

            {/* Name Input Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>GROUP NAME</Text>
              <View style={[styles.inputWrapper, focused && { borderColor: colors.primary, backgroundColor: colors.card }]}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={focused ? colors.primary : colors.textMuted}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Weekend Trip, Office Lunch..."
                  placeholderTextColor={colors.textMuted}
                  value={groupName}
                  onChangeText={setGroupName}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  autoFocus
                />
                {groupName.length > 0 && (
                  <TouchableOpacity onPress={() => setGroupName('')} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.charCount, groupName.length >= 25 && { color: '#f59e0b' }]}>
                {groupName.length}/30
              </Text>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isValid ? colors.primary : colors.inputBorder }]}
              onPress={handleCreateGroup}
              disabled={!isValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
                  <Text style={styles.createButtonText}>Creating Group...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Group</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 110 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateGroupScreen;
