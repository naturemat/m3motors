import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, BottomNav, Card} from '../../components/molecules';
import {Badge, Button} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'VehicleHistory'>;
type Route = RouteProp<MechanicStackParamList, 'VehicleHistory'>;

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

const mockAlerts = [
  {
    id: '1',
    severity: 'high' as const,
    title: 'Frenos desgastados',
    component: 'Pastillas delanteras',
    days: 15,
  },
  {
    id: '2',
    severity: 'medium' as const,
    title: 'Cambio de aceite proximo',
    component: 'Motor',
    days: 30,
  },
];

export default function VehicleHistory() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {vehicleId} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Historial del Vehiculo"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleModel}>Toyota Corolla</Text>
            <Text style={styles.vehiclePlate}>PBA-1234</Text>
            <View style={styles.vehicleStats}>
              <Text style={styles.vehicleStat}>KM: 45,000</Text>
              <Text style={styles.vehicleStat}>Desgaste: 500 km/sem</Text>
            </View>
          </View>
        </Card>

        {mockAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas Activas</Text>
            {mockAlerts.map(alert => (
              <Card
                key={alert.id}
                style={[
                  styles.alertCard,
                  {borderLeftColor: alert.severity === 'high' ? colors.error[500] : colors.warning[500]},
                ]}>
                <View style={styles.alertRow}>
                  <Badge
                    label={alert.severity === 'high' ? 'ALTA' : 'MEDIA'}
                    type={alert.severity === 'high' ? 'error' : 'warning'}
                    size="small"
                  />
                  <Text style={styles.alertDays}>{alert.days} dias</Text>
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertComponent}>{alert.component}</Text>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Servicios</Text>
          {mockHistory.map(item => (
            <Card key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{item.fecha}</Text>
                <Badge label={item.servicio} type="info" size="small" />
              </View>
              <Text style={styles.historyService}>{item.servicio}</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyDetail}>
                  Mecanico: {item.mecanico}
                </Text>
                <Text style={styles.historyDetail}>
                  KM: {item.kilometraje.toLocaleString()}
                </Text>
              </View>
              {item.componentes.length > 0 && (
                <View style={styles.componentList}>
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
                <Text style={styles.historyCost}>
                  ${item.costo.toFixed(2)}
                </Text>
              )}
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Registrar Nueva Intervencion"
            variant="primary"
            size="large"
            fullWidth
            onPress={() =>
              navigation.navigate('NewService', {vehicleId})
            }
          />
        </View>
      </ScrollView>

      <BottomNav
        active="history"
        items={[
          {key: 'dashboard', label: 'Dashboard', icon: 'home'},
          {key: 'search', label: 'Buscar', icon: 'search'},
          {key: 'history', label: 'Historial', icon: 'file-text'},
          {key: 'profile', label: 'Perfil', icon: 'user'},
        ]}
        onPress={() => {}}
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
  vehicleHeader: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  vehicleInfo: {
    gap: 4,
  },
  vehicleModel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  vehiclePlate: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  vehicleStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  vehicleStat: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  alertCard: {
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertDays: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  alertComponent: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  historyCard: {
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  historyService: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  historyDetail: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyCost: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success[500],
    marginTop: 8,
    textAlign: 'right',
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
