import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Card} from '../molecules';
import {Badge} from '../atoms';
import {colors, typography, spacing, borderRadius} from '../../theme';
import {IntervencionData} from '../../services/vehicle';

interface Props {
  intervenciones: IntervencionData[];
}

export default function InterventionsList({intervenciones}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...intervenciones].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔧</Text>
        <Text style={styles.emptyText}>No hay intervenciones registradas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Historial de Intervenciones</Text>
      {sorted.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() =>
            setExpandedId(expandedId === item.id ? null : item.id)
          }>
          <Card style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.date}>
                  {new Date(item.fecha).toLocaleDateString('es-EC')}
                </Text>
                <Text style={styles.diagnostico}>{item.diagnostico}</Text>
              </View>
              <Text style={styles.chevron}>
                {expandedId === item.id ? '−' : '+'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>Mecanico: {item.mecanicoId}</Text>
            </View>

            {item.componentes.length > 0 && (
              <View style={styles.componentList}>
                {item.componentes.map((comp, idx) => (
                  <Badge
                    key={idx}
                    label={comp.nombre}
                    type="outlined"
                    size="small"
                  />
                ))}
              </View>
            )}

            {item.manoDeObra > 0 && (
              <Text style={styles.cost}>${item.manoDeObra.toFixed(2)}</Text>
            )}

            {expandedId === item.id && (
              <View style={styles.expanded}>
                <View style={styles.divider} />
                <Text style={styles.expandedLabel}>Observaciones:</Text>
                <Text style={styles.expandedText}>
                  {item.observaciones || 'Sin observaciones'}
                </Text>
                <View style={styles.severityRow}>
                  <Text style={styles.expandedLabel}>Severidad:</Text>
                  <Badge
                    label={item.nivelSeveridad}
                    type={
                      item.nivelSeveridad === 'ALTA'
                        ? 'error'
                        : item.nivelSeveridad === 'MEDIA'
                        ? 'warning'
                        : 'success'
                    }
                    size="small"
                  />
                </View>
                <Text style={styles.expandedLabel}>Estado:</Text>
                <Badge
                  label={item.estado}
                  type={item.estado === 'FINALIZADO' ? 'success' : 'info'}
                  size="small"
                />
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
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
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: spacing[1],
  },
  date: {
    ...typography.caption,
  },
  diagnostico: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  chevron: {
    fontSize: 20,
    color: colors.neutral[400],
    fontWeight: '300',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[2],
  },
  meta: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  cost: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success[500],
    textAlign: 'right',
    marginTop: spacing[2],
  },
  expanded: {
    marginTop: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginBottom: spacing[3],
  },
  expandedLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  expandedText: {
    ...typography.body,
    color: colors.neutral[800],
    marginBottom: spacing[2],
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  emptyText: {
    ...typography.bodySecondary,
  },
});
