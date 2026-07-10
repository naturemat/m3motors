import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, CustomerSearchItem, CustomerSearchSkeleton} from '../../components/molecules';
import {Input} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {Customer} from '../../types';
import {customersService} from '../../services/customers';
import {colors, typography, borderRadius} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'CustomerSearch'>;

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVATED';
type OrderBy = 'date_desc' | 'name_asc' | 'name_desc';

const TAKE = 20;
const SEARCH_DEBOUNCE_MS = 500;
const EMPTY_MESSAGE = 'No se encontraron clientes con esos criterios';
const ERROR_MESSAGE = 'Error al buscar clientes. Intenta nuevamente.';

export default function CustomerSearchScreen() {
  const navigation = useNavigation<Nav>();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const skipRef = useRef(0);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [orderBy, setOrderBy] = useState<OrderBy>('date_desc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchCustomers = useCallback(
    async (mode: 'initial' | 'refresh' | 'loadMore' = 'initial') => {
      const isLoadMore = mode === 'loadMore';
      const currentSkip = isLoadMore ? skipRef.current : 0;

      if (isLoadMore) {
        setLoadingMore(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await customersService.searchPreRegisteredCustomers({
          q: debouncedQuery || undefined,
          status: statusFilter,
          skip: currentSkip,
          take: TAKE,
          orderBy,
        });

        if (isLoadMore) {
          setCustomers(prev => [...prev, ...response.data]);
        } else {
          setCustomers(response.data);
        }

        const nextSkip = currentSkip + response.data.length;
        skipRef.current = nextSkip;
        setHasMore(nextSkip < response.meta.total);
      } catch {
        setError(ERROR_MESSAGE);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery, statusFilter, orderBy],
  );

  useEffect(() => {
    skipRef.current = 0;
    setHasMore(true);
    fetchCustomers('initial');
  }, [debouncedQuery, statusFilter, orderBy, fetchCustomers]);

  const onRefresh = () => {
    skipRef.current = 0;
    setHasMore(true);
    fetchCustomers('refresh');
  };

  const onLoadMore = () => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      fetchCustomers('loadMore');
    }
  };

  const handleActivate = (customer: Customer) => {
    navigation.navigate('ActivateCustomer', {customerId: customer.id});
  };

  const handleViewDetails = (customer: Customer) => {
    if (customer.status === 'active' && customer.vehicleId) {
      navigation.navigate('VehicleHistory', {vehicleId: customer.vehicleId});
      return;
    }

    Alert.alert(
      customer.nombre,
      [
        `Teléfono: ${customer.telefono}`,
        customer.email ? `Email: ${customer.email}` : null,
        customer.licensePlate ? `Placa: ${customer.licensePlate}` : null,
        customer.fechaPreRegistro
          ? `Pre-registro: ${new Date(customer.fechaPreRegistro).toLocaleDateString()}`
          : null,
        customer.status === 'pending' ? 'Estado: Pendiente' : 'Estado: Activado',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  };

  const renderFilterBadge = <T extends string>(
    label: string,
    value: T,
    currentVal: T,
    setVal: (val: T) => void,
  ) => (
    <TouchableOpacity key={value} onPress={() => setVal(value)}>
      <View
        style={[
          styles.filterBadge,
          currentVal === value && styles.filterBadgeActive,
        ]}>
        <Text
          style={[
            styles.filterBadgeText,
            currentVal === value && styles.filterBadgeTextActive,
          ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const showInitialSkeleton = loading && !refreshing && customers.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Buscar Clientes"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar por nombre, teléfono o placa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchHint}>
          Puedes buscar por nombre, número de teléfono o placa del vehículo
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Estado:</Text>
        <View style={styles.filterRow}>
          {renderFilterBadge('Todos', 'ALL', statusFilter, setStatusFilter)}
          {renderFilterBadge(
            'Pendientes',
            'PENDING',
            statusFilter,
            setStatusFilter,
          )}
          {renderFilterBadge(
            'Activados',
            'ACTIVATED',
            statusFilter,
            setStatusFilter,
          )}
        </View>

        <Text style={[styles.filterLabel, styles.filterLabelSpaced]}>
          Ordenar por:
        </Text>
        <View style={styles.filterRow}>
          {renderFilterBadge('Más reciente', 'date_desc', orderBy, setOrderBy)}
          {renderFilterBadge('Nombre (A-Z)', 'name_asc', orderBy, setOrderBy)}
          {renderFilterBadge('Nombre (Z-A)', 'name_desc', orderBy, setOrderBy)}
        </View>
      </View>

      {showInitialSkeleton ? (
        <CustomerSearchSkeleton />
      ) : error && customers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{ERROR_MESSAGE}</Text>
          <TouchableOpacity
            onPress={() => fetchCustomers('refresh')}
            style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <CustomerSearchItem
              customer={item}
              onActivate={handleActivate}
              onViewDetails={handleViewDetails}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>{EMPTY_MESSAGE}</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color={colors.primary[500]}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.neutral[0],
  },
  searchHint: {
    ...typography.caption,
    marginTop: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterLabel: {
    ...typography.caption,
    marginBottom: 6,
  },
  filterLabelSpaced: {
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterBadgeActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.neutral[800],
  },
  filterBadgeTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error[500],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.base,
  },
  retryText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
});
