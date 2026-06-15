"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const EventFormSchema = z.object({
  eventType: z.string().min(1),
  partyName: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  guestsCount: z.coerce.number().nonnegative().default(0),
  hallCharge: z.coerce.number().nonnegative().default(0),
  waitstaffQuantity: z.coerce.number().nonnegative().default(0),
  gasCharge: z.coerce.number().nonnegative().default(0),
  advancePayment: z.coerce.number().nonnegative().default(0),
  remainingAmount: z.coerce.number().default(0),
  address: z.string().optional(),
  mobileNumber: z.string().optional(),
});

export async function getEventTypes() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.from('app_config').select('value').eq('key', 'event_types').single();
  if (data?.value) {
    try {
      return JSON.parse(data.value);
    } catch (e) {
      return ["Wedding", "Birthday", "Corporate", "Meeting", "Other"];
    }
  }
  return ["Wedding", "Birthday", "Corporate", "Meeting", "Other"];
}

export async function createReceiptAndEvent(rawFormData: any, totalAmount: number) {
  const parseResult = EventFormSchema.safeParse(rawFormData);
  if (!parseResult.success) {
    return { success: false, error: "Invalid form data" };
  }
  const formData = parseResult.data;

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Calculate expense for waitstaff based on 500 per boy cost
  const waitstaffExpense = formData.waitstaffQuantity * 500;

  // 1. Create the Event
  const eventName = `${formData.eventType} - ${formData.partyName}`;
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      name: eventName,
      event_type: formData.eventType,
      party_name: formData.partyName,
      booking_date: formData.bookingDate || null,
      event_date: formData.eventDate || null,
      guests_count: formData.guestsCount || 0,
      total_amount: totalAmount || 0,
      advance_payment: formData.advancePayment || 0,
      remaining_amount: formData.remainingAmount || 0,
    })
    .select()
    .single();

  if (eventError || !event) {
    return { success: false, error: `Failed to create event: ${eventError?.message || 'Unknown error'} (Code: ${eventError?.code}, Details: ${eventError?.details})` };
  }

  // 2. Create the Transaction for Advance Payment if greater than 0
  if (formData.advancePayment > 0) {
    const { error: txnError } = await supabase.from("transactions").insert({
      date: formData.bookingDate || new Date().toISOString().split('T')[0],
      description: `Advance Payment: ${eventName}`,
      event_id: event.id,
      type: "Income",
      amount: formData.advancePayment,
      method: "Cash", // Defaulting to Cash
      status: "Received",
      created_by: user.id,
    });

    if (txnError) {
      return { success: false, error: "Failed to log transaction" };
    }
  }

  // Optional: Also log the expense if waitstaff exists
  if (waitstaffExpense > 0) {
    await supabase.from("transactions").insert({
      date: formData.eventDate || new Date().toISOString().split('T')[0],
      description: `Waitstaff - ${eventName}`,
      event_id: event.id,
      type: "Expense",
      amount: waitstaffExpense,
      method: "Cash",
      status: "Pending", // Or whatever default makes sense
      created_by: user.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/transactions");

  return { success: true, eventId: event.id };
}
