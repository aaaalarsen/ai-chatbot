'use client'

import { useState } from 'react'
import { Language } from '@/types'
import LanguageSelector from '@/components/Language/LanguageSelector'
import ChatContainer from '@/components/Chat/ChatContainer'
import SettingsButton from '@/components/UI/SettingsButton'

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja')
  const [showLanguageSelector, setShowLanguageSelector] = useState(true)
  const [isLarge, setIsLarge] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    setShowLanguageSelector(false)
  }

  const handleHomeClick = () => {
    setShowLanguageSelector(true)
  }

  const handleTextSizeToggle = () => {
    setIsLarge(!isLarge)
  }

  const handleContrastToggle = () => {
    setIsHighContrast(!isHighContrast)
  }


  if (showLanguageSelector) {
    return (
      <div className={isHighContrast ? 'bg-white min-h-screen' : ''}>
        <SettingsButton
          onTextSizeToggle={handleTextSizeToggle}
          onContrastToggle={handleContrastToggle}
          isLarge={isLarge}
          isHighContrast={isHighContrast}
          language={currentLanguage}
        />
        <LanguageSelector
          selectedLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          isLarge={isLarge}
          isHighContrast={isHighContrast}
        />
      </div>
    )
  }

  return (
    <div className={isHighContrast ? 'bg-white min-h-screen' : ''}>
      <SettingsButton
        onTextSizeToggle={handleTextSizeToggle}
        onContrastToggle={handleContrastToggle}
        isLarge={isLarge}
        isHighContrast={isHighContrast}
        language={currentLanguage}
      />
      <ChatContainer
        language={currentLanguage}
        isLarge={isLarge}
        isHighContrast={isHighContrast}
        onHomeClick={handleHomeClick}
      />
    </div>
  )
}
