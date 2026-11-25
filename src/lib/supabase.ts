import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Authentication and database features are unavailable.');
}

export const supabase = createClient(
  supabaseUrl || 'https://supabase-not-configured.invalid',
  supabaseAnonKey || 'missing-supabase-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  },
);

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          xp: number;
          level: number;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          xp?: number;
          level?: number;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          xp?: number;
          level?: number;
          streak?: number;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          progress: number;
          total_modules: number;
          completed_modules: number;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          estimated_hours: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          progress?: number;
          total_modules: number;
          completed_modules?: number;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          estimated_hours: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          progress?: number;
          total_modules?: number;
          completed_modules?: number;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          estimated_hours?: number;
          rating?: number;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          duration_minutes: number;
          xp_earned: number;
          mode: 'focus' | 'break';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration_minutes: number;
          xp_earned: number;
          mode: 'focus' | 'break';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration_minutes?: number;
          xp_earned?: number;
          mode?: 'focus' | 'break';
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          summary: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          summary?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          file_url?: string | null;
          updated_at?: string;
        };
      };
      roadmaps: {
        Row: {
          id: string;
          user_id: string;
          goal: string;
          milestones: any; // JSON array
          progress_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal: string;
          milestones: any;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal?: string;
          milestones?: any;
          progress_percentage?: number;
          updated_at?: string;
        };
      };
    };
  };
};

