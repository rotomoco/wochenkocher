export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          unit: string
        }
        Insert: {
          id?: string
          dish_id: string
          ingredient_id: string
          amount: number
          unit: string
        }
        Update: {
          id?: string
          dish_id?: string
          ingredient_id?: string
          amount?: number
          unit?: string
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