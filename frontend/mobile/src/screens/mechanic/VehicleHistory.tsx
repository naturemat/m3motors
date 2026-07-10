import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, BottomNav, LoadingSpinner} from '../../components';
import {
  VehicleHeader,
  ClientInfo,
  StatusIndicator,
  InterventionsList,
  ComponentsList,
  NextMaintenance,
} from '../../components/organisms';
import {MechanicStackParamList} from '../../navigation/types';
import {VehiculoHistorialData, fetchHistorialByQR} from '../../services/vehicle';
import {colors, typography, spacing} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'VehicleHistory'>;
type Route = RouteProp<MechanicStackParamList, 'VehicleHistory'>;

export default function VehicleHistory() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {vehicleId} = route.params;

  const [vehicle, setVehicle] = useState<VehiculoHistorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchHistorialByQR(vehicleId);
      setVehicle(data);
    } catch (_err) {
      setError('No se pudo cargar el historial del vehiculo');
    }
  }, [vehicleId]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Historial del Vehiculo"
          showBack
          onBack={() => navigation.goBack()}
        />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Historial del Vehiculo"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'Vehiculo no encontrado'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Historial del Vehiculo"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <VehicleHeader vehicle={vehicle} />

        <StatusIndicator
          estado={vehicle.estadoGeneral}
          mensaje={vehicle.mensajeEstado}
        />

        {vehicle.cliente && <ClientInfo cliente={vehicle.cliente} />}

        <ComponentsList
          intervenciones={vehicle.intervenciones}
          kilometrajeActual={vehicle.kilometrajeActual}
        />

        <InterventionsList intervenciones={vehicle.intervenciones} />

        <NextMaintenance
          proximoMantenimiento={vehicle.proximoMantenimiento}
          kilometrajeActual={vehicle.kilometrajeActual}
          tasaDesgasteSemanal={vehicle.tasaDesgasteSemanal}
          onRegistrarServicio={() =>
            navigation.navigate('NewService', {vehicleId: vehicle.vehicleId})
          }
        />

        <View style={styles.bottomSpacer} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  errorText: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing[4],
  },
});
