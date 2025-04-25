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
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          id: string
          metrics: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          id?: string
          metrics: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          metrics?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_holes: {
        Row: {
          course_id: string | null
          created_at: string | null
          distance_yards: number | null
          hole_number: number
          id: string
          par: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          distance_yards?: number | null
          hole_number: number
          id?: string
          par: number
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          distance_yards?: number | null
          hole_number?: number
          id?: string
          par?: number
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
      drills: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          duration: string
          focus: string[]
          id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          duration: string
          focus: string[]
          id?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration?: string
          focus?: string[]
          id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      golf_courses: {
        Row: {
          address: string | null
          course_rating: number | null
          created_at: string | null
          id: string
          name: string
          slope_rating: number | null
          total_par: number | null
        }
        Insert: {
          address?: string | null
          course_rating?: number | null
          created_at?: string | null
          id?: string
          name: string
          slope_rating?: number | null
          total_par?: number | null
        }
        Update: {
          address?: string | null
          course_rating?: number | null
          created_at?: string | null
          id?: string
          name?: string
          slope_rating?: number | null
          total_par?: number | null
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
      profiles: {
        Row: {
          created_at: string | null
          goals: string | null
          handicap_level: string | null
          has_onboarded: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goals?: string | null
          handicap_level?: string | null
          has_onboarded?: boolean | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goals?: string | null
          handicap_level?: string | null
          has_onboarded?: boolean | null
          id?: string
          updated_at?: string | null
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
          id: string
          notes: string | null
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
          id?: string
          notes?: string | null
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
          id?: string
          notes?: string | null
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
        ]
      }
      user_challenge_progress: {
        Row: {
          best_score: string | null
          challenge_id: string
          created_at: string
          id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: string | null
          challenge_id: string
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: string | null
          challenge_id?: string
          created_at?: string
          id?: string
          progress?: number
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
      [_ in never]: never
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
