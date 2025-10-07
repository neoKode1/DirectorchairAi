'use client'

import React from 'react'
import { useGenerations } from '@/hooks/useGenerations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Download, Eye, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function GenerationHistory() {
  const { 
    generations, 
    loading, 
    error, 
    deleteGeneration, 
    deleteMediaFile 
  } = useGenerations()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteGeneration = async (id: string) => {
    if (confirm('Are you sure you want to delete this generation?')) {
      await deleteGeneration(id)
    }
  }

  const handleDeleteMediaFile = async (id: string) => {
    if (confirm('Are you sure you want to delete this media file?')) {
      await deleteMediaFile(id)
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        <span>Loading generations...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading generations: {error}</p>
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No generations yet</p>
          <p className="text-sm">Start creating content to see your history here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generation History</h2>
        <Badge variant="secondary">
          {generations.length} {generations.length === 1 ? 'generation' : 'generations'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {generations.map((generation) => (
          <Card key={generation.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {generation.prompt}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span>{generation.model}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(generation.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(generation.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(generation.status)}
                      <span className="capitalize">{generation.status}</span>
                    </div>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGeneration(generation.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {generation.media_files && generation.media_files.length > 0 && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {generation.media_files.map((media) => (
                    <div key={media.id} className="relative group">
                      {media.file_type === 'image' ? (
                        <img
                          src={media.file_url}
                          alt={media.file_name}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                      ) : media.file_type === 'video' ? (
                        <video
                          src={media.file_url}
                          className="w-full h-24 object-cover rounded-md border"
                          muted
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-md border flex items-center justify-center">
                          <span className="text-xs text-gray-500">Audio</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(media.file_url, media.file_name)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteMediaFile(media.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
