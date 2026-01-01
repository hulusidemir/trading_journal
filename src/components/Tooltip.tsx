'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 5, // 5px offset
        left: rect.left + window.scrollX + (rect.width / 2)
      })
    }
  }, [isVisible])

  return (
    <div 
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={triggerRef}
    >
      {children}
      {isVisible && text && createPortal(
        <div 
          className="fixed z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 max-w-xs break-words pointer-events-none transform -translate-x-1/2"
          style={{ top: position.top - window.scrollY, left: position.left }}
        >
          {text}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-t border-l border-gray-700 transform rotate-45"></div>
        </div>,
        document.body
      )}
    </div>
  )
}
