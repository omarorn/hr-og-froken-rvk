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
      ai_service_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          prompt: string
          response: string | null
          service: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt: string
          response?: string | null
          service: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt?: string
          response?: string | null
          service?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bORING: {
        Row: {
          Value: string[] | null
        }
        Insert: {
          Value?: string[] | null
        }
        Update: {
          Value?: string[] | null
        }
        Relationships: []
      }
      bus_locations: {
        Row: {
          bus_id: string
          heading: number | null
          id: number
          latitude: number
          longitude: number
          route_id: number | null
          route_number: string
          speed: number | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          bus_id: string
          heading?: number | null
          id?: number
          latitude: number
          longitude: number
          route_id?: number | null
          route_number: string
          speed?: number | null
          timestamp?: string
          updated_at?: string
        }
        Update: {
          bus_id?: string
          heading?: number | null
          id?: number
          latitude?: number
          longitude?: number
          route_id?: number | null
          route_number?: string
          speed?: number | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_locations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "bus_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_routes: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          route_number: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          route_number: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          route_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      bus_stops: {
        Row: {
          address: string | null
          created_at: string
          id: number
          latitude: number
          longitude: number
          name: string
          stop_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: number
          latitude: number
          longitude: number
          name: string
          stop_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          stop_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "Input Database": {
        Row: {
          AiTools: string | null
          created_at: string | null
          Description: string | null
          HttpsEmbedCode: string | null
          id: string
          "Last Modified": string | null
          Links: string | null
          "Resource Name": string | null
          "Resource Type": string | null
        }
        Insert: {
          AiTools?: string | null
          created_at?: string | null
          Description?: string | null
          HttpsEmbedCode?: string | null
          id?: string
          "Last Modified"?: string | null
          Links?: string | null
          "Resource Name"?: string | null
          "Resource Type"?: string | null
        }
        Update: {
          AiTools?: string | null
          created_at?: string | null
          Description?: string | null
          HttpsEmbedCode?: string | null
          id?: string
          "Last Modified"?: string | null
          Links?: string | null
          "Resource Name"?: string | null
          "Resource Type"?: string | null
        }
        Relationships: []
      }
      playlist_questions: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          question_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          question_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_questions_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "saved_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_schedules: {
        Row: {
          arrival_time: string
          created_at: string
          day_type: string
          departure_time: string
          id: number
          route_id: number
          stop_id: number
          updated_at: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          day_type: string
          departure_time: string
          id?: number
          route_id: number
          stop_id: number
          updated_at?: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          day_type?: string
          departure_time?: string
          id?: number
          route_id?: number
          stop_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "bus_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_schedules_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "bus_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          created_at: string
          id: number
          route_id: number
          stop_id: number
          stop_order: number
        }
        Insert: {
          created_at?: string
          id?: number
          route_id: number
          stop_id: number
          stop_order: number
        }
        Update: {
          created_at?: string
          id?: number
          route_id?: number
          stop_id?: number
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "bus_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "bus_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scraped_data: {
        Row: {
          data: Json
          domain: string
          id: string
          pages_scraped: number
          scraped_at: string
          url: string
        }
        Insert: {
          data: Json
          domain: string
          id?: string
          pages_scraped: number
          scraped_at?: string
          url: string
        }
        Update: {
          data?: Json
          domain?: string
          id?: string
          pages_scraped?: number
          scraped_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_logs_count_by_service: {
        Args: Record<PropertyKey, never>
        Returns: {
          service: string
          count: number
          last_used: string
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
