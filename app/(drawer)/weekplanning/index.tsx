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
import { router } from 'expo-router';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { getRandomDishes, updateWeeklyPlan, supabase } from '@/app/lib/supabase';
import { DishWithIngredients } from '@/app/types/database';

const PRIMARY_COLOR = '#4CAF50';

type WeekDay = {
  date: Date;
  dish?: DishWithIngredients | null;
};

export default function WeekplanningView() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    loadWeekPlan();
  }, [selectedWeek]);

  async function loadWeekPlan() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => ({
        date: addDays(weekStart, i),
        dish: null,
      }));

      const { data: weeklyPlan, error } = await supabase
        .from('weekly_plan')
        .select(`
          date,
          dishes (
            id,
            name,
            image_url,
            dish_ingredients (
              amount,
              unit,
              ingredient:ingredients (
                name
              )
            )
          )
        `)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(addDays(weekStart, 6), 'yyyy-MM-dd'))
        .eq('user_id', user.id);

      if (error) throw error;

      weeklyPlan.forEach((plan) => {
        const dayIndex = days.findIndex(
          (d) => format(d.date, 'yyyy-MM-dd') === plan.date
        );
        if (dayIndex !== -1 && plan.dishes) {
          days[dayIndex].dish = plan.dishes;
        }
      });

      setWeekDays(days);
    } catch (error) {
      console.error('Fehler beim Laden des Wochenplans:', error);
      Alert.alert('Fehler', 'Der Wochenplan konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  async function generateRandomMeals() {
    try {
      setGeneratingPlan(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      const randomDishes = await getRandomDishes(7);
      
      for (let i = 0; i < weekDays.length; i++) {
        if (randomDishes[i]) {
          await updateWeeklyPlan(weekDays[i].date, randomDishes[i].id, user.id);
        }
      }

      await loadWeekPlan();
    } catch (error) {
      console.error('Fehler beim Generieren des Plans:', error);
      Alert.alert('Fehler', 'Der Plan konnte nicht generiert werden.');
    } finally {
      setGeneratingPlan(false);
    }
  }

  function navigateWeek(direction: 'next' | 'prev') {
    const newDate = direction === 'next'
      ? addWeeks(selectedWeek, 1)
      : subWeeks(selectedWeek, 1);
    setSelectedWeek(newDate);
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.weekNavButton} 
          onPress={() => navigateWeek('prev')}>
          <Ionicons name="chevron-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>
            Kalenderwoche {format(selectedWeek, 'w')}
          </Text>
          <Text style={styles.weekDates}>
            {format(weekDays[0]?.date, 'd. MMMM', { locale: de })} - {' '}
            {format(weekDays[6]?.date, 'd. MMMM yyyy', { locale: de })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.weekNavButton} 
          onPress={() => navigateWeek('next')}>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.randomButton,
          generatingPlan && styles.randomButtonDisabled
        ]}
        onPress={generateRandomMeals}
        disabled={generatingPlan}>
        {generatingPlan ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="shuffle" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Zufällige Woche generieren</Text>
          </>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayCard}
            onPress={() => router.push('/gerichte')}>
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayName}>
                  {format(day.date, 'EEEE', { locale: de })}
                </Text>
                <Text style={styles.dayDate}>
                  {format(day.date, 'd. MMMM', { locale: de })}
                </Text>
              </View>
              {day.dish && (
                <TouchableOpacity
                  style={styles.dishDetailButton}
                  onPress={() => router.push(`/dish/${day.dish?.id}`)}>
                  <Ionicons name="information-circle-outline" size={24} color={PRIMARY_COLOR} />
                </TouchableOpacity>
              )}
            </View>

            {day.dish ? (
              <View style={styles.dishContainer}>
                {day.dish.image_url ? (
                  <Image
                    source={{ uri: day.dish.image_url }}
                    style={styles.dishImage}
                  />
                ) : (
                  <View style={styles.dishImagePlaceholder}>
                    <Ionicons name="restaurant" size={32} color="#666" />
                  </View>
                )}
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{day.dish.name}</Text>
                  <Text style={styles.ingredientCount}>
                    {day.dish.dish_ingredients?.length || 0} Zutaten
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyDish}>
                <Ionicons name="add-circle-outline" size={32} color={PRIMARY_COLOR} />
                <Text style={styles.emptyText}>Gericht hinzufügen</Text>
              </View>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekNavButton: {
    padding: 8,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  weekDates: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  randomButton: {
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
  randomButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  dayDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dishDetailButton: {
    padding: 8,
  },
  dishContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
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
  emptyDish: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
});