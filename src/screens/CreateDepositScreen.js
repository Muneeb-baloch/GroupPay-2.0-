import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { depositsService } from '../services/depositsService';
import { filesService } from '../services/filesService';
import { usersService } from '../services/usersService';
import { groupsService } from '../services/groupsService';
import { Modal, FlatList } from 'react-native';

const CreateDepositScreen = ({ navigation, route }) => {
  const { groupName = 'Chichory', groupData } = route?.params || {};
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [selectedType, setSelectedType] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);
  const [memberPickerVisible, setMemberPickerVisible] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedReceiverEmail, setSelectedReceiverEmail] = useState(null);

  const allDepositTypes = [
    {
      key: 'deposit',
      label: 'Deposit',
      icon: 'add-circle',
      color: '#10b981',
      description: 'Send money to admin to top up your balance',
      adminOnly: false,
    },
    {
      key: 'withdrawal',
      label: 'Withdrawal',
      icon: 'remove-circle',
      color: '#ef4444',
      description: 'Distribute money back to a member',
      adminOnly: true,
    },
    {
      key: 'request',
      label: 'Request',
      icon: 'mail',
      color: '#f59e0b',
      description: 'Request a payment from a member',
      adminOnly: true,
    },
  ];
  // Members can only deposit; admin has all types
  const depositTypes = isAdmin ? allDepositTypes : allDepositTypes.filter(t => !t.adminOnly);

  const paymentMethods = [
    { 
      key: 'bank_transfer', 
      label: 'Bank Transfer', 
      icon: 'card',
      description: 'Direct bank to bank transfer',
      requiresReceipt: true
    },
    { 
      key: 'cash', 
      label: 'Cash', 
      icon: 'cash',
      description: 'Physical cash payment',
      requiresReceipt: false
    },
    { 
      key: 'digital_wallet', 
      label: 'Digital Wallet', 
      icon: 'wallet',
      description: 'PayPal, Venmo, etc.',
      requiresReceipt: false
    },
    { 
      key: 'check', 
      label: 'Check', 
      icon: 'document',
      description: 'Paper check payment',
      requiresReceipt: false
    }
  ];

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload receipt.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take a photo.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0]);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Upload Receipt',
      'Choose how you want to add the receipt:',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const removeImage = () => {
    setReceiptImage(null);
  };

  const resolveReceiverId = () => {
    if (selectedReceiverId) return selectedReceiverId;
    if (route?.params?.receiverId) return route.params.receiverId;
    // Never fall back to self — no explicit receiver means unresolved
    return null;
  };

  // groupData.role is set by groupsService.fetchGroups — default to 'member' (safe)
  const isAdmin = (groupData?.role || 'member') === 'admin';

  // Fetch group members for member picker
  useEffect(() => {
    const groupId = route?.params?.groupId || groupData?.id;
    if (!token || !groupId) return;
    let mounted = true;
    setMembersLoading(true);
    setMembersError(null);
    const myId = String(user?.person_id || user?.id || '');
    groupsService.getGroupMembers(token, groupId)
      .then((data) => {
        if (!mounted) return;
        // /groups/{id}/members returns "List of active members with roles"
        const raw =
          data?.data?.members ||
          data?.data?.participants ||
          (Array.isArray(data?.data) ? data.data : null) ||
          data?.members ||
          data?.participants ||
          data?.rows ||
          (Array.isArray(data) ? data : []);

        if (__DEV__) console.log('[CreateDeposit] members count:', (raw || []).length);

        const list = (raw || []).map(p => {
          const personId = String(p.person_id || p.person?.id || p.id || '');
          const roleStr = (p.role || p.participant_role || p.user_role || '').toString().toLowerCase();
          const isParticipantAdmin =
            p.is_admin === true  ||
            p.is_admin === 1     ||
            p.is_owner === true  ||
            roleStr === 'admin'  ||
            roleStr === 'owner';
          return {
            id: p.person_id || p.person?.id || p.id,
            name: p.person?.fullname || p.person?.username || p.fullname || p.name || 'Unknown',
            email: p.person?.email || p.email || '',
            is_admin: isParticipantAdmin,
          };
        });

        // Members send to admin only; admins send to any other member (exclude self)
        let filtered = isAdmin
          ? list.filter(m => String(m.id) !== myId)
          : list.filter(m => m.is_admin);

        setMembers(filtered);
        if (filtered.length === 0) {
          setMembersError(
            isAdmin
              ? 'No other members found in this group.'
              : 'Could not find group admin. Make sure you are in an active group.'
          );
        }

        // Non-admin members: auto-select the admin as receiver
        if (!isAdmin && filtered.length > 0 && !selectedReceiverId) {
          const admin = filtered[0];
          setSelectedReceiverId(admin.id);
          setSelectedReceiverEmail(admin.name || admin.email);
        }
      })
      .catch(err => {
        if (!mounted) return;
        console.warn('[CreateDeposit] getGroupMembers error:', err?.message);
        setMembersError('Could not load group members: ' + (err?.message || 'Unknown error'));
      })
      .finally(() => { if (mounted) setMembersLoading(false); });
    return () => { mounted = false; };
  }, [token, route?.params?.groupId, groupData?.id, isAdmin]);

  const normalizeDepositResponse = (payload) => payload?.data?.deposit || payload?.data || payload?.deposit || payload;

  const handleCreateDeposit = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!note.trim()) {
      Alert.alert('Error', 'Please add a note or description');
      return;
    }

    // Check if receipt is required for bank transfer
    const selectedMethodData = paymentMethods.find(m => m.key === selectedMethod);
    if (selectedMethodData?.requiresReceipt && !receiptImage) {
      Alert.alert('Receipt Required', 'Please upload a receipt for bank transfer transactions.');
      return;
    }

    let receiverId = resolveReceiverId();
    const groupId = route?.params?.groupId || groupData?.id;
    if (!groupId) {
      Alert.alert('Error', 'Missing group id for this deposit request.');
      return;
    }
    // If receiverId not provided yet, try route param email lookup
    if (!receiverId && route?.params?.receiverEmail) {
      try {
        const lookup = await usersService.getUserByEmail(token, route.params.receiverEmail);
        const found = (lookup?.data && lookup.data.length > 0) ? lookup.data[0] : null;
        if (found && found.id) {
          receiverId = found.id;
        }
      } catch (err) {
        // ignore and let the missing receiverId error show below
        console.warn('User lookup failed', err.message);
      }
    }
    if (!receiverId) {
      Alert.alert('Error', 'Missing receiver id for this deposit request.');
      return;
    }

    setLoading(true);

    try {
      let attachmentUrl = null;

      if (receiptImage) {
        const uploadResponse = await filesService.uploadFile(token, receiptImage, 'receipts');
        const uploadData = uploadResponse?.data || uploadResponse;
        attachmentUrl = uploadData?.url || uploadData?.file_url || uploadData?.path || uploadData?.location || null;
      }

      const response = await depositsService.createDeposit(token, {
        group_id: groupId,
        receiver_id: receiverId,
        amount: parseFloat(amount),
        deposit_type: selectedMethod.toUpperCase(),
        description: `${selectedType.toUpperCase()}: ${note.trim()}`,
        attachment_url: attachmentUrl,
      });

      const createdDeposit = normalizeDepositResponse(response);
      setLoading(false);
      Alert.alert(
        'Success',
        `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Deposits', { groupName, groupId, groupData, newDeposit: createdDeposit });
            }
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Could not create deposit. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Deposit</Text>
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
            {/* Group Info */}
            <View style={styles.groupInfo}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupIndicator, { backgroundColor: groupData?.color || colors.primary }]} />
                <Text style={styles.groupName}>{groupName}</Text>
              </View>
              <Text style={styles.groupSubtitle}>Managing group deposits</Text>
            </View>

            {/* Deposit Type Selection - Improved */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <Text style={styles.sectionSubtitle}>Choose what type of transaction you want to make</Text>
              <View style={styles.typeContainer}>
                {depositTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeCard,
                      selectedType === type.key && [styles.selectedTypeCard, { borderColor: type.color }]
                    ]}
                    onPress={() => setSelectedType(type.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.typeCardContent}>
                      <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
                        <Ionicons name={type.icon} size={28} color={type.color} />
                      </View>
                      <View style={styles.typeInfo}>
                        <Text style={[
                          styles.typeLabel,
                          selectedType === type.key && { color: type.color, fontWeight: '800' }
                        ]}>
                          {type.label}
                        </Text>
                        <Text style={styles.typeDescription}>{type.description}</Text>
                      </View>
                      {selectedType === type.key && (
                        <View style={[styles.selectedIndicator, { backgroundColor: type.color }]}>
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>Rs</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                />
              </View>
            </View>

            {/* Payment Method - Improved */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <Text style={styles.sectionSubtitle}>Select how the payment will be processed</Text>
              <View style={styles.methodContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    style={[
                      styles.methodCard,
                      selectedMethod === method.key && styles.selectedMethodCard
                    ]}
                    onPress={() => {
                      setSelectedMethod(method.key);
                      // Clear receipt if switching away from bank transfer
                      if (method.key !== 'bank_transfer') {
                        setReceiptImage(null);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.methodCardContent}>
                      <View style={[
                        styles.methodIcon,
                        selectedMethod === method.key && styles.selectedMethodIcon
                      ]}>
                        <Ionicons 
                          name={method.icon} 
                          size={24} 
                          color={selectedMethod === method.key ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={[
                          styles.methodLabel,
                          selectedMethod === method.key && styles.selectedMethodLabel
                        ]}>
                          {method.label}
                        </Text>
                        <Text style={styles.methodDescription}>{method.description}</Text>
                        {method.requiresReceipt && (
                          <View style={styles.receiptRequired}>
                            <Ionicons name="camera" size={12} color="#f59e0b" />
                            <Text style={styles.receiptRequiredText}>Receipt required</Text>
                          </View>
                        )}
                      </View>
                      {selectedMethod === method.key && (
                        <View style={styles.selectedMethodIndicator}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Receipt Upload Section - Only for Bank Transfer */}
            {selectedMethod === 'bank_transfer' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transaction Receipt</Text>
                <Text style={styles.sectionSubtitle}>Upload a screenshot or photo of your bank transfer</Text>
                
                {!receiptImage ? (
                  <TouchableOpacity 
                    style={styles.uploadArea}
                    onPress={showImagePicker}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadContent}>
                      <View style={styles.uploadIcon}>
                        <Ionicons name="cloud-upload" size={32} color={colors.primary} />
                      </View>
                      <Text style={styles.uploadTitle}>Upload Receipt</Text>
                      <Text style={styles.uploadSubtitle}>Tap to take photo or choose from gallery</Text>
                      <View style={styles.uploadButton}>
                        <Ionicons name="camera" size={16} color={colors.primary} />
                        <Text style={styles.uploadButtonText}>Add Photo</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: receiptImage.uri }} style={styles.previewImage} />
                    <View style={styles.imageActions}>
                      <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={showImagePicker}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera" size={16} color={colors.primary} />
                        <Text style={styles.changeImageText}>Change</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={removeImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={styles.removeImageText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Receiver Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isAdmin ? 'Send To Member' : 'Depositing To'}</Text>
              <Text style={styles.sectionSubtitle}>
                {isAdmin ? 'Select the group member receiving this deposit' : 'Deposits go directly to the group admin'}
              </Text>

              {!isAdmin ? (
                /* Non-admin: locked to admin, just show who it's going to */
                <View style={[styles.amountContainer, { paddingVertical: 14, paddingHorizontal: 16 }]}>
                  <Ionicons name="person" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    {membersLoading ? (
                      <Text style={{ fontSize: 15, color: colors.textMuted }}>Finding group admin...</Text>
                    ) : selectedReceiverEmail ? (
                      <>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{selectedReceiverEmail}</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Group Admin</Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 15, color: colors.error }}>Admin not found — reload or check group</Text>
                    )}
                  </View>
                  <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
                </View>
              ) : (
                /* Admin: full member picker */
                <TouchableOpacity
                  style={[styles.amountContainer, { paddingVertical: 12, paddingHorizontal: 16 }]}
                  onPress={() => setMemberPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: selectedReceiverEmail ? colors.text : colors.textMuted }}>
                      {selectedReceiverEmail || 'Select a member...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note / Description</Text>
              <View style={styles.noteContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note or description..."
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                  maxLength={100}
                  multiline={true}
                  numberOfLines={3}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                />
              </View>
              <Text style={styles.characterCount}>
                {note.length}/100 characters
              </Text>
            </View>

            {/* Preview Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewIcon, { backgroundColor: `${depositTypes.find(t => t.key === selectedType)?.color}20` }]}>
                    <Ionicons 
                      name={depositTypes.find(t => t.key === selectedType)?.icon} 
                      size={20} 
                      color={depositTypes.find(t => t.key === selectedType)?.color} 
                    />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewTitle}>
                      {note || 'Your note will appear here'}
                    </Text>
                    <Text style={styles.previewMethod}>
                      {paymentMethods.find(m => m.key === selectedMethod)?.label}
                    </Text>
                  </View>
                  <Text style={[
                    styles.previewAmount,
                    { color: depositTypes.find(t => t.key === selectedType)?.color }
                  ]}>
                    {selectedType === 'deposit' ? '+' : selectedType === 'withdrawal' ? '-' : ''}Rs {amount || '0.00'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                (!amount.trim() || !note.trim() || loading) && styles.createButtonDisabled
              ]}
              onPress={handleCreateDeposit}
              disabled={!amount.trim() || !note.trim() || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.createButtonText}>Creating...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.createButtonText}>
                    Create {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Member Picker Modal */}
            <Modal
              visible={memberPickerVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setMemberPickerVisible(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' }}>
                  {/* Handle bar */}
                  <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt }} />
                  </View>
                  {/* Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Select Receiver</Text>
                    <TouchableOpacity onPress={() => setMemberPickerVisible(false)} style={{ padding: 4 }}>
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {/* Content */}
                  {membersLoading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14 }}>Loading members...</Text>
                    </View>
                  ) : members.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                      <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                      <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                        {membersError || 'No members found'}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={members}
                      keyExtractor={(item) => String(item.id)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, backgroundColor: selectedReceiverId === item.id ? colors.primaryLight : colors.card }}
                          onPress={() => {
                            setSelectedReceiverId(item.id);
                            setSelectedReceiverEmail(item.name);
                            setMemberPickerVisible(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>{(item.name || '?')[0].toUpperCase()}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{item.name}</Text>
                            {item.email ? <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{item.email}</Text> : null}
                          </View>
                          {selectedReceiverId === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                      )}
                      contentContainerStyle={{ paddingBottom: 32 }}
                    />
                  )}
                </View>
              </View>
            </Modal>

            {/* Extra spacing for keyboard */}
            <View style={styles.keyboardSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Keyboard Avoiding View
  keyboardAvoidingView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  keyboardSpacer: {
    height: 100,
  },

  // Group Info
  groupInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  groupSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },

  // Improved Type Selection
  typeContainer: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTypeCard: {
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  typeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Amount Input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 12,
    minHeight: 48,
  },

  // Improved Payment Method
  methodContainer: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMethodCard: {
    borderColor: '#06b6d4',
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  methodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    marginRight: 16,
  },
  selectedMethodIcon: {
    backgroundColor: colors.primaryLight,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedMethodLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  methodDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  receiptRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptRequiredText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  selectedMethodIndicator: {
    marginLeft: 8,
  },

  // Receipt Upload Styles
  uploadArea: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Image Preview Styles
  imagePreview: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },

  // Note Input
  noteContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  noteInput: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },

  // Preview Card
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  previewMethod: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  previewAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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

export default CreateDepositScreen;