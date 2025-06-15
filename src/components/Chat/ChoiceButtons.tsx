'use client'

import { Choice } from '@/types'

interface ChoiceButtonsProps {
  choices: Choice[]
  onChoiceSelect: (choice: Choice) => void
  isLarge?: boolean
  isHighContrast?: boolean
}

export default function ChoiceButtons({ 
  choices, 
  onChoiceSelect, 
  isLarge = false,
  isHighContrast = false 
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-4 mt-6">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => onChoiceSelect(choice)}
          style={{ animationDelay: `${index * 100}ms` }}
          className={`
            relative px-8 py-5 rounded-2xl transition-all duration-300 transform
            animate-[slideInUp_0.6s_ease-out_forwards] opacity-0
            ${isHighContrast
              ? 'bg-white text-black border-3 border-black hover:bg-black hover:text-white'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }
            ${isLarge ? 'text-xl' : 'text-lg'}
            font-semibold
            focus:outline-none focus:ring-4 focus:ring-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            group overflow-hidden
          `}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
          
          {/* Choice icon */}
          <div className="flex items-center justify-between">
            <span className="relative z-10">{choice.text}</span>
            <svg 
              className="w-6 h-6 ml-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  )
}