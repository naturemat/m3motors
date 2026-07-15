import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ClerkProvider, useAuth, useUser} from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import {RootNavigator} from './src/navigation';
import {useAuthStore} from './src/store/authStore';
import {LoadingSpinner} from './src/components/atoms';
import {authService} from './src/services/auth';
import {UserRole} from './src/types';

// Workaround for react-native-web CSS parsing issue with pseudo-elements
if (Platform.OS === 'web') {
  const originalInsertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    try {
      return originalInsertRule.call(this, rule, index);
    } catch {
      return index ?? 0;
    }
  };
}

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
  const {user: clerkUser} = useUser();
  const {setUser, setLoading} = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (isSignedIn && clerkUser) {
      setLoading(true);

      // Get role from Clerk publicMetadata first, fallback to API
      const clerkRole = clerkUser.publicMetadata?.role as UserRole | undefined;

      authService
        .getMe()
        .then(userData => {
          setUser({
            id: String(userData.id),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: clerkRole || userData.role || 'client',
          });
        })
        .catch(() => {
          // If API fails, use Clerk metadata or default to client
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            role: clerkRole || 'client',
          });
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser, setUser, setLoading]);

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