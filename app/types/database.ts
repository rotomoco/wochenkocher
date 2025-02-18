export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dishes: {
        Row: {
          id: string
          name: string
          recipe: string | null
          image_url: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          recipe?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          recipe?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      dish_ingredients: {
        Row: {
          id: string
          dish_id: string
          ingredient_id: string
          amount: number
          unit: 'g' | 'kg' | 'Stk' | 'TL' | 'EL' | 'l'
        }
        Insert: {
          id?: string
          dish_id: string
          ingredient_id: string
          amount: number
          unit: 'g' | 'kg' | 'Stk' | 'TL' | 'EL' | 'l'
        }
        Update: {
          id?: string
          dish_id?: string
          ingredient_id?: string
          amount?: number
          unit?: 'g' | 'kg' | 'Stk' | 'TL' | 'EL' | 'l'
        }
      }
      weekly_plan: {
        Row: {
          id: string
          date: string
          dish_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          dish_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          dish_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Dish = Database['public']['Tables']['dishes']['Row']
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type DishIngredient = Database['public']['Tables']['dish_ingredients']['Row']
export type WeeklyPlan = Database['public']['Tables']['weekly_plan']['Row']

export type DishWithIngredients = Dish & {
  dish_ingredients?: (DishIngredient & {
    ingredient: Ingredient;
  })[];
}