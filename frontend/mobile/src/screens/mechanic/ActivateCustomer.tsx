import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, BottomNav, Card} from '../../components/molecules';
import {Badge, Input, Button} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'ActivateCustomer'>;
type Route = RouteProp<MechanicStackParamList, 'ActivateCustomer'>;

const motorTypes = [
  {label: 'Gasolina', value: 'gasolina'},
  {label: 'Diesel', value: 'diesel'},
  {label: 'Hibrido', value: 'hibrido'},
  {label: 'Electrico', value: 'electrico'},
];

export default function ActivateCustomer() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {customerId} = route.params;

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [tipoMotor, setTipoMotor] = useState('');
  const [placa, setPlaca] = useState('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [placaReconocida, setPlacaReconocida] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleCapturePhoto = async () => {
    setIsProcessingOCR(true);
    await new Promise<void>(r => setTimeout(r, 2000));
    setPlacaReconocida('ABC-1234');
    setIsProcessingOCR(false);
  };

  const handleActivate = async () => {
    setIsActivating(true);
    await new Promise<void>(r => setTimeout(r, 1500));
    setIsActivating(false);
    navigation.goBack();
  };

  const isFormComplete = placaReconocida && marca && modelo && anio && tipoMotor;

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Activar Cliente" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.customerCard}>
          <Text style={styles.customerName}>Cliente Pendiente</Text>
          <Text style={styles.customerDetail}>ID: {customerId}</Text>
          <Badge label="Pendiente de Activacion" type="warning" />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tomar foto del vehiculo</Text>
          <Text style={styles.sectionSubtitle}>
            Toma una foto de la placa para registrar el vehiculo
          </Text>

          <TouchableOpacity
            style={styles.photoCapture}
            onPress={handleCapturePhoto}>
            {isProcessingOCR ? (
              <View style={styles.ocrProcessing}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.ocrText}>Reconociendo placa...</Text>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.photoLabel}>Tomar foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {placaReconocida && (
          <Card style={styles.ocrResult}>
            <View style={styles.ocrRow}>
              <View style={styles.ocrContent}>
                <Text style={styles.ocrLabel}>Placa reconocida</Text>
                <Text style={styles.ocrPlate}>{placaReconocida}</Text>
                <TouchableOpacity>
                  <Text style={styles.ocrEdit}>Editar placa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del vehiculo</Text>

          <Input
            label="Placa"
            placeholder="Ej: ABC-1234"
            value={placaReconocida || placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />
          <Input
            label="Marca"
            placeholder="Ej: Toyota"
            value={marca}
            onChangeText={setMarca}
          />
          <Input
            label="Modelo"
            placeholder="Ej: Corolla"
            value={modelo}
            onChangeText={setModelo}
          />
          <Input
            label="Anio"
            placeholder="Ej: 2020"
            value={anio}
            onChangeText={setAnio}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Tipo de motor</Text>
          <View style={styles.motorOptions}>
            {motorTypes.map(motor => (
              <TouchableOpacity
                key={motor.value}
                style={[
                  styles.motorOption,
                  tipoMotor === motor.value && styles.motorOptionSelected,
                ]}
                onPress={() => setTipoMotor(motor.value)}>
                <Text
                  style={[
                    styles.motorOptionText,
                    tipoMotor === motor.value &&
                      styles.motorOptionTextSelected,
                  ]}>
                  {motor.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Activar Cliente"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleActivate}
            loading={isActivating}
            disabled={!isFormComplete}
          />
          <Button
            title="Cancelar"
            variant="secondary"
            size="large"
            fullWidth
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>

      <BottomNav
        active="search"
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
  customerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  customerDetail: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 16,
  },
  photoCapture: {
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    backgroundColor: colors.neutral[0],
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraIcon: {
    fontSize: 36,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  ocrProcessing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ocrText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  ocrResult: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  ocrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ocrContent: {
    flex: 1,
    gap: 4,
  },
  ocrLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success[500],
  },
  ocrPlate: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  ocrEdit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary[500],
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 8,
  },
  motorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motorOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  motorOptionSelected: {
    backgroundColor: colors.primary[500],
  },
  motorOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  motorOptionTextSelected: {
    color: colors.neutral[0],
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
});
