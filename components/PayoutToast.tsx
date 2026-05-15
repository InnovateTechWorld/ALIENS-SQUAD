'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function PayoutToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slight delay so the hero photos animate in first
    const t = setTimeout(() => setVisible(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`
        absolute top-6 left-2 z-20
        flex items-center gap-3
        bg-white border border-gray-100
        rounded-2xl shadow-xl px-4 py-3 w-56
        transition-all duration-500 ease-out
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      `}
    >
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
        <CheckCircle className="text-green-600" size={20} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          Total paid out
        </p>
        <p className="text-lg font-extrabold text-gray-900 leading-tight">₦145,350</p>
        <p className="text-[10px] text-gray-400 mt-0.5">this month · 1,453 users</p>
      </div>

      {/* Live dot */}
      <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
    </div>
  )
}
