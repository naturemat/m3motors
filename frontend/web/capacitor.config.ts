import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m3motors.app',
  appName: 'M3Motors',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://m3motors.me',
    cleartext: false,
  },
  plugins: {
    Camera: {
      permissions: ['camera'],
    },
  },
};

export default config;
