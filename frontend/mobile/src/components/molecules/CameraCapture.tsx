import React, {useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CameraView} from 'expo-camera';
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
  const cameraRef = useRef<React.ElementRef<typeof CameraView>>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
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

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
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
