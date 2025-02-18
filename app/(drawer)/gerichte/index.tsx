import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllDishes, updateWeeklyPlan, supabase } from '@/app/lib/supabase';
import { DishWithIngredients } from '@/app/types/database';

const PRIMARY_COLOR = '#4CAF50';

export default function GerichteView() {
  const params = useLocalSearchParams();
  const isSelectMode = params.selectMode === 'true';
  const selectedDate = params.date as string;
  const dayName = params.dayName as string;
  
  const [dishes, setDishes] = useState<DishWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDishes();
  }, []);

  async function loadDishes() {
    try {
      setLoading(true);
      const dishes = await getAllDishes();
      setDishes(dishes);
    } catch (error) {
      console.error('Fehler beim Laden der Gerichte:', error);
      Alert.alert('Fehler', 'Die Gerichte konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDishSelect(dishId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      await updateWeeklyPlan(new Date(selectedDate), dishId, user.id);
      router.back();
    } catch (error) {
      console.error('Fehler beim Auswählen des Gerichts:', error);
      Alert.alert('Fehler', 'Das Gericht konnte nicht ausgewählt werden.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isSelectMode && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionTitle}>
            Gericht auswählen für {dayName}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(drawer)/gerichte/neu')}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Neues Gericht</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {dishes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>Keine Gerichte vorhanden</Text>
            <Text style={styles.emptyStateText}>
              Füge dein erstes Gericht hinzu, um loszulegen
            </Text>
          </View>
        ) : (
          dishes.map((dish) => (
            <TouchableOpacity
              key={dish.id}
              style={styles.dishCard}
              onPress={() => isSelectMode 
                ? handleDishSelect(dish.id)
                : router.push(`/(drawer)/gerichte/${dish.id}`)
              }>
              {dish.image_url ? (
                <Image source={{ uri: dish.image_url }} style={styles.dishImage} />
              ) : (
                <View style={styles.dishImagePlaceholder}>
                  <Ionicons name="restaurant" size={32} color="#666" />
                </View>
              )}
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.ingredientCount}>
                  {dish.dish_ingredients?.length || 0} Zutaten
                </Text>
              </View>
              <Ionicons 
                name={isSelectMode ? "add-circle-outline" : "chevron-forward"} 
                size={24} 
                color="#ccc" 
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  dishImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  ingredientCount: {
    fontSize: 14,
    color: '#666',
  },
});