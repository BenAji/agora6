export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      events: {
        Row: {
          companyID: string | null
          createdAt: string | null
          description: string | null
          endDate: string | null
          eventID: string
          eventName: string
          eventType: Database["public"]["Enums"]["event_type"]
          gicsSector: string | null
          gicsSubSector: string | null
          hostCompany: string | null
          location: string | null
          startDate: string
          tickerSymbol: string | null
          updatedAt: string | null
        }
        Insert: {
          companyID?: string | null
          createdAt?: string | null
          description?: string | null
          endDate?: string | null
          eventID?: string
          eventName: string
          eventType: Database["public"]["Enums"]["event_type"]
          gicsSector?: string | null
          gicsSubSector?: string | null
          hostCompany?: string | null
          location?: string | null
          startDate: string
          tickerSymbol?: string | null
          updatedAt?: string | null
        }
        Update: {
          companyID?: string | null
          createdAt?: string | null
          description?: string | null
          endDate?: string | null
          eventID?: string
          eventName?: string
          eventType?: Database["public"]["Enums"]["event_type"]
          gicsSector?: string | null
          gicsSubSector?: string | null
          hostCompany?: string | null
          location?: string | null
          startDate?: string
          tickerSymbol?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_companyID_fkey"
            columns: ["companyID"]
            isOneToOne: false
            referencedRelation: "user_companies"
            referencedColumns: ["companyID"]
          },
          {
            foreignKeyName: "events_tickerSymbol_fkey"
            columns: ["tickerSymbol"]
            isOneToOne: false
            referencedRelation: "gics_companies"
            referencedColumns: ["tickerSymbol"]
          },
        ]
      }
      gics_companies: {
        Row: {
          companyID: string
          companyName: string
          createdAt: string | null
          gicsSector: string
          gicsSubCategory: string
          tickerSymbol: string
          updatedAt: string | null
        }
        Insert: {
          companyID?: string
          companyName: string
          createdAt?: string | null
          gicsSector: string
          gicsSubCategory: string
          tickerSymbol: string
          updatedAt?: string | null
        }
        Update: {
          companyID?: string
          companyName?: string
          createdAt?: string | null
          gicsSector?: string
          gicsSubCategory?: string
          tickerSymbol?: string
          updatedAt?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "user_companies"
            referencedColumns: ["companyID"]
          },
        ]
      }
      rsvps: {
        Row: {
          createdAt: string | null
          eventID: string | null
          rsvpID: string
          status: Database["public"]["Enums"]["rsvp_status"]
          updatedAt: string | null
          userID: string | null
        }
        Insert: {
          createdAt?: string | null
          eventID?: string | null
          rsvpID?: string
          status: Database["public"]["Enums"]["rsvp_status"]
          updatedAt?: string | null
          userID?: string | null
        }
        Update: {
          createdAt?: string | null
          eventID?: string | null
          rsvpID?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
          updatedAt?: string | null
          userID?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_eventID_fkey"
            columns: ["eventID"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["eventID"]
          },
          {
            foreignKeyName: "rsvps_userID_profiles_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          createdAt: string | null
          gicsSector: string | null
          gicsSubCategory: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subEnd: string | null
          subID: string
          subStart: string
          updatedAt: string | null
          userID: string | null
        }
        Insert: {
          createdAt?: string | null
          gicsSector?: string | null
          gicsSubCategory?: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subEnd?: string | null
          subID?: string
          subStart: string
          updatedAt?: string | null
          userID?: string | null
        }
        Update: {
          createdAt?: string | null
          gicsSector?: string | null
          gicsSubCategory?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subEnd?: string | null
          subID?: string
          subStart?: string
          updatedAt?: string | null
          userID?: string | null
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          companyID: string
          companyName: string
          createdAt: string | null
          location: string | null
          updatedAt: string | null
        }
        Insert: {
          companyID?: string
          companyName: string
          createdAt?: string | null
          location?: string | null
          updatedAt?: string | null
        }
        Update: {
          companyID?: string
          companyName?: string
          createdAt?: string | null
          location?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          enabled: boolean
          frequency_days: number
          gics_sectors: string[] | null
          companies: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          enabled?: boolean
          frequency_days?: number
          gics_sectors?: string[] | null
          companies?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          enabled?: boolean
          frequency_days?: number
          gics_sectors?: string[] | null
          companies?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_log: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          event_id: string | null
          status: string
          message: string | null
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          event_id?: string | null
          status: string
          message?: string | null
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          event_id?: string | null
          status?: string
          message?: string | null
          sent_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["eventID"]
          }
        ]
      }
      users: {
        Row: {
          companyID: string | null
          createdAt: string | null
          email: string
          end: string | null
          firstName: string
          lastName: string
          managerID: string | null
          password: string
          role: Database["public"]["Enums"]["user_role"]
          start: string | null
          updatedAt: string | null
          userID: string
          username: string
        }
        Insert: {
          companyID?: string | null
          createdAt?: string | null
          email: string
          end?: string | null
          firstName: string
          lastName: string
          managerID?: string | null
          password: string
          role: Database["public"]["Enums"]["user_role"]
          start?: string | null
          updatedAt?: string | null
          userID?: string
          username: string
        }
        Update: {
          companyID?: string | null
          createdAt?: string | null
          email?: string
          end?: string | null
          firstName?: string
          lastName?: string
          managerID?: string | null
          password?: string
          role?: Database["public"]["Enums"]["user_role"]
          start?: string | null
          updatedAt?: string | null
          userID?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_companyID_fkey"
            columns: ["companyID"]
            isOneToOne: false
            referencedRelation: "user_companies"
            referencedColumns: ["companyID"]
          },
          {
            foreignKeyName: "users_managerID_fkey"
            columns: ["managerID"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userID"]
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
      event_type:
        | "EARNINGS_CALL"
        | "INVESTOR_MEETING"
        | "CONFERENCE"
        | "ROADSHOW"
        | "ANALYST_DAY"
        | "PRODUCT_LAUNCH"
        | "OTHER"
      rsvp_status: "ACCEPTED" | "DECLINED" | "TENTATIVE" | "PENDING"
      subscription_status: "ACTIVE" | "INACTIVE" | "EXPIRED"
      user_role: "IR_ADMIN" | "ANALYST_MANAGER" | "INVESTMENT_ANALYST"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: [
        "EARNINGS_CALL",
        "INVESTOR_MEETING",
        "CONFERENCE",
        "ROADSHOW",
        "ANALYST_DAY",
        "PRODUCT_LAUNCH",
        "OTHER",
      ],
      rsvp_status: ["ACCEPTED", "DECLINED", "TENTATIVE", "PENDING"],
      subscription_status: ["ACTIVE", "INACTIVE", "EXPIRED"],
      user_role: ["IR_ADMIN", "ANALYST_MANAGER", "INVESTMENT_ANALYST"],
    },
  },
} as const
