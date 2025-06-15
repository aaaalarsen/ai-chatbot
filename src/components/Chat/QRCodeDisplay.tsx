'use client'

import { Language } from '@/types'

interface QRCodeDisplayProps {
  language: Language
  isLarge?: boolean
  isHighContrast?: boolean
}

export default function QRCodeDisplay({ 
  language,
  isLarge = false,
  isHighContrast = false 
}: QRCodeDisplayProps) {
  // More realistic QR code pattern for demo purposes
  const generateQRPattern = () => {
    const size = 25 // More realistic QR code size
    const pattern = []
    
    for (let i = 0; i < size; i++) {
      const row = []
      for (let j = 0; j < size; j++) {
        // Create finder patterns (corner squares)
        const isFinderPattern = 
          (i < 9 && j < 9) || 
          (i < 9 && j > 15) || 
          (i > 15 && j < 9)
        
        if (isFinderPattern) {
          const isFinderBorder = 
            (i === 0 || i === 8 || j === 0 || j === 8) ||
            (i === 1 || i === 7 || j === 1 || j === 7) ||
            (i >= 3 && i <= 5 && j >= 3 && j <= 5)
          row.push(isFinderBorder)
        } else {
          // Create timing patterns and data modules
          const isTimingPattern = (i === 6 || j === 6)
          const isDataModule = Math.random() > 0.5
          const isAlignmentPattern = (i > 16 && i < 20 && j > 16 && j < 20)
          
          row.push(isTimingPattern || isDataModule || isAlignmentPattern)
        }
      }
      pattern.push(row)
    }
    
    return pattern
  }

  const qrPattern = generateQRPattern()

  return (
    <div className="flex flex-col items-center p-8 animate-[fadeInScale_0.8s_ease-out]">
      {/* QR Code Container */}
      <div className={`
        relative bg-white p-6 rounded-3xl shadow-2xl border
        ${isHighContrast ? 'border-2 border-black' : 'border border-gray-200'}
        transform transition-all duration-300 hover:scale-105
      `}>
        {/* Scanning animation overlay */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
        </div>
        
        <div 
          className="grid gap-0 w-56 h-56 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(25, 1fr)' }}
        >
          {qrPattern.map((row, i) =>
            row.map((isBlack, j) => (
              <div
                key={`${i}-${j}`}
                className={`
                  w-full h-full transition-colors duration-300
                  ${isBlack ? 'bg-black' : 'bg-white'}
                `}
              />
            ))
          )}
        </div>
        
        {/* Corner indicators */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Instructions */}
      <div className={`
        mt-6 text-center max-w-md
        ${isLarge ? 'text-xl' : 'text-lg'}
        ${isHighContrast ? 'text-black' : 'text-gray-800 dark:text-gray-200'}
      `}>
        <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          {language === 'ja' 
            ? 'お取引QRコード' 
            : 'Transaction QR Code'
          }
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-2xl border border-blue-200">
          <p className={`
            ${isLarge ? 'text-lg' : 'text-base'}
            ${isHighContrast ? 'text-black' : 'text-gray-700'}
            leading-relaxed
          `}>
            {language === 'ja'
              ? 'スマートフォンのカメラでこのQRコードをスキャンして、お取引を完了してください。'
              : 'Please scan this QR code with your smartphone camera to complete your transaction.'
            }
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mt-6 space-y-3">
        <div className={`
          px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200
          ${isHighContrast ? 'border-black bg-gray-200' : ''}
        `}>
          <p className={`
            ${isLarge ? 'text-sm' : 'text-xs'}
            ${isHighContrast ? 'text-black' : 'text-gray-600'}
            font-medium
          `}>
            {language === 'ja' ? '取引ID' : 'Transaction ID'}
          </p>
          <p className={`
            ${isLarge ? 'text-base' : 'text-sm'}
            ${isHighContrast ? 'text-black' : 'text-gray-800'}
            font-mono font-bold
          `}>
            TXN-{Date.now().toString().slice(-8)}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-green-600">
          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            {language === 'ja' ? 'スキャン待機中' : 'Ready to scan'}
          </span>
        </div>
      </div>
    </div>
  )
}