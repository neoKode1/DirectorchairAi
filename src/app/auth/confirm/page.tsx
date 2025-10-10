'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token and type from URL parameters
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link. Please try signing up again.')
          return
        }

        // Verify the email confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        })

        if (error) {
          console.error('Email confirmation error:', error)
          setStatus('error')
          setMessage(error.message || 'Failed to confirm email. Please try again.')
        } else if (data.user) {
          setStatus('success')
          setMessage('Email confirmed successfully! You can now sign in.')
          
          // Redirect to timeline after a short delay
          setTimeout(() => {
            router.push('/timeline')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Email confirmation failed. Please try again.')
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleSignIn = () => {
    router.push('/?mode=signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-md border-gray-700">
        <div className="text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h1>
            <p className="text-gray-300">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <p className="text-sm text-gray-400">
                  Redirecting to DirectorchairAI in 2 seconds...
                </p>
                <Button
                  onClick={() => router.push('/timeline')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Go to DirectorchairAI
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Try Signing In
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back to Home
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Home
              </Button>
            )}
          </div>

          {/* DirectorchairAI Branding */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Welcome to <span className="font-semibold text-white">DirectorchairAI</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              AI-powered media creation studio
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
