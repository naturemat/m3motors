import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {colors} from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const variantStyles = {
    primary: {bg: colors.primary[500], text: colors.neutral[0]},
    secondary: {
      bg: colors.neutral[0],
      text: colors.primary[500],
      border: colors.primary[500],
    },
    danger: {bg: colors.error[500], text: colors.neutral[0]},
    ghost: {bg: 'transparent', text: colors.primary[500]},
    success: {bg: colors.success[500], text: colors.neutral[0]},
  };

  const sizeStyles = {
    small: {paddingVertical: 6, paddingHorizontal: 12, fontSize: 12},
    medium: {paddingVertical: 10, paddingHorizontal: 20, fontSize: 14},
    large: {paddingVertical: 14, paddingHorizontal: 28, fontSize: 16},
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? colors.neutral[300] : v.bg,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderWidth: 'border' in v ? 2 : 0,
          borderColor: 'border' in v ? v.border : 'transparent',
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {color: isDisabled ? colors.neutral[400] : v.text, fontSize: s.fontSize},
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 40,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
