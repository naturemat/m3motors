import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../molecules';
import {Button} from '../atoms';
import {colors, typography, spacing, borderRadius} from '../../theme';

interface Props {
  proximoMantenimiento: string | null;
  kilometrajeActual: number | null;
  tasaDesgasteSemanal: number;
  onRegistrarServicio: () => void;
}

export default function NextMaintenance({
  proximoMantenimiento,
  kilometrajeActual,
  tasaDesgasteSemanal,
  onRegistrarServicio,
}: Props) {
  const fechaEstimada = proximoMantenimiento
    ? new Date(proximoMantenimiento)
    : null;

  const kmEstimado =
    kilometrajeActual !== null && tasaDesgasteSemanal > 0
      ? kilometrajeActual + tasaDesgasteSemanal * 12
      : null;

  const diasRestantes = fechaEstimada
    ? Math.ceil((fechaEstimada.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Proximo Mantenimiento Sugerido</Text>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Fecha Estimada</Text>
          <Text style={styles.statValue}>
            {fechaEstimada
              ? fechaEstimada.toLocaleDateString('es-EC')
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Dias Restantes</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  diasRestantes !== null && diasRestantes < 15
                    ? colors.error[500]
                    : diasRestantes !== null && diasRestantes < 30
                    ? colors.warning[500]
                    : colors.success[500],
              },
            ]}>
            {diasRestantes !== null ? `${diasRestantes} dias` : 'N/A'}
          </Text>
        </View>
      </View>

      {kmEstimado !== null && (
        <View style={styles.kmEstimado}>
          <Text style={styles.kmLabel}>Kilometraje estimado para proximo servicio:</Text>
          <Text style={styles.kmValue}>{kmEstimado.toLocaleString()} km</Text>
        </View>
      )}

      <Button
        title="Registrar Servicio"
        variant="primary"
        size="medium"
        fullWidth
        onPress={onRegistrarServicio}
      />
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  stat: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    padding: spacing[3],
    borderRadius: borderRadius.base,
  },
  statLabel: {
    ...typography.caption,
    marginBottom: spacing[1],
  },
  statValue: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  kmEstimado: {
    backgroundColor: colors.info[100],
    padding: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[3],
  },
  kmLabel: {
    ...typography.bodySmall,
    color: colors.neutral[800],
  },
  kmValue: {
    ...typography.headingH4,
    color: colors.info[500],
    marginTop: spacing[1],
  },
});
