import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSignIn} from '@clerk/clerk-expo';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Input, Button} from '../../components/atoms';
import {AuthStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<Nav>();
  const {signIn, setActive, isLoaded} = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }

    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({session: result.createdSessionId});
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>M3</Text>
            </View>
          </View>

          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>Inicia sesion en tu cuenta</Text>

          <View style={styles.form}>
            <Input
              label="Correo electronico"
              placeholder="ejemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Contrasena"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              }
            />

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>
                  Olvidaste tu contrasena?
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Iniciar Sesion"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleLogin}
              loading={isLoading}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.footerText}>
            No tienes cuenta? Contacta a tu taller
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary[500],
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    color: colors.error[500],
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
