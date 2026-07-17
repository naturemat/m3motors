import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m3motors.mobile',
  appName: 'M3Motors',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    OneSignal: {
      appId: process.env.ONESIGNAL_APP_ID ?? '',
    },
  },
};

export default config;
