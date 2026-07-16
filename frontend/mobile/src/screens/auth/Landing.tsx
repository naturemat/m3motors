import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

export default function Landing() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with gradient */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>M3</Text>
            </View>
          </View>
          <Text style={styles.brandName}>M3Motors</Text>
          <Text style={styles.tagline}>Gestión Inteligente para Talleres</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Mantenimiento predictivo y historial vehicular
          </Text>
          <Text style={styles.heroSubtitle}>
            Todo en una sola plataforma para ti y tu taller.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔧</Text>
            <Text style={styles.featureTitle}>Historial Completo</Text>
            <Text style={styles.featureText}>
              Registro detallado de cada intervención
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureTitle}>Alertas Predictivas</Text>
            <Text style={styles.featureText}>
              Notificaciones automáticas de mantenimiento
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureTitle}>QR por Vehículo</Text>
            <Text style={styles.featureText}>
              Acceso instantáneo al historial
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            ¿No tienes cuenta? Contacta a tu taller mecánico
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: colors.primary[500],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary[500],
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  // Hero
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.neutral[600],
    marginTop: 8,
    lineHeight: 22,
  },

  // Features
  featuresSection: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  featureText: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
  },

  // CTA
  ctaSection: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  footerText: {
    fontSize: 13,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
