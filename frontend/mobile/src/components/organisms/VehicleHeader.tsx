import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../molecules';
import {Badge} from '../atoms';
import {colors, typography, spacing, borderRadius} from '../../theme';
import {VehiculoHistorialData} from '../../services/vehicle';

interface Props {
  vehicle: VehiculoHistorialData;
}

export default function VehicleHeader({vehicle}: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.model}>
            {vehicle.marca} {vehicle.modelo}
          </Text>
          <Text style={styles.plate}>{vehicle.placa}</Text>
        </View>
        <Badge
          label={vehicle.estadoGeneral}
          type={
            vehicle.estadoGeneral === 'OPTIMO'
              ? 'success'
              : vehicle.estadoGeneral === 'ATENCION'
              ? 'warning'
              : 'error'
          }
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Anio</Text>
          <Text style={styles.statValue}>{vehicle.anio}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Motor</Text>
          <Text style={styles.statValue}>{vehicle.tipoMotor}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>KM Actual</Text>
          <Text style={styles.statValue}>
            {vehicle.kilometrajeActual?.toLocaleString() ?? 'N/A'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Desgaste</Text>
          <Text style={styles.statValue}>
            {vehicle.tasaDesgasteSemanal} km/sem
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  model: {
    ...typography.headingH3,
  },
  plate: {
    ...typography.bodySecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  stat: {
    width: '48%',
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
});
