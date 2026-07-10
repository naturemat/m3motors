import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../molecules';
import {Badge, Button} from '../atoms';
import {colors} from '../../theme';

interface ActivationSummaryProps {
  customerName: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  onGoToDashboard: () => void;
}

export default function ActivationSummary({
  customerName,
  brand,
  model,
  year,
  plate,
  onGoToDashboard,
}: ActivationSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.checkMark}>{'\u2713'}</Text>
      </View>

      <Text style={styles.title}>Activacion Completada</Text>
      <Text style={styles.subtitle}>El cliente ha sido activado correctamente</Text>

      <Card style={styles.summaryCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.value}>{customerName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Vehiculo</Text>
          <Text style={styles.value}>
            {brand} {model} {year}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Placa</Text>
          <Badge label={plate} type="primary" />
        </View>
      </Card>

      <Button
        title="Ir al Dashboard"
        variant="primary"
        size="large"
        fullWidth
        onPress={onGoToDashboard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 32,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
});
