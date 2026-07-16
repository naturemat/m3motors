import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import Logo from '../../components/atoms/Logo';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientQR'>;

export default function ClientQR() {
  const navigation = useNavigation<Nav>();
  const [glowIntensity, setGlowIntensity] = useState(8);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(Math.floor(Math.random() * 8 + 6));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({message: 'Codigo QR de M3Motors - Muestra esto al mecanico'});
      setSuccessMsg('QR copiado al portapapeles');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Logo size="small" variant="light" />
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {successMsg.length > 0 && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        <View style={styles.qrSection}>
          <View style={styles.qrWrapper}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            <View style={[styles.qrInner, {shadowRadius: glowIntensity}]}>
              <View style={styles.qrCode}>
                <Text style={styles.qrText}>QR</Text>
                <Text style={styles.qrSubtext}>M3Motors</Text>
              </View>
            </View>
          </View>
          <Text style={styles.qrHint}>
            Muestra este codigo al mecanico para acceder a tu historial
          </Text>
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleIconText}>M3</Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>Toyota Corolla 2024</Text>
            <View style={styles.vehicleMeta}>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>Placa: ABC-1234</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Compartir QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Descargar QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {width: 40, alignItems: 'flex-start'},
  backArrow: {fontSize: 24, color: colors.neutral[0], fontWeight: '300'},

  content: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, alignItems: 'center'},

  successBanner: {
    backgroundColor: colors.accent.bg,
    borderWidth: 1,
    borderColor: colors.accent.light,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
  },
  successText: {fontSize: 13, fontWeight: '600', color: colors.accent.dark, textAlign: 'center'},

  qrSection: {alignItems: 'center', marginBottom: 20},
  qrWrapper: {position: 'relative', padding: 8},
  cornerTL: {position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.primary[600], borderTopLeftRadius: 12},
  cornerTR: {position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.primary[600], borderTopRightRadius: 12},
  cornerBL: {position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.primary[600], borderBottomLeftRadius: 12},
  cornerBR: {position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.primary[600], borderBottomRightRadius: 12},
  qrInner: {
    backgroundColor: colors.neutral[0],
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary[500],
    shadowColor: colors.primary[600],
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    elevation: 10,
  },
  qrCode: {width: 200, height: 200, backgroundColor: colors.neutral[50], borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  qrText: {fontSize: 40, fontWeight: '800', color: colors.primary[500]},
  qrSubtext: {fontSize: 12, fontWeight: '600', color: colors.neutral[400], marginTop: 4},
  qrHint: {fontSize: 12, fontWeight: '600', color: colors.neutral[500], textAlign: 'center', marginTop: 20, maxWidth: 260, lineHeight: 18},

  vehicleCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 20,
  },
  vehicleIcon: {width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary[50] + '1A', alignItems: 'center', justifyContent: 'center'},
  vehicleIconText: {fontSize: 16, fontWeight: '800', color: colors.primary[600]},
  vehicleInfo: {flex: 1},
  vehicleName: {fontSize: 15, fontWeight: '700', color: colors.primary[600]},
  vehicleMeta: {flexDirection: 'row', gap: 8, marginTop: 6},
  plateBadge: {backgroundColor: colors.accent.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  plateText: {fontSize: 11, fontWeight: '700', color: colors.accent.dark},

  actions: {width: '100%', gap: 10},
  shareButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {fontSize: 14, fontWeight: '700', color: colors.neutral[0]},
  downloadButton: {
    borderWidth: 2,
    borderColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {fontSize: 14, fontWeight: '700', color: colors.primary[600]},
});
