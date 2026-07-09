import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@clerk/clerk-expo';
import {AppBar, BottomNav, Card} from '../../components/molecules';
import {Badge, Button} from '../../components/atoms';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientDashboard'>;

const mockVehicle = {
  placa: 'PBA-1234',
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2020,
  ultimoKilometraje: 45000,
  tasaDesgaste: 500,
  proximoMantenimiento: {km: 50000, semanas: 4},
  totalIntervenciones: 8,
};

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

const mockHistory = [
  {
    id: '1',
    fecha: '2026-06-15',
    servicio: 'Cambio de aceite',
    mecanico: 'Juan Perez',
    kilometraje: 45000,
  },
  {
    id: '2',
    fecha: '2026-05-20',
    servicio: 'Revision de frenos',
    mecanico: 'Carlos Lopez',
    kilometraje: 42000,
  },
];

export default function ClientDashboard() {
  const navigation = useNavigation<Nav>();
  const {signOut} = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Mi Vehiculo"
        showNotifications
        notificationCount={2}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleModel}>
                {mockVehicle.marca} {mockVehicle.modelo}
              </Text>
              <Text style={styles.vehiclePlate}>{mockVehicle.placa}</Text>
              <View style={styles.vehicleMeta}>
                <Text style={styles.vehicleYear}>{mockVehicle.anio}</Text>
                <Badge label="ACTIVADO" type="success" size="small" />
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {mockVehicle.proximoMantenimiento.km.toLocaleString()} km
            </Text>
            <Text style={styles.metricLabel}>Proximo mantenimiento</Text>
            <Text style={styles.metricSub}>
              {mockVehicle.proximoMantenimiento.semanas} semanas
            </Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {mockVehicle.tasaDesgaste} km/sem
            </Text>
            <Text style={styles.metricLabel}>Tasa de desgaste</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {mockVehicle.totalIntervenciones}
            </Text>
            <Text style={styles.metricLabel}>Servicios</Text>
            <Text style={styles.metricSub}>intervenciones</Text>
          </Card>
        </View>

        <Card style={styles.qrSection}>
          <Text style={styles.qrTitle}>QR de tu vehiculo</Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>📱</Text>
          </View>
          <Text style={styles.qrHint}>
            Muestra este codigo al mecanico en tu proxima visita
          </Text>
          <Button
            title="Ver QR"
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate('ClientQR')}
          />
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ultimas Alertas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial Reciente</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ClientHistory')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {mockHistory.map(item => (
            <Card key={item.id} style={styles.historyItem}>
              <View style={styles.historyRow}>
                <View>
                  <Text style={styles.historyDate}>{item.fecha}</Text>
                  <Text style={styles.historyService}>{item.servicio}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyMechanic}>{item.mecanico}</Text>
                  <Text style={styles.historyKm}>
                    {item.kilometraje.toLocaleString()} km
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Actualizar Kilometraje"
            variant="secondary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('UpdateKM')}
          />
          <Button
            title="Ver Historial Completo"
            variant="ghost"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('ClientHistory')}
          />
        </View>
      </ScrollView>

      <BottomNav
        active="inicio"
        items={[
          {key: 'inicio', label: 'Inicio', icon: 'home'},
          {key: 'historial', label: 'Historial', icon: 'file-text'},
          {key: 'qr', label: 'QR', icon: 'qrcode'},
          {key: 'perfil', label: 'Perfil', icon: 'user'},
        ]}
        onPress={key => {
          if (key === 'historial') navigation.navigate('ClientHistory');
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
  vehicleCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  vehicleRow: {
    flexDirection: 'row',
  },
  vehicleInfo: {
    flex: 1,
    gap: 4,
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  vehiclePlate: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
  },
  metricSub: {
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  qrSection: {
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  qrIcon: {
    fontSize: 48,
  },
  qrHint: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary[500],
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
  historyItem: {
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  historyService: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyMechanic: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  historyKm: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary[500],
  },
  actions: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16,
  },
});
