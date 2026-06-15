import { formatTaka, formatDate } from '@/lib/utils/formatters'
import type { Receipt, ReceiptItem } from '@/types'

export function ReceiptTemplate({ receipt }: { receipt: Receipt }) {
  const items: ReceiptItem[] = typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)

  return (
    <div className="printable-area w-[794px] min-h-[1123px] bg-white text-slate-800 p-12 flex flex-col" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center text-white bg-black font-black text-sm">R</div>
            <div><h1 className="text-xl font-bold text-slate-900">Rajdarbar</h1><p className="text-[0.5625rem] text-slate-500 tracking-wider uppercase">Convention Hall</p></div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Rajdarbar Convention Hall<br />Dhaka, Bangladesh</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: '#0d5c3f' }}>RECEIPT</p>
          <p className="text-sm font-mono font-bold text-slate-600 mt-2">{receipt.receipt_number}</p>
          <div className="mt-4 text-xs text-slate-500">
            <p>Issue: {formatDate(receipt.issue_date)}</p>
            {receipt.due_date && <p>Due: {formatDate(receipt.due_date)}</p>}
          </div>
        </div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead>
          <tr style={{ background: 'rgba(13,92,63,0.06)' }}>
            <th className="text-left py-3 px-4 text-[0.6875rem] font-bold text-slate-600 uppercase">Description</th>
            <th className="text-center py-3 px-4 text-[0.6875rem] font-bold text-slate-600 uppercase">Qty</th>
            <th className="text-right py-3 px-4 text-[0.6875rem] font-bold text-slate-600 uppercase">Price</th>
            <th className="text-right py-3 px-4 text-[0.6875rem] font-bold text-slate-600 uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (<tr key={i} className="border-b border-slate-100">
            <td className="py-3 px-4">{item.description}</td>
            <td className="py-3 px-4 text-center">{item.quantity}</td>
            <td className="py-3 px-4 text-right font-mono">{formatTaka(item.price)}</td>
            <td className="py-3 px-4 text-right font-mono font-bold">{formatTaka(item.quantity * item.price)}</td>
          </tr>))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Subtotal</span><span className="font-mono">{formatTaka(subtotal)}</span></div>
          <div className="flex justify-between py-3 mt-1" style={{ background: 'rgba(13,92,63,0.06)', borderRadius: '8px', padding: '12px 16px' }}>
            <span className="font-bold" style={{ color: '#0d5c3f' }}>Total</span><span className="text-lg font-bold font-mono" style={{ color: '#0d5c3f' }}>{formatTaka(receipt.amount)}</span>
          </div>
        </div>
      </div>

      {receipt.notes && (<div className="mt-4"><p className="text-[0.6875rem] font-bold text-slate-500 uppercase mb-1">Notes</p><p className="text-sm text-slate-600">{receipt.notes}</p></div>)}

      <div className="mt-auto pt-8 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">Rajdarbar Convention Hall · Financial Department</p>
      </div>
    </div>
  )
}
