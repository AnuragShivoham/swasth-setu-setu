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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'doctor' | 'patient'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: 'doctor' | 'patient'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'doctor' | 'patient'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctor_profiles: {
        Row: {
          id: string
          specialization: string
          license_number: string
          bio: string | null
          years_of_experience: number | null
          consultation_fee: number | null
          is_verified: boolean
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          specialization: string
          license_number: string
          bio?: string | null
          years_of_experience?: number | null
          consultation_fee?: number | null
          is_verified?: boolean
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          specialization?: string
          license_number?: string
          bio?: string | null
          years_of_experience?: number | null
          consultation_fee?: number | null
          is_verified?: boolean
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type DoctorProfile = Database['public']['Tables']['doctor_profiles']['Row']
export type DoctorProfileInsert = Database['public']['Tables']['doctor_profiles']['Insert']
export type DoctorProfileUpdate = Database['public']['Tables']['doctor_profiles']['Update']

// Combined type for user with profile
export interface UserWithProfile {
  id: string
  email: string
  profile: Profile
  doctorProfile?: DoctorProfile
}
