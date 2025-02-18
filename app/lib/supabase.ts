import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Hilfsfunktion zum Generieren der öffentlichen URL für Bilder
export function getPublicImageUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('dish-images')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadDishImage(uri: string): Promise<string> {
  try {
    // Generiere einen eindeutigen Dateinamen
    const fileExt = uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Konvertiere das Bild in einen Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload zur Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('dish-images')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Hole die öffentliche URL des hochgeladenen Bildes
    return getPublicImageUrl(filePath);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Rest der Datei bleibt unverändert...