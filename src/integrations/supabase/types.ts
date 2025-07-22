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
      chat_messages: {
        Row: {
          active: boolean | null
          app: string | null
          bot_message: string | null
          conversation_id: string | null
          created_at: string
          id: number
          message_type: string | null
          phone: string | null
          user_id: string | null
          user_message: string | null
          user_name: string | null
        }
        Insert: {
          active?: boolean | null
          app?: string | null
          bot_message?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          message_type?: string | null
          phone?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Update: {
          active?: boolean | null
          app?: string | null
          bot_message?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          message_type?: string | null
          phone?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          app: string | null
          conversation_id: string | null
          created_at: string
          id: number
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          app?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          app?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          active: boolean | null
          app: string | null
          cliente_name: string | null
          created_at: string
          distance: string | null
          email: string | null
          id: number
          lat: string | null
          location: string | null
          long: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          app?: string | null
          cliente_name?: string | null
          created_at?: string
          distance?: string | null
          email?: string | null
          id?: number
          lat?: string | null
          location?: string | null
          long?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          app?: string | null
          cliente_name?: string | null
          created_at?: string
          distance?: string | null
          email?: string | null
          id?: number
          lat?: string | null
          location?: string | null
          long?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Gastos: {
        Row: {
          created_at: string
          id: number
          "Nome do Gasto": string | null
          Tipo: Database["public"]["Enums"]["Tipo"] | null
          Valor: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Nome do Gasto"?: string | null
          Tipo?: Database["public"]["Enums"]["Tipo"] | null
          Valor?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          "Nome do Gasto"?: string | null
          Tipo?: Database["public"]["Enums"]["Tipo"] | null
          Valor?: number | null
        }
        Relationships: []
      }
      "Leads n8n": {
        Row: {
          created_at: string
          Data: string | null
          id: number
          Lead_ID_fone: string | null
          Lead_Mensagem: string | null
          Lead_nome: string | null
        }
        Insert: {
          created_at?: string
          Data?: string | null
          id?: number
          Lead_ID_fone?: string | null
          Lead_Mensagem?: string | null
          Lead_nome?: string | null
        }
        Update: {
          created_at?: string
          Data?: string | null
          id?: number
          Lead_ID_fone?: string | null
          Lead_Mensagem?: string | null
          Lead_nome?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          iCalUID: string | null
          id: number
          name: string | null
          phone: string | null
          resumo: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          iCalUID?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          resumo?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          iCalUID?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          resumo?: string | null
        }
        Relationships: []
      }
      usuários1: {
        Row: {
          created_at: string
          id: number
          nome: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nome?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Tipo:
        | "Mercado"
        | "Alimentação"
        | "Saúde"
        | "Moradia"
        | "Educação"
        | "Finanças"
        | "Combustível"
        | "Automóvel"
        | "Lazer"
        | "Filhos"
        | "Trabalho"
        | "Doações"
        | "Diversos"
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
      Tipo: [
        "Mercado",
        "Alimentação",
        "Saúde",
        "Moradia",
        "Educação",
        "Finanças",
        "Combustível",
        "Automóvel",
        "Lazer",
        "Filhos",
        "Trabalho",
        "Doações",
        "Diversos",
      ],
    },
  },
} as const
