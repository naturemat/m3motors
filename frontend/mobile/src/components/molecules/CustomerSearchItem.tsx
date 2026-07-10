import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';
import { Customer } from '../../types';
import Button from '../atoms/Button';
import Card from './Card';

interface CustomerSearchItemProps {
  customer: Customer;
  onActivate: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
}

export default function CustomerSearchItem({
  customer,
  onActivate,
  onViewDetails,
}: CustomerSearchItemProps) {
  const isPending = customer.status === 'pending';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card style={styles.container} variant={isPending ? 'highlighted' : 'default'}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{customer.nombre}</Text>
          <View style={[styles.badge, isPending ? styles.badgePending : styles.badgeActive]}>
            <Text style={[styles.badgeText, isPending ? styles.badgeTextPending : styles.badgeTextActive]}>
              {isPending ? 'Pendiente' : 'Activado'}
            </Text>
          </View>
        </View>
        {customer.licensePlate && (
          <View style={styles.plateContainer}>
            <Text style={styles.plateText}>{customer.licensePlate}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>📞 {customer.telefono}</Text>
        <Text style={styles.detailText}>📅 Pre-registro: {formatDate(customer.fechaPreRegistro)}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Ver Detalles"
          variant="secondary"
          size="small"
          onPress={() => onViewDetails(customer)}
          style={styles.actionButton}
        />
        {isPending && (
          <Button
            title="Activar Cliente"
            variant="primary"
            size="small"
            onPress={() => onActivate(customer)}
            style={styles.actionButton}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  name: {
    ...typography.headingH3,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgePending: {
    backgroundColor: colors.warning[100],
  },
  badgeActive: {
    backgroundColor: colors.success[100],
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  badgeTextPending: {
    color: colors.warning[500],
  },
  badgeTextActive: {
    color: colors.success[500],
  },
  plateContainer: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  plateText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.neutral[800],
  },
  details: {
    marginBottom: 16,
  },
  detailText: {
    ...typography.bodySmall,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8, // Requires React Native >= 0.71 for flexbox gap
  },
  actionButton: {
    flex: 1,
  },
});
