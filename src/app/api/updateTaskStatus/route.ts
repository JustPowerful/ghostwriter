import { NextResponse } from "next/server";
import { db } from "@/lib/prisma/db";

export async function POST(request: Request) {
  const { id, newStatus } = await request.json();
  try {
    if (newStatus !== "DONE") {
      await db.tasks.update({
        where: { id },
        data: { status: newStatus, doneAt: null },
      });
    } else {
      await db.tasks.update({
        where: { id },
        data: { status: newStatus, doneAt: new Date() },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.error();
  }
}
