import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getPillSelectorStyles } from '../../styles/common/pillSelectorStyles';

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
  const styles = useMemo(() => getPillSelectorStyles(colors), [colors]);

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

export default PillSelector;
