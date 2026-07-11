import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar, BottomNav, Card} from '../../components/molecules';
import {Input, Button} from '../../components/atoms';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'UpdateKM'>;

export default function UpdateKM() {
  const navigation = useNavigation<Nav>();
  const [newKM, setNewKM] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentKM = 45000;

  const handleUpdate = async () => {
    setIsLoading(true);
    await new Promise<void>(r => setTimeout(r, 1500));
    setIsLoading(false);
    navigation.goBack();
  };

  const isInvalid = !!newKM && parseInt(newKM, 10) <= currentKM;

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Actualizar Kilometraje"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.currentCard}>
          <Text style={styles.currentLabel}>Kilometraje actual</Text>
          <Text style={styles.currentValue}>
            {currentKM.toLocaleString()} km
          </Text>
          <Text style={styles.currentDate}>Ultimo registro: 2026-06-15</Text>
        </Card>

        <View style={styles.form}>
          <Input
            label="Nuevo kilometraje"
            placeholder="Ingresa el kilometraje actual"
            value={newKM}
            onChangeText={setNewKM}
            keyboardType="number-pad"
            error={isInvalid ? `El kilometraje debe ser mayor a ${currentKM.toLocaleString()} km` : undefined}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Actualizar tu kilometraje ayuda al sistema a calcular el desgaste
            de tu vehiculo y generar alertas precisas de mantenimiento.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Actualizar Kilometraje"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleUpdate}
            loading={isLoading}
            disabled={!newKM || isInvalid}
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
  },
  currentCard: {
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  currentValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary[500],
    marginTop: 4,
  },
  currentDate: {
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 4,
  },
  form: {
    marginTop: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[100],
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[900],
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
});
