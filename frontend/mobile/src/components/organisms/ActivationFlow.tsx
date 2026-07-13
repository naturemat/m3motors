import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCameraPermissions} from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import {AppBar} from '../molecules';
import {Button, LoadingSpinner} from '../atoms';
import StepIndicator from '../atoms/StepIndicator';
import PhotoStep from './PhotoStep';
import OCRProcessing from './OCRProcessing';
import ActivationSummary from '../molecules/ActivationSummary';
import {MechanicStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {recognizePlate} from '../../services/ocr';
import {activateClient} from '../../services/activation';

type Nav = NativeStackNavigationProp<MechanicStackParamList, 'ActivateCustomer'>;
type Route = RouteProp<MechanicStackParamList, 'ActivateCustomer'>;

const PHOTO_STEPS = [
  {instruction: 'Toma una foto frontal del vehiculo'},
  {instruction: 'Toma una foto lateral del vehiculo'},
  {instruction: 'Toma una foto de la placa (asegurate de que sea legible)'},
];

const STEP_LABELS = ['Frontal', 'Lateral', 'Placa'];

type FlowStep =
  | 'confirmation'
  | 'photo-0'
  | 'photo-1'
  | 'photo-2'
  | 'ocr'
  | 'summary';

export default function ActivationFlow() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {customerId} = route.params;

  const [currentStep, setCurrentStep] = useState<FlowStep>('confirmation');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<{
    plate: string;
    brand: string;
    model: string;
    year: number;
  } | null>(null);

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);

  const getStepIndex = (step: FlowStep): number => {
    if (step.startsWith('photo-')) {
      return parseInt(step.split('-')[1], 10);
    }
    return 0;
  };

  const handleConfirmActivation = () => {
    setCurrentStep('photo-0');
  };

  const handleCapturePhoto = (uri: string) => {
    const stepIndex = getStepIndex(currentStep);
    const newPhotos = [...photos];
    newPhotos[stepIndex] = uri;
    setPhotos(newPhotos);
  };

  const handleRetakePhoto = () => {
    const stepIndex = getStepIndex(currentStep);
    const newPhotos = [...photos];
    newPhotos[stepIndex] = null;
    setPhotos(newPhotos);
  };

  const handleNextStep = async () => {
    const stepIndex = getStepIndex(currentStep);

    if (stepIndex < 2) {
      setCurrentStep(`photo-${stepIndex + 1}` as FlowStep);
    } else {
      setCurrentStep('ocr');
      await processOCR();
    }
  };

  const processOCR = async () => {
    setIsProcessingOCR(true);
    setOcrError(null);

    try {
      const platePhoto = photos[2];
      if (!platePhoto) {
        throw new Error('No hay foto de placa disponible');
      }

      const base64 = await FileSystem.readAsStringAsync(platePhoto, {
        encoding: FileSystem.EncodingType.Base64,
      });

      try {
        const result = await recognizePlate(base64);
        setRecognizedPlate(result.placa);
      } catch {
        setOcrError(
          'No se pudo reconocer la placa automaticamente. Ingrese la placa manualmente.',
        );
      }
      setIsProcessingOCR(false);
    } catch {
      setOcrError(
        'No se pudo reconocer la placa automaticamente. Ingrese la placa manualmente.',
      );
      setIsProcessingOCR(false);
    }
  };

  const handleConfirmPlate = async (plate: string) => {
    setIsActivating(true);

    try {
      const fotos = [
        {tipo: 'frontal' as const, base64: ''},
        {tipo: 'lateral' as const, base64: ''},
        {tipo: 'placa' as const, base64: ''},
      ];

      for (let i = 0; i < 3; i++) {
        if (photos[i]) {
          fotos[i].base64 = await FileSystem.readAsStringAsync(photos[i]!, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }

      await activateClient({
        customerId,
        workshopId: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020,
        tipoMotor: 'Gasolina',
        fotos,
      });

      setActivationResult({
        plate,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });
      setCurrentStep('summary');
    } catch {
      Alert.alert('Error', 'No se pudo completar la activacion. Intente nuevamente.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleGoToDashboard = () => {
    navigation.navigate('MechanicDashboard');
  };

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContainer}>
      <Text style={styles.confirmationTitle}>Activar Cliente</Text>
      <Text style={styles.confirmationText}>
        Vas a activar al cliente pendiente. Se capturaran 3 fotografias del
        vehiculo para completar el registro.
      </Text>
      <View style={styles.confirmationActions}>
        <Button
          title="Confirmar"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleConfirmActivation}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          size="large"
          fullWidth
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );

  const renderPhotoStep = (stepIndex: number) => (
    <View style={styles.photoStepContainer}>
      <PhotoStep
        instruction={PHOTO_STEPS[stepIndex].instruction}
        imageUri={photos[stepIndex]}
        onCapture={handleCapturePhoto}
        onRetake={handleRetakePhoto}
        hasPermission={cameraPermission?.granted ?? false}
      />
      {photos[stepIndex] && (
        <View style={styles.photoStepActions}>
          <Button
            title={stepIndex < 2 ? 'Siguiente' : 'Procesar Placa'}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleNextStep}
          />
        </View>
      )}
    </View>
  );

  const renderOCRStep = () => (
    <ScrollView contentContainerStyle={styles.ocrContainer}>
      <OCRProcessing
        isProcessing={isProcessingOCR}
        recognizedPlate={recognizedPlate}
        error={ocrError}
        onConfirmPlate={handleConfirmPlate}
        onRetryOCR={processOCR}
      />
      {isActivating && (
        <View style={styles.activatingOverlay}>
          <LoadingSpinner />
          <Text style={styles.activatingText}>Activando cliente...</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderSummaryStep = () => {
    if (!activationResult) return null;

    return (
      <ActivationSummary
        customerName="Cliente Pendiente"
        brand={activationResult.brand}
        model={activationResult.model}
        year={activationResult.year}
        plate={activationResult.plate}
        onGoToDashboard={handleGoToDashboard}
      />
    );
  };

  const getStepIndicatorIndex = (): number => {
    if (currentStep === 'confirmation') return 0;
    if (currentStep.startsWith('photo-')) return getStepIndex(currentStep);
    if (currentStep === 'ocr') return 2;
    return 2;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Activar Cliente"
        showBack
        onBack={() => navigation.goBack()}
      />

      {currentStep !== 'confirmation' && currentStep !== 'summary' && (
        <StepIndicator
          currentStep={getStepIndicatorIndex()}
          totalSteps={3}
          labels={STEP_LABELS}
        />
      )}

      <View style={styles.content}>
        {currentStep === 'confirmation' && renderConfirmationStep()}
        {currentStep.startsWith('photo-') &&
          renderPhotoStep(getStepIndex(currentStep))}
        {currentStep === 'ocr' && renderOCRStep()}
        {currentStep === 'summary' && renderSummaryStep()}
      </View>
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
  },
  confirmationContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  confirmationText: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  confirmationActions: {
    marginTop: 'auto',
    gap: 8,
  },
  photoStepContainer: {
    flex: 1,
  },
  photoStepActions: {
    padding: 16,
  },
  ocrContainer: {
    flex: 1,
    padding: 16,
  },
  activatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activatingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary[500],
    marginTop: 12,
  },
});
