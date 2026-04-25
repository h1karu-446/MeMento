'use client'

import { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'error' | 'success' | 'info'
type Toast = { id: number; message: string; type: ToastType }

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const colorMap: Record<ToastType, string> = {
    error:   'bg-red-50   border-red-200   text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-blue-50  border-blue-200  text-blue-700',
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl border text-sm font-medium shadow-lg pointer-events-auto max-w-sm animate-fade-in ${colorMap[t.type]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
