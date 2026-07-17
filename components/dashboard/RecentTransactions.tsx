"use client";

import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { formatTaka, formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import type { Transaction } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();

  return (
    <section className="glass overflow-hidden" aria-labelledby="recent-transactions-heading">
      <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <ArrowLeftRight size={18} className="shrink-0 text-brand-orange" />
          <h2 id="recent-transactions-heading" className="truncate text-base font-semibold text-text-primary">
            {t("recentTransactions")}
          </h2>
        </div>
        <Link href="/transactions" className="btn-ghost shrink-0 !min-h-11 !px-2 text-xs">
          {t("viewAll")}
          <ArrowRight size={15} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center px-5 py-10 text-center">
          <p className="text-sm text-text-muted">{t("noTransactionsYet")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {transactions.map(transaction => (
            <article key={transaction.id} className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3 md:px-5">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-text-primary">{transaction.description}</h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <time className="text-xs text-text-muted">{formatDate(transaction.date)}</time>
                  <Badge variant={transaction.status} />
                </div>
              </div>
              <p className={`shrink-0 whitespace-nowrap font-mono text-sm font-bold tabular-nums ${
                transaction.type === "Income" ? "text-semantic-green" : "text-semantic-red"
              }`}>
                {transaction.type === "Income" ? "+" : "-"}{formatTaka(transaction.amount)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
