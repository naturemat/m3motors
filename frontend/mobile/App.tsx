/**
 * M3Motors Mobile
 * React Native App
 */

import React, {useEffect} from 'react';
import {NewAppScreen} from '@react-native/new-app-screen';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import OneSignal from 'react-native-onesignal';
import Config from 'react-native-config';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize OneSignal
    OneSignal.initialize(Config.ONESIGNAL_APP_ID);

    // Request permission for notifications
    OneSignal.Notifications.requestPermission(true);

    // Listen for notification clicks
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('OneSignal: notification clicked:', event);
    });

    // Listen for notifications in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      console.log('OneSignal: notification will display:', event);
      event.getNotification().display();
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
