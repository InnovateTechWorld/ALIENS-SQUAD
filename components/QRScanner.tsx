'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ScanLine, Camera, Loader2 } from 'lucide-react'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  userPhone: string
}

export function QRScanner({ isOpen, onClose, userPhone }: QRScannerProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [manualBinId, setManualBinId] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isOpen])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError('')
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const startSession = async (binId: string) => {
    setStarting(true)
    try {
      // Automatically create session with user's phone number
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bin_id: binId,
          user_phone: userPhone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start session')
      }

      // Session created! Navigate to bin monitoring page
      stopCamera()
      router.push(`/bin/${binId}/monitor?phone=${encodeURIComponent(userPhone)}`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to start session')
    } finally {
      setStarting(false)
    }
  }

  const handleManualEntry = () => {
    if (manualBinId && !starting) {
      startSession(manualBinId)
    }
  }

  const handleQuickAccess = (binId: string) => {
    if (!starting) {
      startSession(binId)
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan Bin QR Code" size="lg">
      <div className="space-y-6">
        {/* Camera View */}
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {error && !error.includes('camera') ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center p-6">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-white mb-2">{error}</p>
                <p className="text-sm text-gray-400">Enable camera access in browser settings</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative border-4 border-green-500 rounded-2xl" style={{ width: '70%', height: '70%' }}>
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white font-medium bg-black/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                  Position QR code within frame
                </p>
              </div>
            </>
          )}
        </div>

        {/* Manual Entry */}
        <div className="border-t pt-4">
          <p className="text-sm text-black font-medium mb-3 text-center">
            Or enter bin ID:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualBinId}
              onChange={(e) => setManualBinId(e.target.value.toUpperCase())}
              placeholder="e.g., 001"
              disabled={starting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black disabled:bg-gray-100"
            />
            <Button onClick={handleManualEntry} disabled={!manualBinId || starting} loading={starting}>
              {starting ? 'Starting...' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="border-t pt-4">
          <p className="text-sm text-black font-medium mb-3 text-center">
            Quick access (Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['001', '002', '003'].map((binId) => (
              <Button
                key={binId}
                onClick={() => handleQuickAccess(binId)}
                variant="secondary"
                disabled={starting}
                className="w-full"
              >
                {starting ? <Loader2 className="animate-spin" size={16} /> : `Bin ${binId}`}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
