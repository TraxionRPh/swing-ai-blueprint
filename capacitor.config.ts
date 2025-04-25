
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4d696576782241e1857f0009ded09f4e',
  appName: 'ChipAway',
  webDir: 'dist',
  server: {
    url: 'https://4d696576-7822-41e1-857f-0009ded09f4e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
