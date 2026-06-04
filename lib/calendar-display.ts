export type DayDisplayState = "free" | "pending" | "partial" | "busy";

export function getDayDisplayState(
  slots: { status: string }[],
  totalSlots: number
): DayDisplayState {
  const confirmed = slots.filter((s) => s.status === "confirmed").length;
  const pending = slots.filter((s) => s.status === "pending").length;

  if (confirmed >= totalSlots) return "busy";
  if (confirmed > 0) return "partial";
  if (pending > 0) return "pending";
  return "free";
}

export function isSlotTaken(
  slots: { slotId: string; status?: string }[],
  slotId: string
): boolean {
  return slots.some((s) => s.slotId === slotId);
}
