'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (open) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; return () => { document.body.style.overflow = '' } }, [open])
  if (!open) return null
  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-bg-elevated border border-border w-full max-w-lg max-h-[85vh] flex flex-col anim-fade-in shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-base/50">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-bg-base/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
