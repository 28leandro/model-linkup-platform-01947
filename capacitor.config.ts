import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d4a8abe9191348aea76f96767755072e',
  appName: 'NEO',
  webDir: 'dist',
  server: {
    url: 'https://d4a8abe9-1913-48ae-a76f-96767755072e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
