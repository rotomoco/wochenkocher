import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyShoppingList, supabase } from '../lib/supabase';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

const PRIMARY_COLOR = '#4CAF50';

type ShoppingItem = {
  name: string;
  amount: number;
  unit: string;
  isCustom?: boolean;
  isChecked?: boolean;
  category?: string;
};

type GroupedItems = {
  [key: string]: ShoppingItem[];
};

export default function EinkaufslisteView() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadShoppingList();
    }
  }, [userId, weekStart]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  async function loadShoppingList() {
    if (!userId) return;

    try {
      setLoading(true);
      const weeklyPlan = await getWeeklyShoppingList(weekStart, userId);
      
      // Zusammenfassen der Zutaten
      const combinedItems: { [key: string]: ShoppingItem } = {};
      
      weeklyPlan.forEach((day) => {
        day.dish?.dish_ingredients?.forEach((di) => {
          const ingredientName = di.ingredient.name;
          const key = `${ingredientName}-${di.unit}`;
          
          if (combinedItems[key]) {
            combinedItems[key].amount += di.amount;
          } else {
            combinedItems[key] = {
              name: ingredientName,
              amount: di.amount,
              unit: di.unit,
              isChecked: false,
              category: categorizeIngredient(ingredientName),
            };
          }
        });
      });

      setItems(Object.values(combinedItems));
    } catch (error) {
      console.error('Fehler beim Laden der Einkaufsliste:', error);
      Alert.alert('Fehler', 'Die Einkaufsliste konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  function categorizeIngredient(name: string): string {
    // Einfache Kategorisierung basierend auf Schlüsselwörtern
    const categories = {
      'Obst & Gemüse': ['apfel', 'banane', 'karotte', 'salat', 'tomate'],
      'Fleisch & Fisch': ['fleisch', 'huhn', 'fisch', 'lachs'],
      'Milchprodukte': ['milch', 'käse', 'joghurt', 'sahne'],
      'Gewürze': ['salz', 'pfeffer', 'gewürz'],
      'Grundnahrungsmittel': ['mehl', 'zucker', 'reis', 'nudel'],
    };

    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    return 'Sonstiges';
  }

  function toggleItemCheck(index: number) {
    setItems(currentItems => {
      const newItems = [...currentItems];
      newItems[index] = {
        ...newItems[index],
        isChecked: !newItems[index].isChecked,
      };
      return newItems;
    });
  }

  function updateItemAmount(index: number, increment: boolean) {
    setItems((currentItems) => {
      const newItems = [...currentItems];
      const item = newItems[index];
      const step = item.unit === 'Stk' ? 1 : 0.5;
      newItems[index] = {
        ...item,
        amount: increment ? item.amount + step : Math.max(0, item.amount - step),
      };
      return newItems;
    });
  }

  function addCustomItem() {
    if (!newItemName.trim()) return;

    setItems((currentItems) => [
      ...currentItems,
      {
        name: newItemName.trim(),
        amount: 1,
        unit: 'Stk',
        isCustom: true,
        isChecked: false,
        category: categorizeIngredient(newItemName),
      },
    ]);
    setNewItemName('');
  }

  async function shareList() {
    try {
      const groupedItems = items.reduce((groups: GroupedItems, item) => {
        const category = item.category || 'Sonstiges';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {});

      let listText = `Einkaufsliste für ${format(weekStart, 'd. MMMM yyyy', { locale: de })}:\n\n`;
      
      Object.entries(groupedItems).forEach(([category, categoryItems]) => {
        listText += `${category}:\n`;
        categoryItems.forEach(item => {
          listText += `□ ${item.amount} ${item.unit} ${item.name}\n`;
        });
        listText += '\n';
      });
      
      await Share.share({
        message: listText,
        title: 'Meine Einkaufsliste',
      });
    } catch (error) {
      console.error('Fehler beim Teilen der Liste:', error);
      Alert.alert('Fehler', 'Die Liste konnte nicht geteilt werden.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  // Gruppiere Items nach Kategorie
  const groupedItems = items.reduce((groups: GroupedItems, item) => {
    const category = item.category || 'Sonstiges';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Einkaufsliste</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            style={styles.headerButton}>
            <Ionicons name="today-outline" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareList} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekInfo}>
        <Text style={styles.weekInfoText}>
          {format(weekStart, 'd. MMMM', { locale: de })} - {' '}
          {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'd. MMMM yyyy', { locale: de })}
        </Text>
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Neue Zutat hinzufügen"
          onSubmitEditing={addCustomItem}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addCustomItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {categoryItems.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.item}>
                <TouchableOpacity
                  style={styles.checkBox}
                  onPress={() => toggleItemCheck(items.indexOf(item))}>
                  <Ionicons
                    name={item.isChecked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={PRIMARY_COLOR}
                  />
                </TouchableOpacity>
                <View style={styles.itemInfo}>
                  <Text style={[
                    styles.itemName,
                    item.isChecked && styles.itemNameChecked
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemAmount}>
                    {item.amount} {item.unit}
                  </Text>
                </View>
                <View style={styles.itemControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateItemAmount(items.indexOf(item), false)}>
                    <Text style={styles.controlButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateItemAmount(items.indexOf(item), true)}>
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  weekInfo: {
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekInfoText: {
    fontSize: 14,
    color: '#666',
  },
  addItemContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkBox: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemAmount: {
    fontSize: 14,
    color: '#666',
  },
  itemControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  controlButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
});