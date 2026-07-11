import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@clerk/clerk-expo';
import {AppBar, BottomNav} from '../../components/molecules';
import {Input, Button} from '../../components/atoms';
import {ClientStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList, 'ClientProfile'>;

export default function ClientProfile() {
  const navigation = useNavigation<Nav>();
  const {signOut} = useAuth();
  const [name, setName] = useState('Carlos Perez');
  const [phone, setPhone] = useState('+593 99 123 4567');
  const [email, setEmail] = useState('carlos@email.com');
  const [isLoading, setIsLoading] = useState(false);

  const userInitials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise<void>(r => setTimeout(r, 1000));
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Mi Perfil" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
          />
          <Input
            label="Telefono"
            value={phone}
            onChangeText={setPhone}
            placeholder="Tu telefono"
            keyboardType="phone-pad"
          />
          <Input
            label="Correo electronico"
            value={email}
            onChangeText={setEmail}
            placeholder="Tu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Guardar Cambios"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSave}
            loading={isLoading}
          />
          <Button
            title="Cerrar Sesion"
            variant="danger"
            size="large"
            fullWidth
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      <BottomNav
        active="perfil"
        items={[
          {key: 'inicio', label: 'Inicio', icon: 'home'},
          {key: 'historial', label: 'Historial', icon: 'file-text'},
          {key: 'qr', label: 'QR', icon: 'qrcode'},
          {key: 'perfil', label: 'Perfil', icon: 'user'},
        ]}
        onPress={key => {
          if (key === 'inicio') navigation.navigate('ClientDashboard');
          else if (key === 'historial') navigation.navigate('ClientHistory');
          else if (key === 'qr') navigation.navigate('ClientQR');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    marginTop: 8,
  },
  userEmail: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  actions: {
    gap: 8,
  },
});
