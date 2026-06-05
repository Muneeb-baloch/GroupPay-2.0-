import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import getCreateSceneStyles from '../../styles/scenes/createSceneStyles';
import { useTheme } from '../../context/ThemeContext';

const CreateSceneHeader = ({ navigation, title = 'New Scene Outing', canCreateScene, onSubmit }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getCreateSceneStyles(colors), [colors]);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onSubmit}
        activeOpacity={0.7}
        disabled={!canCreateScene}
        style={[styles.headerActionBtn, !canCreateScene && styles.headerActionBtnDisabled]}
      >
        <Ionicons name="cloud-done-outline" size={18} color={canCreateScene ? '#ffffff' : colors.textMuted} />
        <Text style={[styles.headerActionText, !canCreateScene && styles.headerActionTextDisabled]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateSceneHeader;
