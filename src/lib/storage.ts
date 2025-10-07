import { supabase } from './supabase'
import { db } from './database'

export interface UploadResult {
  url: string
  path: string
  size: number
  mimeType: string
}

export class StorageService {
  private bucketName = 'media-files'

  async uploadFile(
    file: File,
    generationId?: string,
    folder: string = 'generations'
  ): Promise<UploadResult | null> {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading file:', error)
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName)

      // Save file metadata to database
      const mediaFile = await db.createMediaFile({
        generation_id: generationId || null,
        file_type: this.getFileType(file.type),
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })

      if (!mediaFile) {
        console.error('Error saving file metadata to database')
        return null
      }

      return {
        url: urlData.publicUrl,
        path: fileName,
        size: file.size,
        mimeType: file.type,
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  async uploadFromUrl(
    url: string,
    fileName: string,
    generationId?: string,
    folder: string = 'generations'
  ): Promise<UploadResult | null> {
    try {
      // Fetch the file from URL
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      const blob = await response.blob()
      const file = new File([blob], fileName, { type: blob.type })

      return await this.uploadFile(file, generationId, folder)
    } catch (error) {
      console.error('Error uploading from URL:', error)
      return null
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        console.error('Error deleting file:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  async getFileUrl(path: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(path)

      return data.publicUrl
    } catch (error) {
      console.error('Error getting file URL:', error)
      return null
    }
  }

  private getFileType(mimeType: string): 'image' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'image' // default fallback
  }

  // Helper method to convert data URL to file
  async uploadDataUrl(
    dataUrl: string,
    fileName: string,
    generationId?: string,
    folder: string = 'generations'
  ): Promise<UploadResult | null> {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: blob.type })

      return await this.uploadFile(file, generationId, folder)
    } catch (error) {
      console.error('Error uploading data URL:', error)
      return null
    }
  }

  // Helper method to get file size from URL
  async getFileSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const contentLength = response.headers.get('content-length')
      return contentLength ? parseInt(contentLength) : 0
    } catch (error) {
      console.error('Error getting file size:', error)
      return 0
    }
  }
}

// Export a singleton instance
export const storage = new StorageService()
