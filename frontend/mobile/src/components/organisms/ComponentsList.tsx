import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../molecules';
import {Badge} from '../atoms';
import {colors, typography, spacing, borderRadius} from '../../theme';
import {IntervencionData} from '../../services/vehicle';

interface Props {
  intervenciones: IntervencionData[];
  kilometrajeActual: number | null;
}

export default function ComponentsList({intervenciones, kilometrajeActual}: Props) {
  const componentes = intervenciones
    .flatMap(i => i.componentes)
    .filter(comp => {
      if (!kilometrajeActual) return true;
      const recorrido = kilometrajeActual - comp.kilometrajeInstalacion;
      const porcentaje = (recorrido / comp.limiteKilometrajeFabricante) * 100;
      return porcentaje > 30;
    })
    .sort((a, b) => {
      if (!kilometrajeActual) return 0;
      const desgasteA = kilometrajeActual - a.kilometrajeInstalacion;
      const desgasteB = kilometrajeActual - b.kilometrajeInstalacion;
      return desgasteB / b.limiteKilometrajeFabricante - desgasteA / a.limiteKilometrajeFabricante;
    });

  if (componentes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Componentes Criticos</Text>
      {componentes.map(comp => {
        const recorrido = (kilometrajeActual ?? 0) - comp.kilometrajeInstalacion;
        const porcentaje = Math.min(
          100,
          (recorrido / comp.limiteKilometrajeFabricante) * 100,
        );

        return (
          <Card key={comp.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.nombre}>{comp.nombre}</Text>
              <Badge
                label={
                  comp.estado === 'OPTIMO'
                    ? 'OPTIMO'
                    : comp.estado === 'DESGASTE_MEDIO'
                    ? 'DESGASTE'
                    : 'CRITICO'
                }
                type={
                  comp.estado === 'OPTIMO'
                    ? 'success'
                    : comp.estado === 'DESGASTE_MEDIO'
                    ? 'warning'
                    : 'error'
                }
                size="small"
              />
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(porcentaje, 100)}%`,
                      backgroundColor:
                        comp.estado === 'OPTIMO'
                          ? colors.success[500]
                          : comp.estado === 'DESGASTE_MEDIO'
                          ? colors.warning[500]
                          : colors.error[500],
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{porcentaje.toFixed(0)}%</Text>
            </View>

            <View style={styles.details}>
              <Text style={styles.detail}>
                Instalado a: {comp.kilometrajeInstalacion.toLocaleString()} km
              </Text>
              <Text style={styles.detail}>
                Limite: {comp.limiteKilometrajeFabricante.toLocaleString()} km
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  sectionTitle: {
    ...typography.headingH4,
    marginBottom: spacing[3],
  },
  card: {
    marginBottom: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  nombre: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
});
