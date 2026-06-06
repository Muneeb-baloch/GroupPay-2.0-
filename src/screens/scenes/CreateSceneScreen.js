import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, KeyboardAvoidingView, ScrollView, Keyboard, TouchableWithoutFeedback, Modal, Image, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import PillSelector from '../../components/common/PillSelector';
import ActionFooter from '../../components/common/ActionFooter';
import { getInitials } from '../../utils/helpers';
import { groupsService } from '../../services/groupsService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { scenesService } from '../../services/scenesService';
import { filesService } from '../../services/filesService';
import CreateSceneHeader from '../../components/scenes/CreateSceneHeader';
import getCreateSceneStyles from '../../styles/scenes/createSceneStyles';

const { width, height } = Dimensions.get('window');

const MOCK_MAP_PLACES = [
  { name: 'Tummy Cafe', address: 'Plot 12, Commercial Area, Sector F-11, Islamabad' },
  { name: 'Spice Garden Restaurant', address: 'Block D, Blue Area, Islamabad' },
  { name: 'Downtown Cafe', address: 'Main Margalla Rd, Sector F-7, Islamabad' },
  { name: 'Office Cafeteria', address: 'Software Technology Park, Constitution Ave, Islamabad' },
  { name: 'Centaurus Mall Food Court', address: 'Jinnah Ave, Sector F-8, Islamabad' },
  { name: 'NUST C1 Cafe', address: 'NUST Campus, Sector H-12, Islamabad' },
  { name: 'Giga Mall Coffee Shop', address: 'GT Road, Phase 2, DHA, Islamabad' }
];

const CreateSceneScreen = ({ navigation, route }) => {
  const { token, user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getCreateSceneStyles(colors), [colors]);

  // State
  const [sceneTitle, setSceneTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupsList, setGroupsList] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [totalBill, setTotalBill] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentImage, setAttachmentImage] = useState(null);
  const [activeSplitTab, setActiveSplitTab] = useState('sharing');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [individualShares, setIndividualShares] = useState({});
  const [participantPaid, setParticipantPaid] = useState({});
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatorActive, setIsCalculatorActive] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [modalSelectedIds, setModalSelectedIds] = useState([]);
  const [debugRawGroup, setDebugRawGroup] = useState(null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [selectedMapPlace, setSelectedMapPlace] = useState(MOCK_MAP_PLACES[0]);
  const [filteredPlaces, setFilteredPlaces] = useState(MOCK_MAP_PLACES);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [pickerDay, setPickerDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [pickerMonth, setPickerMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear().toString());
  const [pickerHour, setPickerHour] = useState(new Date().getHours() > 12 ? (new Date().getHours() - 12).toString().padStart(2, '0') : new Date().getHours() === 0 ? '12' : new Date().getHours().toString().padStart(2, '0'));
  const [pickerMin, setPickerMin] = useState(new Date().getMinutes().toString().padStart(2, '0'));
  const [pickerPeriod, setPickerPeriod] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');

  // Refs
  const prevGroupIdRef = useRef(null);
  const pinAnim = useRef(new Animated.Value(0)).current;
  const isHydratedRef = useRef(false);

  const evaluateExpression = (expr) => {
    try {
      const sanitized = expr.replace(/[^0-9+\-*/.() ]/g, '');
      if (!sanitized.trim()) return 0;
      const result = new Function(`return (${sanitized})`)();
      return isFinite(result) ? Math.round(result * 100) / 100 : 0;
    } catch (e) { return 0; }
  };

  const getGroupMemberCount = (group) => {
    if (!group) return 0;
    const rawMembers = group?.members;
    if (Array.isArray(rawMembers)) return rawMembers.length;
    const participantCount = group?.participant_count ?? group?.participants_count ?? group?.member_count ?? group?.members_count;
    if (typeof participantCount === 'number') return participantCount;
    return 0;
  };

  const parseDateTimeToISO = (value) => {
    if (!value) return new Date().toISOString();
    try {
      const [datePart = '', timePartRaw = ''] = value.split(',').map((v) => v.trim());
      const [day, month, year] = datePart.split('/').map((v) => parseInt(v, 10));
      if (!day || !month || !year) return new Date().toISOString();
      const [timePart = '00:00', periodRaw = ''] = timePartRaw.split(' ');
      const [hourRaw = '0', minuteRaw = '0'] = timePart.split(':');
      let hours = parseInt(hourRaw, 10) || 0;
      const minutes = parseInt(minuteRaw, 10) || 0;
      const period = periodRaw.toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
    } catch { return new Date().toISOString(); }
  };

  const extractFileUrl = (uploadResponse) => {
    return (
      uploadResponse?.data?.url ||
      uploadResponse?.data?.file_url ||
      uploadResponse?.url ||
      null
    );
  };

  const detectAdmin = (group) => {
    if (!group || !user) return false;
    const adminStrings = ['admin', 'owner', 'creator'];
    const meId = String(user?.person_id || user?.id);
    if (group.role && adminStrings.includes(String(group.role).toLowerCase())) return true;
    if (group.my_role && adminStrings.includes(String(group.my_role).toLowerCase())) return true;
    if (group.is_admin === true || group.is_owner === true) return true;
    const participants = group.participants || group.members || group.group_participants || [];
    if (Array.isArray(participants) && participants.length > 0) {
      const me = participants.find(p => String(p.person_id || p.id || p.person?.id) === meId);
      if (me) {
        const roleText = (me.role || me.user_role || me.member_role || '').toString().toLowerCase();
        if (adminStrings.includes(roleText)) return true;
        if (me.is_admin === true || me.is_owner === true) return true;
      }
    }
    return false;
  };

  const handleCalcChange = (text) => {
    setCalcExpression(text);
    const result = evaluateExpression(text);
    if (result > 0) setTotalBill(result.toString());
  };

  const toggleCalculator = () => {
    if (isCalculatorActive) setIsCalculatorActive(false);
    else {
      setIsCalculatorActive(true);
      if (totalBill && !calcExpression) setCalcExpression(totalBill);
    }
  };

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
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location access required.'); return; }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const placeName = address.name || address.street || "Current Location";
        setSelectedMapPlace({ name: placeName, address: [address.street, address.city].filter(Boolean).join(', ') });
        triggerPinBounce();
      }
    } catch (error) { console.warn('Location fetch error:', error.message); } finally { setFetchingLocation(false); }
  };

  const handlePickImage = async () => {
    Alert.alert('Upload Receipt', 'Choose source:', [
      { text: 'Camera', onPress: async () => { try { const { status } = await ImagePicker.requestCameraPermissionsAsync(); if (status === 'granted') { const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 }); if (!res.canceled) setAttachmentImage(res.assets[0]); } } catch (e) { Alert.alert('Error', e.message || 'Camera not available.'); } } },
      { text: 'Gallery', onPress: async () => { try { const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (status === 'granted') { const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 }); if (!res.canceled) setAttachmentImage(res.assets[0]); } } catch (e) { Alert.alert('Error', e.message || 'Gallery not available.'); } } },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleIndividualShareChange = (memberId, val) => {
    setIndividualShares(prev => ({ ...prev, [memberId]: val }));
  };

  const handlePaidChange = (memberId, val) => {
    setParticipantPaid(prev => ({ ...prev, [memberId]: val }));
  };

  const handleSetDateTime = () => {
    setDateTime(`${pickerDay}/${pickerMonth}/${pickerYear}, ${pickerHour}:${pickerMin} ${pickerPeriod}`);
    setDateModalVisible(false);
  };

  const handleMapSearchChange = (text) => {
    setMapSearchText(text);
    if (!text.trim()) setFilteredPlaces(MOCK_MAP_PLACES);
    else setFilteredPlaces(MOCK_MAP_PLACES.filter(place => place.name.toLowerCase().includes(text.toLowerCase())));
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
  useEffect(() => {
    let mounted = true;
    const loadMembers = async () => {
      if (!selectedGroup || !selectedGroup.id) return;
      const currentGroupId = String(selectedGroup.id);
      const isHydratingEdit = !!route?.params?.existingScene && !isHydratedRef.current;
      if (prevGroupIdRef.current !== null && prevGroupIdRef.current !== currentGroupId && !isHydratingEdit) {
        setSelectedParticipants([]); setIndividualShares({}); setParticipantPaid({}); setModalSelectedIds([]);
      }
      prevGroupIdRef.current = currentGroupId;
      if (!token) return;
      try {
        const g = await groupsService.getGroupMembers(token, currentGroupId);
        const raw = g?.data?.members || g?.data?.participants ||
          (Array.isArray(g?.data) ? g.data : null) ||
          g?.members || g?.participants || g?.rows ||
          (Array.isArray(g) ? g : []);
        const members = raw.map(p => ({
          id: String(p.person_id || p.person?.id || p.id),
          name: p.person?.fullname || p.person?.username || p.name || 'Unknown',
          avatar: getInitials(p.person?.fullname || p.name || 'U'),
          imageUrl: p.person?.profile_picture_url || p.person?.avatar_url || null,
          color: p.color || '#06b6d4',
          isYou: String(p.person_id || p.person?.id || p.id) === String(user?.person_id || user?.id)
        }));
        if (mounted) setGroupMembers(members);
      } catch (err) {
        console.warn('Group members load failed', err.message);
        const fallback = (Array.isArray(selectedGroup.members) ? selectedGroup.members : []).map(m => ({
          id: String(m.id || m.person_id),
          name: m.name || m.person?.fullname || 'Unknown',
          avatar: getInitials(m.name || 'U'),
          color: m.color || '#8b5cf6',
          isYou: String(m.id || m.person_id) === String(user?.person_id || user?.id)
        }));
        if (mounted) setGroupMembers(fallback);
      }
    };
    loadMembers(); return () => { mounted = false; };
  }, [selectedGroup, token, user]);

  useEffect(() => {
    let mounted = true;
    const loadGroups = async () => {
      if (!token) return;
      setGroupsLoading(true);
      try {
        const grouped = await groupsService.fetchGroups(token, user?.person_id || user?.id);
        if (mounted) {
          const adminGroups = grouped?.your || [];
          setGroupsList(adminGroups);
          if (adminGroups.length > 0) {
            if (route?.params?.existingScene) {
              const s = route.params.existingScene;
              const sceneGroupId = String(s.group_id || s.group?.id || s.group?.group_id || '');
              const matchingGroup = adminGroups.find(g => String(g.id) === sceneGroupId);
              if (matchingGroup && mounted) setSelectedGroup(matchingGroup);
            } else if (!selectedGroup) {
              setSelectedGroup(adminGroups[0]);
            }
          }
        }
      } catch (err) { console.warn('Groups failed', err.message); } finally { if (mounted) setGroupsLoading(false); }
    };
    loadGroups(); return () => { mounted = false; };
  }, [token, user]);

  useEffect(() => { setIsGroupAdmin(detectAdmin(selectedGroup)); }, [selectedGroup, user]);

  useEffect(() => {
    if (route?.params?.existingScene && !isHydratedRef.current) {
      const s = route.params.existingScene;
      setSceneTitle(s.scene_name || s.title || ''); setLocation(s.location || ''); setTotalBill(String(s.total_amount || 0)); setDescription(s.description || '');
      if (s.scene_timestamptz) {
        const d = new Date(s.scene_timestamptz);
        if (!isNaN(d.getTime())) {
          const day = d.getDate().toString().padStart(2, '0'), month = (d.getMonth() + 1).toString().padStart(2, '0'), year = d.getFullYear().toString();
          const h24 = d.getHours(), period = h24 >= 12 ? 'PM' : 'AM', h12 = h24 > 12 ? (h24 - 12) : h24 === 0 ? 12 : h24, min = d.getMinutes().toString().padStart(2, '0');
          setDateTime(`${day}/${month}/${year}, ${h12.toString().padStart(2, '0')}:${min} ${period}`);
          setPickerDay(day); setPickerMonth(month); setPickerYear(year); setPickerHour(h12.toString().padStart(2, '0')); setPickerMin(min); setPickerPeriod(period);
        }
      }
      // Restore the previously uploaded receipt image so it shows in the thumbnail
      // (selectedGroup is set by loadGroups — it finds the full group object from adminGroups)
      const existingImageUrl = s.image_url || s.receipt_url || s.attachment_url || null;
      if (existingImageUrl) setAttachmentImage({ uri: existingImageUrl });
      const rawParts = (Array.isArray(s.participants) ? s.participants : null) ||
        (Array.isArray(s.scene_participants) ? s.scene_participants : null) ||
        s.raw?.participants || s.raw?.scene_participants || [];
      if (rawParts.length > 0) {
        let anyInd = false;
        const mapped = rawParts.map(p => {
          const cat = p.participant_category || 'SHARING'; if (cat === 'INDIVIDUAL') anyInd = true;
          const pid = String(p.person_id || p.id);
          return { id: pid, name: p.person?.fullname || p.name || 'Unknown', avatar: getInitials(p.person?.fullname || p.name || 'U'), imageUrl: p.person?.profile_picture_url || p.person?.avatar_url || null, color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][Number(pid) % 5], category: cat, additional_amount: cat === 'SHARING' ? Number(p.additional_amount || 0) : 0, isYou: pid === String(user?.person_id || user?.id) };
        });
        setSelectedParticipants(mapped); setModalSelectedIds(rawParts.map(p => String(p.person_id || p.id)));
        if (anyInd) setActiveSplitTab('individual');
        const paid = {}, shares = {};
        rawParts.forEach(p => { const pid = String(p.person_id || p.id); paid[pid] = String(p.paid_amount || 0); if (p.participant_category === 'INDIVIDUAL') shares[pid] = String(p.share_amount || (Number(p.additional_amount || 0) + Number(s.per_person_share || 0))); });
        setParticipantPaid(paid); setIndividualShares(shares);
      }
      isHydratedRef.current = true;
    }
  }, [route?.params?.existingScene, user]);

  const totalBillNum = parseFloat(totalBill) || 0;
  const getParticipantMode = (p) => p.category || (activeSplitTab === 'individual' ? 'INDIVIDUAL' : 'SHARING');
  const indSum = selectedParticipants.filter(p => getParticipantMode(p) === 'INDIVIDUAL').reduce((sum, p) => sum + (parseFloat(individualShares[p.id]) || 0), 0);
  const shSum = selectedParticipants.filter(p => getParticipantMode(p) === 'SHARING').reduce((sum, p) => sum + (parseFloat(p.additional_amount) || 0), 0);
  const shareable = totalBillNum - indSum - shSum;
  const perShare = selectedParticipants.length > 0 ? Math.round((shareable / selectedParticipants.length) * 100) / 100 : 0;
  const remaining = totalBillNum - indSum - shSum;
  const canSubmit = !!selectedGroup && isGroupAdmin && (Math.max(getGroupMemberCount(selectedGroup), selectedParticipants.length)) >= 2 && !(selectedParticipants.every(p => getParticipantMode(p) === 'INDIVIDUAL') && Math.abs(remaining) > 0.01) && !isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!token) return Alert.alert('Error', 'Please login again.');
    if (!selectedGroup) return Alert.alert('Error', 'Please select a group.');
    if (!location.trim()) return Alert.alert('Error', 'Please enter location.');
    if (totalBillNum <= 0) return Alert.alert('Error', 'Enter a valid amount.');
    if (selectedParticipants.length === 0) return Alert.alert('Error', 'Select participants.');
    const payer = selectedParticipants.find(p => p.isYou) || selectedParticipants[0];
    const sumPaid = Object.values(participantPaid).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const resolvedPaid = {};
    if (Math.abs(sumPaid) < 0.001) selectedParticipants.forEach(p => resolvedPaid[p.id] = p.id === payer?.id ? Number(totalBillNum.toFixed(2)) : 0);
    else selectedParticipants.forEach(p => resolvedPaid[p.id] = Number(parseFloat(participantPaid[p.id] || 0).toFixed(2)));
    const payloadParts = selectedParticipants.map(p => {
      const mode = getParticipantMode(p); let add = 0;
      if (mode === 'INDIVIDUAL') add = Number((parseFloat(individualShares[p.id] || 0) - perShare).toFixed(2));
      else add = Number((parseFloat(p.additional_amount) || 0).toFixed(2));
      return { person_id: Number(p.id), paid_amount: resolvedPaid[p.id], additional_amount: add, participant_category: mode };
    });
    const paidTotal = payloadParts.reduce((s, p) => s + p.paid_amount, 0);
    if (Math.abs(paidTotal - totalBillNum) > 0.01) return Alert.alert('Paid Amount Mismatch', 'Total paid must equal bill.');
    
    setIsSubmitting(true);
    try {
      let img; 
      if (attachmentImage?.uri && !attachmentImage.uri.startsWith('http')) {
        img = extractFileUrl(await filesService.uploadFile(token, attachmentImage, 'scene-images')); 
      } else if (attachmentImage?.uri) {
        img = attachmentImage.uri;
      }
      const payload = { group_id: selectedGroup.id, location: location.trim(), description: description.trim(), scene_timestamptz: parseDateTimeToISO(dateTime), total_amount: Number(totalBillNum.toFixed(2)), participants: payloadParts, ...(img ? { image_url: img } : {}) };
      if (route?.params?.existingScene) await scenesService.updateScene(token, route.params.existingScene.scene_id || route.params.sceneId, payload);
      else await scenesService.createScene(token, payload);
      Alert.alert('Success', 'Scene saved!', [{ text: 'OK', onPress: () => navigation.navigate('ScenesList', { shouldRefresh: true }) }]);
    } catch (e) { 
      Alert.alert('Error', e.message || 'Failed to save.'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <CreateSceneHeader navigation={navigation} title={route?.params?.existingScene ? "Edit Scene" : "New Scene Outing"} canCreateScene={canSubmit} onSubmit={handleSubmit} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" bounces={false}>
            
            <View style={styles.amountHeaderContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', position: 'relative' }}>
                <Text style={styles.amountHeaderLabel}>{isCalculatorActive ? 'Calculator Mode' : 'Total Outing Bill'}</Text>
                <TouchableOpacity onPress={toggleCalculator} style={{ position: 'absolute', right: 16 }} activeOpacity={0.7}>
                  <Ionicons name={isCalculatorActive ? "calculator" : "calculator-outline"} size={22} color={isCalculatorActive ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.amountInputRow}>
                <Text style={styles.amountCurrencySymbol}>Rs</Text>
                {isCalculatorActive ? (
                  <TextInput style={styles.amountTextInput} placeholder="e.g. 100+50" placeholderTextColor={colors.inputBorder} value={calcExpression} onChangeText={handleCalcChange} autoFocus />
                ) : (
                  <TextInput style={styles.amountTextInput} placeholder="0.00" placeholderTextColor={colors.inputBorder} keyboardType="numeric" value={totalBill} onChangeText={setTotalBill} returnKeyType="done" />
                )}
              </View>
              {isCalculatorActive && <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 4 }}>Result: Rs {totalBill}</Text>}
            </View>

            <TouchableOpacity style={styles.groupTile} onPress={() => setGroupModalVisible(true)} activeOpacity={0.7}>
              <View style={[styles.groupIndicator, { backgroundColor: selectedGroup?.color || colors.inputBorder }]} />
              <View style={{ flex: 1 }}><Text style={styles.groupTileLabel}>Selected Outing Group</Text><Text style={styles.groupTileValue}>{selectedGroup?.name || 'Select a group'}</Text></View>
              <Text style={styles.changeGroupText}>{selectedGroup ? 'Change' : 'Select'}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {selectedGroup && !isGroupAdmin && (
              <View style={styles.adminNoticeRow}><Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} /><Text style={styles.adminNoticeText}>Only group admins can create scenes for this group.</Text></View>
            )}

            <View style={styles.formCard}>
              <View style={styles.formRow}><Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} /><Text style={styles.rowLabel}>Scene Name</Text><TextInput style={styles.rowInput} placeholder="e.g. Cafe Outing" placeholderTextColor={colors.textMuted} value={sceneTitle} onChangeText={setSceneTitle} /></View>
              <View style={styles.formRow}><Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} /><Text style={styles.rowLabel}>Location</Text><TextInput style={[styles.rowInput, { marginRight: 6 }]} placeholder="e.g. Tummy Cafe" placeholderTextColor={colors.textMuted} value={location} onChangeText={setLocation} /><TouchableOpacity onPress={() => { setMapModalVisible(true); triggerPinBounce(); }} style={styles.inlineActionBtn} activeOpacity={0.7}><Ionicons name="navigate-outline" size={18} color={colors.primary} /></TouchableOpacity></View>
              <TouchableOpacity style={styles.formRow} onPress={() => setDateModalVisible(true)} activeOpacity={0.7}><Ionicons name="time-outline" size={20} color={colors.textSecondary} style={styles.rowIcon} /><Text style={styles.rowLabel}>Date & Time</Text><Text style={styles.rowTextVal}>{dateTime}</Text><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <View style={[styles.formRow, { borderBottomWidth: 0, alignItems: 'flex-start' }]}><Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={[styles.rowIcon, { marginTop: 10 }]} /><View style={{ flex: 1 }}><Text style={styles.notesLabel}>Notes & Description</Text><TextInput style={styles.notesTextInput} placeholder="Enter outing notes (optional)..." placeholderTextColor={colors.textMuted} value={description} onChangeText={setDescription} multiline numberOfLines={2} /></View></View>
              <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Receipt Screenshot</Text>
                {!attachmentImage ? (
                  <TouchableOpacity style={styles.receiptAddBtn} onPress={handlePickImage} activeOpacity={0.7}><Ionicons name="camera-outline" size={18} color={colors.primary} /><Text style={styles.receiptAddText}>Add Photo</Text></TouchableOpacity>
                ) : (
                  <View style={styles.receiptThumbnailContainer}><Image source={{ uri: attachmentImage.uri || attachmentImage }} style={styles.receiptThumbnail} /><TouchableOpacity style={styles.receiptRemoveBadge} onPress={() => setAttachmentImage(null)} activeOpacity={0.7}><Ionicons name="close" size={10} color="#ffffff" /></TouchableOpacity></View>
                )}
              </View>
            </View>

            <View style={styles.splitSection}>
              <Text style={styles.splitSectionTitle}>Participant Split</Text><Text style={styles.splitSectionSubtitle}>Select participants and assign expenses</Text>
              <PillSelector mode="segmented" selectedKey={activeSplitTab} onSelect={(key) => { setActiveSplitTab(key); const updated = selectedParticipants.map(p => ({ ...p, category: key === 'individual' ? 'INDIVIDUAL' : 'SHARING' })); setSelectedParticipants(updated); }} containerStyle={styles.pillTabsContainer} items={[{ key: 'sharing', label: `Split Equally (${selectedParticipants.length})` }, { key: 'individual', label: `Individual Split (${selectedParticipants.length})` }]} />
              <TouchableOpacity style={styles.memberSelectorRow} onPress={() => setMemberModalVisible(true)} activeOpacity={0.7}><Ionicons name="person-add-outline" size={18} color={colors.primary} /><Text style={styles.memberSelectorText}>Select Outing Members...</Text><Ionicons name="chevron-down" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} /></TouchableOpacity>
              {selectedParticipants.length === 0 ? <View style={styles.emptyPrompt}><Text style={styles.emptyPromptText}>No members selected yet.</Text></View> : (
                <View style={styles.membersSplitCard}>
                  {selectedParticipants.map(member => {
                    const mode = getParticipantMode(member);
                    const displayShare = mode === 'INDIVIDUAL' ? (parseFloat(individualShares[member.id]) || 0) : perShare + (parseFloat(member.additional_amount) || 0);
                    return (
                      <View key={member.id} style={styles.memberListRow}>
                        <View style={styles.memberTopRow}>
                          <View style={styles.memberAvatarWrapper}>
                            <View style={[styles.memberAvatarCircle, { backgroundColor: member.color }]}>
                              {member.imageUrl ? <Image source={{ uri: member.imageUrl }} style={styles.memberAvatarImage} /> : <Text style={styles.avatarTextLetter}>{getInitials(member.name)}</Text>}
                            </View>
                            <View style={styles.memberNameCol}>
                              <Text style={styles.memberNameText} numberOfLines={1}>{member.name}{member.isYou ? ' (You)' : ''}</Text>
                              <View style={styles.memberShareBadge}><Text style={styles.memberShareLabel}>{mode === 'INDIVIDUAL' ? 'Personal' : 'Share'}: Rs {displayShare.toLocaleString()}</Text></View>
                            </View>
                          </View>
                          <TouchableOpacity onPress={() => { const nextMode = mode === 'SHARING' ? 'INDIVIDUAL' : 'SHARING'; setSelectedParticipants(selectedParticipants.map(p => p.id === member.id ? { ...p, category: nextMode } : p)); }} style={{ padding: 4, backgroundColor: colors.surfaceAlt, borderRadius: 6 }}><Text style={{ fontSize: 9, fontWeight: '700', color: colors.textSecondary }}>{mode}</Text></TouchableOpacity>
                        </View>
                        <View style={styles.memberInputsRow}>
                          <View style={styles.memberInputField}><Text style={styles.memberInputLabel}>Paid Amount</Text><View style={styles.memberInputBox}><Text style={styles.memberInputCurrency}>Rs</Text><TextInput style={styles.memberInputText} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} value={participantPaid[member.id]?.toString() || ''} onChangeText={(val) => handlePaidChange(member.id, val)} /></View></View>
                          <View style={styles.memberInputField}><Text style={styles.memberInputLabel}>{mode === 'INDIVIDUAL' ? 'Personal Bill' : 'Extra Cost'}</Text><View style={styles.memberInputBox}><Text style={styles.memberInputCurrency}>Rs</Text>{mode === 'INDIVIDUAL' ? <TextInput style={styles.memberInputText} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} value={individualShares[member.id]?.toString() || ''} onChangeText={(val) => handleIndividualShareChange(member.id, val)} /> : <TextInput style={styles.memberInputText} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} value={member.additional_amount?.toString() || ''} onChangeText={(val) => { setSelectedParticipants(selectedParticipants.map(p => p.id === member.id ? { ...p, additional_amount: parseFloat(val) || 0 } : p)); }} />}</View></View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              {totalBillNum > 0 && <View style={[styles.statusBanner, Math.abs(remaining) < 0.01 ? styles.bannerOk : remaining > 0 ? styles.bannerUnder : styles.bannerOver]}><Ionicons name={Math.abs(remaining) < 0.01 ? "checkmark-circle" : remaining > 0 ? "alert-circle" : "close-circle"} size={18} color={Math.abs(remaining) < 0.01 ? "#10b981" : remaining > 0 ? "#f59e0b" : "#ef4444"} /><Text style={[styles.statusBannerText, Math.abs(remaining) < 0.01 ? styles.textOk : remaining > 0 ? styles.textUnder : styles.textOver]}>{Math.abs(remaining) < 0.01 ? 'Split match!' : remaining > 0 ? `Remaining: Rs ${remaining.toLocaleString()}` : `Over: Rs ${Math.abs(remaining).toLocaleString()}`}</Text></View>}
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.fixedFooter}><ActionFooter cancelLabel="Cancel" confirmLabel={route?.params?.existingScene ? "Update Outing" : "Create Outing"} onCancel={() => navigation.goBack()} onConfirm={handleSubmit} confirmDisabled={!canSubmit} /></View>

      <Modal visible={groupModalVisible} transparent animationType="slide" onRequestClose={() => setGroupModalVisible(false)}><View style={styles.modalOverlay}><View style={styles.bottomSheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Select Outing Group</Text><TouchableOpacity onPress={() => setGroupModalVisible(false)} activeOpacity={0.7}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View><ScrollView style={{ padding: 20 }}>{groupsList.map(group => (<TouchableOpacity key={group.id} style={[styles.groupOptionRow, selectedGroup?.id === group.id && styles.activeGroupOptionRow]} onPress={() => { setSelectedGroup(group); setGroupModalVisible(false); }} activeOpacity={0.7}><View style={[styles.groupColorIndicator, { backgroundColor: group.color || '#06b6d4' }]} /><Text style={[styles.groupOptionText, selectedGroup?.id === group.id && styles.activeGroupOptionText]}>{group.name}</Text>{selectedGroup?.id === group.id && <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />}</TouchableOpacity>))}<View style={{ height: 40 }} /></ScrollView></View></View></Modal>
      
      <Modal visible={mapModalVisible} transparent animationType="slide" onRequestClose={() => setMapModalVisible(false)}><SafeAreaView style={styles.mapSafeArea}><View style={styles.mapSheet}><View style={styles.mapSheetHeader}><TouchableOpacity onPress={() => setMapModalVisible(false)} activeOpacity={0.7} style={{ padding: 4 }}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity><Text style={styles.mapSheetTitle}>Location</Text><View style={{ width: 32 }} /></View><View style={styles.mapSearchContainer}><View style={styles.mapSearchInputRow}><Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} /><TextInput style={styles.mapSearchInput} placeholder="Search address..." placeholderTextColor={colors.textMuted} value={mapSearchText} onChangeText={handleMapSearchChange} />{mapSearchText.length > 0 && <TouchableOpacity onPress={() => handleMapSearchChange('')} activeOpacity={0.7}><Ionicons name="close-circle" size={16} color={colors.textSecondary} /></TouchableOpacity>}</View>{mapSearchText.length > 0 && (<View style={styles.autocompleteList}>{filteredPlaces.slice(0, 3).map((place, idx) => (<TouchableOpacity key={idx} style={styles.autocompleteItem} onPress={() => selectPlaceOnMap(place)} activeOpacity={0.7}><Ionicons name="location-outline" size={16} color={colors.primary} style={{ marginRight: 8 }} /><View style={{ flex: 1 }}><Text style={styles.autocompleteName}>{place.name}</Text><Text style={styles.autocompleteAddress} numberOfLines={1}>{place.address}</Text></View></TouchableOpacity>))}</View>)}</View><View style={styles.mapVisualContainer}><View style={styles.roadHorizontal1} /><View style={styles.roadHorizontal2} /><View style={styles.roadVertical1} /><View style={styles.roadVertical2} /><View style={styles.parkBlock}><Ionicons name="leaf-outline" size={16} color="#166534" /><Text style={styles.parkText}>Margalla Park</Text></View><Animated.View style={[styles.mapPinContainer, { transform: [{ translateY: pinAnim }] }]}><Ionicons name="location" size={42} color="#ef4444" /><View style={styles.mapPinDot} /></Animated.View><TouchableOpacity style={styles.myLocationFab} onPress={fetchLiveLocation} activeOpacity={0.7}>{fetchingLocation ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="locate" size={24} color={colors.primary} />}</TouchableOpacity></View><View style={styles.mapFooterCard}><View style={styles.mapFooterInfo}><Ionicons name="location" size={24} color={colors.primary} style={{ marginRight: 12 }} /><View style={{ flex: 1 }}><Text style={styles.mapFooterName}>{selectedMapPlace.name}</Text><Text style={styles.mapFooterAddress}>{selectedMapPlace.address}</Text></View></View><TouchableOpacity style={styles.mapConfirmButton} onPress={handleConfirmMapLocation} activeOpacity={0.7}><Text style={styles.mapConfirmText}>Confirm Location</Text></TouchableOpacity></View></View></SafeAreaView></Modal>

      <Modal visible={dateModalVisible} transparent animationType="slide" onRequestClose={() => setDateModalVisible(false)}><View style={styles.modalOverlay}><View style={styles.bottomSheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Date & Time</Text><TouchableOpacity onPress={() => setDateModalVisible(false)} activeOpacity={0.7}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View><View style={styles.pickerSection}><View style={styles.pickerRow}><TextInput style={styles.pickerInput} value={pickerDay} onChangeText={setPickerDay} keyboardType="numeric" maxLength={2} /><Text style={styles.pickerSeparator}>/</Text><TextInput style={styles.pickerInput} value={pickerMonth} onChangeText={setPickerMonth} keyboardType="numeric" maxLength={2} /><Text style={styles.pickerSeparator}>/</Text><TextInput style={[styles.pickerInput, { width: 70 }]} value={pickerYear} onChangeText={setPickerYear} keyboardType="numeric" maxLength={4} /></View><View style={styles.pickerRow}><TextInput style={styles.pickerInput} value={pickerHour} onChangeText={setPickerHour} keyboardType="numeric" maxLength={2} /><Text style={styles.pickerSeparator}>:</Text><TextInput style={styles.pickerInput} value={pickerMin} onChangeText={setPickerMin} keyboardType="numeric" maxLength={2} /><View style={styles.periodToggle}><TouchableOpacity style={[styles.periodBtn, pickerPeriod === 'AM' && styles.periodBtnActive]} onPress={() => setPickerPeriod('AM')} activeOpacity={0.7}><Text style={[styles.periodText, pickerPeriod === 'AM' && styles.periodTextActive]}>AM</Text></TouchableOpacity><TouchableOpacity style={[styles.periodBtn, pickerPeriod === 'PM' && styles.periodBtnActive]} onPress={() => setPickerPeriod('PM')} activeOpacity={0.7}><Text style={[styles.periodText, pickerPeriod === 'PM' && styles.periodTextActive]}>PM</Text></TouchableOpacity></View></View><ActionFooter cancelLabel="Cancel" confirmLabel="Apply" onCancel={() => setDateModalVisible(false)} onConfirm={handleSetDateTime} /></View><View style={{ height: 40 }} /></View></View></Modal>

      <Modal visible={memberModalVisible} transparent animationType="slide" onRequestClose={() => setMemberModalVisible(false)}><View style={styles.modalOverlay}><View style={styles.bottomSheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Select Outing Members</Text><TouchableOpacity onPress={() => setMemberModalVisible(false)} activeOpacity={0.7}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View><ScrollView style={{ padding: 20 }}>{groupMembers.map(member => { const id = String(member.id); const isSelected = modalSelectedIds.includes(id); return (<TouchableOpacity key={id} style={styles.memberCheckRow} onPress={() => { setModalSelectedIds(prev => isSelected ? prev.filter(x => x !== id) : [...prev, id]); }} activeOpacity={0.7}><View style={[styles.memberAvatarCircle, { backgroundColor: member.color || '#06b6d4', width: 36, height: 36 }]}>{member.imageUrl ? <Image source={{ uri: member.imageUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} /> : <Text style={styles.avatarTextLetter}>{getInitials(member.name)}</Text>}</View><Text style={styles.memberCheckName}>{member.name}</Text><View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>{isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}</View></TouchableOpacity>); })}<TouchableOpacity style={styles.closeMembersBtn} onPress={() => { setSelectedParticipants(groupMembers.filter(m => modalSelectedIds.includes(String(m.id)))); setMemberModalVisible(false); }} activeOpacity={0.7}><Text style={styles.closeMembersBtnText}>Confirm Members</Text></TouchableOpacity><View style={{ height: 40 }} /></ScrollView></View></View></Modal>
    </SafeAreaView>
  );
};

export default CreateSceneScreen;

