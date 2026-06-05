import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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
  const styles = useMemo(() => getStyles(colors), [colors]);

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

const getStyles = (colors) => StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.inputBorder,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ActionFooter;
