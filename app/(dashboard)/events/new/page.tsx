"use client";

import { BookingReceiptForm } from "@/components/dashboard/BookingReceiptForm";
import { useLanguage } from "@/components/LanguageProvider";

export default function NewEventPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{t("createReceipt")}</h1>
        <p className="text-[0.8125rem] text-text-muted mt-1">{t("dashboard")} &bull; {t("newEvent")}</p>
      </div>
      <BookingReceiptForm />
    </div>
  );
}
