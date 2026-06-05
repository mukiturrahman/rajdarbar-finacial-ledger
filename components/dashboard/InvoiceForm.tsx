"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InvoiceForm() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    eventType: "Wedding",
    partyName: "",
    address: "",
    mobileNumber: "",
    bookingDate: "",
    eventDate: "",
    guestsCount: 0,
    hallCharge: 0,
    gasCharge: 0,
    cateringEnabled: false,
    cateringCost: 0,
    waitstaffQuantity: 0,
    waitstaffRate: 0,
    eventCharge: 0,
    lightingCharge: 0,
    advancePayment: 0,
  });

  const [eventTypes, setEventTypes] = useState(["Wedding", "Birthday", "Corporate", "Meeting", "Other"]);

  useEffect(() => {
    import("@/app/actions/invoice").then((m) => {
      m.getEventTypes().then((types) => {
        if (types && types.length > 0) {
          setEventTypes(types);
          if (!types.includes(formData.eventType)) {
            setFormData(prev => ({ ...prev, eventType: types[0] }));
          }
        }
      });
    });
  }, []);

  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cateringTotal = formData.cateringEnabled ? formData.cateringCost : 0;
    const waitstaffTotal = formData.waitstaffRate; // Treated as absolute total charged to client
    const calculatedTotal =
      formData.hallCharge +
      formData.gasCharge +
      cateringTotal +
      waitstaffTotal +
      formData.eventCharge +
      formData.lightingCharge;

    setTotalAmount(calculatedTotal);
    setRemainingBalance(calculatedTotal - formData.advancePayment);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { createInvoiceAndEvent } = await import("@/app/actions/invoice");
      const result = await createInvoiceAndEvent(formData, totalAmount);
      
      if (result.success) {
        alert("Invoice saved successfully!");
        router.push("/events");
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
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
          <CardTitle>{t("invoices")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="number" label={t("hallCharge")} name="hallCharge" value={formData.hallCharge} onChange={handleChange} />
          <Input type="number" label={t("gasCharge")} name="gasCharge" value={formData.gasCharge} onChange={handleChange} />
          
          <div className="md:col-span-2 flex items-center space-x-2 border p-3 rounded-md border-white/10 glass-sm">
            <input 
              type="checkbox" 
              name="cateringEnabled" 
              checked={formData.cateringEnabled} 
              onChange={handleChange}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-brand-emerald focus:ring-brand-emerald cursor-pointer"
            />
            <label className="text-[0.8125rem] font-medium text-text-primary">{t("catering")}</label>
            {formData.cateringEnabled && (
              <Input type="number" placeholder="Cost" name="cateringCost" value={formData.cateringCost} onChange={handleChange} className="ml-4 w-48" />
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4 border p-3 rounded-md border-white/10 glass-sm">
            <div className="col-span-2 text-[0.8125rem] font-medium text-text-primary">{t("waitstaff")}</div>
            <Input type="number" label={t("quantity")} name="waitstaffQuantity" value={formData.waitstaffQuantity} onChange={handleChange} />
            <Input type="number" label={t("rate")} name="waitstaffRate" value={formData.waitstaffRate} onChange={handleChange} />
          </div>

          <Input type="number" label={t("eventCharge")} name="eventCharge" value={formData.eventCharge} onChange={handleChange} />
          <Input type="number" label={t("lightingCharge")} name="lightingCharge" value={formData.lightingCharge} onChange={handleChange} />
        </CardContent>
      </Card>

      <Card className="!bg-bg-elevated !border-brand-emerald/20">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Input type="number" label={t("advancePayment")} name="advancePayment" value={formData.advancePayment} onChange={handleChange} />
          
          <div className="p-4 glass-sm rounded-md border border-white/10 flex flex-col justify-center">
            <span className="text-[0.8125rem] font-medium text-text-muted">{t("totalAmount")}</span>
            <span className="text-2xl font-bold text-text-primary">৳{totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="p-4 glass-sm rounded-md border border-brand-emerald/30 flex flex-col justify-center bg-semantic-green-dim">
            <span className="text-[0.8125rem] font-medium text-brand-emerald">{t("remainingBalance")}</span>
            <span className="text-2xl font-bold text-brand-emerald">৳{remainingBalance.toLocaleString()}</span>
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
