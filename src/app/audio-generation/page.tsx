import React from 'react';
// import { AudioGenerationInterface } from '@/components/audio-generation-interface'; // Removed - component deleted
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AudioGenerationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Audio Generation Studio</h1>
          <p className="text-muted-foreground">
            Generate high-quality audio from text using ElevenLabs or MiniMax TTS, or upload your own audio files.
          </p>
        </div>

        {/* <AudioGenerationInterface
          showDownloadButton={true}
          showUseInLipSync={true}
          showUseInVideo={true}
        /> Removed - component deleted */}
        <div className="text-center py-8 text-gray-500">
          <p>Audio Generation Interface component has been removed during cleanup.</p>
          <p>This page is no longer functional.</p>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>
                Generate and manage audio for your creative projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🎤 Generate Audio from Text</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Choose between ElevenLabs (natural voices) or MiniMax (AI-powered voices)</li>
                  <li>• Select from a wide variety of voices and accents</li>
                  <li>• Adjust voice settings like stability, speed, and pitch</li>
                  <li>• Generate audio from any text input</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">📁 Upload Your Own Audio</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Upload MP3, WAV, M4A, or AAC files</li>
                  <li>• Maximum file size: 50MB</li>
                  <li>• Use your own recordings or existing audio</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💾 Download & Reuse</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Download generated audio files</li>
                  <li>• Copy audio URLs for external use</li>
                  <li>• Use generated audio in lip sync workflows</li>
                  <li>• Integrate with video generation models</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🎬 Workflow Integration</h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Use generated audio with HALU Minimax video generation</li>
                  <li>• Create lip sync videos with any audio source</li>
                  <li>• Combine with other AI generation tools</li>
                  <li>• Build complete audio-visual workflows</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
