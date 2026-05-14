'use client'

import { Recycle, Coins, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: 'recycle' | 'coins' | 'trending'
  subtitle?: string
  color?: 'green' | 'blue' | 'purple'
}

export function StatsCard({
  title,
  value,
  icon,
  subtitle,
  color = 'green',
}: StatsCardProps) {
  const icons = {
    recycle: Recycle,
    coins: Coins,
    trending: TrendingUp,
  }

  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  const Icon = icons[icon]

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-full ${colors[color]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  )
}
