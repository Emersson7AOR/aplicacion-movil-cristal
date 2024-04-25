import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'progomex-app',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    "allowNavigation": ["blob:"]

  }
};

export default config;
