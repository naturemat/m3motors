import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppBar} from '../../components/molecules';
import {Button} from '../../components/atoms';
import {MechanicStackParamList} from '../../navigation/types';
import {fetchHistorialByQR} from '../../services/vehicle';
import {colors, typography, spacing, borderRadius} from '../../theme';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'QRScanner'>;

export default function QRScanner() {
  const navigation = useNavigation<Nav>();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Ingresa un codigo QR valido');
      return;
    }

    setLoading(true);
    try {
      const historial = await fetchHistorialByQR(qrCode.trim());
      navigation.replace('VehicleHistory', {
        vehicleId: historial.vehicleId,
      });
    } catch (error) {
      Alert.alert(
        'Codigo QR no valido',
        'Intenta nuevamente con un codigo valido.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Escanear QR"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.scannerArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>
            Ingresa el codigo QR del vehiculo
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="QR-XXXX-XXXX"
            placeholderTextColor={colors.neutral[400]}
            value={qrCode}
            onChangeText={setQrCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Button
            title={loading ? 'Buscando...' : 'Buscar Vehiculo'}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleScan}
            disabled={loading || !qrCode.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  scannerArea: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[500],
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: borderRadius.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: borderRadius.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: borderRadius.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: borderRadius.lg,
  },
  scanText: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  inputSection: {
    gap: spacing[4],
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...typography.input,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
