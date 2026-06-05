'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'
interface ToastContextValue { toast: (msg: string, type?: 'success' | 'error') => void }
const ToastContext = createContext<ToastContextValue>({ toast: () => {} })
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'success' | 'error'>('success')
  const [show, setShow] = useState(false)
  const toast = useCallback((msg: string, t: 'success' | 'error' = 'success') => { setMessage(msg); setType(t); setShow(true); setTimeout(() => setShow(false), 3500) }, [])
  return (
    <ToastContext.Provider value={{ toast }}>{children}
      {show && (<div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] anim-slide-up"><div className="glass-sm flex items-center gap-3 px-4 py-3 min-w-[280px]" style={{ borderColor: type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }}><span className="text-sm font-medium" style={{ color: type === 'success' ? '#34d399' : '#f87171' }}>{message}</span><button onClick={() => setShow(false)} className="ml-auto text-text-muted hover:text-white"><X size={14} /></button></div></div>)}
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
