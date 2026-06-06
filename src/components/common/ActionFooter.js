import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getActionFooterStyles } from '../../styles/common/actionFooterStyles';

const ActionFooter = ({
  cancelLabel = 'Cancel',
  confirmLabel = 'Save',
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmStyle,
  confirmTextStyle,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getActionFooterStyles(colors), [colors]);

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.75}>
        <Text style={styles.cancelText}>{cancelLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          confirmDisabled && styles.confirmButtonDisabled,
          confirmStyle,
        ]}
        onPress={onConfirm}
        disabled={confirmDisabled}
        activeOpacity={0.85}
      >
        <Text style={[styles.confirmText, confirmTextStyle]}>{confirmLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionFooter;
