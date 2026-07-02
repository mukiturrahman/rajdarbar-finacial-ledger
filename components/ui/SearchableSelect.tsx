'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchableSelect({ options, value, onChange, placeholder = 'Select...', className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={wrapperRef} className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`}>
      <div 
        className="input-field flex items-center justify-between cursor-pointer min-h-[42px]"
        onClick={() => { setIsOpen(!isOpen); setSearch('') }}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {value ? (
          <X size={16} className="text-text-muted hover:text-text-primary" onClick={(e) => { e.stopPropagation(); onChange(''); }} />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-void border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search size={16} className="text-text-muted ml-1" />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-text-muted text-center">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-3 text-sm cursor-pointer transition-colors ${option.value === value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary hover:bg-bg-void'}`}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
