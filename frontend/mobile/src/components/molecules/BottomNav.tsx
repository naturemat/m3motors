import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../theme';

interface BottomNavItem {
  key: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  onPress: (key: string) => void;
}

const iconMap: Record<string, string> = {
  home: '🏠',
  search: '🔍',
  'file-text': '📄',
  qrcode: '📱',
  user: '👤',
  dashboard: '🏠',
  history: '📄',
  profile: '👤',
};

export default function BottomNav({items, active, onPress}: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      {items.map(item => {
        const isActive = item.key === active;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onPress(item.key)}
            style={styles.item}
            activeOpacity={0.7}>
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {iconMap[item.icon] || item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.neutral[400],
    letterSpacing: 0.5,
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});
