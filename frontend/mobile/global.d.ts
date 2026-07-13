declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_ONESIGNAL_APP_ID?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
