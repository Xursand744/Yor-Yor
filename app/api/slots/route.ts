import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { listEventSlots } from "@/lib/services/slot";
import type { EventSlotResponse } from "@/types/venue";

export async function GET(): Promise<
  NextResponse<EventSlotResponse[] | { error: string }>
> {
  try {
    const slots = await listEventSlots();
    return NextResponse.json(slots);
  } catch (error) {
    console.error("[GET /api/slots]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
