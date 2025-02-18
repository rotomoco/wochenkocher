import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !segments.includes('auth')) {
        router.replace('/auth/login');
      } else if (session && segments.includes('auth')) {
        router.replace('/(drawer)');
      }
    });
  }, [segments]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="auth" />
      </Stack>
    </ThemeProvider>
  );
}