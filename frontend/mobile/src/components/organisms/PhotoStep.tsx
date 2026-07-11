import React from 'react';
import {View, StyleSheet} from 'react-native';
import CameraCapture from '../molecules/CameraCapture';
import PhotoPreview from '../atoms/PhotoPreview';
import {colors} from '../../theme';

interface PhotoStepProps {
  instruction: string;
  imageUri: string | null;
  onCapture: (uri: string) => void;
  onRetake: () => void;
  hasPermission: boolean;
}

export default function PhotoStep({
  instruction,
  imageUri,
  onCapture,
  onRetake,
  hasPermission,
}: PhotoStepProps) {
  if (imageUri) {
    return (
      <View style={styles.container}>
        <PhotoPreview
          imageUri={imageUri}
          label={instruction}
          onRetake={onRetake}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraCapture
        instruction={instruction}
        onCapture={onCapture}
        hasPermission={hasPermission}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
});
