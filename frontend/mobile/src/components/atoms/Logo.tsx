import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
}

export default function Logo({size = 'medium', variant = 'light'}: LogoProps) {
  const sizeMap = {
    small: {icon: 24, text: 14, subtext: 9},
    medium: {icon: 32, text: 20, subtext: 12},
    large: {icon: 40, text: 26, subtext: 14},
  };

  const s = sizeMap[size];
  const isLight = variant === 'light';
  const textColor = isLight ? colors.neutral[0] : colors.primary[500];
  const subtextColor = isLight ? 'rgba(255,255,255,0.7)' : colors.neutral[600];

  return (
    <View style={styles.container}>
      <View style={[styles.icon, {width: s.icon, height: s.icon, borderRadius: s.icon * 0.2}]}>
        <Text style={[styles.iconText, {fontSize: s.icon * 0.45}]}>M3</Text>
      </View>
      <Text style={[styles.text, {fontSize: s.text, color: textColor}]}>Motors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  text: {
    fontWeight: '600',
  },
});
