import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import PlateInput from '../molecules/PlateInput';
import {colors} from '../../theme';

interface OCRProcessingProps {
  isProcessing: boolean;
  recognizedPlate: string | null;
  error: string | null;
  onConfirmPlate: (plate: string) => void;
  onRetryOCR: () => void;
}

export default function OCRProcessing({
  isProcessing,
  recognizedPlate,
  error,
  onConfirmPlate,
  onRetryOCR: _onRetryOCR,
}: OCRProcessingProps) {
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.processingText}>Procesando placa...</Text>
        <Text style={styles.processingSubtext}>
          Reconocimiento automatico en curso
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <PlateInput value="" onConfirm={onConfirmPlate} error={error} />
      </View>
    );
  }

  if (recognizedPlate) {
    return (
      <View style={styles.container}>
        <Text style={styles.successText}>Placa reconocida</Text>
        <Text style={styles.plateText}>{recognizedPlate}</Text>
        <PlateInput value={recognizedPlate} onConfirm={onConfirmPlate} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        No se pudo reconocer la placa automaticamente.
      </Text>
      <Text style={styles.instructionSubtext}>
        Ingrese la placa manualmente:
      </Text>
      <PlateInput value="" onConfirm={onConfirmPlate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  errorText: {
    fontSize: 14,
    color: colors.error[500],
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success[500],
  },
  plateText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  instructionSubtext: {
    fontSize: 12,
    color: colors.neutral[400],
    marginBottom: 8,
  },
});
