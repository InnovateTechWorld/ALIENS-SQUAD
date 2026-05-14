'use client'

import { formatDistanceToNow } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Transaction {
  id: string
  type: 'recycle' | 'withdrawal'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  bin_id?: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start recycling to see your transaction history
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                transaction.type === 'recycle'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {transaction.type === 'recycle' ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowDownRight size={20} />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {transaction.type === 'recycle' ? 'Recycled Item' : 'Withdrawal'}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(transaction.created_at)}
                {transaction.bin_id && ` • ${transaction.bin_id}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold ${
                transaction.type === 'recycle' ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              {transaction.type === 'recycle' ? '+' : '-'}₦{transaction.amount}
            </p>
            <p
              className={`text-xs ${
                transaction.status === 'completed'
                  ? 'text-green-600'
                  : transaction.status === 'pending'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {transaction.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
