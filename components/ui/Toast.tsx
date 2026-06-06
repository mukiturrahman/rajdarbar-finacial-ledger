'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
interface ToastContextValue { toast: (msg: string, type?: 'success' | 'error') => void }
const ToastContext = createContext<ToastContextValue>({ toast: () => {} })
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'success' | 'error'>('success')
  const [show, setShow] = useState(false)
  const toast = useCallback((msg: string, t: 'success' | 'error' = 'success') => { setMessage(msg); setType(t); setShow(true); setTimeout(() => setShow(false), 3500) }, [])
  return (
    <ToastContext.Provider value={{ toast }}>{children}
      {show && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[120] anim-slide-up">
          <div className="bg-bg-elevated border flex items-center gap-3 px-4 py-3 min-w-[300px] shadow-glass-sm rounded-xl" style={{ borderColor: type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)' }}>
            {type === 'success' ? <CheckCircle size={18} className="text-semantic-green" /> : <AlertCircle size={18} className="text-semantic-red" />}
            <span className="text-sm font-medium text-text-primary">{message}</span>
            <button onClick={() => setShow(false)} className="ml-auto text-text-muted hover:text-white transition-colors"><X size={16} /></button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
