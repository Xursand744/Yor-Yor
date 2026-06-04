export type BookingStatusValue = "pending" | "confirmed" | "cancelled";
export type PaymentStatusValue = "unpaid" | "advance_paid" | "paid";
export type PaymentPlanValue = "advance" | "full";

export interface CreateBookingBody {
  venueId: string;
  bookingDate: string;
  slotId: string;
  clientName: string;
  clientPhone: string;
  status?: BookingStatusValue;
  paymentPlan?: PaymentPlanValue;
}

export interface PaymentSummary {
  id: string;
  amount: number;
  type: string;
  method: string;
  createdAt: string;
}

export interface BookingResponse {
  id: string;
  venueId: string;
  venueName?: string;
  bookingDate: string;
  slotId: string;
  slotName: string;
  clientName: string;
  clientPhone: string;
  status: BookingStatusValue;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatusValue;
  remainingAmount: number;
  advanceAmount: number;
  createdAt: string;
  payments?: PaymentSummary[];
}

export interface CalendarSlotEntry {
  slotId: string;
  slotName: string;
  status: BookingStatusValue;
  bookingId: string;
}

export interface CalendarDayEntry {
  date: string;
  slots: CalendarSlotEntry[];
}

export interface VenueCalendarResponse {
  venueId: string;
  venueName: string;
  from: string;
  to: string;
  days: CalendarDayEntry[];
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
