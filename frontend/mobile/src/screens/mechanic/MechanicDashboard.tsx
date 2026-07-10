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
import {Badge, Input, Button} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {Customer} from '../../types';
import {colors} from '../../theme';
import api from '../../services/api';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'MechanicDashboard'>;

export default function MechanicDashboard() {
  const navigation = useNavigation<Nav>();
  const {signOut} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCustomers, setPendingCustomers] = useState<Customer[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [customersRes, kpisRes] = await Promise.all([
        api.get('/admin/customers'),
        api.get('/admin/kpis'),
      ]);

      const allCustomers = customersRes.data;
      const pending = (allCustomers.preRegistered ?? [])
        .filter((c: any) => c.status === 'PENDING')
        .map((c: any) => ({
          id: String(c.id),
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
          licensePlate: c.licensePlate ?? undefined,
          status: 'pending' as const,
        }));

      const active = (allCustomers.activeClients ?? [])
        .slice(0, 5)
        .map((c: any) => ({
          id: String(c.id),
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
          vehicleId: c.idVehiculo ? String(c.idVehiculo) : undefined,
          status: 'active' as const,
        }));

      setPendingCustomers(pending);
      setRecentCustomers(active);
    } catch (err) {
      console.error('Error fetching mechanic data:', err);
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
      <AppBar title="Panel del Mecanico" showNotifications notificationCount={pendingCustomers.length} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CustomerSearch')}>
            <Input
              placeholder="Buscar cliente por nombre, telefono o placa"
              editable={false}
              value=""
            />
          </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
          <Button
            title="Escanear Codigo QR"
            variant="primary"
            size="medium"
            fullWidth
            onPress={() => navigation.navigate('QRScanner')}
          />
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Registrar Nueva Intervencion"
            variant="secondary"
            size="medium"
            fullWidth
            onPress={() => navigation.navigate('ServiceRegistration')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes Pendientes</Text>
            <Badge label={`${pendingCustomers.length}`} type="warning" />
          </View>
          {pendingCustomers.length > 0 ? (
            pendingCustomers.map(customer => (
              <Card key={customer.id} style={styles.customerCard}>
                <View style={styles.customerRow}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.nombre}</Text>
                    <Text style={styles.customerPhone}>{customer.telefono}</Text>
                    {customer.licensePlate && (
                      <Badge label={customer.licensePlate} type="outlined" size="small" style={{}} />
                    )}
                  </View>
                  <View style={styles.customerActions}>
                    <Badge label="Pendiente" type="warning" size="small" />
                    <Button
                      title="Activar"
                      variant="secondary"
                      size="small"
                      onPress={() =>
                        navigation.navigate('ActivateCustomer', {
                          customerId: customer.id,
                        })
                      }
                    />
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay clientes pendientes de activacion</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomerSearch')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {recentCustomers.map(customer => (
            <Card key={customer.id} style={styles.customerCard}>
              <TouchableOpacity
                onPress={() =>
                  customer.vehicleId &&
                  navigation.navigate('VehicleHistory', {
                    vehicleId: customer.vehicleId,
                  })
                }>
                <View style={styles.customerRow}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.nombre}</Text>
                    <Text style={styles.customerPlate}>{customer.email}</Text>
                  </View>
                  <View style={styles.customerActions}>
                    <Badge label="Activo" type="success" size="small" />
                    <Text style={styles.chevron}>&rsaquo;</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        active="dashboard"
        items={[
          {key: 'dashboard', label: 'Inicio', icon: 'home'},
          {key: 'search', label: 'Buscar', icon: 'search'},
          {key: 'history', label: 'Historial', icon: 'file-text'},
          {key: 'profile', label: 'Salir', icon: 'log-out'},
        ]}
        onPress={key => {
          if (key === 'search') navigation.navigate('CustomerSearch');
          else if (key === 'profile') void handleLogout();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.neutral[100]},
  scrollContent: {paddingBottom: 80},
  searchContainer: {paddingHorizontal: 16, marginTop: 16},
  qrSection: {paddingHorizontal: 16, marginTop: 12},
  actionSection: {paddingHorizontal: 16, marginTop: 8},
  section: {marginTop: 16, paddingHorizontal: 16},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  sectionTitle: {fontSize: 18, fontWeight: '600', color: colors.neutral[900]},
  seeAll: {fontSize: 14, fontWeight: '500', color: colors.secondary[500]},
  customerCard: {marginBottom: 8},
  customerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  customerInfo: {flex: 1, gap: 4},
  customerName: {fontSize: 14, fontWeight: '600', color: colors.neutral[900]},
  customerPhone: {fontSize: 12, color: colors.neutral[600]},
  customerPlate: {fontSize: 12, color: colors.neutral[600]},
  customerActions: {alignItems: 'flex-end', gap: 4},
  emptyText: {fontSize: 14, color: colors.neutral[400], textAlign: 'center', paddingVertical: 16},
  chevron: {fontSize: 24, color: colors.neutral[400], fontWeight: '300'},
});
