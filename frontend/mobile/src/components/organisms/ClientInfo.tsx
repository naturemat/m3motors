import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../molecules';
import {colors, typography, spacing} from '../../theme';
import {ClienteData} from '../../services/vehicle';

interface Props {
  cliente: ClienteData;
}

export default function ClientInfo({cliente}: Props) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Datos del Cliente</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{cliente.nombre}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Telefono</Text>
        <Text style={styles.value}>{cliente.telefono}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{cliente.email}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
  },
  title: {
    ...typography.headingH4,
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  label: {
    ...typography.bodySecondary,
  },
  value: {
    ...typography.body,
    fontWeight: '500',
    color: colors.neutral[900],
  },
});
