import { Prisma } from "@prisma/client";
import { calcAdvanceAmount } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  endOfMonthUTC,
  formatBookingDate,
  parseBookingDate,
  startOfMonthUTC,
} from "@/lib/date";
import type {
  BookingResponse,
  CalendarDayEntry,
  CreateBookingBody,
  PaymentStatusValue,
  PaymentSummary,
  VenueCalendarResponse,
} from "@/types/booking";

export class SlotNotAvailableError extends Error {
  constructor() {
    super("SLOT_NOT_AVAILABLE");
    this.name = "SlotNotAvailableError";
  }
}

export class VenueNotFoundError extends Error {
  constructor() {
    super("VENUE_NOT_FOUND");
    this.name = "VenueNotFoundError";
  }
}

export class SlotNotFoundError extends Error {
  constructor() {
    super("SLOT_NOT_FOUND");
    this.name = "SlotNotFoundError";
  }
}

export class BookingNotFoundError extends Error {
  constructor() {
    super("BOOKING_NOT_FOUND");
    this.name = "BookingNotFoundError";
  }
}

export class InvalidPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPaymentError";
  }
}

function mapBooking(
  booking: {
    id: string;
    venueId: string;
    bookingDate: Date;
    slotId: string;
    clientName: string;
    clientPhone: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    createdAt: Date;
    slot: { slotName: string };
    venue?: { name: string; advancePercent: number } | null;
    payments?: {
      id: string;
      amount: number;
      type: string;
      method: string;
      createdAt: Date;
    }[];
  }
): BookingResponse {
  const advanceAmount = booking.venue
    ? calcAdvanceAmount(booking.totalAmount, booking.venue.advancePercent)
    : calcAdvanceAmount(booking.totalAmount, 30);

  return {
    id: booking.id,
    venueId: booking.venueId,
    venueName: booking.venue?.name,
    bookingDate: formatBookingDate(booking.bookingDate),
    slotId: booking.slotId,
    slotName: booking.slot.slotName,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    status: booking.status as BookingResponse["status"],
    totalAmount: booking.totalAmount,
    paidAmount: booking.paidAmount,
    paymentStatus: booking.paymentStatus as PaymentStatusValue,
    remainingAmount: Math.max(0, booking.totalAmount - booking.paidAmount),
    advanceAmount,
    createdAt: booking.createdAt.toISOString(),
    payments: booking.payments?.map(
      (p): PaymentSummary => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        method: p.method,
        createdAt: p.createdAt.toISOString(),
      })
    ),
  };
}

const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

export async function isSlotAvailable(
  venueId: string,
  bookingDate: Date,
  slotId: string
): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: {
      venueId,
      bookingDate,
      slotId,
      status: { in: [...ACTIVE_STATUSES] },
    },
    select: { id: true },
  });

  return existing === null;
}

export async function createBooking(
  input: CreateBookingBody
): Promise<BookingResponse> {
  const bookingDate = parseBookingDate(input.bookingDate);

  const [venue, slot] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: input.venueId },
      select: {
        id: true,
        name: true,
        basePrice: true,
        advancePercent: true,
      },
    }),
    prisma.eventSlot.findUnique({
      where: { id: input.slotId },
      select: { id: true, slotName: true },
    }),
  ]);

  if (!venue) {
    throw new VenueNotFoundError();
  }
  if (!slot) {
    throw new SlotNotFoundError();
  }

  if (venue.basePrice <= 0 && input.paymentPlan) {
    throw new InvalidPaymentError("To'yxona narxi belgilanmagan");
  }

  const available = await isSlotAvailable(
    input.venueId,
    bookingDate,
    input.slotId
  );
  if (!available) {
    throw new SlotNotAvailableError();
  }

  const totalAmount = venue.basePrice;
  const advanceAmount = calcAdvanceAmount(totalAmount, venue.advancePercent);

  let paidAmount = 0;
  let paymentStatus: PaymentStatusValue = "unpaid";
  let paymentType: string | null = null;
  let bookingStatus = input.status ?? "pending";

  if (input.paymentPlan === "full") {
    paidAmount = totalAmount;
    paymentStatus = "paid";
    paymentType = "full";
    bookingStatus = "pending";
  } else if (input.paymentPlan === "advance") {
    paidAmount = advanceAmount;
    paymentStatus = paidAmount >= totalAmount ? "paid" : "advance_paid";
    paymentType = "advance";
    bookingStatus = "pending";
  } else if (input.status === "confirmed") {
    bookingStatus = "confirmed";
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          venueId: input.venueId,
          bookingDate,
          slotId: input.slotId,
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          status: bookingStatus,
          totalAmount,
          paidAmount,
          paymentStatus,
        },
        include: {
          slot: { select: { slotName: true } },
          venue: { select: { name: true, advancePercent: true } },
        },
      });

      if (paymentType && paidAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: created.id,
            amount: paidAmount,
            type: paymentType,
            method: "online",
            status: "completed",
          },
        });
      }

      return tx.booking.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          slot: { select: { slotName: true } },
          venue: { select: { name: true, advancePercent: true } },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    return mapBooking(booking);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new SlotNotAvailableError();
    }
    throw error;
  }
}

export class BookingAlreadyConfirmedError extends Error {
  constructor() {
    super("BOOKING_ALREADY_CONFIRMED");
    this.name = "BookingAlreadyConfirmedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export async function listPendingBookings(filters: {
  venueId?: string;
  managerVenueId?: string | null;
}): Promise<BookingResponse[]> {
  const venueId =
    filters.managerVenueId ?? filters.venueId;

  const bookings = await prisma.booking.findMany({
    where: {
      status: "pending",
      ...(venueId ? { venueId } : {}),
    },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map(mapBooking);
}

export async function confirmBooking(
  bookingId: string,
  actor: { role: string; venueId: string | null }
): Promise<BookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) {
    throw new BookingNotFoundError();
  }

  if (booking.status === "cancelled") {
    throw new BookingAlreadyCancelledError();
  }

  if (booking.status === "confirmed") {
    throw new BookingAlreadyConfirmedError();
  }

  if (actor.role === "manager" && actor.venueId !== booking.venueId) {
    throw new ForbiddenError();
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "confirmed" },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  return mapBooking(updated);
}

export class BookingAlreadyCancelledError extends Error {
  constructor() {
    super("BOOKING_ALREADY_CANCELLED");
    this.name = "BookingAlreadyCancelledError";
  }
}

export async function listActiveBookings(filters: {
  venueId?: string;
  managerVenueId?: string | null;
}): Promise<BookingResponse[]> {
  const venueId = filters.managerVenueId ?? filters.venueId;

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: [...ACTIVE_STATUSES] },
      ...(venueId ? { venueId } : {}),
    },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ bookingDate: "asc" }, { createdAt: "desc" }],
  });

  return bookings.map(mapBooking);
}

export async function cancelBooking(
  bookingId: string,
  actor: { role: string; venueId: string | null }
): Promise<BookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) {
    throw new BookingNotFoundError();
  }

  if (booking.status === "cancelled") {
    throw new BookingAlreadyCancelledError();
  }

  if (actor.role === "manager" && actor.venueId !== booking.venueId) {
    throw new ForbiddenError();
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  return mapBooking(updated);
}

export async function payBookingRemainder(
  bookingId: string,
  method: "online" | "cash" = "online"
): Promise<BookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
    },
  });

  if (!booking) {
    throw new BookingNotFoundError();
  }

  if (booking.status === "cancelled") {
    throw new InvalidPaymentError("Bron bekor qilingan");
  }

  if (booking.status !== "confirmed") {
    throw new InvalidPaymentError(
      "Bron hali tasdiqlanmagan. Admin tasdiqlagach qolgan to'lovni amalga oshiring."
    );
  }

  const remaining = booking.totalAmount - booking.paidAmount;
  if (remaining <= 0) {
    throw new InvalidPaymentError("To'lov allaqachon to'liq amalga oshirilgan");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        bookingId,
        amount: remaining,
        type: "remainder",
        method,
        status: "completed",
      },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        paidAmount: booking.totalAmount,
        paymentStatus: "paid",
      },
      include: {
        slot: { select: { slotName: true } },
        venue: { select: { name: true, advancePercent: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  });

  return mapBooking(updated);
}

export async function getBookingById(id: string): Promise<BookingResponse> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      slot: { select: { slotName: true } },
      venue: { select: { name: true, advancePercent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!booking) {
    throw new BookingNotFoundError();
  }

  return mapBooking(booking);
}

export interface CalendarRange {
  from: Date;
  to: Date;
}

export function resolveCalendarRange(params: {
  year?: number;
  month?: number;
  from?: string;
  to?: string;
}): CalendarRange {
  const now = new Date();
  const year = params.year ?? now.getUTCFullYear();
  const month = params.month ?? now.getUTCMonth() + 1;

  if (params.from && params.to) {
    return {
      from: parseBookingDate(params.from),
      to: parseBookingDate(params.to),
    };
  }

  return {
    from: startOfMonthUTC(year, month),
    to: endOfMonthUTC(year, month),
  };
}

export async function getVenueCalendar(
  venueId: string,
  range: CalendarRange
): Promise<VenueCalendarResponse> {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, name: true },
  });

  if (!venue) {
    throw new VenueNotFoundError();
  }

  const bookings = await prisma.booking.findMany({
    where: {
      venueId,
      status: { in: [...ACTIVE_STATUSES] },
      bookingDate: {
        gte: range.from,
        lte: range.to,
      },
    },
    include: {
      slot: { select: { slotName: true } },
    },
    orderBy: [{ bookingDate: "asc" }, { slot: { slotName: "asc" } }],
  });

  const dayMap = new Map<string, CalendarDayEntry>();

  for (const booking of bookings) {
    const dateKey = formatBookingDate(booking.bookingDate);
    const day =
      dayMap.get(dateKey) ??
      ({
        date: dateKey,
        slots: [],
      } satisfies CalendarDayEntry);

    day.slots.push({
      bookingId: booking.id,
      slotId: booking.slotId,
      slotName: booking.slot.slotName,
      status: booking.status as CalendarDayEntry["slots"][0]["status"],
    });

    dayMap.set(dateKey, day);
  }

  return {
    venueId: venue.id,
    venueName: venue.name,
    from: formatBookingDate(range.from),
    to: formatBookingDate(range.to),
    days: Array.from(dayMap.values()),
  };
}
