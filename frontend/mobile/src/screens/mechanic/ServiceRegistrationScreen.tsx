import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { InterventionService } from '../../services/intervention.service';
import { CreateInterventionDTO, VehiculoInfo, DetalleComponenteDTO } from '../../types/intervention.types';

export const ServiceRegistrationScreen = ({ route, navigation }: any) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [vehiculo, setVehiculo] = useState<VehiculoInfo | null>(null);
  const [kilometraje, setKilometraje] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [severidad, _setSeveridad] = useState<'BAJA' | 'MEDIA' | 'ALTA'>('MEDIA');
  const [manoDeObra, setManoDeObra] = useState('');
  const [detalles, setDetalles] = useState<DetalleComponenteDTO[]>([]);

  // --- ESTADOS DE UI (Validaciones) ---
  const [loading, setLoading] = useState(false);
  const [errorKilometraje, setErrorKilometraje] = useState('');

  // 1. Cargar vehículo si el usuario viene desde el Historial o Escaneo QR
  useEffect(() => {
    if (route.params?.vehiculoId) {
      // Aquí simulamos la data inicial que viene de los parámetros de navegación. 
      // Si usas un endpoint para traerlo, puedes llamar a InterventionService aquí.
      setVehiculo({
        id: route.params.vehiculoId,
        placa: route.params.placa || 'Desconocida',
        marca: route.params.marca || 'Vehículo',
        modelo: route.params.modelo || '',
        kilometrajeActual: route.params.kilometrajeActual || 0 // Ejemplo: 45230
      });
    }
  }, [route.params]);

  // 2. Validación en tiempo real del Kilometraje
  const handleKilometrajeChange = (text: string) => {
    setKilometraje(text);
    const nuevoKms = Number(text);
    if (vehiculo && nuevoKms <= vehiculo.kilometrajeActual) {
      setErrorKilometraje(`Debe ser mayor al último registro: ${vehiculo.kilometrajeActual} km`);
    } else {
      setErrorKilometraje('');
    }
  };

  // 3. Manejo de Componentes Instalados Dinámicos
  const agregarComponente = () => {
    setDetalles([
      ...detalles, 
      { componenteReemplazado: '', tipoServicio: 'REEMPLAZO' } // Kilometraje de instalación se asigna en backend
    ]);
  };

  const actualizarComponente = (index: number, campo: keyof DetalleComponenteDTO, valor: any) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor };
    setDetalles(nuevosDetalles);
  };

  // 4. Resumen y Guardado
  const handleGuardar = () => {
    if (!vehiculo) return Alert.alert('Error', 'Debe seleccionar o escanear un vehículo primero.');
    if (Number(kilometraje) <= vehiculo.kilometrajeActual) {
      return Alert.alert('Error de Validación', 'El kilometraje ingresado no es válido.');
    }
    if (!diagnostico.trim()) return Alert.alert('Error', 'El diagnóstico es obligatorio.');

    // Modal de Resumen antes de guardar (Criterio de Aceptación)
    Alert.alert(
      'Resumen del Servicio',
      `Vehículo: ${vehiculo.placa}\nKMs: ${kilometraje}\nComponentes: ${detalles.length}\n\n¿Desea guardar este servicio?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Guardar Servicio', 
          onPress: async () => {
            try {
              setLoading(true);
              const payload: CreateInterventionDTO = {
                vehiculoId: vehiculo.id,
                kilometrajeOdometro: Number(kilometraje),
                diagnostico,
                severidad,
                manoDeObra: Number(manoDeObra) || 0,
                detalles: detalles.length > 0 ? detalles : undefined,
              };

              await InterventionService.registrarIntervencion(payload);
              Alert.alert('Éxito', 'Servicio registrado exitosamente.');
              // Redirigir al historial del vehículo
              navigation.goBack(); 
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Ocurrió un error al guardar.');
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* SECCIÓN 1: Información del Vehículo */}
      <View style={styles.card}>
        <Text style={styles.title}>Datos del Vehículo</Text>
        {vehiculo ? (
          <Text style={styles.infoText}>
            {vehiculo.marca} {vehiculo.modelo} - Placa: {vehiculo.placa}{'\n'}
            Último kilometraje: <Text style={{fontWeight: 'bold'}}>{vehiculo.kilometrajeActual} km</Text>
          </Text>
        ) : (
          <Text style={styles.errorText}>No hay vehículo seleccionado. Escanee un QR para empezar.</Text>
        )}
      </View>

      {/* SECCIÓN 2: Datos del Servicio */}
      <View style={styles.card}>
        <Text style={styles.title}>Datos del Servicio</Text>
        
        <Text style={styles.label}>Kilometraje Actual *</Text>
        <TextInput
          style={[styles.input, errorKilometraje ? styles.inputError : null]}
          keyboardType="numeric"
          value={kilometraje}
          onChangeText={handleKilometrajeChange}
          placeholder="Ingrese KMs actuales"
        />
        {errorKilometraje ? <Text style={styles.errorText}>{errorKilometraje}</Text> : null}

        <Text style={styles.label}>Descripción / Diagnóstico *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={diagnostico}
          onChangeText={setDiagnostico}
          placeholder="Describa el trabajo realizado..."
        />

        <Text style={styles.label}>Costo Mano de Obra ($)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={manoDeObra}
          onChangeText={setManoDeObra}
          placeholder="Ej: 50.00"
        />
      </View>

      {/* SECCIÓN 3: Componentes Instalados */}
      <View style={styles.card}>
        <Text style={styles.title}>Componentes Instalados</Text>
        {detalles.map((detalle, index) => (
          <View key={index} style={styles.componentItem}>
            <Text style={styles.label}>Nombre del componente</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Filtro de Aceite"
              value={detalle.componenteReemplazado}
              onChangeText={(text) => actualizarComponente(index, 'componenteReemplazado', text)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.secondaryButton} onPress={agregarComponente}>
          <Text style={styles.secondaryButtonText}>+ Agregar Componente</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN 4: Botón Final */}
      <TouchableOpacity 
        style={[styles.primaryButton, (loading || !vehiculo) ? styles.disabledButton : null]} 
        onPress={handleGuardar}
        disabled={loading || !vehiculo}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Guardando...' : 'Guardar Servicio'}
        </Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// --- ESTILOS DE LA PANTALLA ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 6, marginTop: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, backgroundColor: '#F9FAFB', color: '#1F2937' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  textArea: { height: 90, textAlignVertical: 'top' },
  infoText: { fontSize: 16, color: '#10B981', fontWeight: '500', lineHeight: 24 },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 4 },
  componentItem: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#F9FAFB' },
  primaryButton: { backgroundColor: '#2563EB', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  secondaryButtonText: { color: '#374151', fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 }
});