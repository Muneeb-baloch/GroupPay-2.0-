import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsService } from '../services/groupsService';
import { useAuth } from '../context/AuthContext';

const COLOR_OPTIONS = [
  '#06b6d4', '#10b981', '#f59e0b',
  '#8b5cf6', '#ef4444', '#3b82f6',
  '#ec4899', '#f97316',
];

const CreateGroupScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#06b6d4');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Spinner animation
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
        id: data?.id || Date.now(),
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Preview */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarRing, { borderColor: selectedColor + '50' }]}>
                <View style={[styles.avatar, { backgroundColor: selectedColor }]}>
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
              <View style={[styles.inputWrapper, focused && { borderColor: selectedColor, backgroundColor: '#ffffff' }]}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={focused ? selectedColor : '#94a3b8'}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Weekend Trip, Office Lunch..."
                  placeholderTextColor="#9ca3af"
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
                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.charCount, groupName.length >= 25 && { color: '#f59e0b' }]}>
                {groupName.length}/30
              </Text>
            </View>

            {/* Color Picker Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>GROUP COLOR</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
              {[
                { icon: 'shield-checkmark-outline', text: "You'll be the group admin" },
                { icon: 'person-add-outline', text: 'Invite members after creation' },
                { icon: 'lock-closed-outline', text: 'Private group by default' },
              ].map((item, i, arr) => (
                <View key={i} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
                  <View style={[styles.infoIcon, { backgroundColor: selectedColor + '18' }]}>
                    <Ionicons name={item.icon} size={16} color={selectedColor} />
                  </View>
                  <Text style={styles.infoText}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* Create Button — inside scroll, above nav bar */}
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isValid ? selectedColor : '#cbd5e1' }]}
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

            {/* Bottom padding for nav bar */}
            <View style={{ height: 110 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    maxWidth: 240,
    textAlign: 'center',
  },
  avatarSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '500',
  },

  // Colors
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    transform: [{ scale: 1.18 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  // Create button — matches GroupsScreen style
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },
});

export default CreateGroupScreen;
