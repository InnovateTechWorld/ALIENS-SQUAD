'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Recycle, ArrowLeft, Leaf, Coins, CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber) {
      setError('Phone number is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          name: name || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign in')
      }

      router.push(`/dashboard/${phoneNumber}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── Left panel: branding ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-green-600 rounded-lg">
            <Recycle className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-white">RecyclePay</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Turn your trash into{' '}
            <span className="text-green-400">real money.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of Nigerians earning from recycling.
          </p>

          <div className="space-y-4">
            {[
              { Icon: Recycle, text: 'AI-verified recyclable detection', color: 'text-green-400' },
              { Icon: Coins, text: '₦100 per bottle, credited instantly', color: 'text-yellow-400' },
              { Icon: Leaf, text: 'Help the environment while you earn', color: 'text-green-300' },
            ].map(({ Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className={`${color} shrink-0`} size={18} />
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial-style proof */}
          <div className="mt-12 p-5 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <CheckCircle key={i} className="text-green-500" size={13} />
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              &quot;I&apos;ve earned over ₦8,000 this month just from recycling bottles after work. It&apos;s unbelievable.&quot;
            </p>
            <p className="text-gray-500 text-xs mt-2">— Amaka O., Lagos</p>
          </div>
        </div>

        <p className="text-gray-700 text-xs">© 2026 RecyclePay. All rights reserved.</p>
      </div>

      {/* ─── Right panel: form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="p-1.5 bg-green-600 rounded-lg">
              <Recycle className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900">RecyclePay</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            <span className="text-sm font-medium">Back to home</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get started</h1>
            <p className="text-gray-500">
              Sign in or create your free account to start earning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name{' '}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base hover:bg-green-700 active:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Continue'
              )}
            </button>

            <p className="text-xs text-center text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-green-600 hover:underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-600 hover:underline font-medium">
                Privacy Policy
              </a>
            </p>
          </form>

        </div>
      </div>

    </div>
  )
}
