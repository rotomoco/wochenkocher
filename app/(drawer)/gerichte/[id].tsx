import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDishWithIngredients } from '@/app/lib/supabase';
import { DishWithIngredients } from '@/app/types/database';

const PRIMARY_COLOR = '#4CAF50';

export default function DishDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dish, setDish] = useState<DishWithIngredients | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadDish();
  }, [id]);

  useEffect(() => {
    // Update the header title when the dish is loaded
    if (dish) {
      navigation.setOptions({
        headerTitle: dish.name,
      });
    }
  }, [dish, navigation]);

  async function loadDish() {
    try {
      setLoading(true);
      const dishData = await getDishWithIngredients(id);
      setDish(dishData);
    } catch (error) {
      console.error('Fehler beim Laden des Gerichts:', error);
      Alert.alert('Fehler', 'Das Gericht konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    if (dish) {
      router.push({
        pathname: '/(drawer)/gerichte/neu',
        params: { editDishId: dish.id }
      });
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#666" />
        <Text style={styles.errorText}>Gericht nicht gefunden</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{dish.name}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}>
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text style={styles.editButtonText}>Bearbeiten</Text>
        </TouchableOpacity>
      </View>

      {dish.image_url ? (
        <Image source={{ uri: dish.image_url }} style={styles.dishImage} />
      ) : (
        <View style={styles.dishImagePlaceholder}>
          <Ionicons name="restaurant" size={64} color="#666" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zutaten</Text>
          {dish.dish_ingredients?.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </Text>
              <Text style={styles.ingredientName}>
                {ingredient.ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        {dish.recipe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zubereitung</Text>
            <Text style={styles.recipeText}>{dish.recipe}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  dishImage: {
    width: '100%',
    height: 250,
  },
  dishImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: PRIMARY_COLOR,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ingredientAmount: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
  },
  recipeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});