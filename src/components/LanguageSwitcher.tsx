'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => setLanguage('tr')}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${language === 'tr' ? 'bg-gray-700 ring-1 ring-gray-500' : ''}`}
        title="Türkçe"
      >
        🇹🇷
      </button>
      <button 
        onClick={() => setLanguage('en')}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${language === 'en' ? 'bg-gray-700 ring-1 ring-gray-500' : ''}`}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  )
}
