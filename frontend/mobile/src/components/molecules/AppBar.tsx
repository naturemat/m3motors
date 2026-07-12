import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../theme';
import Logo from '../atoms/Logo';

interface AppBarProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  onBack?: () => void;
  onNotifications?: () => void;
}

export default function AppBar({
  title,
  showBack = false,
  showNotifications = false,
  notificationCount = 0,
  onBack,
  onNotifications,
}: AppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backArrow}>{'‹'}</Text>
            </TouchableOpacity>
          )}
          {!showBack && <Logo size="small" variant="light" />}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>
          {showNotifications && (
            <TouchableOpacity
              onPress={onNotifications}
              style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[500],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  left: {
    width: 80,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 28,
    color: colors.neutral[0],
    fontWeight: '300',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[0],
    textAlign: 'center',
  },
  right: {
    width: 80,
    alignItems: 'flex-end',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.neutral[0],
    fontSize: 10,
    fontWeight: '600',
  },
});
