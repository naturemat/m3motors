import React, {useState} from 'react';
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
import {Input, Button} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'NewService'>;
type Route = RouteProp<MechanicStackParamList, 'NewService'>;

const serviceOptions = [
  {label: 'Cambio de aceite', value: 'aceite'},
  {label: 'Revision de frenos', value: 'frenos'},
  {label: 'Cambio de llantas', value: 'llantas'},
  {label: 'Alineacion', value: 'alineacion'},
  {label: 'Revision general', value: 'general'},
  {label: 'Diagnostico', value: 'diagnostico'},
];

export default function NewService() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {vehicleId} = route.params;

  const [kilometraje, setKilometraje] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [severidad, setSeveridad] = useState<'BAJA' | 'MEDIA' | 'ALTA'>('BAJA');
  const [manoDeObra, setManoDeObra] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise<void>(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Nueva Intervencion"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryPlate}>PBA-1234</Text>
          <Text style={styles.summaryModel}>Toyota Corolla</Text>
          <Text style={styles.summaryKm}>KM actual: 45,000 km</Text>
        </Card>

        <View style={styles.form}>
          <Input
            label="Kilometraje"
            placeholder="Kilometraje actual"
            value={kilometraje}
            onChangeText={setKilometraje}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Tipo de servicio</Text>
          <View style={styles.serviceOptions}>
            {serviceOptions.map(service => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.serviceOption,
                  tipoServicio === service.value &&
                    styles.serviceOptionSelected,
                ]}
                onPress={() => setTipoServicio(service.value)}>
                <Text
                  style={[
                    styles.serviceOptionText,
                    tipoServicio === service.value &&
                      styles.serviceOptionTextSelected,
                  ]}>
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Diagnostico"
            placeholder="Describe la falla detectada"
            value={diagnostico}
            onChangeText={setDiagnostico}
          />

          <Input
            label="Observaciones"
            placeholder="Observaciones adicionales"
            value={observaciones}
            onChangeText={setObservaciones}
          />

          <Text style={styles.label}>Severidad</Text>
          <View style={styles.severityOptions}>
            {(['BAJA', 'MEDIA', 'ALTA'] as const).map(sev => (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.severityButton,
                  severidad === sev && styles.severityButtonSelected,
                  severidad === sev && {
                    backgroundColor:
                      sev === 'BAJA'
                        ? colors.success[500]
                        : sev === 'MEDIA'
                        ? colors.warning[500]
                        : colors.error[500],
                  },
                ]}
                onPress={() => setSeveridad(sev)}>
                <Text
                  style={[
                    styles.severityText,
                    severidad === sev && styles.severityTextSelected,
                  ]}>
                  {sev}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Mano de obra ($)"
            placeholder="Costo de mano de obra"
            value={manoDeObra}
            onChangeText={setManoDeObra}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Finalizar Intervencion"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit}
            loading={isSubmitting}
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
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  summaryPlate: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  summaryModel: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  summaryKm: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  form: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  serviceOptionSelected: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[500],
  },
  serviceOptionText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  serviceOptionTextSelected: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  severityButtonSelected: {},
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  severityTextSelected: {
    color: colors.neutral[0],
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
});
