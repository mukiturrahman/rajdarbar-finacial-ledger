'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logReceiptExpense } from '@/app/actions/receipts'
import { FileUp, Receipt, Calendar, Plus, Tag, X, UploadCloud } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { useToast } from '@/components/ui/Toast'

export function ReceiptForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await logReceiptExpense(formData)
      
      if (result.success) {
        toast(t('receiptLoggedSuccess'))
        router.push('/receipts')
      } else {
        toast(`${t('error')}: ${result.error}`, "error")
      }
    } catch (error) {
      toast(t('unexpectedError'), "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("logExpenseReceipt")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="date" label={t("date")} name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          
          <div className="space-y-1.5">
            <label className="block text-[0.8125rem] font-medium text-text-muted mb-1.5">{t("category")}</label>
            <select name="category" required className="input-field w-full">
              <option value="Electricity">Electricity</option>
              <option value="Gate Fees">Gate Fees</option>
              <option value="Catering">Catering</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Staff Salary">Staff Salary</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" step="0.01" label={t("amount")} name="amount" required />
            <Input label={t("description")} name="description" required placeholder={t("description")} />
          </div>
          
          <div className="pt-2">
            <label className="block text-[0.8125rem] font-medium text-text-muted mb-1.5">{t("receiptImageOptional")}</label>
            
            {previewUrl ? (
              <div className="relative border border-border bg-bg-void">
                <img src={previewUrl} alt="Receipt preview" className="w-full h-auto max-h-[300px] object-contain" />
                <button 
                  type="button" 
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                className="border border-dashed border-border p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-bg-hover transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="text-text-primary" size={24} />
                </div>
                <p className="text-sm font-medium text-text-primary">Click to upload receipt image</p>
                <p className="text-xs text-text-muted mt-1">JPEG, PNG, or WebP</p>
              </div>
            )}
            
            <input 
              ref={fileInputRef}
              type="file" 
              name="receiptImage" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Log Expense"}
        </Button>
      </div>
    </form>
  )
}
