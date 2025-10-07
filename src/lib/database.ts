import { supabase, generateSessionId, getExpirationDate } from './supabase'
import type { Database } from './supabase'

type Generation = Database['public']['Tables']['generations']['Row']
type GenerationInsert = Database['public']['Tables']['generations']['Insert']
type GenerationUpdate = Database['public']['Tables']['generations']['Update']

type MediaFile = Database['public']['Tables']['media_files']['Row']
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert']
type MediaFileUpdate = Database['public']['Tables']['media_files']['Update']

export class DatabaseService {
  private sessionId: string | null = null

  constructor() {
    // Initialize session ID for non-authenticated users
    this.initializeSession()
  }

  private async initializeSession() {
    // Check if we have a session ID in localStorage
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('directorchair_session_id')
      if (storedSessionId) {
        this.sessionId = storedSessionId
      } else {
        this.sessionId = generateSessionId()
        localStorage.setItem('directorchair_session_id', this.sessionId)
      }
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Generation methods
  async createGeneration(data: Omit<GenerationInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Generation | null> {
    try {
      const userId = await this.getCurrentUserId()
      const expiresAt = userId ? null : getExpirationDate(72) // 72 hours for non-authenticated users

      const generationData: GenerationInsert = {
        ...data,
        user_id: userId,
        session_id: userId ? null : this.sessionId,
        expires_at: expiresAt,
      }

      const { data: generation, error } = await supabase
        .from('generations')
        .insert(generationData)
        .select()
        .single()

      if (error) {
        console.error('Error creating generation:', error)
        return null
      }

      return generation
    } catch (error) {
      console.error('Error creating generation:', error)
      return null
    }
  }

  async updateGeneration(id: string, data: GenerationUpdate): Promise<Generation | null> {
    try {
      const { data: generation, error } = await supabase
        .from('generations')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating generation:', error)
        return null
      }

      return generation
    } catch (error) {
      console.error('Error updating generation:', error)
      return null
    }
  }

  async getGenerations(): Promise<Generation[]> {
    try {
      const userId = await this.getCurrentUserId()
      
      let query = supabase
        .from('generations')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('session_id', this.sessionId)
      }

      const { data: generations, error } = await query

      if (error) {
        console.error('Error fetching generations:', error)
        return []
      }

      return generations || []
    } catch (error) {
      console.error('Error fetching generations:', error)
      return []
    }
  }

  async deleteGeneration(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting generation:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting generation:', error)
      return false
    }
  }

  // Media file methods
  async createMediaFile(data: Omit<MediaFileInsert, 'id' | 'created_at' | 'updated_at'>): Promise<MediaFile | null> {
    try {
      const userId = await this.getCurrentUserId()
      const expiresAt = userId ? null : getExpirationDate(72) // 72 hours for non-authenticated users

      const mediaFileData: MediaFileInsert = {
        ...data,
        user_id: userId,
        session_id: userId ? null : this.sessionId,
        expires_at: expiresAt,
      }

      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .insert(mediaFileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating media file:', error)
        return null
      }

      return mediaFile
    } catch (error) {
      console.error('Error creating media file:', error)
      return null
    }
  }

  async getMediaFiles(generationId?: string): Promise<MediaFile[]> {
    try {
      const userId = await this.getCurrentUserId()
      
      let query = supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('session_id', this.sessionId)
      }

      if (generationId) {
        query = query.eq('generation_id', generationId)
      }

      const { data: mediaFiles, error } = await query

      if (error) {
        console.error('Error fetching media files:', error)
        return []
      }

      return mediaFiles || []
    } catch (error) {
      console.error('Error fetching media files:', error)
      return []
    }
  }

  async deleteMediaFile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting media file:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting media file:', error)
      return false
    }
  }

  // Utility methods
  async isAuthenticated(): Promise<boolean> {
    const userId = await this.getCurrentUserId()
    return userId !== null
  }

  async getSessionId(): Promise<string | null> {
    return this.sessionId
  }

  // Clean up session data (for logout or session expiration)
  async clearSessionData(): Promise<void> {
    if (this.sessionId) {
      try {
        // Delete all session-based data
        await supabase
          .from('generations')
          .delete()
          .eq('session_id', this.sessionId)

        await supabase
          .from('media_files')
          .delete()
          .eq('session_id', this.sessionId)

        // Clear session ID from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('directorchair_session_id')
        }

        this.sessionId = null
      } catch (error) {
        console.error('Error clearing session data:', error)
      }
    }
  }

  // Migrate session data to user account (when user signs up/signs in)
  async migrateSessionToUser(userId: string): Promise<void> {
    if (this.sessionId) {
      try {
        // Update generations
        await supabase
          .from('generations')
          .update({ 
            user_id: userId, 
            session_id: null,
            expires_at: null 
          })
          .eq('session_id', this.sessionId)

        // Update media files
        await supabase
          .from('media_files')
          .update({ 
            user_id: userId, 
            session_id: null,
            expires_at: null 
          })
          .eq('session_id', this.sessionId)

        // Clear session ID
        if (typeof window !== 'undefined') {
          localStorage.removeItem('directorchair_session_id')
        }

        this.sessionId = null
      } catch (error) {
        console.error('Error migrating session data:', error)
      }
    }
  }
}

// Export a singleton instance
export const db = new DatabaseService()
