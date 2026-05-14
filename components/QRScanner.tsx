'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ScanLine, Camera, X } from 'lucide-react'

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
        video: { facingMode: 'environment' } // Use back camera on mobile
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

  const handleManualEntry = () => {
    if (manualBinId) {
      stopCamera()
      router.push(`/bin/${manualBinId}`)
      onClose()
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
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-white mb-2">{error}</p>
                <p className="text-sm text-gray-400">Please enable camera access in your browser settings</p>
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
                <div className="border-4 border-green-500 rounded-2xl" style={{ width: '70%', height: '70%' }}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
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

        {/* Manual Entry Option */}
        <div className="border-t pt-4">
          <p className="text-sm text-black font-medium mb-3 text-center">
            Or enter bin ID manually:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualBinId}
              onChange={(e) => setManualBinId(e.target.value)}
              placeholder="e.g., 001"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
            />
            <Button onClick={handleManualEntry} disabled={!manualBinId}>
              Go
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
