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
      ai_practice_plans: {
        Row: {
          created_at: string
          diagnosis: string
          id: string
          practice_plan: Json
          problem: string
          recommended_drills: Json
          root_causes: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis: string
          id?: string
          practice_plan: Json
          problem: string
          recommended_drills: Json
          root_causes: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string
          id?: string
          practice_plan?: Json
          problem?: string
          recommended_drills?: Json
          root_causes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          count: number
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          commonmistake1: string | null
          commonmistake2: string | null
          commonmistake3: string | null
          created_at: string
          description: string
          difficulty: string
          Focus: string | null
          id: string
          instruction1: string | null
          instruction2: string | null
          instruction3: string | null
          metric: string
          metrics: string[] | null
          protip: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          commonmistake1?: string | null
          commonmistake2?: string | null
          commonmistake3?: string | null
          created_at?: string
          description: string
          difficulty: string
          Focus?: string | null
          id?: string
          instruction1?: string | null
          instruction2?: string | null
          instruction3?: string | null
          metric?: string
          metrics?: string[] | null
          protip?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          commonmistake1?: string | null
          commonmistake2?: string | null
          commonmistake3?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          Focus?: string | null
          id?: string
          instruction1?: string | null
          instruction2?: string | null
          instruction3?: string | null
          metric?: string
          metrics?: string[] | null
          protip?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_edit_history: {
        Row: {
          changes: Json | null
          course_id: string | null
          edited_at: string | null
          edited_by: string | null
          id: string
          previous_state: Json | null
        }
        Insert: {
          changes?: Json | null
          course_id?: string | null
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          previous_state?: Json | null
        }
        Update: {
          changes?: Json | null
          course_id?: string | null
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          previous_state?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "course_edit_history_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_holes: {
        Row: {
          course_id: string | null
          created_at: string | null
          distance_yards: number | null
          hole_number: number
          id: string
          last_updated: string | null
          par: number
          tee_distances: Json | null
          updated_by: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          distance_yards?: number | null
          hole_number: number
          id?: string
          last_updated?: string | null
          par: number
          tee_distances?: Json | null
          updated_by?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          distance_yards?: number | null
          hole_number?: number
          id?: string
          last_updated?: string | null
          par?: number
          tee_distances?: Json | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_holes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tees: {
        Row: {
          color: string | null
          course_id: string | null
          course_rating: number | null
          created_at: string | null
          id: string
          name: string
          slope_rating: number | null
          total_yards: number | null
        }
        Insert: {
          color?: string | null
          course_id?: string | null
          course_rating?: number | null
          created_at?: string | null
          id?: string
          name: string
          slope_rating?: number | null
          total_yards?: number | null
        }
        Update: {
          color?: string | null
          course_id?: string | null
          course_rating?: number | null
          created_at?: string | null
          id?: string
          name?: string
          slope_rating?: number | null
          total_yards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_tees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      drills: {
        Row: {
          category: string | null
          common_mistake1: string | null
          common_mistake2: string | null
          common_mistake3: string | null
          common_mistake4: string | null
          common_mistake5: string | null
          created_at: string | null
          difficulty: string | null
          duration: string | null
          focus: string[] | null
          id: string
          instruction1: string | null
          instruction2: string | null
          instruction3: string | null
          instruction4: string | null
          instruction5: string | null
          instructions: string | null
          overview: string | null
          pro_tip: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          common_mistake1?: string | null
          common_mistake2?: string | null
          common_mistake3?: string | null
          common_mistake4?: string | null
          common_mistake5?: string | null
          created_at?: string | null
          difficulty?: string | null
          duration?: string | null
          focus?: string[] | null
          id?: string
          instruction1?: string | null
          instruction2?: string | null
          instruction3?: string | null
          instruction4?: string | null
          instruction5?: string | null
          instructions?: string | null
          overview?: string | null
          pro_tip?: string | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          common_mistake1?: string | null
          common_mistake2?: string | null
          common_mistake3?: string | null
          common_mistake4?: string | null
          common_mistake5?: string | null
          created_at?: string | null
          difficulty?: string | null
          duration?: string | null
          focus?: string[] | null
          id?: string
          instruction1?: string | null
          instruction2?: string | null
          instruction3?: string | null
          instruction4?: string | null
          instruction5?: string | null
          instructions?: string | null
          overview?: string | null
          pro_tip?: string | null
          title?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      golf_courses: {
        Row: {
          city: string
          course_rating: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          last_verified_at: string | null
          name: string
          slope_rating: number | null
          state: string
          total_par: number | null
          verified_by: string | null
        }
        Insert: {
          city: string
          course_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          name: string
          slope_rating?: number | null
          state: string
          total_par?: number | null
          verified_by?: string | null
        }
        Update: {
          city?: string
          course_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          name?: string
          slope_rating?: number | null
          state?: string
          total_par?: number | null
          verified_by?: string | null
        }
        Relationships: []
      }
      hole_scores: {
        Row: {
          created_at: string | null
          fairway_hit: boolean | null
          green_in_regulation: boolean | null
          hole_number: number
          id: string
          notes: string | null
          putts: number | null
          round_id: string | null
          score: number
        }
        Insert: {
          created_at?: string | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number: number
          id?: string
          notes?: string | null
          putts?: number | null
          round_id?: string | null
          score: number
        }
        Update: {
          created_at?: string | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number?: number
          id?: string
          notes?: string | null
          putts?: number | null
          round_id?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "hole_scores_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          ai_insights: boolean | null
          created_at: string | null
          id: string
          practice_reminders: boolean | null
          round_completion_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: boolean | null
          created_at?: string | null
          id?: string
          practice_reminders?: boolean | null
          round_completion_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: boolean | null
          created_at?: string | null
          id?: string
          practice_reminders?: boolean | null
          round_completion_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number
          focus_area: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          duration_minutes: number
          focus_area: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number
          focus_area?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          goals: string | null
          handicap_goal: number | null
          handicap_level: string | null
          has_onboarded: boolean | null
          id: string
          last_name: string | null
          score_goal: number | null
          selected_goals: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          goals?: string | null
          handicap_goal?: number | null
          handicap_level?: string | null
          has_onboarded?: boolean | null
          id: string
          last_name?: string | null
          score_goal?: number | null
          selected_goals?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          goals?: string | null
          handicap_goal?: number | null
          handicap_level?: string | null
          has_onboarded?: boolean | null
          id?: string
          last_name?: string | null
          score_goal?: number | null
          selected_goals?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_keys: Json
          created_at: string | null
          endpoint: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_keys: Json
          created_at?: string | null
          endpoint: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_keys?: Json
          created_at?: string | null
          endpoint?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          course_id: string | null
          created_at: string | null
          date: string
          fairways_hit: number | null
          greens_in_regulation: number | null
          hole_count: number | null
          id: string
          notes: string | null
          tee_id: string | null
          total_putts: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date?: string
          fairways_hit?: number | null
          greens_in_regulation?: number | null
          hole_count?: number | null
          id?: string
          notes?: string | null
          tee_id?: string | null
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date?: string
          fairways_hit?: number | null
          greens_in_regulation?: number | null
          hole_count?: number | null
          id?: string
          notes?: string | null
          tee_id?: string | null
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean
          subscription_end: string | null
          subscription_start: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          best_score: string | null
          challenge_id: string
          created_at: string
          id: string
          progress: number
          recent_score: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: string | null
          challenge_id: string
          created_at?: string
          id?: string
          progress?: number
          recent_score?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: string | null
          challenge_id?: string
          created_at?: string
          id?: string
          progress?: number
          recent_score?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_handicap: {
        Args: { user_uuid: string }
        Returns: number
      }
      has_premium_access: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
