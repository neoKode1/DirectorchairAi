'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/database'
import { storage } from '@/lib/storage'
import type { Database } from '@/lib/supabase'

type Generation = Database['public']['Tables']['generations']['Row']
type MediaFile = Database['public']['Tables']['media_files']['Row']

export interface GenerationWithMedia extends Generation {
  media_files?: MediaFile[]
}

export function useGenerations() {
  const [generations, setGenerations] = useState<GenerationWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGenerations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [generationsData, mediaFilesData] = await Promise.all([
        db.getGenerations(),
        db.getMediaFiles()
      ])

      // Group media files by generation ID
      const mediaByGeneration = mediaFilesData.reduce((acc, media) => {
        if (media.generation_id) {
          if (!acc[media.generation_id]) {
            acc[media.generation_id] = []
          }
          acc[media.generation_id].push(media)
        }
        return acc
      }, {} as Record<string, MediaFile[]>)

      // Combine generations with their media files
      const generationsWithMedia: GenerationWithMedia[] = generationsData.map(gen => ({
        ...gen,
        media_files: mediaByGeneration[gen.id] || []
      }))

      setGenerations(generationsWithMedia)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generations')
    } finally {
      setLoading(false)
    }
  }, [])

  const createGeneration = useCallback(async (data: {
    model: string
    prompt: string
    result_data?: any
    status?: 'pending' | 'completed' | 'failed'
  }) => {
    try {
      const generation = await db.createGeneration(data)
      if (generation) {
        await fetchGenerations() // Refresh the list
        return generation
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create generation')
      return null
    }
  }, [fetchGenerations])

  const updateGeneration = useCallback(async (id: string, data: {
    result_data?: any
    status?: 'pending' | 'completed' | 'failed'
  }) => {
    try {
      const generation = await db.updateGeneration(id, data)
      if (generation) {
        await fetchGenerations() // Refresh the list
        return generation
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update generation')
      return null
    }
  }, [fetchGenerations])

  const deleteGeneration = useCallback(async (id: string) => {
    try {
      const success = await db.deleteGeneration(id)
      if (success) {
        await fetchGenerations() // Refresh the list
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete generation')
      return false
    }
  }, [fetchGenerations])

  const uploadMediaFile = useCallback(async (
    file: File | string, // File object or data URL
    generationId?: string,
    fileName?: string
  ) => {
    try {
      let result
      
      if (typeof file === 'string') {
        // Handle data URL
        const name = fileName || `generated_${Date.now()}.png`
        result = await storage.uploadDataUrl(file, name, generationId)
      } else {
        // Handle File object
        result = await storage.uploadFile(file, generationId)
      }

      if (result) {
        await fetchGenerations() // Refresh the list
        return result
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media file')
      return null
    }
  }, [fetchGenerations])

  const deleteMediaFile = useCallback(async (id: string) => {
    try {
      const success = await db.deleteMediaFile(id)
      if (success) {
        await fetchGenerations() // Refresh the list
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media file')
      return false
    }
  }, [fetchGenerations])

  // Load generations on mount
  useEffect(() => {
    fetchGenerations()
  }, [fetchGenerations])

  return {
    generations,
    loading,
    error,
    createGeneration,
    updateGeneration,
    deleteGeneration,
    uploadMediaFile,
    deleteMediaFile,
    refreshGenerations: fetchGenerations,
  }
}
