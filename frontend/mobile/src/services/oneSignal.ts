import {OneSignal} from 'react-native-onesignal';

const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '';
let initialized = false;

export function initOneSignal() {
  if (!appId || initialized) {
    return;
  }
  try {
    OneSignal.initialize(appId);
    OneSignal.Notifications.requestPermission(false);
    initialized = true;
  } catch {}
}

export function oneSignalLogin(userId: string) {
  if (!initialized) {
    return;
  }
  try {
    OneSignal.login(userId);
  } catch {}
}

export function oneSignalLogout() {
  if (!initialized) {
    return;
  }
  try {
    OneSignal.logout();
  } catch {}
}
