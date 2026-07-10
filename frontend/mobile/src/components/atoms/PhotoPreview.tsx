import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../../theme';

interface PhotoPreviewProps {
  imageUri: string;
  label: string;
  onRetake: () => void;
}

export default function PhotoPreview({
  imageUri,
  label,
  onRetake,
}: PhotoPreviewProps) {
  return (
    <View style={styles.container}>
      <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Text style={styles.retakeText}>Retomar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[0],
  },
  retakeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  retakeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[0],
  },
});
