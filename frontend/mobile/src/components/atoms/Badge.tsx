import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../../theme';

type BadgeType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'outlined';

interface BadgeProps {
  label: string;
  type?: BadgeType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const typeColors: Record<BadgeType, {bg: string; text: string; border?: string}> = {
  primary: {bg: colors.primary[500], text: colors.neutral[0]},
  success: {bg: colors.success[500], text: colors.neutral[0]},
  warning: {bg: colors.warning[500], text: colors.neutral[0]},
  error: {bg: colors.error[500], text: colors.neutral[0]},
  info: {bg: colors.info[500], text: colors.neutral[0]},
  neutral: {bg: colors.neutral[100], text: colors.neutral[600]},
  outlined: {
    bg: 'transparent',
    text: colors.primary[500],
    border: colors.primary[500],
  },
};

export default function Badge({
  label,
  type = 'primary',
  size = 'medium',
  style,
}: BadgeProps) {
  const colors_ = typeColors[type];
  const sizeStyles = {
    small: {paddingVertical: 2, paddingHorizontal: 8, fontSize: 10},
    medium: {paddingVertical: 4, paddingHorizontal: 12, fontSize: 12},
    large: {paddingVertical: 6, paddingHorizontal: 16, fontSize: 14},
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors_.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderWidth: type === 'outlined' ? 1 : 0,
          borderColor: colors_.border,
        },
        style,
      ]}>
      <Text style={[styles.text, {color: colors_.text, fontSize: s.fontSize}]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
