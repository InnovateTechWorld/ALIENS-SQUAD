'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Recycle, CheckCircle, Loader2 } from 'lucide-react'

interface MonitorPageProps {
  params: Promise<{ id: string }>
}

export default function BinMonitorPage({ params }: MonitorPageProps) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const binId = resolvedParams.id
  const userPhone = searchParams.get('phone')

  const [sessionActive, setSessionActive] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)
  const [reward, setReward] = useState(0)

  // Auto-delete session after showing result
  useEffect(() => {
    if (showSuccess || showFailure) {
      console.log('[Monitor] Result shown, clearing session in 5 seconds...')
      const timeout = setTimeout(async () => {
        console.log('[Monitor] Auto-clearing session')
        await supabase.from('active_sessions').delete().eq('bin_id', binId)
      }, 5000) // 5 seconds to view result

      return () => clearTimeout(timeout)
    }
  }, [showSuccess, showFailure, binId])

  useEffect(() => {
    if (!userPhone) {
      router.push('/')
      return
    }

    console.log('[Monitor] Setting up real-time listener for bin:', binId)

    // Listen for session updates ONLY (no deletion)
    const channel = supabase
      .channel('session-monitor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_sessions',
          filter: `bin_id=eq.${binId}`,
        },
        (payload: any) => {
          console.log('[Monitor] Session updated!', payload)
          const newStatus = payload.new?.status
          
          if (newStatus === 'success') {
            setSessionActive(false)
            setReward(10)
            setShowSuccess(true)
          } else if (newStatus === 'failed') {
            setSessionActive(false)
            setShowFailure(true)
          }
        }
      )
      .subscribe((status) => {
        console.log('[Monitor] Subscription status:', status)
      })

    // FALLBACK: Poll for session status every 2 seconds
    const pollInterval = setInterval(async () => {
      console.log('[Monitor] Polling for session status...')
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('bin_id', binId)
        .eq('user_phone', userPhone)
        .maybeSingle()

      if (error) {
        console.error('[Monitor] Poll error:', error)
        return
      }

      if (data) {
        // Check status
        const status = (data as any).status
        console.log('[Monitor] Current session status:', status)
        
        if (status === 'success') {
          console.log('[Monitor] Success detected!')
          setSessionActive(false)
          setReward(10)
          setShowSuccess(true)
          clearInterval(pollInterval)
        } else if (status === 'failed') {
          console.log('[Monitor] Failure detected!')
          setSessionActive(false)
          setShowFailure(true)
          clearInterval(pollInterval)
        }
      } else {
        // Session not found - might have been manually deleted
        console.log('[Monitor] Session not found')
      }
    }, 2000)

    return () => {
      console.log('[Monitor] Cleaning up...')
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [binId, userPhone, router, showSuccess, showFailure])

  const handleViewDashboard = async () => {
    // Clear the session so bin can be used again
    await supabase.from('active_sessions').delete().eq('bin_id', binId)
    router.push(`/dashboard/${userPhone}`)
  }

  const handleTryAgain = async () => {
    // Clear the session so user can try again
    await supabase.from('active_sessions').delete().eq('bin_id', binId)
    router.push(`/dashboard/${userPhone}`)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold text-black mb-2">
              Success!
            </h2>
            <p className="text-black text-lg mb-4">
              Your bottle has been verified and accepted
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-green-700 font-medium mb-2">You earned</p>
              <p className="text-5xl font-bold text-green-600">
                ₦{reward}
              </p>
            </div>
            <Button onClick={handleViewDashboard} className="w-full" size="lg">
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showFailure) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">
              Item Rejected
            </h2>
            <p className="text-black text-lg mb-4">
              The item you inserted could not be verified
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-red-700 font-medium mb-2">Possible reasons:</p>
              <ul className="text-sm text-red-600 text-left space-y-2">
                <li>• Item is not a recyclable bottle</li>
                <li>• Bottle is damaged or crushed</li>
                <li>• Camera could not verify the item</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button onClick={handleTryAgain} className="w-full" size="lg">
                Try Again
              </Button>
              <Button onClick={handleViewDashboard} variant="secondary" className="w-full" size="lg">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Recycle className="text-green-600 animate-pulse" size={64} />
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-ping" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            Bin {binId} is Ready!
          </h2>
          <p className="text-black mb-4">
            Insert your recyclable item now
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-black font-medium">
              ⚡ The bin is now monitoring for your item
            </p>
            <p className="text-xs text-black mt-2">
              Session expires in 5 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
