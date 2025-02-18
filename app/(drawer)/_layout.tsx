import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#4CAF50';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: PRIMARY_COLOR,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: PRIMARY_COLOR,
        drawerStyle: {
          backgroundColor: '#fff',
        },
        drawerLabelStyle: {
          marginLeft: -16,
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Übersicht',
          title: 'Wochenkocher',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="gerichte"
        options={{
          drawerLabel: 'Gerichte',
          title: 'Meine Gerichte',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="wochenplan"
        options={{
          drawerLabel: 'Wochenplan',
          title: 'Mein Wochenplan',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="einkaufsliste"
        options={{
          drawerLabel: 'Einkaufsliste',
          title: 'Meine Einkaufsliste',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="einstellungen"
        options={{
          drawerLabel: 'Einstellungen',
          title: 'Einstellungen',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}