import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PillSelector = ({
  items = [],
  selectedKey,
  onSelect,
  mode = 'chips',
  containerStyle,
  itemStyle,
  activeItemStyle,
  textStyle,
  activeTextStyle,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const content = items.map((item) => {
    const isSelected = selectedKey === item.key;

    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.pill,
          mode === 'segmented' && styles.segmentedPill,
          isSelected && styles.pillActive,
          isSelected && mode === 'segmented' && styles.segmentedPillActive,
          itemStyle,
          isSelected && activeItemStyle,
        ]}
        onPress={() => onSelect(item.key)}
        activeOpacity={0.75}
      >
        {item.icon ? (
          <Ionicons
            name={item.icon}
            size={item.iconSize || 15}
            color={isSelected ? (item.activeColor || '#ffffff') : (item.inactiveColor || colors.textSecondary)}
            style={styles.icon}
          />
        ) : null}

        <Text
          style={[
            styles.text,
            mode === 'segmented' && styles.segmentedText,
            isSelected && styles.textActive,
            isSelected && mode === 'segmented' && styles.segmentedTextActive,
            textStyle,
            isSelected && activeTextStyle,
          ]}
        >
          {item.label}
        </Text>

        {typeof item.count === 'number' ? (
          <View style={[styles.countBubble, isSelected && styles.countBubbleActive]}>
            <Text style={[styles.countText, isSelected && styles.countTextActive]}>{item.count}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  });

  if (mode === 'segmented') {
    return <View style={[styles.segmentedContainer, containerStyle]}>{content}</View>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsContainer, containerStyle]}>
      {content}
    </ScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorderMedium,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 42,
  },
  segmentedPill: {
    flex: 1,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedPillActive: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedText: {
    textAlign: 'center',
    fontSize: 12.5,
  },
  textActive: {
    color: '#ffffff',
  },
  segmentedTextActive: {
    color: '#ffffff',
  },
  countBubble: {
    marginLeft: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBubbleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  countTextActive: {
    color: '#ffffff',
  },
});

export default PillSelector;
