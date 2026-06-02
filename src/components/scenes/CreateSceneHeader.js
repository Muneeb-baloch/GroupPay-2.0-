import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import createSceneStyles from '../../styles/scenes/createSceneStyles';

const CreateSceneHeader = ({ navigation, title = 'New Scene Outing', canCreateScene, onSubmit }) => {
  const styles = createSceneStyles;
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color="#0f172a" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onSubmit}
        activeOpacity={0.7}
        disabled={!canCreateScene}
        style={[styles.headerActionBtn, !canCreateScene && styles.headerActionBtnDisabled]}
      >
        <Ionicons name="cloud-done-outline" size={18} color={canCreateScene ? '#ffffff' : '#94a3b8'} />
        <Text style={[styles.headerActionText, !canCreateScene && styles.headerActionTextDisabled]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateSceneHeader;
