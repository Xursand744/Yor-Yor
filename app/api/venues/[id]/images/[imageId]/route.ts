import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { deleteVenueImage } from "@/lib/services/venue";

type RouteContext = {
  params: { id: string; imageId: string };
};

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id, imageId } = context.params;
  if (!id || id.length < 10 || !imageId || imageId.length < 10) {
    return jsonError(400, "ID noto'g'ri");
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return jsonError(401, "Kirish talab qilinadi");
  }
  if (session.user.role === "manager" && session.user.venueId !== id) {
    return jsonError(403, "Faqat o'z to'yxonangiz rasmini o'chira olasiz");
  }

  try {
    const deleted = await deleteVenueImage(id, imageId);
    if (!deleted) {
      return jsonError(404, "Rasm topilmadi");
    }

    if (deleted.imageUrl.startsWith("/uploads/")) {
      const relativePath = deleted.imageUrl.replace(/^\/+/, "");
      const fullPath = path.join(process.cwd(), "public", relativePath);
      await unlink(fullPath).catch(() => undefined);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/venues/[id]/images/[imageId]]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
