import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../../theme';

interface Props {
  estado: 'OPTIMO' | 'ATENCION' | 'CRITICO';
  mensaje: string;
}

export default function StatusIndicator({estado, mensaje}: Props) {
  const estadoConfig = {
    OPTIMO: {
      color: colors.success[500],
      bgColor: colors.success[100],
      label: 'Todo bien',
    },
    ATENCION: {
      color: colors.warning[500],
      bgColor: colors.warning[100],
      label: 'Atencion',
    },
    CRITICO: {
      color: colors.error[500],
      bgColor: colors.error[100],
      label: 'Critico',
    },
  };

  const config = estadoConfig[estado];

  return (
    <View style={[styles.container, {backgroundColor: config.bgColor}]}>
      <View style={[styles.dot, {backgroundColor: config.color}]} />
      <View style={styles.textContainer}>
        <Text style={[styles.label, {color: config.color}]}>{config.label}</Text>
        <Text style={styles.mensaje}>{mensaje}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.base,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  mensaje: {
    ...typography.body,
    color: colors.neutral[900],
    marginTop: 2,
  },
});
