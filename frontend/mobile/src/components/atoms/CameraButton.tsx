import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../../theme';

interface CameraButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function CameraButton({
  onPress,
  disabled = false,
  style,
}: CameraButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.innerCircle}>
        <View style={styles.shutter} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary[500],
  },
  buttonDisabled: {
    borderColor: colors.neutral[300],
  },
  innerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[500],
  },
});
