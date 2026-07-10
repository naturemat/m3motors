import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSignIn} from '@clerk/clerk-expo';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Input, Button} from '../../components/atoms';
import {AuthStackParamList} from '../../navigation/types';
import {colors} from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPassword() {
  const navigation = useNavigation<Nav>();
  const {signIn, isLoaded} = useSignIn();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electronico');
      return;
    }

    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        identifier: email,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || 'Error al enviar el correo de recuperacion',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✉️</Text>
          </View>
          <Text style={styles.successTitle}>Correo enviado</Text>
          <Text style={styles.successText}>
            Revisa tu bandeja de entrada y sigue las instrucciones para
            restablecer tu contrasena.
          </Text>
          <Button
            title="Volver al login"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar contrasena</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electronico y te enviaremos un enlace para
              restablecer tu contrasena.
            </Text>
          </View>

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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Enviar correo de recuperacion"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleResetPassword}
              loading={isLoading}
            />

            <Button
              title="Volver al login"
              variant="ghost"
              size="medium"
              fullWidth
              onPress={() => navigation.goBack()}
            />
          </View>
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
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error[500],
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
