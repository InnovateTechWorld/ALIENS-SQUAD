'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, CheckCircle, XCircle, Recycle } from 'lucide-react'

interface BinPageProps {
  params: Promise<{ id: string }>
}

export default function BinPage({ params }: BinPageProps) {
  const resolvedParams = use(params)
  const binId = resolvedParams.id
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [error, setError] = useState('')

  // Listen for session completion
  useEffect(() => {
    if (!sessionActive || !sessionData) return

    const channel = supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'active_sessions',
          filter: `bin_id=eq.${binId}`,
        },
        () => {
          // Session deleted = bottle accepted!
          setRewardAmount(10)
          setShowSuccessModal(true)
          setSessionActive(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionActive, sessionData, binId])

  const handleStartRecycling = async () => {
    if (!phoneNumber) {
      setError('Phone number is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Register/Get user
      const registerResponse = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, name }),
      })

      if (!registerResponse.ok) {
        throw new Error('Failed to register user')
      }

      // 2. Start session
      const sessionResponse = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin_id: binId, user_phone: phoneNumber }),
      })

      const sessionResult = await sessionResponse.json()

      if (!sessionResponse.ok) {
        throw new Error(sessionResult.error || 'Failed to start session')
      }

      setSessionData(sessionResult.data)
      setSessionActive(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDashboard = () => {
    router.push(`/dashboard/${phoneNumber}`)
  }

  if (sessionActive) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bin is Ready!
            </h2>
            <p className="text-gray-600 mb-6">
              Insert your recyclable item now. The AI is watching...
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚡ The Raspberry Pi is now monitoring this bin
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Session expires in 5 minutes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Bottle Accepted!"
          size="md"
        >
          <div className="text-center">
            <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h3>
            <p className="text-gray-600 mb-4">
              Your item has been verified and accepted.
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-green-700 mb-2">You earned</p>
              <p className="text-4xl font-bold text-green-600">
                ₦{rewardAmount}
              </p>
            </div>
            <Button onClick={handleViewDashboard} className="w-full">
              View Dashboard
            </Button>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Recycle className="text-green-600" size={48} />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            RecyclePay Bin {binId}
          </CardTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            Earn ₦10 for every recyclable item you deposit
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+234 XXX XXX XXXX"
              value={phoneNumber}
              onChange={setPhoneNumber}
              error={error}
              required
            />

            <Input
              label="Name (Optional)"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={setName}
            />

            <Button
              onClick={handleStartRecycling}
              loading={loading}
              className="w-full"
              size="lg"
            >
              Start Recycling
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our terms of service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
