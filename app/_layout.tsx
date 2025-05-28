import { Stack } from 'expo-router';
import { ToastProvider } from '@/components/ui/toast';
import 'react-native-url-polyfill/auto';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="Welcome"
        />
      </ToastProvider>
    </AuthProvider>
  );
}
