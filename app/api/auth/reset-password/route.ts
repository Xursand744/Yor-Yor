import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUzPhone } from "@/lib/phone";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Noto'g'ri so'rov formati" },
      { status: 400 }
    );
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const phone = normalizeUzPhone(parsed.data.phone);
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Bu telefon raqam bilan ro'yxatdan o'tgan foydalanuvchi topilmadi",
      },
      { status: 404 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash },
  });

  return NextResponse.json({
    ok: true,
    message: "Parol muvaffaqiyatli yangilandi",
  });
}
