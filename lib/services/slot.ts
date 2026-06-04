import { prisma } from "@/lib/prisma";
import type { EventSlotResponse } from "@/types/venue";

export async function listEventSlots(): Promise<EventSlotResponse[]> {
  const slots = await prisma.eventSlot.findMany({
    where: {
      slotName: { in: ["abetki_toy", "kechki_toy"] },
    },
    select: { id: true, slotName: true },
  });

  const order = { abetki_toy: 0, kechki_toy: 1 } as const;
  return slots.sort(
    (a, b) =>
      (order[a.slotName as keyof typeof order] ?? 99) -
      (order[b.slotName as keyof typeof order] ?? 99)
  );
}
