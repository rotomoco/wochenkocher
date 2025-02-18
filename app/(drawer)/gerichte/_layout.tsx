import { Stack } from 'expo-router';

export default function GerichteLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="neu"
        options={{
          title: 'Neues Gericht',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitle: '',  // We'll set this dynamically in the screen component
        }}
      />
    </Stack>
  );
}