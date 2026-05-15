import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setLoading(true);
    
    // Create new group object
    const newGroup = {
      id: Date.now(), // Simple ID generation
      name: groupName.trim(),
      status: 'active',
      role: 'admin',
      members: 1,
      totalBalance: 0,
      lastActivity: 'Just created',
      memberInitials: ['MU'], // You can make this dynamic later
      color: '#06b6d4'
    };
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Group "${groupName}" created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and pass the new group data
              navigation.navigate('GroupsList', { newGroup });
            }
          }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Group</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Keyboard Avoiding View */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Group Preview - More Compact */}
            <View style={styles.previewSection}>
              <View style={styles.previewCard}>
                <View style={styles.previewIcon}>
                  <Ionicons name="people" size={24} color="#06b6d4" />
                </View>
                <Text style={styles.previewName}>
                  {groupName || 'Group Name'}
                </Text>
                <Text style={styles.previewSubtitle}>
                  Ready to manage expenses together
                </Text>
              </View>
            </View>

            {/* Group Name Input - Compact */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter group name..."
                  placeholderTextColor="#9ca3af"
                  value={groupName}
                  onChangeText={setGroupName}
                  maxLength={30}
                  autoFocus={false}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                />
              </View>
              <Text style={styles.inputHelper}>
                {groupName.length}/30 characters
              </Text>
            </View>

            {/* Info Section - More Compact */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={18} color="#06b6d4" />
                <Text style={styles.infoText}>You'll be the group admin</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color="#06b6d4" />
                <Text style={styles.infoText}>Invite members after creation</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="lock-closed" size={18} color="#06b6d4" />
                <Text style={styles.infoText}>Private group by default</Text>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                (!groupName.trim() || loading) && styles.createButtonDisabled
              ]}
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.createButtonText}>Creating...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Group</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Extra spacing for keyboard */}
            <View style={styles.keyboardSpacer} />
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
  
  // Keyboard Avoiding View
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Header - More Compact
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 16
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced from 32
    paddingBottom: 40, // Reduced for keyboard handling
    flexGrow: 1,
  },

  // Keyboard Spacer
  keyboardSpacer: {
    height: 100, // Extra space when keyboard is open
  },

  // Preview Section - More Compact
  previewSection: {
    alignItems: 'center',
    marginBottom: 24, // Reduced from 40
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16, // Reduced from 20
    padding: 20, // Reduced from 32
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.08, // Lighter shadow
    shadowRadius: 8, // Reduced from 12
    elevation: 3, // Reduced from 4
    borderWidth: 1,
    borderColor: '#e0f2fe',
    minWidth: 200, // Reduced from 240
  },
  previewIcon: {
    width: 48, // Reduced from 64
    height: 48, // Reduced from 64
    borderRadius: 24, // Reduced from 32
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // Reduced from 16
  },
  previewName: {
    fontSize: 18, // Reduced from 20
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4, // Reduced from 6
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 13, // Reduced from 14
    color: '#64748b',
    textAlign: 'center',
  },

  // Input Section - More Compact
  inputSection: {
    marginBottom: 20, // Reduced from 32
  },
  inputLabel: {
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10, // Reduced from 12
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10, // Reduced from 12
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.04, // Lighter shadow
    shadowRadius: 3, // Reduced from 4
    elevation: 2,
  },
  textInput: {
    paddingHorizontal: 14, // Reduced from 16
    paddingVertical: 12, // Reduced from 16
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    minHeight: 44, // Ensure proper touch target
  },
  inputHelper: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6, // Reduced from 8
    textAlign: 'right',
  },

  // Info Section - More Compact
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12, // Reduced from 16
    padding: 16, // Reduced from 20
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 24, // Added margin for button
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16
  },
  infoText: {
    fontSize: 13, // Reduced from 14
    color: '#64748b',
    marginLeft: 10, // Reduced from 12
    fontWeight: '500',
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    paddingVertical: 14, // Reduced from 16
    borderRadius: 10, // Reduced from 12
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 3 }, // Reduced shadow
    shadowOpacity: 0.15, // Reduced from 0.2
    shadowRadius: 6, // Reduced from 8
    elevation: 3, // Reduced from 4
  },
  createButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.05,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
  },
});

export default CreateGroupScreen;