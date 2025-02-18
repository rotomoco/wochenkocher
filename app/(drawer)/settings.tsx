import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#999999' : '#666666',
      marginLeft: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333333' : '#eeeeee',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowText: {
      fontSize: 16,
      marginLeft: 12,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    logoutButton: {
      margin: 16,
      padding: 16,
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      alignItems: 'center',
    },
    logoutText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allgemein</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon" size={22} color={isDarkMode ? '#ffffff' : '#666666'} />
            <Text style={styles.rowText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            ios_backgroundColor="#cccccc"
            trackColor={{ false: '#cccccc', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications" size={22} color={isDarkMode ? '#ffffff' : '#666666'} />
            <Text style={styles.rowText}>Benachrichtigungen</Text>
          </View>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={setIsNotificationsEnabled}
            ios_backgroundColor="#cccccc"
            trackColor={{ false: '#cccccc', true: '#81b0ff' }}
            thumbColor={isNotificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="person" size={22} color={isDarkMode ? '#ffffff' : '#666666'} />
            <Text style={styles.rowText}>Persönliche Daten</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={isDarkMode ? '#666666' : '#cccccc'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="lock-closed" size={22} color={isDarkMode ? '#ffffff' : '#666666'} />
            <Text style={styles.rowText}>Sicherheit</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={isDarkMode ? '#666666' : '#cccccc'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>
    </View>
  );
}