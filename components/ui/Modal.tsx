'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (open) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; return () => { document.body.style.overflow = '' } }, [open])
  if (!open) return null
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="glass w-full max-w-lg max-h-[85vh] flex flex-col anim-fade-in" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="text-lg font-bold text-white">{title}</h2><button onClick={onClose} className="btn-ghost !p-2 !min-w-0 !min-h-0"><X size={18} /></button></div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">{footer}</div>)}
      </div>
    </div>
  )
}
