import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Mock groups
const GROUPS_DATA = [
  {
    id: 1,
    name: 'Testing',
    color: '#06b6d4',
    members: [
      { id: 1, name: 'Muneeb ur Rehman', avatar: 'MU', color: '#8b5cf6', isYou: true }
    ]
  },
  {
    id: 2,
    name: 'Chichory',
    color: '#8b5cf6',
    members: [
      { id: 1, name: 'Muneeb ur Rehman', avatar: 'MU', color: '#8b5cf6', isYou: true },
      { id: 2, name: 'Yasir Uddin', avatar: 'YU', color: '#06b6d4', isYou: false },
      { id: 3, name: 'Ahmad Hassan', avatar: 'AH', color: '#10b981', isYou: false },
      { id: 4, name: 'Sarah Khan', avatar: 'SK', color: '#f59e0b', isYou: false },
      { id: 5, name: 'Hassan Niaz', avatar: 'HN', color: '#10b981', isYou: false },
      { id: 6, name: 'Umer Javed', avatar: 'UJ', color: '#f59e0b', isYou: false },
      { id: 7, name: 'Muneeb Yasin', avatar: 'MY', color: '#06b6d4', isYou: false }
    ]
  }
];

const MOCK_MAP_PLACES = [
  { name: 'Tummy Cafe', address: 'Plot 12, Commercial Area, Sector F-11, Islamabad' },
  { name: 'Spice Garden Restaurant', address: 'Block D, Blue Area, Islamabad' },
  { name: 'Downtown Cafe', address: 'Main Margalla Rd, Sector F-7, Islamabad' },
  { name: 'Office Cafeteria', address: 'Software Technology Park, Constitution Ave, Islamabad' },
  { name: 'Centaurus Mall Food Court', address: 'Jinnah Ave, Sector F-8, Islamabad' },
  { name: 'NUST C1 Cafe', address: 'NUST Campus, Sector H-12, Islamabad' },
  { name: 'Giga Mall Coffee Shop', address: 'GT Road, Phase 2, DHA, Islamabad' }
];

const CreateSceneScreen = ({ navigation }) => {
  const [sceneTitle, setSceneTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(GROUPS_DATA[1]);
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [calculatorExpr, setCalculatorExpr] = useState('');
  const [totalBill, setTotalBill] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentImage, setAttachmentImage] = useState(null);

  const [activeSplitTab, setActiveSplitTab] = useState('sharing');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [individualShares, setIndividualShares] = useState({});

  // Modals
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);

  // Map simulation
  const [mapSearchText, setMapSearchText] = useState('');
  const [selectedMapPlace, setSelectedMapPlace] = useState(MOCK_MAP_PLACES[0]);
  const [filteredPlaces, setFilteredPlaces] = useState(MOCK_MAP_PLACES);
  const pinAnim = useRef(new Animated.Value(0)).current;
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Date states
  const [pickerDay, setPickerDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [pickerMonth, setPickerMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear().toString());
  const [pickerHour, setPickerHour] = useState(new Date().getHours() > 12 ? (new Date().getHours() - 12).toString().padStart(2, '0') : new Date().getHours() === 0 ? '12' : new Date().getHours().toString().padStart(2, '0'));
  const [pickerMin, setPickerMin] = useState(new Date().getMinutes().toString().padStart(2, '0'));
  const [pickerPeriod, setPickerPeriod] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (selectedGroup) {
      setSelectedParticipants(selectedGroup.members);
      const shares = {};
      selectedGroup.members.forEach(m => {
        shares[m.id] = '';
      });
      setIndividualShares(shares);
    }
  }, [selectedGroup]);

  const triggerPinBounce = () => {
    Animated.sequence([
      Animated.timing(pinAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(pinAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const fetchLiveLocation = async () => {
    setFetchingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location is required.');
        setFetchingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const placeName = address.name || address.street || address.district || "Current Location";
        const formattedAddr = [address.street, address.district, address.city, address.region].filter(Boolean).join(', ');

        setSelectedMapPlace({ name: placeName, address: formattedAddr || 'Unknown Address' });
        triggerPinBounce();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingLocation(false);
    }
  };

  const evaluateCalculator = (expr) => {
    if (!expr.trim() || !/^[0-9.+\-*/\s()]+$/.test(expr)) return null;
    try {
      const result = new Function(`return ${expr}`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 100) / 100;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const calculatedResult = evaluateCalculator(calculatorExpr);

  useEffect(() => {
    if (calculatedResult !== null) {
      setTotalBill(calculatedResult.toString());
    }
  }, [calculatorExpr]);

  useEffect(() => {
    const d = new Date();
    setDateTime(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
  }, []);

  const handleSetDateTime = () => {
    setDateTime(`${pickerDay}/${pickerMonth}/${pickerYear}, ${pickerHour}:${pickerMin} ${pickerPeriod}`);
    setDateModalVisible(false);
  };

  const handleMapSearchChange = (text) => {
    setMapSearchText(text);
    if (!text.trim()) {
      setFilteredPlaces(MOCK_MAP_PLACES);
    } else {
      setFilteredPlaces(MOCK_MAP_PLACES.filter(place => place.name.toLowerCase().includes(text.toLowerCase())));
    }
  };

  const selectPlaceOnMap = (place) => {
    setSelectedMapPlace(place);
    setMapSearchText('');
    setFilteredPlaces(MOCK_MAP_PLACES);
    triggerPinBounce();
  };

  const handleConfirmMapLocation = () => {
    setLocation(selectedMapPlace.name);
    setMapModalVisible(false);
  };

  const handlePickImage = async () => {
    Alert.alert('Upload Receipt', 'Choose receipt source:', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status === 'granted') {
            const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
            if (!res.canceled) setAttachmentImage(res.assets[0]);
          }
        }
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status === 'granted') {
            const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
            if (!res.canceled) setAttachmentImage(res.assets[0]);
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const totalBillNum = parseFloat(totalBill) || 0;
  const participantCount = selectedParticipants.length;
  const equalSplitAmount = participantCount > 0 ? Math.round((totalBillNum / participantCount) * 100) / 100 : 0;

  const sumIndividualShares = Object.keys(individualShares).reduce((sum, key) => {
    const isSelected = selectedParticipants.some(p => p.id.toString() === key);
    return isSelected ? sum + (parseFloat(individualShares[key]) || 0) : sum;
  }, 0);

  const remainingToAssign = totalBillNum - sumIndividualShares;

  const handleToggleParticipant = (member) => {
    setSelectedParticipants(prev =>
      prev.some(p => p.id === member.id) ? prev.filter(p => p.id !== member.id) : [...prev, member]
    );
  };

  const handleIndividualShareChange = (memberId, val) => {
    setIndividualShares(prev => ({ ...prev, [memberId]: val }));
  };

  const handleSubmitScene = () => {
    if (!selectedGroup) return Alert.alert('Error', 'Please select a group.');
    if (!location.trim()) return Alert.alert('Error', 'Please enter location.');
    if (totalBillNum <= 0) return Alert.alert('Error', 'Please enter a valid bill amount.');
    if (participantCount === 0) return Alert.alert('Error', 'Please select participants.');

    if (activeSplitTab === 'individual' && Math.abs(remainingToAssign) > 0.01) {
      return Alert.alert('Error', `Individual splits must sum up to the total bill.\nRemaining: Rs ${remainingToAssign}`);
    }

    let yourShare = 0;
    const currentUser = selectedParticipants.find(p => p.isYou);
    if (currentUser) {
      yourShare = activeSplitTab === 'sharing' ? equalSplitAmount : parseFloat(individualShares[currentUser.id]) || 0;
    }

    const dateParts = dateTime.split(',')[0].split('/');
    let formattedDate = dateTime.split(',')[0];
    if (dateParts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formattedDate = `${months[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[0])}, ${dateParts[2]}`;
    }

    const newScene = {
      id: Date.now(),
      title: sceneTitle.trim() || location.trim(),
      group: selectedGroup.name,
      description: description.trim() || `Expenses at ${location}`,
      date: formattedDate,
      time: dateTime.split(',')[1]?.trim() || '12:00 PM',
      totalBill: totalBillNum,
      participants: participantCount,
      participantAvatars: selectedParticipants.map(p => ({ name: p.avatar, color: p.color })),
      location: location.trim(),
      yourShare: Math.round(yourShare)
    };

    Alert.alert('Success', `Scene "${newScene.title}" created successfully!`, [
      { text: 'OK', onPress: () => navigation.navigate('ScenesList', { newScene }) }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffe" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Scene Outing</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* 1. Large Amount Header - Mobile-Native Focus */}
            <View style={styles.amountHeaderContainer}>
              <Text style={styles.amountHeaderLabel}>Total Outing Bill</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.amountCurrencySymbol}>Rs</Text>
                <TextInput
                  style={styles.amountTextInput}
                  placeholder="0.00"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={totalBill}
                  onChangeText={setTotalBill}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* 2. Group Settings Block */}
            <TouchableOpacity
              style={styles.groupTile}
              onPress={() => setGroupModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.groupIndicator, { backgroundColor: selectedGroup.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTileLabel}>Selected Outing Group</Text>
                <Text style={styles.groupTileValue}>{selectedGroup.name}</Text>
              </View>
              <Text style={styles.changeGroupText}>Change</Text>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>

            {/* 3. Settings-Style Forms Card */}
            <View style={styles.formCard}>
              {/* Event Title Row */}
              <View style={styles.formRow}>
                <Ionicons name="bookmark-outline" size={20} color="#64748b" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Event Title</Text>
                <TextInput
                  style={styles.rowInput}
                  placeholder="e.g. Cafe Outing, Pizza Party"
                  placeholderTextColor="#94a3b8"
                  value={sceneTitle}
                  onChangeText={setSceneTitle}
                />
              </View>

              {/* Location Row */}
              <View style={styles.formRow}>
                <Ionicons name="location-outline" size={20} color="#64748b" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Location</Text>
                <TextInput
                  style={[styles.rowInput, { marginRight: 6 }]}
                  placeholder="e.g. Tummy Cafe"
                  placeholderTextColor="#94a3b8"
                  value={location}
                  onChangeText={setLocation}
                />
                <TouchableOpacity 
                  onPress={() => { setMapModalVisible(true); triggerPinBounce(); }}
                  style={styles.inlineActionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate-outline" size={18} color="#06b6d4" />
                </TouchableOpacity>
              </View>

              {/* Date & Time Row */}
              <TouchableOpacity
                style={styles.formRow}
                onPress={() => setDateModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={20} color="#64748b" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Date & Time</Text>
                <Text style={styles.rowTextVal}>{dateTime}</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>

              {/* Formula Calculator Row */}
              <View style={[styles.formRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="calculator-outline" size={20} color="#64748b" style={styles.rowIcon} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.rowLabel}>Calculator</Text>
                  {calculatedResult !== null && (
                    <View style={styles.inlineCalcBadge}>
                      <Text style={styles.inlineCalcText}>= Rs {calculatedResult}</Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.rowInput}
                  placeholder="e.g. 500+250*2"
                  placeholderTextColor="#94a3b8"
                  value={calculatorExpr}
                  onChangeText={setCalculatorExpr}
                />
              </View>
            </View>

            {/* 4. Notes & Compact Receipt Capture Card */}
            <View style={styles.formCard}>
              <View style={[styles.formRow, { borderBottomWidth: 0, alignItems: 'flex-start' }]}>
                <Ionicons name="document-text-outline" size={20} color="#64748b" style={[styles.rowIcon, { marginTop: 10 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notesLabel}>Notes & Description</Text>
                  <TextInput
                    style={styles.notesTextInput}
                    placeholder="Enter outing notes (optional)..."
                    placeholderTextColor="#94a3b8"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>

              {/* Compact Image Capture Row - Styled clean like standard mobile settings */}
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Receipt Screenshot</Text>
                {!attachmentImage ? (
                  <TouchableOpacity
                    style={styles.receiptAddBtn}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={18} color="#06b6d4" />
                    <Text style={styles.receiptAddText}>Add Photo</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.receiptThumbnailContainer}>
                    <Image source={{ uri: attachmentImage.uri }} style={styles.receiptThumbnail} />
                    <TouchableOpacity
                      style={styles.receiptRemoveBadge}
                      onPress={() => setAttachmentImage(null)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={10} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* 5. Split Configuration Section */}
            <View style={styles.splitSection}>
              <Text style={styles.splitSectionTitle}>Participant Split</Text>
              <Text style={styles.splitSectionSubtitle}>Select participants and assign expenses</Text>

              {/* Segment Pill Switcher Tabs */}
              <View style={styles.pillTabsContainer}>
                <TouchableOpacity
                  style={[styles.pillTab, activeSplitTab === 'sharing' && styles.activePillTab]}
                  onPress={() => setActiveSplitTab('sharing')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillTabText, activeSplitTab === 'sharing' && styles.activePillTabText]}>
                    Split Equally ({activeSplitTab === 'sharing' ? participantCount : 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pillTab, activeSplitTab === 'individual' && styles.activePillTab]}
                  onPress={() => setActiveSplitTab('individual')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillTabText, activeSplitTab === 'individual' && styles.activePillTabText]}>
                    Individual Split ({activeSplitTab === 'individual' ? participantCount : 0})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dropdown Member Selector */}
              <TouchableOpacity
                style={styles.memberSelectorRow}
                onPress={() => setMemberModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={18} color="#06b6d4" />
                <Text style={styles.memberSelectorText}>Select Outing Members...</Text>
                <Ionicons name="chevron-down" size={16} color="#94a3b8" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              {/* Split Members List */}
              {selectedParticipants.length === 0 ? (
                <View style={styles.emptyPrompt}>
                  <Text style={styles.emptyPromptText}>No members selected yet.</Text>
                </View>
              ) : (
                <View style={styles.membersSplitCard}>
                  {selectedParticipants.map(member => {
                    const isYou = member.isYou;
                    return (
                      <View key={member.id} style={styles.memberListRow}>
                        <View style={styles.memberAvatarWrapper}>
                          <View style={[styles.memberAvatarCircle, { backgroundColor: member.color }]}>
                            <Text style={styles.avatarTextLetter}>{member.avatar}</Text>
                          </View>
                          <Text style={styles.memberNameText} numberOfLines={1}>
                            {member.name} {isYou && '(You)'}
                          </Text>
                        </View>

                        {activeSplitTab === 'sharing' ? (
                          <Text style={styles.equalSplitText}>Rs {equalSplitAmount.toLocaleString()}</Text>
                        ) : (
                          <View style={styles.individualInputWrapper}>
                            <Text style={styles.indivCurrency}>Rs</Text>
                            <TextInput
                              style={styles.indivInputBox}
                              keyboardType="numeric"
                              placeholder="0"
                              value={individualShares[member.id]?.toString() || ''}
                              onChangeText={(val) => handleIndividualShareChange(member.id, val)}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Status Banner */}
              {activeSplitTab === 'individual' && totalBillNum > 0 && (
                <View style={[
                  styles.statusBanner,
                  remainingToAssign === 0 ? styles.bannerOk : remainingToAssign > 0 ? styles.bannerUnder : styles.bannerOver
                ]}>
                  <Ionicons
                    name={remainingToAssign === 0 ? "checkmark-circle" : remainingToAssign > 0 ? "alert-circle" : "close-circle"}
                    size={18}
                    color={remainingToAssign === 0 ? "#10b981" : remainingToAssign > 0 ? "#f59e0b" : "#ef4444"}
                  />
                  <Text style={[
                    styles.statusBannerText,
                    remainingToAssign === 0 ? styles.textOk : remainingToAssign > 0 ? styles.textUnder : styles.textOver
                  ]}>
                    {remainingToAssign === 0
                      ? 'Split sums match the total bill!'
                      : remainingToAssign > 0
                        ? `Remaining to assign: Rs ${remainingToAssign.toLocaleString()}`
                        : `Over budget by: Rs ${Math.abs(remainingToAssign).toLocaleString()}`
                    }
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Floating Bottom Action Buttons - Mobile Standard */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.cancelBtnFoot} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnTextFoot}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitBtnFoot,
            (activeSplitTab === 'individual' && Math.abs(remainingToAssign) > 0.01) && styles.submitBtnDisabled
          ]}
          onPress={handleSubmitScene}
          disabled={activeSplitTab === 'individual' && Math.abs(remainingToAssign) > 0.01}
          activeOpacity={0.7}
        >
          <Text style={styles.submitBtnTextFoot}>Create Outing</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL 1: GROUP SELECT --- */}
      <Modal visible={groupModalVisible} transparent animationType="slide" onRequestClose={() => setGroupModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Outing Group</Text>
              <TouchableOpacity onPress={() => setGroupModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              {GROUPS_DATA.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.groupOptionRow, selectedGroup.id === group.id && styles.activeGroupOptionRow]}
                  onPress={() => { setSelectedGroup(group); setGroupModalVisible(false); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.groupColorIndicator, { backgroundColor: group.color }]} />
                  <Text style={[styles.groupOptionText, selectedGroup.id === group.id && styles.activeGroupOptionText]}>
                    {group.name}
                  </Text>
                  {selectedGroup.id === group.id && <Ionicons name="checkmark" size={20} color="#06b6d4" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: MAP SELECTOR --- */}
      <Modal visible={mapModalVisible} transparent animationType="slide" onRequestClose={() => setMapModalVisible(false)}>
        <SafeAreaView style={styles.mapSafeArea}>
          <View style={styles.mapSheet}>
            <View style={styles.mapSheetHeader}>
              <TouchableOpacity onPress={() => setMapModalVisible(false)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="chevron-back" size={26} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.mapSheetTitle}>Select Location from Map</Text>
              <View style={{ width: 32 }} />
            </View>

            <View style={styles.mapSearchContainer}>
              <View style={styles.mapSearchInputRow}>
                <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.mapSearchInput}
                  placeholder="Search location address..."
                  placeholderTextColor="#94a3b8"
                  value={mapSearchText}
                  onChangeText={handleMapSearchChange}
                />
                {mapSearchText.length > 0 && (
                  <TouchableOpacity onPress={() => handleMapSearchChange('')} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {mapSearchText.length > 0 && (
                <View style={styles.autocompleteList}>
                  {filteredPlaces.slice(0, 3).map((place, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.autocompleteItem}
                      onPress={() => selectPlaceOnMap(place)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location-outline" size={16} color="#06b6d4" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.autocompleteName}>{place.name}</Text>
                        <Text style={styles.autocompleteAddress} numberOfLines={1}>{place.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.mapVisualContainer}>
              <View style={styles.roadHorizontal1} />
              <View style={styles.roadHorizontal2} />
              <View style={styles.roadVertical1} />
              <View style={styles.roadVertical2} />

              <View style={styles.parkBlock}>
                <Ionicons name="leaf-outline" size={16} color="#15803d" />
                <Text style={styles.parkText}>Margalla Hills Park</Text>
              </View>

              <TouchableOpacity style={[styles.landmark, { top: '20%', left: '20%' }]} onPress={() => selectPlaceOnMap(MOCK_MAP_PLACES[0])} activeOpacity={0.7}>
                <Ionicons name="cafe" size={18} color="#b45309" />
                <Text style={styles.landmarkText}>Tummy Cafe</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.landmark, { top: '55%', right: '15%' }]} onPress={() => selectPlaceOnMap(MOCK_MAP_PLACES[1])} activeOpacity={0.7}>
                <Ionicons name="restaurant" size={18} color="#ef4444" />
                <Text style={styles.landmarkText}>Spice Garden</Text>
              </TouchableOpacity>

              <Animated.View style={[styles.mapPinContainer, { transform: [{ translateY: pinAnim }] }]}>
                <Ionicons name="location" size={42} color="#ef4444" />
                <View style={styles.mapPinDot} />
              </Animated.View>

              <TouchableOpacity style={styles.myLocationFab} onPress={fetchLiveLocation} activeOpacity={0.7}>
                {fetchingLocation ? <ActivityIndicator size="small" color="#06b6d4" /> : <Ionicons name="locate" size={24} color="#06b6d4" />}
              </TouchableOpacity>
            </View>

            <View style={styles.mapFooterCard}>
              <View style={styles.mapFooterInfo}>
                <Ionicons name="location" size={24} color="#06b6d4" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapFooterName}>{selectedMapPlace.name}</Text>
                  <Text style={styles.mapFooterAddress}>{selectedMapPlace.address}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.mapConfirmButton} onPress={handleConfirmMapLocation} activeOpacity={0.7}>
                <Text style={styles.mapConfirmText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL 3: DATE SELECTOR --- */}
      <Modal visible={dateModalVisible} transparent animationType="slide" onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Date & Time</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSubLabel}>Day / Month / Year</Text>
              <View style={styles.pickerRow}>
                <TextInput style={styles.pickerInput} value={pickerDay} onChangeText={setPickerDay} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>/</Text>
                <TextInput style={styles.pickerInput} value={pickerMonth} onChangeText={setPickerMonth} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>/</Text>
                <TextInput style={[styles.pickerInput, { width: 70 }]} value={pickerYear} onChangeText={setPickerYear} keyboardType="numeric" maxLength={4} />
              </View>

              <Text style={styles.pickerSubLabel}>Time (Hour : Min)</Text>
              <View style={styles.pickerRow}>
                <TextInput style={styles.pickerInput} value={pickerHour} onChangeText={setPickerHour} keyboardType="numeric" maxLength={2} />
                <Text style={styles.pickerSeparator}>:</Text>
                <TextInput style={styles.pickerInput} value={pickerMin} onChangeText={setPickerMin} keyboardType="numeric" maxLength={2} />

                <View style={styles.periodToggle}>
                  <TouchableOpacity style={[styles.periodBtn, pickerPeriod === 'AM' && styles.periodBtnActive]} onPress={() => setPickerPeriod('AM')} activeOpacity={0.7}>
                    <Text style={[styles.periodText, pickerPeriod === 'AM' && styles.periodTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.periodBtn, pickerPeriod === 'PM' && styles.periodBtnActive]} onPress={() => setPickerPeriod('PM')} activeOpacity={0.7}>
                    <Text style={[styles.periodText, pickerPeriod === 'PM' && styles.periodTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quickDateRow}>
                <TouchableOpacity style={styles.quickDateBtn} onPress={() => { const d = new Date(); setPickerDay(d.getDate().toString().padStart(2, '0')); setPickerMonth((d.getMonth() + 1).toString().padStart(2, '0')); setPickerYear(d.getFullYear().toString()); }} activeOpacity={0.7}>
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickDateBtn} onPress={() => { const d = new Date(); d.setDate(d.getDate() - 1); setPickerDay(d.getDate().toString().padStart(2, '0')); setPickerMonth((d.getMonth() + 1).toString().padStart(2, '0')); setPickerYear(d.getFullYear().toString()); }} activeOpacity={0.7}>
                  <Text style={styles.quickDateText}>Yesterday</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveDateButton} onPress={handleSetDateTime} activeOpacity={0.7}>
                <Text style={styles.saveDateButtonText}>Apply Date & Time</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>

      {/* --- MODAL 4: MEMBERS LIST CHECKLIST --- */}
      <Modal visible={memberModalVisible} transparent animationType="slide" onRequestClose={() => setMemberModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Outing Members</Text>
              <TouchableOpacity onPress={() => setMemberModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              {selectedGroup.members.map(member => {
                const isSelected = selectedParticipants.some(p => p.id === member.id);
                return (
                  <TouchableOpacity key={member.id} style={styles.memberCheckRow} onPress={() => handleToggleParticipant(member)} activeOpacity={0.7}>
                    <View style={[styles.memberAvatarCircle, { backgroundColor: member.color, width: 36, height: 36 }]}>
                      <Text style={styles.avatarTextLetter}>{member.avatar}</Text>
                    </View>
                    <Text style={styles.memberCheckName}>{member.name} {member.isYou && '(You)'}</Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.closeMembersBtn} onPress={() => setMemberModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.closeMembersBtnText}>Confirm Members</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // 1. Large Amount Header
  amountHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  amountHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCurrencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#06b6d4',
    marginRight: 6,
    marginTop: 4,
  },
  amountTextInput: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
    padding: 0,
    minWidth: 100,
    textAlign: 'center',
  },

  // 2. Active Group Settings Tile
  groupTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 16,
  },
  groupIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  groupTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  groupTileValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  changeGroupText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06b6d4',
    marginRight: 4,
  },

  // 3. Settings List-Style Card panel
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    width: 90,
  },
  rowInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    padding: 0,
    textAlign: 'right',
  },
  rowTextVal: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 4,
  },
  inlineActionBtn: {
    padding: 4,
    marginLeft: 6,
  },
  inlineCalcBadge: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  inlineCalcText: {
    fontSize: 10,
    color: '#0891b2',
    fontWeight: '700',
  },

  // 4. Notes & Compact Receipt Capture Card
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  notesTextInput: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    padding: 0,
    marginTop: 6,
    textAlignVertical: 'top',
    height: 48,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  receiptLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  receiptAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  receiptAddText: {
    fontSize: 12,
    color: '#06b6d4',
    fontWeight: '700',
  },
  receiptThumbnailContainer: {
    position: 'relative',
  },
  receiptThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptRemoveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 5. Split Configuration Section
  splitSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    marginBottom: 20,
  },
  splitSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  splitSectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 16,
  },
  pillTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 30,
    padding: 3,
    marginBottom: 16,
  },
  pillTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activePillTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pillTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activePillTabText: {
    color: '#06b6d4',
  },
  memberSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  memberSelectorText: {
    fontSize: 13,
    color: '#06b6d4',
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyPrompt: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyPromptText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  membersSplitCard: {
    gap: 8,
  },
  memberListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  memberAvatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  memberAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarTextLetter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  equalSplitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  individualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 6,
    width: 90,
    height: 32,
  },
  indivCurrency: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 4,
  },
  indivInputBox: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    height: '100%',
    padding: 0,
    textAlign: 'right',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  bannerOk: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  bannerUnder: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bannerOver: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusBannerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textOk: { color: '#065f46' },
  textUnder: { color: '#92400e' },
  textOver: { color: '#991b1b' },

  // Fixed Floating Footer (iOS standard)
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtnFoot: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelBtnTextFoot: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtnFoot: {
    flex: 2,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  submitBtnTextFoot: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Modal bottoms
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: '40%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  groupOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  activeGroupOptionRow: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  groupColorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  groupOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  activeGroupOptionText: {
    color: '#06b6d4',
    fontWeight: '700',
  },

  // DateTime selector
  pickerSection: {
    padding: 20,
    alignItems: 'center',
  },
  pickerSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  pickerInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    width: 44,
    height: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  pickerSeparator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginHorizontal: 6,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 2,
    marginLeft: 14,
  },
  periodBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodBtnActive: {
    backgroundColor: '#ffffff',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  periodTextActive: {
    color: '#06b6d4',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickDateBtn: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0891b2',
  },
  saveDateButton: {
    backgroundColor: '#06b6d4',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveDateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Member checklist
  memberCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberCheckName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  closeMembersBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  closeMembersBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Map Simulator Modal layout
  mapSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapSheet: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  mapSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mapSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  mapSearchContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  mapSearchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  autocompleteList: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  autocompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  autocompleteName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  autocompleteAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  mapVisualContainer: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  roadHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#ffffff',
  },
  roadHorizontal2: {
    position: 'absolute',
    bottom: '40%',
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#ffffff',
  },
  roadVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '25%',
    width: 24,
    backgroundColor: '#ffffff',
  },
  roadVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '30%',
    width: 32,
    backgroundColor: '#ffffff',
  },
  parkBlock: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    width: '40%',
    height: '20%',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  parkText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '700',
  },
  landmark: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  landmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  mapPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -42,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f172a',
    marginTop: -6,
  },
  myLocationFab: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 15,
  },
  mapFooterCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  mapFooterInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mapFooterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  mapFooterAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
  mapConfirmButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CreateSceneScreen;
