'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Recycle, Leaf, Coins, Sparkles, QrCode, Smartphone } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber) {
      setError('Phone number is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Register/login user
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber,
          name: name || undefined
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign in')
      }

      // Redirect to dashboard
      router.push(`/dashboard/${phoneNumber}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 opacity-10">
          <Leaf size={100} className="text-green-600 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Recycle size={120} className="text-emerald-600 animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl">
                  <Recycle className="text-white" size={64} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Get Paid to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Recycle
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-black mb-8 max-w-3xl mx-auto font-medium">
              Turn plastic bottles into instant cash. Simply scan a bin's QR code, recycle, and earn ₦10 per bottle.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
                <Recycle className="text-green-600" size={24} />
                <span className="font-semibold text-black">AI-Verified</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
                <Coins className="text-yellow-600" size={24} />
                <span className="font-semibold text-black">Instant Payment</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
                <Leaf className="text-emerald-600" size={24} />
                <span className="font-semibold text-black">Save the Planet</span>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-2 border-gray-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-black mb-2 text-center">
                  Get Started
                </h2>
                <p className="text-black mb-6 text-center font-medium">
                  Sign up or sign in to start earning
                </p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+234 800 000 0000"
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
                    type="submit"
                    loading={loading}
                    className="w-full"
                    size="lg"
                  >
                    Continue
                  </Button>

                  <p className="text-xs text-center text-black font-medium mt-4">
                    By continuing, you agree to our terms of service
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-black mb-16">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Smartphone size={16} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Sign Up</h3>
              <p className="text-black font-medium">
                Enter your phone number and name to create your free account
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <QrCode size={16} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Scan Bin QR</h3>
              <p className="text-black font-medium">
                Find a RecyclePay bin and scan the static QR code on it with your phone
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Recycle size={16} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Insert Bottle</h3>
              <p className="text-black font-medium">
                Put your bottle in the bin and our AI camera will verify it's recyclable
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Coins size={16} className="text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Get Paid</h3>
              <p className="text-black font-medium">
                Receive ₦10 instantly in your wallet - check your dashboard
              </p>
            </div>
          </div>

          {/* QR Code Callout */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center">
                    <QrCode className="text-white" size={32} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-3">
                    Each Bin Has a Unique QR Code
                  </h3>
                  <p className="text-black text-lg font-medium mb-4">
                    Every RecyclePay smart bin has a static QR code printed on it. When you scan it with your phone camera, 
                    it opens a page where you authenticate with your phone number to start a recycling session at that specific bin.
                  </p>
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <span className="text-2xl">👉</span>
                    <span>Look for bins with the green RecyclePay logo!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">10,000+</div>
              <div className="text-xl text-white font-semibold">Bottles Recycled</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">₦100K+</div>
              <div className="text-xl text-white font-semibold">Paid to Users</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">5 Tons</div>
              <div className="text-xl text-white font-semibold">Plastic Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-black font-medium mb-8">
            Join thousands of Nigerians getting paid to recycle
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            size="lg"
            className="px-12"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  )
}
