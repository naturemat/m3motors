import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Input, Button} from '../atoms';
import {colors} from '../../theme';
import {validateEcuadorianPlate} from '../../services/ocr';

interface PlateInputProps {
  value: string;
  onConfirm: (plate: string) => void;
  error?: string;
}

export default function PlateInput({
  value,
  onConfirm,
  error,
}: PlateInputProps) {
  const [plate, setPlate] = useState(value);
  const [localError, setLocalError] = useState('');

  const handleChange = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setPlate(cleaned);
    setLocalError('');
  };

  const handleConfirm = () => {
    if (!validateEcuadorianPlate(plate)) {
      setLocalError('Formato invalido. Use: ABC-1234');
      return;
    }
    onConfirm(plate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Placa del vehiculo</Text>
      <Text style={styles.hint}>Formato: 3 letras + 4 numeros (Ej: ABC-1234)</Text>
      <Input
        value={plate}
        onChangeText={handleChange}
        placeholder="ABC-1234"
        autoCapitalize="characters"
        error={localError || error}
        maxLength={8}
      />
      <Button
        title="Confirmar Placa"
        variant="primary"
        size="medium"
        fullWidth
        onPress={handleConfirm}
        disabled={!plate || plate.length < 7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  hint: {
    fontSize: 12,
    color: colors.neutral[400],
    marginBottom: 4,
  },
});
