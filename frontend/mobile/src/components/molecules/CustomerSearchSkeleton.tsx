import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, borderRadius} from '../../theme';
import Card from './Card';

interface CustomerSearchSkeletonProps {
  count?: number;
}

function SkeletonBlock({
  width,
  height,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  style?: object;
}) {
  return (
    <View
      style={[styles.block, {width, height}, style]}
      accessibilityLabel="Cargando"
    />
  );
}

function SkeletonItem() {
  return (
    <Card style={styles.item}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonBlock width="60%" height={20} />
          <SkeletonBlock width="30%" height={16} style={styles.badge} />
        </View>
        <SkeletonBlock width={72} height={24} />
      </View>
      <SkeletonBlock width="50%" height={14} style={styles.line} />
      <SkeletonBlock width="40%" height={14} style={styles.line} />
      <View style={styles.actions}>
        <SkeletonBlock width="48%" height={36} />
        <SkeletonBlock width="48%" height={36} />
      </View>
    </Card>
  );
}

export default function CustomerSearchSkeleton({
  count = 4,
}: CustomerSearchSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({length: count}, (_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  badge: {
    marginTop: 4,
  },
  line: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  block: {
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
  },
});
