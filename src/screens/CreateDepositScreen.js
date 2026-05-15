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
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CreateDepositScreen = ({ navigation, route }) => {
  const { groupName = 'Chichory', groupData } = route?.params || {};
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [selectedType, setSelectedType] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  const depositTypes = [
    { 
      key: 'deposit', 
      label: 'Deposit', 
      icon: 'add-circle', 
      color: '#10b981',
      description: 'Add money to group fund'
    },
    { 
      key: 'withdrawal', 
      label: 'Withdrawal', 
      icon: 'remove-circle', 
      color: '#ef4444',
      description: 'Take money from group fund'
    },
    { 
      key: 'request', 
      label: 'Request', 
      icon: 'mail', 
      color: '#f59e0b',
      description: 'Request money from members'
    }
  ];

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

    setLoading(true);
    
    // Create new deposit object
    const newDeposit = {
      id: Date.now(),
      type: selectedType,
      amount: parseFloat(amount),
      note: note.trim(),
      method: selectedMethod,
      date: new Date().toISOString(),
      status: selectedType === 'request' ? 'pending' : 'completed',
      from: selectedType === 'deposit' ? 'You' : 'Group Fund',
      to: selectedType === 'deposit' ? 'Group Fund' : 'You',
      category: 'General',
      receipt: receiptImage ? receiptImage.uri : null
    };
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Deposits', { newDeposit });
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
                <View style={[styles.groupIndicator, { backgroundColor: groupData?.color || '#06b6d4' }]} />
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
                  placeholderTextColor="#9ca3af"
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
                          color={selectedMethod === method.key ? '#06b6d4' : '#64748b'} 
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
                          <Ionicons name="checkmark-circle" size={20} color="#06b6d4" />
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
                        <Ionicons name="cloud-upload" size={32} color="#06b6d4" />
                      </View>
                      <Text style={styles.uploadTitle}>Upload Receipt</Text>
                      <Text style={styles.uploadSubtitle}>Tap to take photo or choose from gallery</Text>
                      <View style={styles.uploadButton}>
                        <Ionicons name="camera" size={16} color="#06b6d4" />
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
                        <Ionicons name="camera" size={16} color="#06b6d4" />
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

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note / Description</Text>
              <View style={styles.noteContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note or description..."
                  placeholderTextColor="#9ca3af"
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
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  keyboardSpacer: {
    height: 100,
  },

  // Group Info
  groupInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
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
    color: '#0f172a',
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },

  // Improved Type Selection
  typeContainer: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTypeCard: {
    borderWidth: 2,
    shadowColor: '#06b6d4',
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
    color: '#0f172a',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 13,
    color: '#64748b',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06b6d4',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 12,
    minHeight: 48,
  },

  // Improved Payment Method
  methodContainer: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMethodCard: {
    borderColor: '#06b6d4',
    backgroundColor: '#f0f9ff',
    shadowColor: '#06b6d4',
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
    backgroundColor: '#f8fafc',
    marginRight: 16,
  },
  selectedMethodIcon: {
    backgroundColor: '#e0f2fe',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  selectedMethodLabel: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  methodDescription: {
    fontSize: 13,
    color: '#64748b',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0f2fe',
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
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
  },

  // Image Preview Styles
  imagePreview: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  noteInput: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'right',
  },

  // Preview Card
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    marginBottom: 2,
  },
  previewMethod: {
    fontSize: 12,
    color: '#64748b',
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
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#06b6d4',
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