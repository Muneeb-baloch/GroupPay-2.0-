import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ActionFooter = ({
  cancelLabel = 'Cancel',
  confirmLabel = 'Save',
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmStyle,
  confirmTextStyle,
}) => {
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

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmButton: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ActionFooter;