import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@clerk/clerk-expo';
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
  const [loading, setLoading] = useState(true);

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
          // continue with basic data
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {vehicle ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerLabel}>Mi Vehiculo</Text>
              <Text style={styles.headerTitle}>
                {vehicle.marca} {vehicle.modelo}
              </Text>
              <View style={styles.headerMeta}>
                <View style={styles.plateBadge}>
                  <Text style={styles.plateText}>{vehicle.placa}</Text>
                </View>
                <Text style={styles.yearText}>{vehicle.anio}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{vehicle.estadoGeneral}</Text>
                </View>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCardPrimary}>
                <Text style={styles.metricValueLarge}>
                  {vehicle.kilometrajeActual.toLocaleString()}
                </Text>
                <Text style={styles.metricUnit}>km</Text>
                <Text style={styles.metricLabelLight}>Kilometraje actual</Text>
              </View>
              <View style={styles.metricCardWhite}>
                <Text style={styles.metricValueDark}>
                  {vehicle.totalIntervenciones}
                </Text>
                <Text style={styles.metricLabelDark}>Servicios</Text>
              </View>
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <View style={styles.qrCornerTL} />
                <View style={styles.qrCornerTR} />
                <View style={styles.qrCornerBL} />
                <View style={styles.qrCornerBR} />
                <View style={styles.qrInner}>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderText}>QR</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.qrHint}>
                Muestra este codigo al mecanico para acceder a tu historial
              </Text>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => navigation.navigate('ClientQR')}>
                <Text style={styles.qrButtonText}>Ver QR completo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial Reciente</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ClientHistory')}>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </TouchableOpacity>
              </View>
              {history.length > 0 ? (
                <View style={styles.timeline}>
                  {history.map((item, idx) => (
                    <View key={item.id} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      {idx < history.length - 1 && <View style={styles.timelineLine} />}
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineDate}>
                            {item.fecha.split('T')[0]}
                          </Text>
                          <View style={styles.timelineTypeBadge}>
                            <Text style={styles.timelineTypeText}>Servicio</Text>
                          </View>
                        </View>
                        <Text style={styles.timelineTitle}>{item.servicio}</Text>
                        <Text style={styles.timelineMechanic}>{item.mecanico}</Text>
                        {item.kilometraje > 0 && (
                          <Text style={styles.timelineKm}>
                            {item.kilometraje.toLocaleString()} km
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    Aun no tienes servicios registrados
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('UpdateKM')}>
                <Text style={styles.primaryButtonText}>Actualizar Kilometraje</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => navigation.navigate('ClientHistory')}>
                <Text style={styles.outlineButtonText}>Ver Historial Completo</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>!</Text>
            </View>
            <Text style={styles.emptyTitle}>No tienes vehiculos activos</Text>
            <Text style={styles.emptySubtitle}>
              Contacta a tu taller para activar tu cuenta
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ClientDashboard')}>
          <Text style={styles.navIconActive}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ClientHistory')}>
          <Text style={styles.navIcon}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => navigation.navigate('ClientQR')}>
          <View style={styles.qrFab}>
            <Text style={styles.qrFabText}>QR</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ClientProfile')}>
          <Text style={styles.navIcon}>Perfil</Text>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLabel: {fontSize: 12, fontWeight: '600', color: colors.accent.light, textTransform: 'uppercase', letterSpacing: 1},
  headerTitle: {fontSize: 26, fontWeight: '800', color: colors.neutral[0], marginTop: 4},
  headerMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12},
  plateBadge: {backgroundColor: colors.accent.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  plateText: {fontSize: 12, fontWeight: '700', color: colors.accent.dark},
  yearText: {fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)'},
  statusBadge: {backgroundColor: 'rgba(39,174,96,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12},
  statusText: {fontSize: 10, fontWeight: '700', color: '#27AE60', textTransform: 'uppercase'},

  metricsGrid: {flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 16},
  metricCardPrimary: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  metricValueLarge: {fontSize: 28, fontWeight: '800', color: colors.neutral[0]},
  metricUnit: {fontSize: 14, fontWeight: '600', color: colors.accent.light},
  metricLabelLight: {fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 4},
  metricCardWhite: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  metricValueDark: {fontSize: 28, fontWeight: '800', color: colors.neutral[900]},
  metricLabelDark: {fontSize: 11, fontWeight: '600', color: colors.neutral[400], marginTop: 4},

  qrSection: {alignItems: 'center', marginTop: 20, paddingHorizontal: 16},
  qrContainer: {position: 'relative', padding: 10},
  qrCornerTL: {position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTopWidth: 5, borderLeftWidth: 5, borderColor: colors.primary[500], borderTopLeftRadius: 14},
  qrCornerTR: {position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTopWidth: 5, borderRightWidth: 5, borderColor: colors.primary[500], borderTopRightRadius: 14},
  qrCornerBL: {position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: colors.primary[500], borderBottomLeftRadius: 14},
  qrCornerBR: {position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 5, borderRightWidth: 5, borderColor: colors.primary[500], borderBottomRightRadius: 14},
  qrInner: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  qrPlaceholder: {width: 200, height: 200, backgroundColor: colors.neutral[50], borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  qrPlaceholderText: {fontSize: 36, fontWeight: '800', color: colors.primary[500]},
  qrHint: {fontSize: 13, fontWeight: '600', color: colors.neutral[500], textAlign: 'center', marginTop: 16, maxWidth: 280, lineHeight: 20},
  qrButton: {
    marginTop: 16,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  qrButtonText: {fontSize: 15, fontWeight: '700', color: colors.neutral[0]},

  section: {marginHorizontal: 16, marginTop: 24},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: colors.primary[600]},
  seeAll: {fontSize: 13, fontWeight: '600', color: colors.secondary[500]},

  timeline: {borderLeftWidth: 2, borderLeftColor: colors.neutral[200], marginLeft: 8, paddingLeft: 16},
  timelineItem: {marginBottom: 16, position: 'relative'},
  timelineDot: {position: 'absolute', left: -23, top: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[600], borderWidth: 2, borderColor: colors.neutral[0]},
  timelineLine: {position: 'absolute', left: -18, top: 22, width: 2, height: '100%', backgroundColor: colors.neutral[200]},
  timelineCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  timelineHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  timelineDate: {fontSize: 11, fontWeight: '600', color: colors.neutral[400]},
  timelineTypeBadge: {backgroundColor: colors.accent.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6},
  timelineTypeText: {fontSize: 10, fontWeight: '700', color: colors.accent.dark},
  timelineTitle: {fontSize: 14, fontWeight: '700', color: colors.primary[600]},
  timelineMechanic: {fontSize: 12, color: colors.neutral[500], marginTop: 2},
  timelineKm: {fontSize: 11, fontWeight: '600', color: colors.neutral[400], marginTop: 4},

  emptyCard: {backgroundColor: colors.neutral[50], borderRadius: 12, padding: 24, alignItems: 'center'},
  emptyText: {fontSize: 13, color: colors.neutral[400], fontWeight: '500'},

  actions: {paddingHorizontal: 16, gap: 10, marginTop: 20},
  primaryButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {fontSize: 14, fontWeight: '700', color: colors.neutral[0]},
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineButtonText: {fontSize: 14, fontWeight: '700', color: colors.primary[600]},

  emptyContainer: {alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32},
  emptyIconContainer: {width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 16},
  emptyIcon: {fontSize: 28, fontWeight: '800', color: colors.primary[600]},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: colors.neutral[900], textAlign: 'center'},
  emptySubtitle: {fontSize: 13, color: colors.neutral[500], textAlign: 'center', marginTop: 8},

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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  qrFabText: {fontSize: 18, fontWeight: '800', color: colors.neutral[0]},
});
