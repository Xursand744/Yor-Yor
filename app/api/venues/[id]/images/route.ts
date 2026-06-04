import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { addVenueImage, listVenueImages } from "@/lib/services/venue";

type RouteContext = {
  params: { id: string };
};

function getFileExtension(fileName: string, mimeType: string): string {
  const extFromName = path.extname(fileName).toLowerCase();
  if (extFromName) return extFromName;
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".bin";
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = context.params;
  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto'g'ri");
  }

  try {
    const images = await listVenueImages(id);
    return NextResponse.json(images);
  } catch (error) {
    console.error("[GET /api/venues/[id]/images]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = context.params;
  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto'g'ri");
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return jsonError(401, "Kirish talab qilinadi");
  }
  if (session.user.role === "manager" && session.user.venueId !== id) {
    return jsonError(403, "Faqat o'z to'yxonangizga rasm qo'sha olasiz");
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "Rasm fayli yuborilmadi");
  }
  if (!file.type.startsWith("image/")) {
    return jsonError(400, "Faqat rasm yuklash mumkin");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = getFileExtension(file.name, file.type);
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;

  const uploadFolder = path.join(process.cwd(), "public", "uploads", "venues", id);
  await mkdir(uploadFolder, { recursive: true });

  const fullPath = path.join(uploadFolder, fileName);
  await writeFile(fullPath, bytes);

  const publicUrl = `/uploads/venues/${id}/${fileName}`;

  try {
    const image = await addVenueImage(id, publicUrl);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("[POST /api/venues/[id]/images]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
