
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import type { Database } from './types';

const SUPABASE_URL = "https://xocrhthipvspkndtkxeq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3JodGhpcHZzcGtuZHRreGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDA2NjMsImV4cCI6MjA2MTExNjY2M30.cCOciDoQwK84AJYqSQJ92TQWs_jj0vf0VsWPsPEabI8";

// Create Supabase client with AsyncStorage for React Native
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
