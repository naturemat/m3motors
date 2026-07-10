import React from 'react';
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
import {Button} from '../../components/atoms';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientQR'>;

export default function ClientQR() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Mi QR" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>📱</Text>
          </View>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>Toyota Corolla</Text>
          <Text style={styles.vehiclePlate}>PBA-1234</Text>
        </View>

        <Text style={styles.instruction}>
          Muestra este codigo al mecanico para acceder a tu historial
        </Text>

        <View style={styles.actions}>
          <Button
            title="Compartir QR"
            variant="secondary"
            size="large"
            fullWidth
            onPress={() => {}}
          />
          <Button
            title="Descargar QR"
            variant="ghost"
            size="large"
            fullWidth
            onPress={() => {}}
          />
        </View>
      </ScrollView>

      <BottomNav
        active="qr"
        items={[
          {key: 'inicio', label: 'Inicio', icon: 'home'},
          {key: 'historial', label: 'Historial', icon: 'file-text'},
          {key: 'qr', label: 'QR', icon: 'qrcode'},
          {key: 'perfil', label: 'Perfil', icon: 'user'},
        ]}
        onPress={key => {
          if (key === 'inicio') navigation.navigate('ClientDashboard');
          else if (key === 'historial') navigation.navigate('ClientHistory');
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: colors.neutral[0],
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary[500],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIcon: {
    fontSize: 64,
  },
  vehicleInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  vehiclePlate: {
    fontSize: 16,
    color: colors.neutral[600],
    marginTop: 4,
  },
  instruction: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  actions: {
    width: '100%',
    gap: 8,
  },
});
