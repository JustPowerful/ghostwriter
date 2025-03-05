import { NextResponse } from "next/server";
import { db } from "@/lib/prisma/db";

export async function POST(request: Request) {
  const { id, newStatus } = await request.json();
  try {
    await db.tasks.update({
      where: { id },
      data: { status: newStatus },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.error();
  }
}
