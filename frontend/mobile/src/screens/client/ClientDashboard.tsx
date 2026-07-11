import React, {useState, useEffect, useCallback} from 'react';
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
import api from '../../services/api';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientDashboard'>;

interface VehicleData {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  qrCode: string;
  totalIntervenciones: number;
  proximoMantenimiento: string | null;
  estadoGeneral: string;
}

interface HistoryItem {
  id: string;
  fecha: string;
  servicio: string;
  mecanico: string;
  kilometraje: number;
}

export default function ClientDashboard() {
  const navigation = useNavigation<Nav>();
  const {signOut} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, _setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const vehiclesRes = await api.get('/vehicles');
      const vehicles = vehiclesRes.data.vehicles ?? vehiclesRes.data;

      if (Array.isArray(vehicles) && vehicles.length > 0) {
        const v = vehicles[0];
        setVehicle({
          placa: v.placa ?? '',
          marca: v.marca ?? '',
          modelo: v.modelo ?? '',
          anio: v.anio ?? 0,
          kilometrajeActual: v.kilometrajeActual ?? 0,
          qrCode: v.qrCode ?? '',
          totalIntervenciones: v.totalIntervenciones ?? 0,
          proximoMantenimiento: v.proximoMantenimiento ?? null,
          estadoGeneral: v.estadoGeneral ?? 'OPTIMO',
        });

        try {
          const historyRes = await api.get(`/vehicles/${v.id}`);
          const interventions = historyRes.data.intervenciones ?? [];
          setHistory(
            interventions.slice(0, 5).map((i: any) => ({
              id: String(i.id),
              fecha: i.fecha ?? i.creadoEn ?? '',
              servicio: i.diagnostico ?? 'Servicio',
              mecanico: i.mecanico?.nombre ?? 'Mecanico',
              kilometraje: i.kilometrajeEnRegistro ?? 0,
            })),
          );
        } catch {
          // Vehicle detail fetch failed, continue with basic data
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Mi Vehiculo" showNotifications notificationCount={0} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {vehicle ? (
          <>
            <Card style={styles.vehicleCard}>
              <View style={styles.vehicleRow}>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleModel}>{vehicle.marca} {vehicle.modelo}</Text>
                  <Text style={styles.vehiclePlate}>{vehicle.placa}</Text>
                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleYear}>{vehicle.anio}</Text>
                    <Badge label={vehicle.estadoGeneral} type="success" size="small" />
                  </View>
                </View>
              </View>
            </Card>

            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{vehicle.kilometrajeActual.toLocaleString()} km</Text>
                <Text style={styles.metricLabel}>Kilometraje actual</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{vehicle.totalIntervenciones}</Text>
                <Text style={styles.metricLabel}>Servicios</Text>
              </Card>
            </View>

            <Card style={styles.qrSection}>
              <Text style={styles.qrTitle}>QR de tu vehiculo</Text>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrHint}>Muestra este codigo al mecanico en tu proxima visita</Text>
              </View>
              <Button
                title="Ver QR"
                variant="secondary"
                size="small"
                onPress={() => navigation.navigate('ClientQR')}
              />
            </Card>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial Reciente</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ClientHistory')}>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              {history.length > 0 ? (
                history.map(item => (
                  <Card key={item.id} style={styles.historyItem}>
                    <View style={styles.historyRow}>
                      <View>
                        <Text style={styles.historyDate}>{item.fecha.split('T')[0]}</Text>
                        <Text style={styles.historyService}>{item.servicio}</Text>
                      </View>
                      <View style={styles.historyRight}>
                        <Text style={styles.historyMechanic}>{item.mecanico}</Text>
                        <Text style={styles.historyKm}>{item.kilometraje.toLocaleString()} km</Text>
                      </View>
                    </View>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>Aun no tienes servicios registrados</Text>
              )}
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
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No tienes vehiculos activos</Text>
            <Text style={styles.emptySubtitle}>Contacta a tu taller para activar tu cuenta</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav
        active="inicio"
        items={[
          {key: 'inicio', label: 'Inicio', icon: 'home'},
          {key: 'historial', label: 'Historial', icon: 'file-text'},
          {key: 'qr', label: 'QR', icon: 'qrcode'},
          {key: 'perfil', label: 'Salir', icon: 'log-out'},
        ]}
        onPress={key => {
          if (key === 'historial') navigation.navigate('ClientHistory');
          else if (key === 'qr') navigation.navigate('ClientQR');
          else if (key === 'perfil') void handleLogout();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.neutral[100]},
  scrollContent: {paddingBottom: 80},
  vehicleCard: {marginHorizontal: 16, marginTop: 16},
  vehicleRow: {flexDirection: 'row'},
  vehicleInfo: {flex: 1, gap: 4},
  vehicleModel: {fontSize: 18, fontWeight: '600', color: colors.neutral[900]},
  vehiclePlate: {fontSize: 14, color: colors.neutral[600]},
  vehicleMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4},
  vehicleYear: {fontSize: 14, color: colors.neutral[600]},
  metricsGrid: {flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12},
  metricCard: {flex: 1, alignItems: 'center', padding: 12},
  metricValue: {fontSize: 18, fontWeight: '700', color: colors.primary[500]},
  metricLabel: {fontSize: 12, fontWeight: '500', color: colors.neutral[600], textAlign: 'center'},
  qrSection: {marginHorizontal: 16, marginTop: 16, alignItems: 'center', gap: 12},
  qrTitle: {fontSize: 18, fontWeight: '600', color: colors.neutral[900]},
  qrPlaceholder: {width: 120, height: 120, borderRadius: 12, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary[500]},
  qrHint: {fontSize: 12, color: colors.neutral[600], textAlign: 'center'},
  section: {marginHorizontal: 16, marginTop: 16},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  sectionTitle: {fontSize: 18, fontWeight: '600', color: colors.neutral[900]},
  seeAll: {fontSize: 14, fontWeight: '500', color: colors.secondary[500]},
  historyItem: {marginBottom: 8},
  historyRow: {flexDirection: 'row', justifyContent: 'space-between'},
  historyDate: {fontSize: 12, color: colors.neutral[600]},
  historyService: {fontSize: 14, fontWeight: '500', color: colors.neutral[900]},
  historyRight: {alignItems: 'flex-end'},
  historyMechanic: {fontSize: 12, color: colors.neutral[600]},
  historyKm: {fontSize: 12, fontWeight: '500', color: colors.primary[500]},
  actions: {paddingHorizontal: 16, gap: 8, marginTop: 16},
  emptyContainer: {alignItems: 'center', justifyContent: 'center', paddingVertical: 60},
  emptyTitle: {fontSize: 18, fontWeight: '600', color: colors.neutral[900], textAlign: 'center'},
  emptySubtitle: {fontSize: 14, color: colors.neutral[600], textAlign: 'center', marginTop: 8},
  emptyText: {fontSize: 14, color: colors.neutral[400], textAlign: 'center', paddingVertical: 16},
});
