'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
}

export function QRCode({
  value,
  size = 256,
  level = 'M',
  includeMargin = true,
}: QRCodeProps) {
  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  )
}
