import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types/booking";

export function jsonError(
  status: number,
  error: string,
  extra?: Partial<ApiErrorResponse>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error, ...extra }, { status });
}
