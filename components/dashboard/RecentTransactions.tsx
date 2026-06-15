"use client";

import { formatTaka, formatDate } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import type { Transaction } from '@/types'
import { useLanguage } from '@/components/LanguageProvider'

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage()

  return (
    <div className="glass p-5">
      <h3 className="text-base font-bold text-text-primary mb-4 pb-3 border-b border-border">{t("recentTransactions")}</h3>
      <div className="flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="text-sm text-text-muted">{t("noTransactionsYet")}</p>
        ) : (
          transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-text-primary truncate">{txn.description}</p>
                <p className="text-sm text-text-muted">{formatDate(txn.date)}</p>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <Badge variant={txn.status} />
                <p className={`text-base font-bold font-mono whitespace-nowrap ${
                  txn.type === 'Income' ? 'text-semantic-green' : 'text-semantic-red'
                }`}>
                  {txn.type === 'Income' ? '+' : '-'}{formatTaka(txn.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
