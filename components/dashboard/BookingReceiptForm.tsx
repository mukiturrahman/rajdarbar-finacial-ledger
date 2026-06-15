"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";

export function BookingReceiptForm() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    eventType: "Wedding",
    partyName: "",
    address: "",
    mobileNumber: "",
    bookingDate: "",
    eventDate: "",
    guestsCount: "" as number | string,
    hallCharge: "" as number | string,
    waitstaffQuantity: "" as number | string,
    gasCharge: "" as number | string,
    advancePayment: "" as number | string,
    remainingAmount: "" as number | string,
    waitstaffChargeRate: "" as number | string,
    waitstaffCostRate: "" as number | string,
  });

  const [eventTypes, setEventTypes] = useState(["Wedding", "Birthday", "Corporate", "Meeting", "Other"]);

  useEffect(() => {
    import("@/app/actions/booking-receipt").then((m) => {
      m.getBookingSettings().then((settings) => {
        if (settings) {
          setEventTypes(settings.eventTypes);
          setFormData((prev) => {
            const next = {
              ...prev,
              waitstaffChargeRate: settings.waitstaffChargeRate,
              waitstaffCostRate: settings.waitstaffCostRate,
            };
            if (!settings.eventTypes.includes(prev.eventType)) {
              next.eventType = settings.eventTypes[0];
            }
            return next;
          });
        }
      });
    });
  }, []);

  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const waitstaffTotal = (Number(formData.waitstaffQuantity) || 0) * (Number(formData.waitstaffChargeRate) || 0);
    const calculatedTotal =
      (Number(formData.hallCharge) || 0) +
      waitstaffTotal +
      (Number(formData.gasCharge) || 0);

    setTotalAmount(calculatedTotal);
    
    // Auto-calculate remaining amount if total or advance changes
    setFormData(prev => ({ ...prev, remainingAmount: calculatedTotal - (Number(prev.advancePayment) || 0) }));
  }, [
    formData.hallCharge, formData.waitstaffQuantity, formData.waitstaffChargeRate, formData.gasCharge, formData.advancePayment
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let val: any = value;
    if (name === "mobileNumber") {
      val = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : Number(value)) : val,
    }));
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { createReceiptAndEvent } = await import("@/app/actions/booking-receipt");
      const result = await createReceiptAndEvent(formData, totalAmount);
      
      if (result.success) {
        toast("Receipt saved successfully!");
        router.push("/events");
        router.refresh();
      } else {
        toast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("newEvent")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-[0.8125rem] font-medium text-text-muted mb-1.5">
              {t("eventType")}
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
              className="input-field w-full"
              required
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <Input label={t("partyName")} name="partyName" value={formData.partyName} onChange={handleChange} required />
          <Input label={t("mobileNumber")} name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
          <Input type="date" label={t("bookingDate")} name="bookingDate" value={formData.bookingDate} onChange={handleChange} required />
          <Input label={t("address")} name="address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
          <Input type="date" label={t("eventDate")} name="eventDate" value={formData.eventDate} onChange={handleChange} required />
          <Input type="number" label={t("guestsCount")} name="guestsCount" value={formData.guestsCount} onChange={handleChange} required />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("receipts")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="number" label={t("hallCharge")} name="hallCharge" value={formData.hallCharge} onChange={handleChange} />
          <Input type="number" label={t("gasCharge")} name="gasCharge" value={formData.gasCharge} onChange={handleChange} />

          <div className="md:col-span-2 grid grid-cols-2 gap-4 border p-4 border-border glass rounded-xl">
            <div className="col-span-2 flex justify-between items-center text-[0.8125rem] font-medium text-text-primary">
              <span>{t("waitstaff")} (Koyjon Boy)</span>
              <span className="text-brand-gold font-mono">Rate: ৳{formData.waitstaffChargeRate || 500} / person</span>
            </div>
            <div className="col-span-2">
              <Input type="number" label={t("quantity")} name="waitstaffQuantity" value={formData.waitstaffQuantity} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="!bg-bg-elevated !border-brand-emerald/20">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Input type="number" label={t("advancePayment")} name="advancePayment" value={formData.advancePayment} onChange={handleChange} />
          
          <div className="p-4 border border-border glass rounded-xl flex flex-col justify-center">
            <span className="text-[0.8125rem] font-medium text-text-muted">{t("totalAmount")}</span>
            <span className="text-2xl font-bold text-text-primary">৳{totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="p-4 border border-border glass rounded-xl">
            <label className="block text-[0.8125rem] font-medium text-brand-emerald mb-1.5">{t("remainingBalance")}</label>
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand-emerald mr-1">৳</span>
              <input 
                type="text" 
                inputMode="decimal"
                name="remainingAmount" 
                value={formData.remainingAmount} 
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9.-]/g, "");
                  if (val.indexOf("-") > 0) {
                    val = val.charAt(0) + val.slice(1).replace(/-/g, "");
                  }
                  const parts = val.split(".");
                  if (parts.length > 2) {
                    val = parts[0] + "." + parts.slice(1).join("");
                  }
                  setFormData(prev => ({ ...prev, remainingAmount: val }));
                }}
                className="bg-transparent border-none text-xl font-bold text-brand-emerald focus:ring-0 p-0 w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>{t("cancel")}</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : t("save")}</Button>
      </div>
    </form>
  );
}
