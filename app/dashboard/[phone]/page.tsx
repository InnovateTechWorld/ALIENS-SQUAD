'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatsCard } from '@/components/StatsCard'
import { TransactionList } from '@/components/TransactionList'
import { QRCode } from '@/components/ui/QRCode'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loader2, QrCode, User, Wallet } from 'lucide-react'

interface DashboardPageProps {
  params: Promise<{ phone: string }>
}

interface UserData {
  id: string
  phone: string
  name: string | null
  balance: number
  virtual_account_number: string | null
  created_at: string
}

interface Transaction {
  id: string
  type: 'recycle' | 'withdrawal'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  bin_id?: string
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = use(params)
  const phoneNumber = resolvedParams.phone

  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [phoneNumber])

  // Real-time balance updates
  useEffect(() => {
    if (!userData) return

    const channel = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `phone=eq.${phoneNumber}`,
        },
        (payload) => {
          setUserData(payload.new as UserData)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_phone=eq.${phoneNumber}`,
        },
        (payload) => {
          setTransactions((prev) => [payload.new as Transaction, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userData, phoneNumber])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${phoneNumber}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user data')
      }

      setUserData(result.data.user)
      setTransactions(result.data.transactions)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalRecycled = transactions.filter(
    (t) => t.type === 'recycle' && t.status === 'completed'
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {userData.name || 'User'}!
              </h1>
              <p className="text-gray-600">{userData.phone}</p>
            </div>
            <Button onClick={() => setShowQRModal(true)} variant="secondary">
              <QrCode size={20} />
              My QR
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-2">Total Balance</p>
                <p className="text-5xl font-bold">₦{userData.balance}</p>
                {userData.virtual_account_number && (
                  <p className="text-green-100 text-sm mt-4">
                    Virtual Account: {userData.virtual_account_number}
                  </p>
                )}
              </div>
              <Wallet size={64} className="text-green-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Recycled"
            value={totalRecycled}
            icon="recycle"
            subtitle="items accepted"
            color="green"
          />
          <StatsCard
            title="This Month"
            value={`₦${userData.balance}`}
            icon="coins"
            subtitle="earnings"
            color="blue"
          />
          <StatsCard
            title="Impact"
            value={`${totalRecycled * 0.5}kg`}
            icon="trending"
            subtitle="plastic saved"
            color="purple"
          />
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={transactions} />
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Your QR Code"
        size="md"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Show this QR code at any RecyclePay bin to start earning
          </p>
          <QRCode value={userData.phone} size={200} />
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Phone:</strong> {userData.phone}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Balance:</strong> ₦{userData.balance}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
