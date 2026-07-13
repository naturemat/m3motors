import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@clerk/clerk-expo';
import {MechanicStackParamList} from '../../navigation/types';
import {Customer} from '../../types';
import {colors} from '../../theme';
import api from '../../services/api';
import Logo from '../../components/atoms/Logo';

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
      const [customersRes] = await Promise.all([api.get('/admin/customers')]);
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

  const filteredClients = pendingCustomers.filter(
    c =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.licensePlate ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Logo size="small" variant="light" />
          <Text style={styles.headerTitle}>Panel del Mecanico</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente por nombre o placa"
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.scanSection}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.scanButtonText}>Escanear Codigo QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCardDark}>
            <Text style={styles.statIconDark}>!</Text>
            <Text style={styles.statLabelLight}>Pendientes</Text>
            <Text style={styles.statValueLight}>{pendingCustomers.length}</Text>
          </View>
          <View style={styles.statCardWhite}>
            <Text style={styles.statIconBlue}>~</Text>
            <Text style={styles.statLabelDark}>En Proceso</Text>
            <Text style={styles.statValueDark}>5</Text>
          </View>
          <View style={styles.statCardWhite}>
            <Text style={styles.statIconRed}>!</Text>
            <Text style={styles.statLabelDark}>Urgentes</Text>
            <Text style={styles.statValueDark}>2</Text>
          </View>
          <View style={styles.statCardWhite}>
            <Text style={styles.statIconGreen}>v</Text>
            <Text style={styles.statLabelDark}>Listos</Text>
            <Text style={styles.statValueDark}>8</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes Pendientes</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredClients.length}</Text>
            </View>
          </View>
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientInitials}>
                    {client.nombre.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.nombre}</Text>
                  <Text style={styles.clientPlate}>
                    {client.licensePlate ?? 'Sin placa'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={() =>
                    navigation.navigate('ActivateCustomer', {customerId: client.id})
                  }>
                  <Text style={styles.activateButtonText}>Activar</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No se encontraron clientes pendientes</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recientes</Text>
          </View>
          <View style={styles.recentCard}>
            {recentCustomers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.recentItem}
                onPress={() =>
                  customer.vehicleId &&
                  navigation.navigate('VehicleHistory', {vehicleId: customer.vehicleId})
                }>
                <View style={[styles.recentDot, {backgroundColor: colors.success[500]}]} />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{customer.nombre}</Text>
                  <Text style={styles.recentEmail}>{customer.email}</Text>
                  <Text style={styles.recentStatus}>Activo</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CustomerSearch')}>
              <Text style={styles.viewAllText}>Ver Historial Completo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ServiceRegistration')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navIconActive}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CustomerSearch')}>
          <Text style={styles.navIcon}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => navigation.navigate('QRScanner')}>
          <View style={styles.qrFab}>
            <Text style={styles.qrFabText}>QR</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ServiceRegistration')}>
          <Text style={styles.navIcon}>Servicios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => void signOut()}>
          <Text style={styles.navIcon}>Salir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  scrollContent: {paddingBottom: 100},

  header: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: colors.neutral[0]},

  searchContainer: {paddingHorizontal: 16, marginTop: 16},
  searchInput: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.neutral[900],
  },

  scanSection: {paddingHorizontal: 16, marginTop: 12},
  scanButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {fontSize: 14, fontWeight: '700', color: colors.neutral[0]},

  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginTop: 16},
  statCardDark: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  statIconDark: {fontSize: 18, fontWeight: '800', color: colors.accent.light},
  statLabelLight: {fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 8},
  statValueLight: {fontSize: 28, fontWeight: '800', color: colors.neutral[0]},
  statCardWhite: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statIconBlue: {fontSize: 18, fontWeight: '800', color: colors.secondary[500]},
  statIconRed: {fontSize: 18, fontWeight: '800', color: colors.error[500]},
  statIconGreen: {fontSize: 18, fontWeight: '800', color: colors.success[500]},
  statLabelDark: {fontSize: 11, fontWeight: '600', color: colors.neutral[400], marginTop: 8},
  statValueDark: {fontSize: 28, fontWeight: '800', color: colors.neutral[900]},

  section: {marginHorizontal: 16, marginTop: 20},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: colors.primary[600]},
  countBadge: {backgroundColor: colors.accent.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  countText: {fontSize: 12, fontWeight: '700', color: colors.accent.dark},

  clientCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 8,
  },
  clientAvatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary[500] + '1A', alignItems: 'center', justifyContent: 'center'},
  clientInitials: {fontSize: 16, fontWeight: '700', color: colors.secondary[500]},
  clientInfo: {flex: 1},
  clientName: {fontSize: 14, fontWeight: '700', color: colors.neutral[900]},
  clientPlate: {fontSize: 12, color: colors.neutral[400], marginTop: 2},
  activateButton: {backgroundColor: colors.primary[600], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10},
  activateButtonText: {fontSize: 12, fontWeight: '700', color: colors.neutral[0]},

  emptyCard: {backgroundColor: colors.neutral[50], borderRadius: 12, padding: 24, alignItems: 'center'},
  emptyText: {fontSize: 13, color: colors.neutral[400], fontWeight: '500'},

  recentCard: {backgroundColor: colors.neutral[50], borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.neutral[200]},
  recentItem: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.neutral[200]},
  recentDot: {width: 8, height: 8, borderRadius: 4},
  recentInfo: {flex: 1},
  recentName: {fontSize: 13, fontWeight: '700', color: colors.neutral[900]},
  recentEmail: {fontSize: 11, color: colors.neutral[400], marginTop: 1},
  recentStatus: {fontSize: 10, fontWeight: '600', color: colors.success[500], marginTop: 2},
  viewAllButton: {borderWidth: 1, borderColor: colors.neutral[300], borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10},
  viewAllText: {fontSize: 12, fontWeight: '600', color: colors.neutral[400]},

  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {fontSize: 28, fontWeight: '300', color: colors.neutral[0]},

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[0],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  navItem: {alignItems: 'center', padding: 4},
  navIcon: {fontSize: 11, fontWeight: '600', color: colors.neutral[400]},
  navIconActive: {fontSize: 11, fontWeight: '700', color: colors.primary[600]},
  navItemCenter: {alignItems: 'center', marginTop: -20},
  qrFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrFabText: {fontSize: 16, fontWeight: '800', color: colors.neutral[0]},
});
