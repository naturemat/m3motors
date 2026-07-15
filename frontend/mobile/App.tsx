import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ClerkProvider, useAuth} from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import {RootNavigator} from './src/navigation';
import {useAuthStore} from './src/store/authStore';
import {LoadingSpinner} from './src/components/atoms';
import {authService} from './src/services/auth';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  async deleteToken(key: string) {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch {
      return;
    }
  },
};

const clerkPubKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

function AuthLoader() {
  const {isLoaded, isSignedIn} = useAuth();
  const {setUser, setLoading} = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (isSignedIn) {
      setLoading(true);
      authService
        .getMe()
        .then(userData => {
          setUser({
            id: String(userData.id),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'client',
          });
        })
        .catch(() => {
          setUser({
            id: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'client',
          });
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, setUser, setLoading]);

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return null;
}

function AppContent() {
  const {isLoading} = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <RootNavigator />;
}

function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPubKey}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <AuthLoader />
          <AppContent />
        </NavigationContainer>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

export default App;