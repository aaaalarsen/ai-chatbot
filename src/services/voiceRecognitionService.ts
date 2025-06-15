'use client'

import { Language } from '@/types'

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

export interface VoiceRecognitionService {
  initialize(language: Language): Promise<void>
  startRecording(): Promise<void>
  stopRecording(): Promise<string>
  isRecording(): boolean
  isSupported(): boolean
  cleanup(): void
}

// VoskVoiceRecognitionService implementation commented out for now
// Will be implemented when Vosk models are available
/*
export class VoskVoiceRecognitionService implements VoiceRecognitionService {
  // Implementation details...
}
*/

// Fallback implementation using Web Speech API
export class WebSpeechVoiceRecognitionService implements VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null
  private recording = false
  private currentLanguage: Language = 'ja'
  private resolveRecording: ((value: string) => void) | null = null

  async initialize(language: Language): Promise<void> {
    this.currentLanguage = language
    
    if (!this.isSupported()) {
      throw new Error('Web Speech API is not supported')
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    this.recognition = new SpeechRecognition()
    
    this.recognition.continuous = true
    this.recognition.interimResults = false
    this.recognition.lang = language === 'ja' ? 'ja-JP' : 'en-US'
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      if (result.isFinal && this.resolveRecording) {
        this.resolveRecording(result[0].transcript)
        this.resolveRecording = null
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (this.resolveRecording) {
        this.resolveRecording('')
        this.resolveRecording = null
      }
    }

    this.recognition.onend = () => {
      this.recording = false
      if (this.resolveRecording) {
        this.resolveRecording('')
        this.resolveRecording = null
      }
    }
  }

  async startRecording(): Promise<void> {
    if (!this.recognition || this.recording) return

    this.recording = true
    this.recognition?.start()
  }

  async stopRecording(): Promise<string> {
    if (!this.recognition || !this.recording) return ''

    return new Promise((resolve) => {
      this.resolveRecording = resolve
      this.recognition?.stop()
      
      // Timeout after 1 second
      setTimeout(() => {
        if (this.resolveRecording) {
          this.resolveRecording('')
          this.resolveRecording = null
        }
      }, 1000)
    })
  }

  isRecording(): boolean {
    return this.recording
  }

  isSupported(): boolean {
    return !!(window.webkitSpeechRecognition || window.SpeechRecognition)
  }

  cleanup(): void {
    if (this.recognition) {
      this.recognition?.stop()
    }
    this.recording = false
    this.resolveRecording = null
  }
}

// Factory function to create appropriate service
export function createVoiceRecognitionService(): VoiceRecognitionService {
  // For now, use Web Speech API (Vosk implementation needs refinement)
  return new WebSpeechVoiceRecognitionService()
}