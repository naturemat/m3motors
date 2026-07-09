import React from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {colors, borderRadius} from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'highlighted';
}

export default function Card({
  children,
  style,
  variant = 'default',
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'highlighted' && styles.highlighted,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  highlighted: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
});
