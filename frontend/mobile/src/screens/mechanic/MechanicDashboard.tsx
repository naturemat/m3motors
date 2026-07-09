import React, {useState, useEffect} from 'react';
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
import {Badge, Input, Button, LoadingSpinner} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {Customer} from '../../types';
import {colors} from '../../theme';
import api from '../../services/api';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'MechanicDashboard'>;

const mockPendingCustomers: Customer[] = [
  {
    id: '1',
    nombre: 'Carlos Perez',
    telefono: '+593 99 123 4567',
    email: 'carlos@email.com',
    licensePlate: 'PBA-1234',
    status: 'pending',
  },
  {
    id: '2',
    nombre: 'Maria Lopez',
    telefono: '+593 98 765 4321',
    email: 'maria@email.com',
    status: 'pending',
  },
];

const mockRecentCustomers: Customer[] = [
  {
    id: '3',
    nombre: 'Juan Martinez',
    telefono: '+593 97 111 2222',
    email: 'juan@email.com',
    licensePlate: 'ABC-5678',
    vehicleId: 'v1',
    status: 'active',
  },
  {
    id: '4',
    nombre: 'Ana Garcia',
    telefono: '+593 96 333 4444',
    email: 'ana@email.com',
    licensePlate: 'XYZ-9012',
    vehicleId: 'v2',
    status: 'active',
  },
];

export default function MechanicDashboard() {
  const navigation = useNavigation<Nav>();
  const {signOut} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCustomers, setPendingCustomers] = useState<Customer[]>(mockPendingCustomers);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>(mockRecentCustomers);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Hola, Mecanico" showNotifications notificationCount={3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Buscar cliente por nombre, telefono o placa"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
                    <Text style={styles.customerPhone}>
                      {customer.telefono}
                    </Text>
                    {customer.licensePlate && (
                      <Badge
                        label={customer.licensePlate}
                        type="outlined"
                        size="small"
                      />
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
            <Text style={styles.emptyText}>
              No hay clientes pendientes de activacion
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clientes Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {recentCustomers.slice(0, 5).map(customer => (
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
                    <Text style={styles.customerPlate}>
                      {customer.licensePlate}
                    </Text>
                  </View>
                  <View style={styles.customerActions}>
                    <Badge label="Activo" type="success" size="small" />
                    <Text style={styles.chevron}>›</Text>
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
          {key: 'dashboard', label: 'Dashboard', icon: 'home'},
          {key: 'search', label: 'Buscar', icon: 'search'},
          {key: 'history', label: 'Historial', icon: 'file-text'},
          {key: 'profile', label: 'Perfil', icon: 'user'},
        ]}
        onPress={key => {
          if (key === 'profile') {
            handleLogout();
          }
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
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
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
  customerCard: {
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  customerPhone: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  customerPlate: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  customerActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: 16,
  },
  chevron: {
    fontSize: 24,
    color: colors.neutral[400],
    fontWeight: '300',
  },
});
