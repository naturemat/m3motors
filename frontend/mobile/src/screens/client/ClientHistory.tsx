import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, BottomNav, Card} from '../../components/molecules';
import {Badge} from '../../components/atoms';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientHistory'>;

const mockHistory = [
  {
    id: '1',
    fecha: '2026-06-15',
    servicio: 'Cambio de aceite',
    mecanico: 'Juan Perez',
    kilometraje: 45000,
    componentes: ['Filtro de aceite', 'Aceite 5W-30'],
    costo: 85.0,
  },
  {
    id: '2',
    fecha: '2026-05-20',
    servicio: 'Revision de frenos',
    mecanico: 'Carlos Lopez',
    kilometraje: 42000,
    componentes: ['Pastillas de freno delanteras'],
    costo: 120.0,
  },
  {
    id: '3',
    fecha: '2026-04-10',
    servicio: 'Cambio de llantas',
    mecanico: 'Juan Perez',
    kilometraje: 38000,
    componentes: ['Llantas 205/55R16'],
    costo: 350.0,
  },
];

export default function ClientHistory() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Historial" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockHistory.length > 0 ? (
          mockHistory.map(item => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.date}>{item.fecha}</Text>
                <Badge label={item.servicio} type="info" size="small" />
              </View>
              <Text style={styles.service}>{item.servicio}</Text>
              <View style={styles.details}>
                <Text style={styles.detail}>Mecanico: {item.mecanico}</Text>
                <Text style={styles.detail}>
                  KM: {item.kilometraje.toLocaleString()}
                </Text>
              </View>
              {item.componentes.length > 0 && (
                <View style={styles.components}>
                  {item.componentes.map((comp, index) => (
                    <Badge
                      key={index}
                      label={comp}
                      type="outlined"
                      size="small"
                    />
                  ))}
                </View>
              )}
              {item.costo && (
                <Text style={styles.cost}>${item.costo.toFixed(2)}</Text>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>
              Aun no hay servicios registrados
            </Text>
            <Text style={styles.emptyText}>
              Tu historial de mantenimiento aparecera aqui cuando tengas tu
              primera intervencion.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav
        active="historial"
        items={[
          {key: 'inicio', label: 'Inicio', icon: 'home'},
          {key: 'historial', label: 'Historial', icon: 'file-text'},
          {key: 'qr', label: 'QR', icon: 'qrcode'},
          {key: 'perfil', label: 'Perfil', icon: 'user'},
        ]}
        onPress={key => {
          if (key === 'inicio') navigation.navigate('ClientDashboard');
          else if (key === 'qr') navigation.navigate('ClientQR');
          else if (key === 'perfil') navigation.navigate('ClientProfile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollContent: {
    paddingBottom: 80,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  service: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  components: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success[500],
    marginTop: 8,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 21,
  },
});
