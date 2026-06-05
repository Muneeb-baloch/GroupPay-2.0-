import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { filesService } from '../services/filesService';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, token, logout, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const fullName = user?.fullname || user?.full_name || user?.name || '';
  const profileInitial = (fullName || user?.email || 'U').charAt(0).toUpperCase();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profile_picture_url || null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refresh profile from API on mount to get latest data
  useEffect(() => {
    if (!token) return;
    authService.getProfile(token)
      .then((data) => {
        const freshUser = data?.data?.user || data?.data || data?.user || data;
        if (freshUser && typeof freshUser === 'object') {
          updateUser(freshUser);
          if (freshUser.username) setUsername(freshUser.username);
          if (freshUser.phone) setPhone(freshUser.phone);
          if (freshUser.profile_picture_url) setProfilePicUrl(freshUser.profile_picture_url);
        }
      })
      .catch(() => {});
  }, [token]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(null);

  const startSpinner = () => {
    spinAnim.current = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    spinAnim.current.start();
  };

  const stopSpinner = () => {
    spinAnim.current?.stop();
    spinValue.setValue(0);
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handlePickProfilePic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingPic(true);

    try {
      const data = await filesService.uploadFile(token, asset, 'profiles');
      const url = data?.data?.url || data?.url || data?.file_url || data?.data?.file_url;
      if (url) {
        setProfilePicUrl(url);
        // Update profile with new picture URL
        await authService.updateProfile(token, {
          fullname: fullName,
          username: username.trim(),
          phone: phone.trim(),
          profile_picture_url: url,
        });
        // Update AuthContext so dashboard reflects immediately
        await updateUser({ profile_picture_url: url });
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      Alert.alert('Upload Failed', error.message || 'Could not upload image.');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    startSpinner();
    try {
      await authService.updateProfile(token, {
        username: username.trim(),
        phone: phone.trim(),
        fullname: fullName,
        profile_picture_url: profilePicUrl,
      });
      stopSpinner();
      setSaving(false);
      // Update AuthContext so all screens reflect changes
      await updateUser({
        username: username.trim(),
        phone: phone.trim(),
        profile_picture_url: profilePicUrl,
      });
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (error) {
      stopSpinner();
      setSaving(false);
      Alert.alert('Error', error.message || 'Could not update profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {profilePicUrl ? (
                <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{profileInitial}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickProfilePic}
                disabled={uploadingPic}
                activeOpacity={0.8}
              >
                {uploadingPic ? (
                  <Animated.View style={[styles.miniSpinner, { transform: [{ rotate: spin }] }]} />
                ) : (
                  <Ionicons name="camera" size={14} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarName}>{fullName || 'Your Name'}</Text>
            <Text style={styles.avatarEmail}>{user?.email || ''}</Text>
          </View>

          {/* Profile Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ACCOUNT INFO</Text>

            {/* Full Name — read only */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="person-outline" size={16} color="#64748b" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <Text style={styles.fieldValueReadOnly}>{fullName || '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Email — read only */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="mail-outline" size={16} color="#64748b" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValueReadOnly}>{user?.email || '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Username — editable */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="at-outline" size={16} color="#64748b" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone — editable */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Ionicons name="call-outline" size={16} color="#64748b" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <View style={styles.buttonRow}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Settings Section */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SETTINGS</Text>

            {/* Dark Mode Toggle */}
            <TouchableOpacity style={styles.settingRow} onPress={toggleTheme} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(6,182,212,0.15)' : '#f0f9ff' }]}>
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
              <View style={[styles.toggleTrack, isDark && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, isDark && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Logout */}
            <TouchableOpacity style={styles.settingRow} onPress={handleLogout} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              </View>
              <Text style={[styles.settingText, { color: '#ef4444' }]}>Logout</Text>
              <Ionicons name="chevron-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: colors.primaryBorder,
  },
  miniSpinner: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  avatarName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 16, padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },

  // Field rows
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  fieldIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  fieldValueReadOnly: { fontSize: 15, color: colors.text, fontWeight: '500' },
  fieldInput: {
    fontSize: 15, color: colors.inputText, fontWeight: '500',
    paddingVertical: 0,
  },

  // Save button
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  saveButtonText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spinner: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },

  // Settings rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingText: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  toggleTrack: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: colors.skeleton,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleTrackActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
});

export default ProfileScreen;
