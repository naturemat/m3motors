import React, {useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Camera,
  CameraRef,
  usePhotoOutput,
  useCameraDevice,
} from 'react-native-vision-camera';
import {colors} from '../../theme';
import CameraButton from '../atoms/CameraButton';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  hasPermission: boolean;
  instruction: string;
}

export default function CameraCapture({
  onCapture,
  hasPermission,
  instruction,
}: CameraCaptureProps) {
  const cameraRef = useRef<CameraRef>(null);
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput();

  const handleCapture = async () => {
    if (!photoOutput) {
      return;
    }
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      onCapture(`file://${photoFile.filePath}`);
    } catch {
      // capture failed
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Se requiere permiso de camara para continuar
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          No se encontro dispositivo de camara
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        outputs={photoOutput ? [photoOutput] : []}
        isActive={true}
      />
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>{instruction}</Text>
      </View>
      <View style={styles.controlsContainer}>
        <CameraButton onPress={handleCapture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  instructionContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 12,
  },
  instruction: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[0],
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  permissionText: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
