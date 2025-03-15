import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id)
    return NextResponse.json(
      {
        success: false,
        message: "Invalid workspace id",
      },
      {
        status: 400,
      }
    );

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const now = new Date();

    // Adjust to get Monday as the start of the week
    // The following code will get the start of the week (Monday) and the end of the week (Sunday)
    // And then fetch all tasks that were completed in the current week
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const workspace = await db.workspace.findFirst({
      where: { id: id, userId: session.user.id },
      include: {
        tasks: {
          where: {
            doneAt: {
              gte: startOfWeek,
              lt: endOfWeek,
            },
          },
          select: {
            title: true,
            description: true,
          },
        },
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    if (!workspace)
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found",
        },
        {
          status: 404,
        }
      );

    return NextResponse.json({
      success: true,
      workspace: workspace,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong",
    });
  }
}
